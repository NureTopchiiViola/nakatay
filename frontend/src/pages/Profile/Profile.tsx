import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUserProfile, type UserProfile } from '../../api';
import { Button } from '../../components/ui/Button';
import './Profile.css';

export function Profile() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    fetchUserProfile()
      .then((data) => {
        if (isMounted) {
          setUser(data);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        if (err.message === 'Unauthorized' || err.message === 'No access token') {
          navigate('/');
        } else {
          setError('Не вдалося завантажити профіль. Спробуйте пізніше.');
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="profile-container">
        <p className="profile-status">Завантаження профілю...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <p className="profile-error">{error}</p>
      </div>
    );
  }

  const initials = user?.name
    ? user.name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-avatar">
          <span>{initials}</span>
        </div>

        <div className="profile-info">
          <h2>{user?.name || 'Користувач'}</h2>
          
          {user?.role && (
            <span className="profile-role-badge">
              {user.role}
            </span>
          )}

          <div className="profile-details">
            <div className="profile-detail-row">
              <span className="profile-label">Email</span>
              <span className="profile-value">{user?.email || 'Не вказано'}</span>
            </div>
            <div className="profile-detail-row">
              <span className="profile-label">Телефон</span>
              <span className="profile-value">{user?.phone || 'Не вказано'}</span>
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <Button variant="outline" onClick={() => navigate('/orders')}>
            Історія та статус заявок
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            Вийти з акаунту
          </Button>
        </div>
      </div>
    </div>
  );
}