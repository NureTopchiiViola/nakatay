import { useState } from 'react';
import type { ReactNode } from 'react';
import { AuthModal } from '../components/auth/AuthModal';
import { AuthPromptModal } from '../components/auth/AuthPromptModal';
import { AuthModalContextValue } from './AuthModalContextValue';

const DEFAULT_PROMPT_MESSAGE = 'Щоб зберігати авто в обране, будь ласка, увійдіть до акаунта.';

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [promptMessage, setPromptMessage] = useState<string | null>(null);

  const openAuthModal = () => {
    setPromptMessage(null);
    setIsAuthOpen(true);
  };

  const openAuthPrompt = (message = DEFAULT_PROMPT_MESSAGE) => {
    setPromptMessage(message);
  };

  return (
    <AuthModalContextValue.Provider value={{ openAuthModal, openAuthPrompt }}>
      {children}
      <AuthPromptModal
        isOpen={promptMessage !== null}
        message={promptMessage ?? DEFAULT_PROMPT_MESSAGE}
        onConfirm={openAuthModal}
        onClose={() => setPromptMessage(null)}
      />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </AuthModalContextValue.Provider>
  );
}