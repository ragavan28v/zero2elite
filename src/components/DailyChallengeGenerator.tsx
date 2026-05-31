import { FaMicrophone, FaBrain, FaSearch, FaCalculator, FaLanguage, FaClock, FaSync, FaPuzzlePiece, FaCube, FaBolt, FaCrosshairs, FaGlobe, FaQuestionCircle } from 'react-icons/fa';
import { MdSpeed, MdPsychology } from 'react-icons/md';
import styles from './DailyChallengeGenerator.module.css';
import TongueTwisterGenerator from './TongueTwisterGenerator';
import SchulteTableGenerator from './SchulteTableGenerator';
import MemoryPalaceBuilder from './MemoryPalaceBuilder';
import PatternRecognitionMatrix from './PatternRecognitionMatrix';
import ChallengeLabGrid from './ChallengeLabGrid';
import { useTrackerStore } from '../store';

export default function DailyChallengeGenerator() {
  const { currentUser } = useTrackerStore();

  // Ensure user is authenticated
  if (!currentUser) {
    return null; // AuthGuard will handle this
  }
  return (
    <div className={styles.challengeContainer}>
      <div className={styles.challengeCard}>
        <div className={styles.challengeHeader}>
          <div className={styles.challengeTitle}>
            <FaMicrophone className={styles.titleIcon} />
            <h2>Daily Challenge Generator</h2>
          </div>
        </div>

        {/* Challenge Navigation */}
        <div className={styles.challengeNavigation}>
          <div 
            className={styles.navIcon} 
            title="Tongue Twister Generator"
            onClick={() => document.getElementById('tongue-twister')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <FaMicrophone />
          </div>
          <div 
            className={styles.navIcon} 
            title="Schulte Table Generator"
            onClick={() => document.getElementById('schulte-table')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <FaBrain />
          </div>
          <div 
            className={styles.navIcon} 
            title="Memory Palace Builder"
            onClick={() => document.getElementById('memory-palace')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <FaCube />
          </div>
          <div 
            className={styles.navIcon} 
            title="Pattern Recognition Matrix"
            onClick={() => document.getElementById('pattern-recognition')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <FaSearch />
          </div>
          <div 
            className={styles.navIcon} 
            title="Speed Reading Tracker"
            onClick={() => document.getElementById('speed-reading')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <MdSpeed />
          </div>
          <div 
            className={styles.navIcon} 
            title="Mental Math Trainer"
            onClick={() => document.getElementById('mental-math')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <FaCalculator />
          </div>
          <div 
            className={styles.navIcon} 
            title="Vocabulary Builder"
            onClick={() => document.getElementById('vocabulary-builder')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <FaLanguage />
          </div>
          <div 
            className={styles.navIcon} 
            title="Attention Span Tracker"
            onClick={() => document.getElementById('attention-span')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <FaClock />
          </div>
          <div 
            className={styles.navIcon} 
            title="Dual Task Trainer"
            onClick={() => document.getElementById('dual-task')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <FaSync />
          </div>
          <div 
            className={styles.navIcon} 
            title="Lateral Thinking Puzzles"
            onClick={() => document.getElementById('lateral-thinking')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <FaPuzzlePiece />
          </div>
          <div 
            className={styles.navIcon} 
            title="Visual-Spatial Trainer"
            onClick={() => document.getElementById('visual-spatial')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <MdPsychology />
          </div>
          <div 
            className={styles.navIcon} 
            title="Logic Gate Builder"
            onClick={() => document.getElementById('logic-gate')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <FaBolt />
          </div>
          <div 
            className={styles.navIcon} 
            title="Reaction Time Tester"
            onClick={() => document.getElementById('reaction-time')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <FaCrosshairs />
          </div>
          <div 
            className={styles.navIcon} 
            title="Hand-Eye Coordination"
            onClick={() => document.getElementById('hand-eye')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <FaCrosshairs />
          </div>
          <div 
            className={styles.navIcon} 
            title="Language Learning Assistant"
            onClick={() => document.getElementById('language-learning')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <FaGlobe />
          </div>
          <div 
            className={styles.navIcon} 
            title="Knowledge Quiz Generator"
            onClick={() => document.getElementById('knowledge-quiz')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <FaQuestionCircle />
          </div>
        </div>

        <div className={styles.challengeContent}>
          <TongueTwisterGenerator />
          <SchulteTableGenerator />
          <MemoryPalaceBuilder />
          <PatternRecognitionMatrix />
          <ChallengeLabGrid />
        </div>
      </div>
    </div>
  );
} 
