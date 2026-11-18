import { createContext } from 'react';

interface AuthModalContextType {
  openAuthModal: () => void;
  openAuthPrompt: (message?: string) => void;
}

export const AuthModalContextValue = createContext<AuthModalContextType | undefined>(undefined);