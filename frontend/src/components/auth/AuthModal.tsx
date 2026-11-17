import { useState } from 'react';
import { MdClose } from 'react-icons/md';
import { GoogleLogin } from '@react-oauth/google';
import { API_BASE_URL } from '../../api';
import './AuthModal.css';

interface AuthResponse {
  accessToken: string;
  user: {
    id: number;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    role: string;
  };
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [authError, setAuthError] = useState('');
  if (!isOpen) return null;

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    const googleToken = credentialResponse.credential;
    if (!googleToken) {
      setAuthError('Google не повернув токен авторизації. Спробуйте ще раз.');
      return;
    }
    
    try {
      setAuthError('');
      const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken: googleToken }),
      });

      if (!response.ok) {
        const details = await response.text();
        throw new Error(`Сервер відхилив вхід (${response.status}). ${details}`);
      }

      const data = await response.json() as AuthResponse;
      if (!data.accessToken || !data.user) {
        throw new Error('Сервер повернув неповні дані авторизації.');
      }

      window.localStorage.setItem('accessToken', data.accessToken);
      window.localStorage.setItem('userRole', data.user.role);
      window.localStorage.setItem('userId', String(data.user.id));
      window.localStorage.setItem('userProfile', JSON.stringify({
        name: [data.user.firstName, data.user.lastName].filter(Boolean).join(' '),
        email: data.user.email,
        phone: data.user.phone ?? '',
      }));

      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Не вдалося увійти через Google:', error);
      setAuthError(error instanceof Error ? error.message : 'Не вдалося виконати вхід. Спробуйте ще раз.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <MdClose size={24} />
        </button>
        
        <h2>Увійти в кабінет</h2>
        <p>Увійдіть, щоб зберігати конфігурації та відстежувати заявки.</p>
        {authError && <p className="auth-error" role="alert">{authError}</p>}
        
        <div className="google-btn-wrapper">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              setAuthError('Помилка авторизації Google. Перевірте налаштування OAuth-клієнта.');
            }}
            theme="outline"
            shape="rectangular"
            text="signin_with"
          />
        </div>
      </div>
    </div>
  );
}