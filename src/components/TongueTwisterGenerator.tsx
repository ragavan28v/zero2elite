import { useState, useEffect } from 'react';
import { FaMicrophone, FaRedo } from 'react-icons/fa';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { useTrackerStore } from '../store';
import styles from './DailyChallengeGenerator.module.css';

interface TongueTwister {
  text: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  category: string;
  tips?: string[];
}

interface ChallengeData {
  date: string;
  tongueTwister: TongueTwister;
  completed: boolean;
  attempts: number;
  bestTime?: number;
  rating?: number;
}

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY as string | undefined;

// Fallback tongue twisters for when AI is not available
const fallbackTongueTwisters = {
  easy: [
    "She sells seashells by the seashore",
    "Peter Piper picked a peck of pickled peppers",
    "How much wood would a woodchuck chuck",
    "Red leather, yellow leather",
    "Fuzzy Wuzzy was a bear"
  ],
  medium: [
    "The sixth sick sheik's sixth sheep's sick",
    "A proper copper coffee pot",
    "Toy boat, toy boat, toy boat",
    "Unique New York, unique New York",
    "Rubber baby buggy bumpers"
  ],
  hard: [
    "Theophilus Thistle, the successful thistle-sifter, in sifting a sieve of unsifted thistles, thrust three thousand thistles through the thick of his thumb",
    "Betty Botter bought some butter, but she said the butter's bitter",
    "I saw Susie sitting in a shoe shine shop",
    "A big black bug bit a big black bear",
    "How can a clam cram in a clean cream can"
  ],
  expert: [
    "The seething sea ceaseth and thus the seething sea sufficeth us",
    "A tutor who tooted the flute tried to tutor two tooters to toot",
    "Said the two to the tutor, is it harder to toot or to tutor two tooters to toot",
    "I wish to wish the wish you wish to wish, but if you wish the wish the witch wishes, I won't wish the wish you wish to wish",
    "The thirty-three thieves thought that they thrilled the throne throughout Thursday"
  ]
};

const generateTongueTwister = async (difficulty: string): Promise<TongueTwister> => {
  try {
    console.log('Generating tongue twister with difficulty:', difficulty);
    
    // First try AI generation
    try {
      const prompt = `Generate a creative ${difficulty} difficulty tongue twister. Return ONLY the tongue twister text, no explanations or quotes.`;

      if (GROQ_API_KEY) {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama3-8b-8192',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.9,
            max_tokens: 100
          })
        });

        if (response.ok) {
          const data = await response.json();
          const rawResponse = data.choices[0].message.content;
          console.log('AI response:', rawResponse);
          
          // Clean the response
          let cleanText = rawResponse.trim();
          cleanText = cleanText.replace(/^["']|["']$/g, ''); // Remove quotes
          cleanText = cleanText.split('\n')[0].trim(); // Take first line
          
          if (cleanText && cleanText.length > 10) {
            const tongueTwister: TongueTwister = {
              text: cleanText,
              difficulty: difficulty as 'easy' | 'medium' | 'hard' | 'expert',
              category: 'alliteration',
              tips: ['Start slow', 'Focus on pronunciation', 'Practice regularly']
            };
            
            console.log('Generated AI tongue twister:', tongueTwister);
            return tongueTwister;
          }
        }
      }
    } catch (aiError) {
      console.warn('AI generation failed, using fallback:', aiError);
    }

    // Fallback to predefined tongue twisters
    const fallbackList = fallbackTongueTwisters[difficulty as keyof typeof fallbackTongueTwisters] || fallbackTongueTwisters.easy;
    const randomIndex = Math.floor(Math.random() * fallbackList.length);
    const selectedText = fallbackList[randomIndex];
    
    console.log('Using fallback tongue twister:', selectedText);

    const tongueTwister: TongueTwister = {
      text: selectedText,
      difficulty: difficulty as 'easy' | 'medium' | 'hard' | 'expert',
      category: 'alliteration',
      tips: ['Start slow', 'Focus on pronunciation', 'Practice regularly']
    };

    return tongueTwister;
  } catch (error) {
    console.error('Error generating tongue twister:', error);
    
    // Ultimate fallback
    const fallbackText = "She sells seashells by the seashore";
    return {
      text: fallbackText,
      difficulty: difficulty as 'easy' | 'medium' | 'hard' | 'expert',
      category: 'alliteration',
      tips: ['Start slow', 'Focus on pronunciation', 'Practice regularly']
    };
  }
};

const getDifficultyForDay = (dayNumber: number): string => {
  if (dayNumber <= 30) return 'easy';
  if (dayNumber <= 60) return 'medium';
  if (dayNumber <= 90) return 'hard';
  return 'expert';
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy': return '#4CAF50';
    case 'medium': return '#FF9800';
    case 'hard': return '#F44336';
    case 'expert': return '#9C27B0';
    default: return '#4CAF50';
  }
};

const getDifficultyIcon = (difficulty: string) => {
  switch (difficulty) {
    case 'easy': return '🌱';
    case 'medium': return '🔥';
    case 'hard': return '⚡';
    case 'expert': return '💎';
    default: return '🌱';
  }
};

