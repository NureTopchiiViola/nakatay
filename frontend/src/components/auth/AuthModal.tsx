import { MdClose } from 'react-icons/md';
import { GoogleLogin } from '@react-oauth/google';
import { getUserProfile } from '../../auth/userProfile';
import './AuthModal.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  if (!isOpen) return null;

const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
  const googleToken = credentialResponse.credential;
  if (!googleToken) return;
  
  try {
    const response = await fetch('http://localhost:8081/api/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: googleToken }),
    });

    if (response.ok) {
      const data = await response.json();
      
      window.localStorage.setItem('accessToken', data.accessToken);
      window.localStorage.setItem('userProfile', JSON.stringify(getUserProfile(googleToken)));
      
      console.log('auth success');
      onClose();
      
      window.location.reload(); 
    } else {
      console.error('bad response from server:', response.status, await response.text());
    }
  } catch (error) {
    console.error('Error occurred while fetching auth data:', error);
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
        
        <div className="google-btn-wrapper">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              console.error('Помилка авторизації Google');
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