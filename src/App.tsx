import { useEffect } from 'react';
import './App.css'
import TopBar from './components/TopBar'
import DashboardMain from './components/DashboardMain'
import MissionPanel from "./components/MissionPanel";
import DailyChallengeGenerator from "./components/DailyChallengeGenerator";
import AuthGuard from "./components/AuthGuard";
import { useTrackerStore } from './store';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

function App() {
  useEffect(() => {
    // Listen for Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        const user = {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          name: firebaseUser.displayName || 'User',
          startDate: new Date().toISOString().split('T')[0]
        };
        await useTrackerStore.getState().setCurrentUser(user);
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
  );
}

export default App
