import { useState, useEffect, useRef } from 'react';
import { FaBrain, FaTrophy, FaChartLine, FaUsers, FaEnvelope, FaLock, FaUser, FaGoogle, FaTimes } from 'react-icons/fa';
import { useTrackerStore } from '../store';
import { auth } from '../firebase';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  getAdditionalUserInfo,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import styles from './LandingPage.module.css';

interface AuthForm {
  email: string;
  password: string;
  name?: string;
}

export default function LandingPage() {
  const formContainerRef = useRef<HTMLDivElement>(null);
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const resetAuthFeedback = () => {
    setAuthError(null);
    setAuthSuccess(null);
  };

  const handleMobileAuthNav = (nextIsLogin: boolean) => {
    setIsLogin(nextIsLogin);
    setIsPasswordReset(false);
    resetAuthFeedback();

    if (!isMobile || !formContainerRef.current) return;

    const targetTop =
      window.scrollY + formContainerRef.current.getBoundingClientRect().top - 12;
    window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
  };

  useEffect(() => {
    if (authError || authSuccess) {
      const timer = setTimeout(() => {
        resetAuthFeedback();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [authError, authSuccess]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    localStorage.setItem('auth_action', 'google');

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const isNewUser = getAdditionalUserInfo(result)?.isNewUser ?? false;

      const user = {
        id: result.user.uid,
        email: result.user.email!,
        name: result.user.displayName || 'User',
        startDate: new Date().toISOString().split('T')[0]
      };

      await setCurrentUser(user, isNewUser);
      setStartDate(user.startDate);
      localStorage.removeItem('auth_action');
    } catch (error: any) {
      console.error('Google auth error:', error);
      localStorage.removeItem('auth_action');
      if (error.code !== 'auth/popup-closed-by-user') {
        let errorMessage = error.message || 'Google sign-in failed.';
        if (error.code === 'auth/unauthorized-domain' || error.code === 'auth/unauthorised-domain') {
          errorMessage =
            'This domain is not authorized for Google sign-in. Add the current hostname to Firebase Authentication > Settings > Authorized domains, then try again.';
        }
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

  const authFeedback = (isInline: boolean) => {
    if (!(authError || authSuccess)) return null;

    const popup = (
      <div
        className={`${styles.feedbackPopup} ${authError ? styles.errorPopup : styles.successPopup} ${
          isInline ? styles.inlineFeedbackPopup : ''
        }`}
      >
        <button
          type="button"
          className={styles.popupCloseButton}
          onClick={resetAuthFeedback}
        >
          <FaTimes />
        </button>
        <p>{authError || authSuccess}</p>
      </div>
    );

    return popup;
  };

  const authForm = isLogin ? (
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
  );

  const mobileView = (
    <div
      style={{
        minHeight: '100dvh',
        width: '100%',
        boxSizing: 'border-box',
        overflowX: 'hidden',
        background:
          'radial-gradient(circle at top left, rgba(255,255,255,0.92), transparent 26%), radial-gradient(circle at bottom right, rgba(96,165,250,0.35), transparent 28%), linear-gradient(135deg, #e3f2fd 0%, #bbdefb 36%, #90caf9 68%, #e8f5ff 100%)',
        padding: '12px 12px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            padding: '12px 14px',
            borderRadius: 24,
            background: 'rgba(255, 255, 255, 0.18)',
            border: '1px solid rgba(33, 150, 243, 0.18)',
            boxShadow: '0 10px 24px rgba(33, 150, 243, 0.08)',
            backdropFilter: 'blur(18px)',
          }}
        >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <FaBrain style={{ fontSize: '1.8rem', color: '#2196f3', flexShrink: 0 }} />
          <span style={{ fontSize: '1.02rem', fontWeight: 700, color: '#1976d2', letterSpacing: 0.3, whiteSpace: 'nowrap' }}>
            Zero2Elite
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: 4,
            borderRadius: 999,
            background: 'rgba(33, 150, 243, 0.09)',
            border: '1px solid rgba(33, 150, 243, 0.12)',
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={() => {
              handleMobileAuthNav(true);
            }}
            style={{
              border: 'none',
              background: isLogin ? '#2196f3' : 'transparent',
              color: isLogin ? '#fff' : '#1976d2',
              padding: '9px 14px',
              borderRadius: 999,
              fontSize: '0.92rem',
              fontWeight: 700,
              boxShadow: isLogin ? '0 6px 14px rgba(33, 150, 243, 0.25)' : 'none',
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              handleMobileAuthNav(false);
            }}
            style={{
              border: 'none',
              background: !isLogin ? '#2196f3' : 'transparent',
              color: !isLogin ? '#fff' : '#1976d2',
              padding: '9px 14px',
              borderRadius: 999,
              fontSize: '0.92rem',
              fontWeight: 700,
              boxShadow: !isLogin ? '0 6px 14px rgba(33, 150, 243, 0.25)' : 'none',
            }}
          >
            Sign Up
          </button>
        </div>
      </div>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <article
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 28,
            minHeight: 240,
            padding: '18px 16px',
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.16), rgba(255,255,255,0.05)), linear-gradient(135deg, rgba(227,242,253,0.44), rgba(100,181,246,0.22)), url(/selfGrowthillustration.png) center/cover no-repeat',
            boxShadow: '0 18px 42px rgba(33, 150, 243, 0.14)',
            border: '1px solid rgba(33,150,243,0.18)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}
        >
          <div style={{ color: '#114e8c', fontSize: 'clamp(2.55rem, 13vw, 3.85rem)', lineHeight: 0.92, fontWeight: 300 }}>
            Daily
          </div>
          <div style={{ color: '#114e8c', fontSize: 'clamp(2.55rem, 13vw, 3.85rem)', lineHeight: 0.92, fontWeight: 300, marginBottom: 10 }}>
            ascension
          </div>
          <p style={{ color: '#1d5f9d', fontSize: '1.02rem', lineHeight: 1.5, maxWidth: 270, margin: 0 }}>
            Set the baseline. Shape the route. Evolve one day at a time.
          </p>
        </article>

        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              color: '#1976d2',
              letterSpacing: 0.7,
              fontSize: 12,
              fontWeight: 800,
              padding: '10px 16px',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.18)',
              border: '1px solid rgba(33, 150, 243, 0.18)',
              boxShadow: '0 8px 18px rgba(33,150,243,0.08)',
              backdropFilter: 'blur(14px)',
              width: 'min(100%, 340px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <span style={{ fontSize: 14 }}>✨</span>
            <span>Cognitive Evolution Platform</span>
          </div>
        </div>

        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              width: 132,
              height: 6,
              borderRadius: 999,
              background: 'linear-gradient(90deg, #2d8cff 0%, #0d7bdc 100%)',
              boxShadow: '0 6px 14px rgba(45, 140, 255, 0.28)',
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '2px 2px 0' }}>
          {[
            {
              title: 'Adaptive Training',
              copy: 'Challenges tailored to your performance.',
            },
            {
              title: 'Growth Analytics',
              copy: 'Detailed mapping of cognitive progress.',
            },
            {
              title: 'Elite Recognition',
              copy: 'Benchmarking against peak capabilities.',
            },
          ].map((item) => (
            <div
              key={item.title}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                padding: 0,
                background: 'transparent',
                border: 'none',
                boxShadow: 'none',
                textAlign: 'center',
              }}
            >
              <span
                style={{
                  width: 9,
                  height: 9,
                  marginTop: 0,
                  borderRadius: 2,
                  transform: 'rotate(45deg)',
                  background: 'linear-gradient(135deg, #2196f3 0%, #1565c0 100%)',
                  flexShrink: 0,
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <strong style={{ color: '#1976d2', fontSize: '1rem', lineHeight: 1.2 }}>{item.title}</strong>
                <span style={{ color: '#1d5f9d', fontSize: '0.94rem', lineHeight: 1.35 }}>{item.copy}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px 12px', borderRadius: 18, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(33,150,243,0.18)', color: '#1976d2', fontSize: '0.93rem', fontWeight: 700, boxShadow: '0 8px 18px rgba(33,150,243,0.08)', backdropFilter: 'blur(14px)' }}>
            <FaTrophy style={{ fontSize: '1rem' }} />
            <span>10+ Challenges</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px 12px', borderRadius: 18, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(33,150,243,0.18)', color: '#1976d2', fontSize: '0.93rem', fontWeight: 700, boxShadow: '0 8px 18px rgba(33,150,243,0.08)', backdropFilter: 'blur(14px)' }}>
            <FaChartLine style={{ fontSize: '1rem' }} />
            <span>Track Progress</span>
          </div>
          <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px 12px', borderRadius: 18, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(33,150,243,0.18)', color: '#1976d2', fontSize: '0.93rem', fontWeight: 700, boxShadow: '0 8px 18px rgba(33,150,243,0.08)', backdropFilter: 'blur(14px)' }}>
            <FaUsers style={{ fontSize: '1rem' }} />
            <span>Join Community</span>
          </div>
        </div>
      </section>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {authFeedback(true)}
        <div
          ref={formContainerRef}
          style={{
            background: 'rgba(255,255,255,0.12)',
            border: '2px solid rgba(33,150,243,0.35)',
            borderRadius: 28,
            boxShadow: '0 0 0 4px rgba(33,150,243,0.08)',
            backdropFilter: 'blur(14px)',
            padding: '14px 14px 16px',
          }}
        >
          {authForm}
        </div>
      </section>
    </div>
  );
  if (isMobile) {
    return mobileView;
  }

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
          <div className={styles.embeddedAuthContainer} ref={formContainerRef}>
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
      {(authError || authSuccess) && !isMobile && (
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

