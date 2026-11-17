import { useState } from 'react';
import type { ReactNode } from 'react';
import { AuthModal } from '../components/auth/AuthModal';
import { AuthModalContextValue } from './AuthModalContextValue';

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AuthModalContextValue.Provider value={{ openAuthModal: () => setIsOpen(true) }}>
      {children}
      <AuthModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </AuthModalContextValue.Provider>
  );
}
