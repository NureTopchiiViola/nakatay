import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchUserProfile, type UserProfile } from '../../api';
import { Button } from '../../components/ui/Button';
import { Applications } from '../Applications/Applications';
import { MyBuilds } from './MyBuilds';
import './Profile.css';

const PROFILE_TABS = [
  { id: 'profile', label: 'Профіль' },
  { id: 'builds', label: 'Мої збірки' },
  { id: 'orders', label: 'Історія заявок' },
] as const;
type ProfileTab = typeof PROFILE_TABS[number]['id'];

export function Profile() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = PROFILE_TABS.find(tab => tab.id === searchParams.get('tab'))?.id ?? 'profile';

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
    window.dispatchEvent(new Event('nakatay-auth-changed'));
    navigate('/');
  };

  const selectTab = (tab: ProfileTab) => {
    setSearchParams(tab === 'profile' ? {} : { tab });
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
      <h1 className="profile-title">Особистий кабінет</h1>
      <div className="profile-tabs" role="tablist" aria-label="Розділи особистого кабінету">
        {PROFILE_TABS.map(tab => (
          <button
            aria-controls="profile-tab-panel"
            aria-selected={activeTab === tab.id}
            className={activeTab === tab.id ? 'profile-tab is-active' : 'profile-tab'}
            id={`profile-tab-${tab.id}`}
            key={tab.id}
            onClick={() => selectTab(tab.id)}
            role="tab"
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        aria-labelledby={`profile-tab-${activeTab}`}
        className="profile-tab-panel"
        id="profile-tab-panel"
        role="tabpanel"
      >
        {activeTab === 'profile' && (
          <div className="profile-card">
            <div className="profile-avatar">
              <span>{initials}</span>
            </div>

            <div className="profile-info">
              <h2>{user?.name || 'Користувач'}</h2>
              {user?.role && <span className="profile-role-badge">{user.role}</span>}
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
              <Button variant="outline" onClick={handleLogout}>
                Вийти з акаунту
              </Button>
            </div>
          </div>
        )}
        {activeTab === 'builds' && <MyBuilds />}
        {activeTab === 'orders' && <Applications headingLevel={2} />}
      </div>
    </div>
  );
}