import { useState, useEffect } from 'react';
import { FaBrain, FaTrophy, FaChartLine, FaUsers, FaEnvelope, FaLock, FaUser, FaGoogle, FaTimes } from 'react-icons/fa';
import { useTrackerStore } from '../store';
import { auth } from '../firebase';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  signOut,
  getAdditionalUserInfo,
} from 'firebase/auth';
import styles from './LandingPage.module.css';

interface AuthForm {
  email: string;
  password: string;
  name?: string;
}

export default function LandingPage() {
  const { 
    setCurrentUser, 
    setStartDate, 
    authError,
    authSuccess,
    setAuthError,
    setAuthSuccess
  } = useTrackerStore();

  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [formData, setFormData] = useState<AuthForm>({
    email: '',
    password: '',
    name: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false);

  const resetAuthFeedback = () => {
    setAuthError(null);
    setAuthSuccess(null);
  };

  useEffect(() => {
    if (authError || authSuccess) {
      const timer = setTimeout(() => {
        resetAuthFeedback();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [authError, authSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetAuthFeedback();
    setIsLoading(true);
    localStorage.setItem('auth_action', isLogin ? 'signin' : 'signup');

    try {
      if (isLogin) {
        // Email Sign In: Firebase Auth naturally throws user-not-found for unregistered accounts
        const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        const user = {
          id: userCredential.user.uid,
          email: userCredential.user.email!,
          name: userCredential.user.displayName || 'User',
          startDate: new Date().toISOString().split('T')[0]
        };
        await setCurrentUser(user, false);
        setStartDate(user.startDate);
      } else {
        // Email Sign Up: Create a new account
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        await updateProfile(userCredential.user, { displayName: formData.name || 'User' });
        const user = {
          id: userCredential.user.uid,
          email: userCredential.user.email!,
          name: formData.name || 'User',
          startDate: new Date().toISOString().split('T')[0]
        };
        await setCurrentUser(user, true);
        setStartDate(user.startDate);
      }
      setIsLoading(false);
      setIsPasswordReset(false);
      localStorage.removeItem('auth_action');
    } catch (error: any) {
      console.error('Authentication error:', error);
      localStorage.removeItem('auth_action');

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

      setAuthError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    resetAuthFeedback();
    setIsLoading(true);
    localStorage.setItem('auth_action', isLogin ? 'signin' : 'signup');

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const isNewUser = getAdditionalUserInfo(result)?.isNewUser;

      if (isLogin) {
        // Sign In Mode: Block if this is a brand new account (unregistered)
        if (isNewUser) {
          await result.user.delete();
          await signOut(auth);
          useTrackerStore.getState().logout();
          setAuthError('No account found with this Google account. Please sign up first.');
          localStorage.removeItem('auth_action');
          setIsLoading(false);
          return;
        }
      }

      const user = {
        id: result.user.uid,
        email: result.user.email!,
        name: result.user.displayName || 'User',
        startDate: new Date().toISOString().split('T')[0]
      };

      await setCurrentUser(user, !isLogin && isNewUser);
      setStartDate(user.startDate);
      localStorage.removeItem('auth_action');
    } catch (error: any) {
      console.error('Google auth error:', error);
      localStorage.removeItem('auth_action');
      if (error.code !== 'auth/popup-closed-by-user') {
        const errorMessage = error.message || 'Google sign-in failed.';
        setAuthError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    resetAuthFeedback();

    if (!formData.email.trim()) {
      setAuthError('Please enter your email address so we can send a reset link.');
      return;
    }

    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, formData.email.trim());
      setAuthSuccess('Password reset link sent. Please check your inbox and spam folder.');
      setIsPasswordReset(false);
    } catch (error: any) {
      console.error('Password reset error:', error);
      const errorMessage = error.code === 'auth/user-not-found'
        ? 'No account exists for that email yet.'
        : error.message || 'Unable to send a password reset email.';
      setAuthError(errorMessage);
    } finally {
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
        <div className={styles.orb1}></div>
        <div className={styles.orb2}></div>
        <div className={styles.orb3}></div>
      </div>

      {/* Top Navigation */}
      <div className={styles.topNav}>
        <div className={styles.logo}>
          <FaBrain className={styles.logoIcon} />
          <span>Zero2Elite</span>
        </div>
        <div className={styles.authButtons}>
          <button 
            onClick={() => {
              setIsLogin(true);
              setIsPasswordReset(false);
              resetAuthFeedback();
            }}
            className={`${styles.authButton} ${isLogin ? styles.active : ''}`}
          >
            Sign In
          </button>
          <button 
            onClick={() => {
              setIsLogin(false);
              setIsPasswordReset(false);
              resetAuthFeedback();
            }}
            className={`${styles.authButton} ${!isLogin ? styles.active : ''}`}
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* Main Content Layout (Non-Scrollable Viewport Split Grid) */}
      <div className={styles.mainContent}>
        {/* Left Column: Hero Details & Upfront Features */}
        <div className={styles.leftColumn}>
          <div className={styles.heroContent}>
            <div className={styles.heroBadgeContainer}>
              <div className={styles.heroBadge}>
                <span>✨ Cognitive Evolution Platform</span>
              </div>
              <div className={styles.badgeUnderline}></div>
            </div>
            <p className={styles.heroSubtitle}>
              Daily mental training challenges designed to elevate your cognitive baseline.
            </p>

            <div className={styles.featuresAndStatsContainer}>
              <div className={styles.coreFeaturesList}>
                <div className={styles.featureItem}>
                  <span className={styles.accentDot}></span>
                  <div className={styles.featureItemText}>
                    <h3>Adaptive Training</h3>
                    <p>Challenges tailored to your performance.</p>
                  </div>
                </div>
                <div className={styles.featureItem}>
                  <span className={styles.accentDot}></span>
                  <div className={styles.featureItemText}>
                    <h3>Growth Analytics</h3>
                    <p>Detailed mapping of cognitive progress.</p>
                  </div>
                </div>
                <div className={styles.featureItem}>
                  <span className={styles.accentDot}></span>
                  <div className={styles.featureItemText}>
                    <h3>Elite Recognition</h3>
                    <p>Benchmarking against peak capabilities.</p>
                  </div>
                </div>
              </div>

              <div className={styles.verticalStatsList}>
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
        </div>

        {/* Right Column: Embedded Form Blending into Surface */}
        <div className={styles.rightColumn}>
          <div className={styles.embeddedAuthContainer}>
            {isLogin ? (
              <form onSubmit={isPasswordReset ? handlePasswordReset : handleSubmit} className={styles.authForm}>
                <h3>{isPasswordReset ? 'Reset Password' : 'Welcome Back'}</h3>
                <p className={styles.formSubtitle}>
                  {isPasswordReset ? 'Enter your email to receive a password reset link' : 'Sign in to continue your evolution'}
                </p>
                
                <div className={styles.inputGroup}>
                  <FaEnvelope className={styles.inputIcon} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email Address"
                    required
                  />
                </div>
                {!isPasswordReset && (
                  <div className={styles.inputGroup}>
                    <FaLock className={styles.inputIcon} />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Password"
                      required
                    />
                  </div>
                )}
                
                <button 
                  type="submit" 
                  className={styles.submitButton}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className={styles.loadingSpinner}></div>
                  ) : (
                    isPasswordReset ? 'Send Reset Link' : 'Sign In'
                  )}
                </button>
                
                <div className={styles.formOptions}>
                  {!isPasswordReset ? (
                    <button
                      type="button"
                      className={styles.secondaryButton}
                      onClick={() => setIsPasswordReset(true)}
                    >
                      Forgot password?
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={styles.secondaryButton}
                      onClick={() => {
                        setIsPasswordReset(false);
                        resetAuthFeedback();
                      }}
                    >
                      Back to sign in
                    </button>
                  )}
                  
                  <button
                    type="button"
                    className={styles.toggleFormButton}
                    onClick={() => {
                      setIsLogin(false);
                      setIsPasswordReset(false);
                      resetAuthFeedback();
                    }}
                  >
                    Don't have an account? Sign Up
                  </button>
                </div>

                <div className={styles.divider}>
                  <span>or</span>
                </div>

                <button
                  type="button"
                  className={styles.socialButton}
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className={styles.loadingSpinner}></div>
                  ) : (
                    <>
                      <FaGoogle className={styles.googleIcon} />
                      <span>Continue with Google</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className={styles.authForm}>
                <h3>Join the Elite</h3>
                <p className={styles.formSubtitle}>Create an account to start your transformation</p>
                
                <div className={styles.inputGroup}>
                  <FaUser className={styles.inputIcon} />
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
                  <FaEnvelope className={styles.inputIcon} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email Address"
                    required
                  />
                </div>
                <div className={styles.inputGroup}>
                  <FaLock className={styles.inputIcon} />
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

                <div className={styles.formOptions}>
                  <button
                    type="button"
                    className={styles.toggleFormButton}
                    onClick={() => {
                      setIsLogin(true);
                      setIsPasswordReset(false);
                      resetAuthFeedback();
                    }}
                  >
                    Already have an account? Sign In
                  </button>
                </div>

                <div className={styles.divider}>
                  <span>or</span>
                </div>

                <button
                  type="button"
                  className={styles.socialButton}
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className={styles.loadingSpinner}></div>
                  ) : (
                    <>
                      <FaGoogle className={styles.googleIcon} />
                      <span>Continue with Google</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Feedback Popup - Fixed Position */}
      {(authError || authSuccess) && (
        <div className={`${styles.feedbackPopup} ${authError ? styles.errorPopup : styles.successPopup}`}>
          <button
            type="button"
            className={styles.popupCloseButton}
            onClick={resetAuthFeedback}
          >
            <FaTimes />
          </button>
          <p>{authError || authSuccess}</p>
        </div>
      )}
    </div>
  );
} 
