import { useState } from 'react';
import { FaBrain, FaTrophy, FaChartLine, FaUsers } from 'react-icons/fa';
import { useTrackerStore } from '../store';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import styles from './LandingPage.module.css';

interface AuthForm {
  email: string;
  password: string;
  name?: string;
}

export default function LandingPage() {
  const { setCurrentUser, setStartDate } = useTrackerStore();
  const [isLogin, setIsLogin] = useState<boolean | null>(null);
  const [formData, setFormData] = useState<AuthForm>({
    email: '',
    password: '',
    name: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        // Sign In
        const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        const user = {
          id: userCredential.user.uid,
          email: userCredential.user.email!,
          name: userCredential.user.displayName || 'User',
          startDate: new Date().toISOString().split('T')[0]
        };
        await setCurrentUser(user);
        setStartDate(user.startDate);
      } else {
        // Sign Up
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = {
          id: userCredential.user.uid,
          email: userCredential.user.email!,
          name: formData.name || 'User',
          startDate: new Date().toISOString().split('T')[0]
        };
        await setCurrentUser(user);
        setStartDate(user.startDate);
      }
      setIsLoading(false);
      setIsLogin(null);
    } catch (error: any) {
      console.error('Authentication error:', error);
      
      let errorMessage = 'Authentication failed';
      if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password. Please check your credentials or create a new account.';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email. Please sign up first.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists. Please sign in instead.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters long.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else {
        errorMessage = error.message || 'Authentication failed';
      }
      
      alert(errorMessage);
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className={styles.landingContainer}>
      {/* Background Elements */}
      <div className={styles.backgroundElements}>
        <div className={styles.floatingBrain}>🧠</div>
        <div className={styles.floatingRocket}>🚀</div>
        <div className={styles.floatingTrophy}>🏆</div>
        <div className={styles.floatingChart}>📈</div>
        <div className={styles.floatingLightbulb}>💡</div>
        <div className={styles.floatingUsers}>👥</div>
      </div>

      {/* Top Navigation */}
      <div className={styles.topNav}>
        <div className={styles.logo}>
          <FaBrain className={styles.logoIcon} />
          <span>Zero2Elite</span>
        </div>
        <div className={styles.authButtons}>
          <button 
            onClick={() => setIsLogin(true)}
            className={styles.authButton}
          >
            Sign In
          </button>
          <button 
            onClick={() => setIsLogin(false)}
            className={styles.authButton}
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* Auth Forms Overlay */}
      {isLogin !== null && (
        <div className={styles.authOverlay}>
          <div className={styles.authCard}>
            <button 
              onClick={() => setIsLogin(null)}
              className={styles.closeButton}
            >
              ×
            </button>
            {isLogin && (
              <form onSubmit={handleSubmit} className={styles.authForm}>
                <h3>Welcome Back</h3>
                <div className={styles.inputGroup}>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email"
                    required
                  />
                </div>
                <div className={styles.inputGroup}>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Password"
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  className={styles.submitButton}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className={styles.loadingSpinner}></div>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>
            )}

            {!isLogin && (
              <form onSubmit={handleSubmit} className={styles.authForm}>
                <h3>Join the Elite</h3>
                <div className={styles.inputGroup}>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Full Name"
                    required
                  />
                </div>
                <div className={styles.inputGroup}>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email"
                    required
                  />
                </div>
                <div className={styles.inputGroup}>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Password"
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  className={styles.submitButton}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className={styles.loadingSpinner}></div>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Single Page Content */}
      <div className={styles.mainContent}>
        {/* Hero Section */}
        <div className={styles.heroSection}>
          <div className={styles.heroContent}>
            <div className={styles.heroTitle}>
              <FaBrain className={styles.heroIcon} />
              <h1>Zero2Elite</h1>
            </div>
            <p className={styles.heroSubtitle}>
              Evolve from scratch through daily training challenges
            </p>
            <div className={styles.heroStats}>
              <div className={styles.statItem}>
                <FaTrophy />
                <span>10+ Challenges</span>
              </div>
              <div className={styles.statItem}>
                <FaChartLine />
                <span>Track Progress</span>
              </div>
              <div className={styles.statItem}>
                <FaUsers />
                <span>Join Community</span>
              </div>
            </div>
          </div>
        </div>

        {/* Single Row Cards Section */}
        <div className={styles.cardsSection}>
          <div className={styles.cardsContainer}>
            <div className={styles.cardRow}>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>🚀</div>
                <h3>From Zero to Elite</h3>
                <p>Start your transformation journey with personalized training challenges</p>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>📈</div>
                <h3>Track Your Growth</h3>
                <p>Monitor your evolution with detailed progress analytics and milestones</p>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>🎯</div>
                <h3>Adaptive Challenges</h3>
                <p>Experience challenges that evolve with your growing capabilities</p>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>🏆</div>
                <h3>Earn Your Elite Status</h3>
                <p>Unlock achievements and prove your elite transformation</p>
              </div>
              <div className={styles.challengePreviewCard}>
                <div className={styles.challengeIcon}>🗣️</div>
                <h3>Speech Mastery</h3>
                <p>Master pronunciation and communication skills</p>
              </div>
              <div className={styles.challengePreviewCard}>
                <div className={styles.challengeIcon}>🔢</div>
                <h3>Visual Intelligence</h3>
                <p>Enhance perception and processing speed</p>
              </div>
              <div className={styles.challengePreviewCard}>
                <div className={styles.challengeIcon}>🏛️</div>
                <h3>Memory Evolution</h3>
                <p>Build advanced memory techniques</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
