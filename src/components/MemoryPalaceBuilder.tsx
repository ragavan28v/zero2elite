import { useState, useEffect } from 'react';
import { FaRedo, FaCheck, FaPlay } from 'react-icons/fa';
import { useTrackerStore } from '../store';
import styles from './DailyChallengeGenerator.module.css';

interface MemoryItem {
  id: number;
  name: string;
  location: string;
  emoji: string;
}

interface MemoryPalaceData {
  date: string;
  items: MemoryItem[];
  userSequence: number[];
  isCompleted: boolean;
  score: number;
}

const MEMORY_ITEMS = [
  { id: 1, name: 'Golden Apple', location: 'Entrance Hall', emoji: '🍎' },
  { id: 2, name: 'Silver Key', location: 'Living Room', emoji: '🔑' },
  { id: 3, name: 'Crystal Ball', location: 'Kitchen', emoji: '🔮' },
  { id: 4, name: 'Ancient Book', location: 'Library', emoji: '📚' },
  { id: 5, name: 'Magic Wand', location: 'Study', emoji: '🪄' },
  { id: 6, name: 'Treasure Chest', location: 'Bedroom', emoji: '💎' },
  { id: 7, name: 'Golden Crown', location: 'Throne Room', emoji: '👑' },
  { id: 8, name: 'Mystic Mirror', location: 'Bathroom', emoji: '🪞' },
  { id: 9, name: 'Enchanted Sword', location: 'Armory', emoji: '⚔️' },
  { id: 10, name: 'Time Machine', location: 'Laboratory', emoji: '⏰' },
  { id: 11, name: 'Flying Carpet', location: 'Attic', emoji: '🛋️' },
  { id: 12, name: 'Dragon Egg', location: 'Dungeon', emoji: '🥚' },
];

