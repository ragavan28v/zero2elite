import { useEffect } from 'react';
import './App.css'
import TopBar from './components/TopBar'
import DashboardMain from './components/DashboardMain'
import MissionPanel from "./components/MissionPanel";
import DailyChallengeGenerator from "./components/DailyChallengeGenerator";
import AuthGuard from "./components/AuthGuard";
import { useTrackerStore } from './store';
import { auth } from './firebase';
import { onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth';

function App() {
  const {
    currentUser,
    scheduleChoicePending,
    setScheduleChoicePending,
    openTemplateEditor,
  } = useTrackerStore();

  useEffect(() => {
    // Set local persistence for session preservation across restarts
    setPersistence(auth, browserLocalPersistence).catch(console.error);

    // Clear any stuck auth action flag on load
    localStorage.removeItem('auth_action');

    // Listen for Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // If a login/signup action is currently running in LandingPage, ignore this listener trigger
      if (localStorage.getItem('auth_action') !== null) {
        return;
      }

      if (firebaseUser) {
        // User is signed in (restoring session / reload)
        const user = {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          name: firebaseUser.displayName || 'User',
          startDate: new Date().toISOString().split('T')[0]
        };

        await useTrackerStore.getState().setCurrentUser(user, false);
        useTrackerStore.getState().setStartDate(user.startDate);
      } else {
        // User is signed out
        useTrackerStore.getState().logout();
      }
    });

    return () => unsubscribe();
  }, []);

  // Always show the main app structure, but AuthGuard will handle authentication
  return (
    <>
      <AuthGuard>
        <div className="elite-root">
          <div className="elite-main">
            <TopBar />
            <DashboardMain />
            <DailyChallengeGenerator />
            <MissionPanel />
          </div>
        </div>
      </AuthGuard>

      {currentUser && scheduleChoicePending && (
        <div className="schedule-choice-overlay">
            <div className="schedule-choice-shell">
              <div className="schedule-choice-visual" aria-hidden="true">
              <div className="schedule-choice-visual-backdrop" />
                <img
                  className="schedule-choice-visual-art"
                  src="/selfGrowthillustration.png"
                  alt=""
                />
                <div className="schedule-choice-visual-orb schedule-choice-visual-orb-b" />
                <div className="schedule-choice-visual-grid" />
              <div className="schedule-choice-visual-core">
                <span className="schedule-choice-visual-eyebrow">Zero2Elite</span>
                <strong>Daily ascension</strong>
                <p>Set the baseline. Shape the route. Evolve one day at a time.</p>
              </div>
            </div>

            <div className="schedule-choice-content">
              <div className="schedule-choice-kicker">Welcome {currentUser?.name || 'User'}</div>
              <h2>Choose your opening<br />protocol</h2>
              <p className="schedule-choice-intro">
                Start with your own template or step into the default master plan. You can still refine a single day later without losing your foundation.
              </p>

              <div className="schedule-choice-actions">
                <div className="schedule-choice-option">
                  <div className="schedule-choice-option-copy">
                    <span className="schedule-choice-label">Forge Template</span>
                    <strong>Build your personal baseline</strong>
                    <p>Open the schedule editor and shape your own structure before training begins.</p>
                  </div>
                  <button
                    className="schedule-choice-action schedule-choice-action-primary"
                    onClick={() => {
                      openTemplateEditor();
                      setScheduleChoicePending(false);
                    }}
                  >
                    Plan now
                  </button>
                </div>

                <div className="schedule-choice-option">
                  <div className="schedule-choice-option-copy">
                    <span className="schedule-choice-label schedule-choice-label-secondary">Use Master Plan</span>
                    <strong>Launch with the default route</strong>
                    <p>Keep the Zero2Elite master schedule and customize it later whenever you want.</p>
                  </div>
                  <button
                    className="schedule-choice-action schedule-choice-action-secondary"
                    onClick={() => setScheduleChoicePending(false)}
                  >
                    Skip for now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App
