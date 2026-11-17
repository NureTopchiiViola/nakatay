import { useContext } from 'react';
import { AuthModalContextValue } from './AuthModalContextValue';

export function useAuthModal() {
  const context = useContext(AuthModalContextValue);
  if (!context) throw new Error('useAuthModal must be used within an AuthModalProvider');
  return context;
}