export default function TongueTwisterGenerator() {
  const { awardChallengeXP, currentUser } = useTrackerStore();
  const [challengeData, setChallengeData] = useState<ChallengeData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Calculate day number based on current date
  const getDayNumber = () => {
    if (!currentUser) return 1;
    
    const startDateKey = `tongueTwisterStartDate_${currentUser.id}`;
    let startDate = localStorage.getItem(startDateKey);
    
    if (!startDate) {
      // First time using the app, set today as start date
      startDate = currentDate;
      localStorage.setItem(startDateKey, startDate);
    }
    
    const startDateObj = new Date(startDate);
    const currentDateObj = new Date(currentDate);
    const dayNumber = Math.floor((currentDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    return dayNumber;
  };
  
  const dayNumber = getDayNumber();

  useEffect(() => {
    loadOrGenerateChallenge();
  }, [currentDate]);

  const loadOrGenerateChallenge = async () => {
    if (!currentUser) return;
    
    const saved = localStorage.getItem(`tongueTwister_${currentUser.id}_${currentDate}`);
    if (saved) {
      const data = JSON.parse(saved);
      setChallengeData(data);
      setIsCompleted(data.completed);
    } else {
      await generateNewChallenge();
    }
  };

  const generateNewChallenge = async () => {
    setIsLoading(true);
    try {
      const difficulty = getDifficultyForDay(dayNumber);
      console.log('Generating challenge for day', dayNumber, 'with difficulty', difficulty);
      
      const tongueTwister = await generateTongueTwister(difficulty);
      console.log('Generated tongue twister:', tongueTwister);
      
      const newChallenge: ChallengeData = {
        date: currentDate,
        tongueTwister,
        completed: false,
        attempts: 0
      };
      
      console.log('New challenge data:', newChallenge);
      
      setChallengeData(newChallenge);
      setIsCompleted(false);
      
      if (currentUser) {
        localStorage.setItem(`tongueTwister_${currentUser.id}_${currentDate}`, JSON.stringify(newChallenge));
      }
    } catch (error) {
      console.error('Error generating challenge:', error);
      // Still set some data so the UI doesn't break
      const fallbackChallenge: ChallengeData = {
        date: currentDate,
        tongueTwister: {
          text: "She sells seashells by the seashore",
          difficulty: 'easy',
          category: 'alliteration',
          tips: ['Start slow', 'Focus on pronunciation', 'Practice regularly']
        },
        completed: false,
        attempts: 0
      };
      setChallengeData(fallbackChallenge);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    await generateNewChallenge();
  };

  const handleComplete = () => {
    if (challengeData) {
      const difficulty = challengeData.tongueTwister.difficulty;
      
      awardChallengeXP(difficulty);
      setIsCompleted(true);
      
      const updatedChallenge = {
        ...challengeData,
        completed: true
      };
      setChallengeData(updatedChallenge);
      if (currentUser) {
        localStorage.setItem(`tongueTwister_${currentUser.id}_${currentDate}`, JSON.stringify(updatedChallenge));
      }
    }
  };

  if (isLoading) {
    return (
      <div id="tongue-twister" className={styles.twisterCard}>
        <FaMicrophone className={styles.loadingIcon} />
        <h3>Generating Today's Challenge...</h3>
        <p>Creating the perfect tongue twister for you!</p>
        <div className={styles.actionButtons}>
          <button 
            className={styles.regenerateButton}
            onClick={generateNewChallenge}
            disabled={isLoading}
            title="Generate New Challenge"
          >
            <FaRedo className={isLoading ? styles.spinning : ''} />
            Generate
          </button>
        </div>
      </div>
    );
  }

  if (!challengeData) {
    return (
      <div id="tongue-twister" className={styles.twisterCard}>
        <h3>Tongue Twister</h3>
        <p>No challenge available. Click to generate one!</p>
        <div className={styles.actionButtons}>
          <button 
            className={styles.regenerateButton}
            onClick={generateNewChallenge}
            disabled={isLoading}
            title="Generate New Challenge"
          >
            <FaRedo />
            Generate Challenge
          </button>
        </div>
      </div>
    );
  }

  const { tongueTwister } = challengeData;
  const difficultyBadgeColor = getDifficultyColor(tongueTwister.difficulty);

  console.log('Rendering tongue twister:', tongueTwister);

  return (
    <div id="tongue-twister" className={styles.twisterCard}>
      <h3>Tongue Twister</h3>
      <div className={styles.dayInfo}>
        <span className={styles.dayNumber}>Day {dayNumber}</span>
        <span className={styles.difficultyBadge} style={{ background: difficultyBadgeColor }}>
          {getDifficultyIcon(tongueTwister.difficulty)} {tongueTwister.difficulty}
        </span>
      </div>
      <div className={styles.twisterText}>
        "{tongueTwister.text}"
      </div>
      
      <div className={styles.actionButtons}>
        {!isCompleted ? (
          <button 
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            onClick={handleComplete}
            title="Complete Challenge"
          >
            <CheckCircleIcon style={{ color: '#e5e7eb', width: 32, height: 32 }} />
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircleIcon style={{ color: '#22c55e', width: 32, height: 32 }} />
            <span style={{ color: '#22c55e', fontWeight: 600, fontSize: '0.9rem' }}>
              +{tongueTwister.difficulty === 'easy' ? 1 : tongueTwister.difficulty === 'medium' ? 2 : 3} XP
            </span>
          </div>
        )}
        
        <button 
          className={styles.regenerateButton}
          onClick={handleRegenerate}
          disabled={isLoading}
          title="Regenerate"
        >
          <FaRedo className={isLoading ? styles.spinning : ''} />
        </button>
      </div>
    </div>
  );
} 
