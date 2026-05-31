import { useState, useEffect } from 'react';
import { FaRedo, FaCheck, FaPlay } from 'react-icons/fa';
import { useTrackerStore } from '../store';
import styles from './DailyChallengeGenerator.module.css';

type PatternType = 'arithmetic' | 'geometric' | 'fibonacci' | 'square';
type PatternDifficulty = 'easy' | 'medium' | 'hard';

interface Pattern {
  id: number;
  sequence: (number | string)[];
  answer: number | string;
  type: PatternType;
  difficulty: PatternDifficulty;
}

interface PatternData {
  date: string;
  patterns: Pattern[];
  currentPattern: number;
  userAnswers: (number | string)[];
  isCompleted: boolean;
  score: number;
  timeLimit: number;
  timeRemaining: number;
  isTimerRunning: boolean;
}

type PatternTemplate = Omit<Pattern, 'id' | 'difficulty'>;

const PATTERN_TYPES: Record<PatternType, Record<PatternDifficulty, PatternTemplate[]>> = {
  arithmetic: {
    easy: [
      { sequence: [2, 4, 6, 8, 10], answer: 12, type: 'arithmetic' },
      { sequence: [5, 10, 15, 20, 25], answer: 30, type: 'arithmetic' },
      { sequence: [1, 3, 5, 7, 9], answer: 11, type: 'arithmetic' },
      { sequence: [10, 20, 30, 40, 50], answer: 60, type: 'arithmetic' },
      { sequence: [3, 6, 9, 12, 15], answer: 18, type: 'arithmetic' }
    ],
    medium: [
      { sequence: [2, 5, 8, 11, 14], answer: 17, type: 'arithmetic' },
      { sequence: [1, 4, 7, 10, 13], answer: 16, type: 'arithmetic' },
      { sequence: [5, 12, 19, 26, 33], answer: 40, type: 'arithmetic' },
      { sequence: [3, 8, 13, 18, 23], answer: 28, type: 'arithmetic' },
      { sequence: [7, 15, 23, 31, 39], answer: 47, type: 'arithmetic' }
    ],
    hard: [
      { sequence: [2, 7, 12, 17, 22], answer: 27, type: 'arithmetic' },
      { sequence: [1, 6, 11, 16, 21], answer: 26, type: 'arithmetic' },
      { sequence: [3, 11, 19, 27, 35], answer: 43, type: 'arithmetic' },
      { sequence: [5, 16, 27, 38, 49], answer: 60, type: 'arithmetic' },
      { sequence: [7, 20, 33, 46, 59], answer: 72, type: 'arithmetic' }
    ]
  },
  geometric: {
    easy: [
      { sequence: [2, 4, 8, 16, 32], answer: 64, type: 'geometric' },
      { sequence: [3, 6, 12, 24, 48], answer: 96, type: 'geometric' },
      { sequence: [1, 2, 4, 8, 16], answer: 32, type: 'geometric' },
      { sequence: [5, 10, 20, 40, 80], answer: 160, type: 'geometric' },
      { sequence: [2, 6, 18, 54, 162], answer: 486, type: 'geometric' }
    ],
    medium: [
      { sequence: [2, 6, 18, 54, 162], answer: 486, type: 'geometric' },
      { sequence: [3, 9, 27, 81, 243], answer: 729, type: 'geometric' },
      { sequence: [1, 3, 9, 27, 81], answer: 243, type: 'geometric' },
      { sequence: [4, 12, 36, 108, 324], answer: 972, type: 'geometric' },
      { sequence: [2, 8, 32, 128, 512], answer: 2048, type: 'geometric' }
    ],
    hard: [
      { sequence: [2, 10, 50, 250, 1250], answer: 6250, type: 'geometric' },
      { sequence: [3, 15, 75, 375, 1875], answer: 9375, type: 'geometric' },
      { sequence: [1, 7, 49, 343, 2401], answer: 16807, type: 'geometric' },
      { sequence: [2, 14, 98, 686, 4802], answer: 33614, type: 'geometric' },
      { sequence: [3, 21, 147, 1029, 7203], answer: 50421, type: 'geometric' }
    ]
  },
  fibonacci: {
    easy: [
      { sequence: [1, 1, 2, 3, 5], answer: 8, type: 'fibonacci' },
      { sequence: [2, 2, 4, 6, 10], answer: 16, type: 'fibonacci' },
      { sequence: [1, 2, 3, 5, 8], answer: 13, type: 'fibonacci' },
      { sequence: [3, 3, 6, 9, 15], answer: 24, type: 'fibonacci' },
      { sequence: [2, 3, 5, 8, 13], answer: 21, type: 'fibonacci' }
    ],
    medium: [
      { sequence: [1, 1, 2, 3, 5, 8], answer: 13, type: 'fibonacci' },
      { sequence: [2, 2, 4, 6, 10, 16], answer: 26, type: 'fibonacci' },
      { sequence: [3, 3, 6, 9, 15, 24], answer: 39, type: 'fibonacci' },
      { sequence: [1, 2, 3, 5, 8, 13], answer: 21, type: 'fibonacci' },
      { sequence: [2, 3, 5, 8, 13, 21], answer: 34, type: 'fibonacci' }
    ],
    hard: [
      { sequence: [1, 1, 2, 3, 5, 8, 13], answer: 21, type: 'fibonacci' },
      { sequence: [2, 2, 4, 6, 10, 16, 26], answer: 42, type: 'fibonacci' },
      { sequence: [3, 3, 6, 9, 15, 24, 39], answer: 63, type: 'fibonacci' },
      { sequence: [1, 2, 3, 5, 8, 13, 21], answer: 34, type: 'fibonacci' },
      { sequence: [2, 3, 5, 8, 13, 21, 34], answer: 55, type: 'fibonacci' }
    ]
  },
  square: {
    easy: [
      { sequence: [1, 4, 9, 16, 25], answer: 36, type: 'square' },
      { sequence: [2, 5, 10, 17, 26], answer: 37, type: 'square' },
      { sequence: [0, 3, 8, 15, 24], answer: 35, type: 'square' },
      { sequence: [4, 9, 16, 25, 36], answer: 49, type: 'square' },
      { sequence: [1, 5, 11, 19, 29], answer: 41, type: 'square' }
    ],
    medium: [
      { sequence: [1, 4, 9, 16, 25, 36], answer: 49, type: 'square' },
      { sequence: [2, 5, 10, 17, 26, 37], answer: 50, type: 'square' },
      { sequence: [0, 3, 8, 15, 24, 35], answer: 48, type: 'square' },
      { sequence: [4, 9, 16, 25, 36, 49], answer: 64, type: 'square' },
      { sequence: [1, 5, 11, 19, 29, 41], answer: 55, type: 'square' }
    ],
    hard: [
      { sequence: [1, 4, 9, 16, 25, 36, 49], answer: 64, type: 'square' },
      { sequence: [2, 5, 10, 17, 26, 37, 50], answer: 65, type: 'square' },
      { sequence: [0, 3, 8, 15, 24, 35, 48], answer: 63, type: 'square' },
      { sequence: [4, 9, 16, 25, 36, 49, 64], answer: 81, type: 'square' },
      { sequence: [1, 5, 11, 19, 29, 41, 55], answer: 71, type: 'square' }
    ]
  }
};

