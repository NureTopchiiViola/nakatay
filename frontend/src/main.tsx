import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="160728940006-h6okatakjd25a7ghbiadbim7vmpbs9vd.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </StrictMode>
);