export default function MemoryPalaceBuilder() {
  const { awardChallengeXP, currentUser } = useTrackerStore();
  const [memoryData, setMemoryData] = useState<MemoryPalaceData | null>(null);
  const [gameState, setGameState] = useState<'memorize' | 'recall' | 'completed'>('memorize');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [studyTime, setStudyTime] = useState(20);
  const [isStudying, setIsStudying] = useState(false);
  const [shuffledItems, setShuffledItems] = useState<MemoryItem[]>([]);
  const [countdownInterval, setCountdownInterval] = useState<NodeJS.Timeout | null>(null);

  // Load or generate memory palace data
  useEffect(() => {
    loadOrGenerateMemoryPalace();
  }, []);

  const loadOrGenerateMemoryPalace = () => {
    if (!currentUser) return;
    
    const saved = localStorage.getItem(`memoryPalace_${currentUser.id}_${currentDate}`);
    if (saved) {
      const data = JSON.parse(saved);
      setMemoryData(data);
      setGameState(data.isCompleted ? 'completed' : 'memorize');
    } else {
      generateNewMemoryPalace();
    }
  };

  const generateNewMemoryPalace = () => {
    if (!currentUser) return;
    
    // Select 10 random items for today's challenge
    const shuffled = [...MEMORY_ITEMS].sort(() => Math.random() - 0.5);
    const selectedItems = shuffled.slice(0, 10);
    
    const newData: MemoryPalaceData = {
      date: currentDate,
      items: selectedItems,
      userSequence: [],
      isCompleted: false,
      score: 0
    };
    
    setMemoryData(newData);
    setGameState('memorize');
    setSelectedItems([]);
    
    if (currentUser) {
      localStorage.setItem(`memoryPalace_${currentUser.id}_${currentDate}`, JSON.stringify(newData));
    }
  };

  const getStudyTime = () => {
    if (!currentUser) return 20;
    
    const startDate = new Date(currentUser.startDate);
    const today = new Date();
    const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceStart <= 30) return 20;
    if (daysSinceStart <= 60) return 15;
    return 10;
  };

  const handleStartRecall = () => {
    // Clear any existing timer
    if (countdownInterval) {
      clearInterval(countdownInterval);
    }
    
    const timeLimit = getStudyTime();
    setStudyTime(timeLimit);
    setIsStudying(true);
    setGameState('memorize');
    
    // Start countdown timer
    const countdown = setInterval(() => {
      setStudyTime(prev => {
        if (prev <= 1) {
          clearInterval(countdown);
          setCountdownInterval(null);
          setIsStudying(false);
          setGameState('recall');
          setSelectedItems([]);
          
          // Shuffle items for recall phase
          const shuffled = [...memoryData!.items].sort(() => Math.random() - 0.5);
          setShuffledItems(shuffled);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    setCountdownInterval(countdown);
  };

  const handleItemClick = (itemId: number) => {
    if (gameState !== 'recall') return;
    
    const newSequence = [...selectedItems, itemId];
    setSelectedItems(newSequence);
    
    // Check if sequence is complete
    if (newSequence.length === memoryData!.items.length) {
      const correctItems = memoryData!.items.map(item => item.id);
      let correctCount = 0;
      
      // Count how many items were clicked in correct order
      for (let i = 0; i < newSequence.length; i++) {
        if (newSequence[i] === correctItems[i]) {
          correctCount++;
        }
      }
      
      const updatedData = {
        ...memoryData!,
        userSequence: newSequence,
        isCompleted: true,
        score: correctCount
      };
      
      setMemoryData(updatedData);
      setGameState('completed');
      
      // Award XP if score is 10+
      if (correctCount >= 10) {
        awardChallengeXP('memoryPalace');
      }
      
      if (currentUser) {
        localStorage.setItem(`memoryPalace_${currentUser.id}_${currentDate}`, JSON.stringify(updatedData));
      }
    }
  };

  const handleRegenerate = () => {
    // Clear any existing timer
    if (countdownInterval) {
      clearInterval(countdownInterval);
      setCountdownInterval(null);
    }
    
    setIsStudying(false);
    setGameState('memorize');
    setStudyTime(getStudyTime());
    setSelectedItems([]);
    setShuffledItems([]);
    
    setIsLoading(true);
    setTimeout(() => {
      generateNewMemoryPalace();
      setIsLoading(false);
    }, 500);
  };

  const isItemSelected = (itemId: number) => {
    return selectedItems.includes(itemId);
  };

  const isItemCorrect = (itemId: number) => {
    if (gameState !== 'completed') return false;
    
    // Find the position of this item in the user's sequence
    const userSequenceIndex = selectedItems.indexOf(itemId);
    
    // If this item wasn't clicked, it's not correct
    if (userSequenceIndex === -1) return false;
    
    // Check if this item was clicked in the correct position
    const correctItemId = memoryData?.items[userSequenceIndex]?.id;
    return itemId === correctItemId;
  };

  if (!memoryData) {
    return (
      <div className={styles.placeholderCard}>
        <div className={styles.loadingCard}>
          <div className={styles.loadingIcon}>🧠</div>
          <h3>Loading Memory Palace...</h3>
        </div>
      </div>
    );
  }

  return (
    <div id="memory-palace" className={styles.placeholderCard}>
      <h3>Memory Palace Builder</h3>
      <div className={styles.placeholderContent}>
        
        {/* Game State Display */}
        <div className={styles.gameStateInfo}>
          {gameState === 'memorize' && !isStudying && (
            <div className={styles.memorizeInfo}>
              <h4>🏛️ Memorize Phase</h4>
              <p>Study time: {getStudyTime()}s • Click items in original order after shuffle</p>
            </div>
          )}
          
          {isStudying && (
            <div className={styles.studyInfo}>
              <h4>⏰ {studyTime}s</h4>
              <div className={styles.studyTimer}>
                <div className={styles.timerBar}>
                  <div 
                    className={styles.timerProgress} 
                    style={{ width: `${(studyTime / getStudyTime()) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
          
          {gameState === 'recall' && (
            <div className={styles.recallInfo}>
              <h4>🧠 Recall: {selectedItems.length}/{memoryData.items.length}</h4>
            </div>
          )}
          
          {gameState === 'completed' && (
            <div className={styles.completedInfo}>
              <h4>✅ {memoryData.score}/{memoryData.items.length}</h4>
              {memoryData.score >= 10 && (
                <div className={styles.xpAward}>
                  <FaCheck style={{ color: '#22c55e', marginRight: '4px' }} />
                  +1 XP
                </div>
              )}
            </div>
          )}
        </div>

        {/* Memory Grid with Action Buttons */}
        <div className={styles.memoryGridContainer}>
          <div className={styles.memoryGrid}>
            {(gameState === 'recall' ? shuffledItems : memoryData.items).slice(0, 10).map((item) => (
              <div
                key={item.id}
                className={`${styles.memoryItem} ${
                  gameState === 'recall' ? styles.clickable : ''
                } ${
                  gameState === 'completed' && isItemCorrect(item.id) 
                    ? styles.correct 
                    : gameState === 'completed' && !isItemCorrect(item.id)
                    ? styles.incorrect
                    : ''
                }`}
                onClick={() => gameState === 'recall' && handleItemClick(item.id)}
                style={{
                  cursor: gameState === 'recall' ? 'pointer' : 'default',
                  opacity: gameState === 'memorize' ? 1 : 0.8,
                  transform: gameState === 'recall' ? 'scale(1)' : 'scale(0.95)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div className={styles.itemEmoji}>{item.emoji}</div>
                <div className={styles.itemName}>{item.name}</div>
                <div className={styles.itemLocation}>{item.location}</div>
                {gameState === 'recall' && isItemSelected(item.id) && (
                  <div className={styles.selectedIndicator}>✓</div>
                )}
              </div>
            ))}
            
            {/* Action Buttons in Grid Positions 11 and 12 */}
            <div className={styles.memoryActionButtons}>
              {gameState === 'memorize' && !isStudying && (
                <button
                  onClick={handleStartRecall}
                  className={styles.iconButton}
                  title="Start Study Timer"
                >
                  <FaPlay />
                </button>
              )}
            </div>
            <div className={styles.memoryActionButtons}>
              <button
                onClick={handleRegenerate}
                disabled={isLoading}
                className={styles.iconButton}
                title="New Palace"
              >
                <FaRedo className={isLoading ? styles.spinning : ''} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