export default function PatternRecognitionMatrix() {
  const { awardChallengeXP, currentUser } = useTrackerStore();
  const [patternData, setPatternData] = useState<PatternData | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [countdownInterval, setCountdownInterval] = useState<NodeJS.Timeout | null>(null);

  // Load or generate pattern data
  useEffect(() => {
    loadOrGeneratePatterns();
  }, []);

  // Timer effect
  useEffect(() => {
    if (patternData?.isTimerRunning && patternData.timeRemaining > 0) {
      const timer = setInterval(() => {
        setPatternData(prev => {
          if (!prev) return prev;
          if (prev.timeRemaining <= 1) {
            clearInterval(timer);
            setCountdownInterval(null);
            return { ...prev, isTimerRunning: false, timeRemaining: 0 };
          }
          return { ...prev, timeRemaining: prev.timeRemaining - 1 };
        });
      }, 1000);
      setCountdownInterval(timer);
    }
    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [patternData?.isTimerRunning]);

  const getTimeLimit = () => {
    if (!currentUser) return 120;
    
    const startDate = new Date(currentUser.startDate);
    const today = new Date();
    const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceStart <= 30) return 120; // 2 minutes
    if (daysSinceStart <= 60) return 90;  // 1.5 minutes
    return 60; // 1 minute
  };

  const loadOrGeneratePatterns = () => {
    if (!currentUser) return;
    
    const saved = localStorage.getItem(`patternMatrix_${currentUser.id}_${currentDate}`);
    if (saved) {
      const data = JSON.parse(saved);
      setPatternData(data);
    } else {
      generateNewPatterns();
    }
  };

  const generateNewPatterns = () => {
    if (!currentUser) return;
    
    const timeLimit = getTimeLimit();
    const patterns: Pattern[] = [];
    
    // Generate 5 patterns with mixed types and difficulties
    const types: PatternType[] = ['arithmetic', 'geometric', 'fibonacci', 'square'];
    const difficulties: PatternDifficulty[] = ['easy', 'medium', 'hard'];
    
    for (let i = 0; i < 5; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
      const typePatterns = PATTERN_TYPES[type as keyof typeof PATTERN_TYPES];
      const difficultyPatterns = typePatterns[difficulty as keyof typeof typePatterns];
      const randomPattern = difficultyPatterns[Math.floor(Math.random() * difficultyPatterns.length)];
      
      patterns.push({
        id: i + 1,
        sequence: randomPattern.sequence,
        answer: randomPattern.answer,
        type: randomPattern.type,
        difficulty
      });
    }
    
    const newData: PatternData = {
      date: currentDate,
      patterns,
      currentPattern: 0,
      userAnswers: [],
      isCompleted: false,
      score: 0,
      timeLimit,
      timeRemaining: timeLimit,
      isTimerRunning: false
    };
    
    setPatternData(newData);
    setUserAnswer('');
    
    if (currentUser) {
      localStorage.setItem(`patternMatrix_${currentUser.id}_${currentDate}`, JSON.stringify(newData));
    }
  };

  const handleStartTimer = () => {
    if (!patternData) return;
    
    // Clear any existing timer
    if (countdownInterval) {
      clearInterval(countdownInterval);
    }
    
    setPatternData(prev => {
      if (!prev) return prev;
      return { ...prev, isTimerRunning: true, timeRemaining: prev.timeLimit };
    });
  };

  const handleSubmitAnswer = () => {
    if (!patternData || !userAnswer.trim()) return;
    
    const currentPattern = patternData.patterns[patternData.currentPattern];
    const isCorrect = userAnswer.trim() === currentPattern.answer.toString();
    
    const newUserAnswers = [...patternData.userAnswers, userAnswer.trim()];
    const newScore = patternData.score + (isCorrect ? 1 : 0);
    
    const nextPattern = patternData.currentPattern + 1;
    const isCompleted = nextPattern >= patternData.patterns.length;
    
    const updatedData = {
      ...patternData,
      currentPattern: nextPattern,
      userAnswers: newUserAnswers,
      score: newScore,
      isCompleted,
      isTimerRunning: !isCompleted
    };
    
    setPatternData(updatedData);
    setUserAnswer('');
    
    if (isCompleted) {
      // Award XP if score is 5+
      if (newScore >= 5) {
        awardChallengeXP('patternMatrix');
      }
    }
    
    if (currentUser) {
      localStorage.setItem(`patternMatrix_${currentUser.id}_${currentDate}`, JSON.stringify(updatedData));
    }
  };

  const handleRegenerate = () => {
    // Clear any existing timer
    if (countdownInterval) {
      clearInterval(countdownInterval);
      setCountdownInterval(null);
    }
    
    setIsLoading(true);
    setTimeout(() => {
      generateNewPatterns();
      setIsLoading(false);
    }, 500);
  };

  const getCurrentPattern = () => {
    if (!patternData) return null;
    return patternData.patterns[patternData.currentPattern];
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!patternData) {
    return (
      <div className={styles.placeholderCard}>
        <div className={styles.loadingCard}>
          <div className={styles.loadingIcon}>🔍</div>
          <h3>Loading Pattern Matrix...</h3>
        </div>
      </div>
    );
  }

  const currentPattern = getCurrentPattern();

  return (
    <div id="pattern-recognition" className={styles.placeholderCard}>
      <h3>Pattern Recognition Matrix</h3>
      <div className={styles.placeholderContent}>
        
        {/* Game State Display */}
        <div className={styles.gameStateInfo}>
          {!patternData.isTimerRunning && !patternData.isCompleted && (
            <div className={styles.memorizeInfo}>
              <h4>🔍 Pattern Recognition</h4>
              <p>Find the next number in each sequence. Time limit: {formatTime(patternData.timeLimit)}</p>
            </div>
          )}
          
          {patternData.isTimerRunning && !patternData.isCompleted && (
            <div className={styles.studyInfo}>
              <h4>⏰ {formatTime(patternData.timeRemaining)}</h4>
              <p>Pattern {patternData.currentPattern + 1}/5 • Score: {patternData.score}</p>
              <div className={styles.studyTimer}>
                <div className={styles.timerBar}>
                  <div 
                    className={styles.timerProgress} 
                    style={{ width: `${(patternData.timeRemaining / patternData.timeLimit) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
          
          {patternData.isCompleted && (
            <div className={styles.completedInfo}>
              <h4>✅ {patternData.score}/5</h4>
              {patternData.score >= 5 && (
                <div className={styles.xpAward}>
                  <FaCheck style={{ color: '#22c55e', marginRight: '4px' }} />
                  +1 XP
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pattern Display */}
        {currentPattern && patternData.isTimerRunning && !patternData.isCompleted && (
          <div className={styles.patternContainer}>
            <div className={styles.patternGrid}>
              {currentPattern.sequence.map((item, index) => (
                <div key={index} className={styles.patternItem}>
                  {item}
                </div>
              ))}
              <div className={styles.patternItem}>
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="?"
                  className={styles.answerInput}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmitAnswer()}
                  autoFocus
                />
              </div>
            </div>
            
            <div className={styles.patternInfo}>
              <p>Type: {currentPattern.type.charAt(0).toUpperCase() + currentPattern.type.slice(1)}</p>
              <p>Difficulty: {currentPattern.difficulty.charAt(0).toUpperCase() + currentPattern.difficulty.slice(1)}</p>
            </div>
            
            <button
              onClick={handleSubmitAnswer}
              disabled={!userAnswer.trim()}
              className={styles.submitButton}
            >
              Submit Answer
            </button>
          </div>
        )}

        {/* Results Display */}
        {patternData.isCompleted && (
          <div className={styles.resultsContainer}>
            {patternData.patterns.map((pattern, index) => (
              <div key={pattern.id} className={styles.resultItem}>
                <div className={styles.resultSequence}>
                  {pattern.sequence.join(' → ')} → {pattern.answer}
                </div>
                <div className={styles.resultAnswer}>
                  Your answer: {patternData.userAnswers[index]}
                  <span className={patternData.userAnswers[index] === pattern.answer.toString() ? styles.correct : styles.incorrect}>
                    {patternData.userAnswers[index] === pattern.answer.toString() ? ' ✓' : ' ✗'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons (clean layout without faded placeholders) */}
        <div className={styles.actionRow}>
          {!patternData.isTimerRunning && !patternData.isCompleted && (
            <button
              onClick={handleStartTimer}
              className={styles.iconButton}
              title="Start Challenge"
            >
              <FaPlay />
            </button>
          )}
          <button
            onClick={handleRegenerate}
            disabled={isLoading}
            className={styles.iconButton}
            title="New Patterns"
          >
            <FaRedo className={isLoading ? styles.spinning : ''} />
          </button>
        </div>
      </div>
    </div>
  );
} 
