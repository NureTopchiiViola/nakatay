import { createContext } from 'react';

interface AuthModalContextType {
  openAuthModal: () => void;
}

export const AuthModalContextValue = createContext<AuthModalContextType | undefined>(undefined);
