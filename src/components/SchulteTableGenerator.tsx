import { useState, useEffect, useRef } from 'react';
import { FaPlay, FaRedo, FaBrain } from 'react-icons/fa';
import { useTrackerStore } from '../store';
import styles from './DailyChallengeGenerator.module.css';

interface SchulteTable {
  grid: number[][];
  currentNumber: number;
  completedNumbers: Set<number>;
  isCompleted: boolean;
}

interface GameState {
  isStarted: boolean;
  isCompleted: boolean;
  startTime: number | null;
  endTime: number | null;
  elapsedTime: number;
  successfulCompletions: number;
}

export default function SchulteTableGenerator() {
  const { awardChallengeXP, currentUser } = useTrackerStore();
  const [schulteTable, setSchulteTable] = useState<SchulteTable | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    isStarted: false,
    isCompleted: false,
    startTime: null,
    endTime: null,
    elapsedTime: 0,
    successfulCompletions: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [currentDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Load or generate new table
  useEffect(() => {
    loadOrGenerateTable();
  }, []);

  // Timer effect
  useEffect(() => {
    if (gameState.isStarted && !gameState.isCompleted) {
      timerRef.current = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          elapsedTime: Date.now() - (prev.startTime || 0)
        }));
      }, 10); // Update every 10ms for millisecond precision
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState.isStarted, gameState.isCompleted]);

  const generateSchulteTable = (): SchulteTable => {
    const numbers = Array.from({ length: 25 }, (_, i) => i + 1);
    const shuffled = [...numbers].sort(() => Math.random() - 0.5);
    
    const grid: number[][] = [];
    for (let i = 0; i < 5; i++) {
      grid.push(shuffled.slice(i * 5, (i + 1) * 5));
    }

    return {
      grid,
      currentNumber: 1,
      completedNumbers: new Set(),
      isCompleted: false
    };
  };

  const loadOrGenerateTable = () => {
    if (!currentUser) return;
    
    try {
      console.log('Loading or generating table for date:', currentDate);
      const saved = localStorage.getItem(`schulte_${currentUser.id}_${currentDate}`);
      if (saved) {
        const data = JSON.parse(saved);
        console.log('Loaded saved data:', data);
        // Convert completedNumbers array back to Set
        const table = {
          ...data.table,
          completedNumbers: new Set(data.table.completedNumbers || [])
        };
        setSchulteTable(table);
        setGameState(data.gameState);
      } else {
        console.log('No saved data, generating new table');
        const newTable = generateSchulteTable();
        console.log('Generated new table:', newTable);
        setSchulteTable(newTable);
        setGameState({
          isStarted: false,
          isCompleted: false,
          startTime: null,
          endTime: null,
          elapsedTime: 0,
          successfulCompletions: 0
        });
      }
    } catch (error) {
      console.error('Error in loadOrGenerateTable:', error);
      // Fallback to generating new table
      const newTable = generateSchulteTable();
      setSchulteTable(newTable);
      setGameState({
        isStarted: false,
        isCompleted: false,
        startTime: null,
        endTime: null,
        elapsedTime: 0,
        successfulCompletions: 0
      });
    }
  };

  const handleRegenerate = () => {
    setIsLoading(true);
    setTimeout(() => {
      const newTable = generateSchulteTable();
      setSchulteTable(newTable);
      setGameState({
        isStarted: false,
        isCompleted: false,
        startTime: null,
        endTime: null,
        elapsedTime: 0,
        successfulCompletions: 0
      });
      setIsLoading(false);
    }, 500);
  };

  const handleStart = () => {
    setGameState(prev => ({
      ...prev,
      isStarted: true,
      startTime: Date.now()
    }));
  };

  const handleCellClick = (row: number, col: number) => {
    if (!gameState.isStarted || gameState.isCompleted || !schulteTable) return;

    const clickedNumber = schulteTable.grid[row][col];
    
    if (clickedNumber === schulteTable.currentNumber) {
      const newCompletedNumbers = new Set(schulteTable.completedNumbers);
      newCompletedNumbers.add(clickedNumber);
      
      const newCurrentNumber = schulteTable.currentNumber + 1;
      const isCompleted = newCurrentNumber > 25;

      const newTable = {
        ...schulteTable,
        currentNumber: newCurrentNumber,
        completedNumbers: newCompletedNumbers,
        isCompleted
      };

      setSchulteTable(newTable);

      if (isCompleted) {
        const endTime = Date.now();
        const elapsedTime = endTime - (gameState.startTime || 0);
        const elapsedSeconds = elapsedTime / 1000;
        
        // Calculate XP based on time and day
        const dayNumber = Math.floor((Date.now() - new Date('2024-01-01').getTime()) / (1000 * 60 * 60 * 24)) + 1;
        let timeThreshold = 30; // 30 seconds
        let xpAward = 0;

        if (dayNumber <= 30) {
          timeThreshold = 30;
        } else if (dayNumber <= 90) {
          timeThreshold = 25;
        } else {
          timeThreshold = 20;
        }

        if (elapsedSeconds <= timeThreshold) {
          xpAward = 1;
        }

        const newSuccessfulCompletions = gameState.successfulCompletions + (xpAward > 0 ? 1 : 0);
        
        setGameState(prev => ({
          ...prev,
          isCompleted: true,
          endTime,
          elapsedTime
        }));

        // Award XP if completed within threshold and minimum 3 completions
        if (xpAward > 0 && newSuccessfulCompletions >= 3) {
          awardChallengeXP('schulte');
        }

        // Save to localStorage
        if (currentUser) {
          localStorage.setItem(`schulte_${currentUser.id}_${currentDate}`, JSON.stringify({
            table: {
              ...newTable,
              completedNumbers: Array.from(newTable.completedNumbers)
            },
            gameState: {
              ...gameState,
              isCompleted: true,
              endTime,
              elapsedTime,
              successfulCompletions: newSuccessfulCompletions
            }
          }));
        }
      }
    }
  };

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')} ${seconds.toString().padStart(2, '0')} ${milliseconds.toString().padStart(2, '0')}`;
  };

  const getDayNumber = (): number => {
    if (!currentUser) return 1;
    
    const startDate = localStorage.getItem(`schulteStartDate_${currentUser.id}`);
    if (!startDate) {
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem(`schulteStartDate_${currentUser.id}`, today);
      return 1;
    }
    
    const start = new Date(startDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getTimeThreshold = (): number => {
    const dayNumber = getDayNumber();
    if (dayNumber <= 30) return 30;
    if (dayNumber <= 90) return 25;
    return 20;
  };

  if (isLoading) {
    return (
      <div className={styles.loadingCard}>
        <FaBrain className={styles.loadingIcon} />
        <h3>Generating Schulte Table...</h3>
        <p>Creating a new number grid for you!</p>
      </div>
    );
  }

  if (!schulteTable) {
    return null;
  }

  return (
    <div id="schulte-table" className={styles.schulteCard}>
      <h3>Schulte Table</h3>
      <div className={styles.schulteContent}>
        <div className={styles.schulteLeftPanel}>
          <div className={styles.schulteTimerSection}>
            {!gameState.isStarted ? (
              <button 
                className={styles.schulteStartButton}
                onClick={handleStart}
                disabled={gameState.isCompleted}
              >
                <FaPlay />
                Start
              </button>
            ) : (
              <div className={styles.schulteTimer}>
                <div className={styles.schulteTimerIcon}>⏱️</div>
                <div className={styles.schulteTimerDisplay}>
                  {formatTime(gameState.elapsedTime)}
                </div>
                <div className={styles.schulteTimerLabels}>
                  <span>min</span>
                  <span>sec</span>
                  <span>ms</span>
                </div>
              </div>
            )}
          </div>

          <div className={styles.schulteStats}>
            <div className={styles.schulteCompletionCount}>
              Successful Completions: {gameState.successfulCompletions}
            </div>
            {gameState.isCompleted && (
              <div className={styles.schulteCompletionMessage}>
                {gameState.elapsedTime / 1000 <= getTimeThreshold() ? 
                  `✅ Completed in ${(gameState.elapsedTime / 1000).toFixed(1)}s (+1 XP)` :
                  `⏰ Completed in ${(gameState.elapsedTime / 1000).toFixed(1)}s (too slow)`
                }
              </div>
            )}
          </div>

          <div className={styles.schulteActionButtons}>
            <button 
              className={styles.schulteRegenerateButton}
              onClick={handleRegenerate}
              disabled={isLoading}
              title="Regenerate"
            >
              <FaRedo className={isLoading ? styles.spinning : ''} />
            </button>
          </div>
        </div>

        <div className={styles.schulteRightPanel}>
          <div className={styles.schulteGrid}>
            {schulteTable.grid.map((row, rowIndex) => (
              <div key={rowIndex} className={styles.schulteRow}>
                {row.map((number, colIndex) => {
                  const isCompleted = schulteTable.completedNumbers.has(number);
                  
                  return (
                    <button
                      key={`${rowIndex}-${colIndex}`}
                      className={`${styles.schulteCell} ${
                        isCompleted ? styles.schulteCompleted : styles.schultePending
                      }`}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      disabled={!gameState.isStarted || gameState.isCompleted}
                    >
                      {number}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 