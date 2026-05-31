import type { ReactNode } from 'react';
import { useTrackerStore } from '../store';
import LandingPage from './LandingPage';

interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { currentUser } = useTrackerStore();

  // If no user is authenticated, show landing page
  if (!currentUser) {
    return <LandingPage />;
  }

  // If user is authenticated, show the protected content
  return <>{children}</>;
} 
