import type { UserProfile } from '../auth/userProfile';

export type ApplicationStatus = 'new' | 'in_progress' | 'completed' | 'cancelled';
export type ApplicationPaymentMethod = 'cash' | 'leasing' | 'credit';

export interface MockApplication {
  id: string;
  createdAt: string;
  carId: number | null;
  vehicleName: string;
  year: number | null;
  imageUrl: string;
  color: string;
  selectedOptions: string[];
  totalPrice: number;
  status: ApplicationStatus;
  paymentMethod: ApplicationPaymentMethod;
  contact: UserProfile;
}

export type NewMockApplication = Omit<MockApplication, 'id' | 'createdAt' | 'status'>;

const STORAGE_PREFIX = 'nakatay_mock_applications:';

const DEMO_APPLICATIONS: MockApplication[] = [
  {
    id: 'NK-20261113-7421',
    createdAt: '2026-11-13T10:30:00.000Z',
    carId: 1,
    vehicleName: 'BMW M4 Competition',
    year: 2023,
    imageUrl: '',
    color: 'Титан сірий',
    selectedOptions: [],
    totalPrice: 85000,
    status: 'in_progress',
    paymentMethod: 'cash',
    contact: { name: 'Олександр Коваленко', phone: '+380671234567', email: 'oleksandr@example.com' },
  },
  {
    id: 'NK-20261109-2814',
    createdAt: '2026-11-09T14:15:00.000Z',
    carId: 2,
    vehicleName: 'Audi RS6 Avant Base',
    year: 2024,
    imageUrl: '',
    color: 'Чорний металік',
    selectedOptions: [],
    totalPrice: 120000,
    status: 'new',
    paymentMethod: 'leasing',
    contact: { name: 'Марія Бондар', phone: '+380501112233', email: 'maria@example.com' },
  },
  {
    id: 'NK-20261102-9305',
    createdAt: '2026-11-02T09:00:00.000Z',
    carId: 3,
    vehicleName: 'Porsche 911 Carrera',
    year: 2023,
    imageUrl: '',
    color: 'Мінеральний білий',
    selectedOptions: [],
    totalPrice: 115000,
    status: 'completed',
    paymentMethod: 'credit',
    contact: { name: 'Андрій Мельник', phone: '+380931234567', email: 'andrii@example.com' },
  },
];

function getStorageKey(): string {
  return `${STORAGE_PREFIX}${localStorage.getItem('userId') || 'guest'}`;
}

function isMockApplication(value: unknown): value is MockApplication {
  if (typeof value !== 'object' || value === null) return false;
  const application = value as Record<string, unknown>;
  return typeof application.id === 'string'
    && typeof application.createdAt === 'string'
    && (typeof application.carId === 'number' || application.carId === null)
    && typeof application.vehicleName === 'string'
    && (typeof application.year === 'number' || application.year === null)
    && typeof application.imageUrl === 'string'
    && typeof application.color === 'string'
    && Array.isArray(application.selectedOptions)
    && application.selectedOptions.every(option => typeof option === 'string')
    && typeof application.totalPrice === 'number'
    && ['new', 'in_progress', 'completed', 'cancelled'].includes(String(application.status))
    && ['cash', 'leasing', 'credit'].includes(String(application.paymentMethod))
    && typeof application.contact === 'object'
    && application.contact !== null;
}

export function getMockApplications(): MockApplication[] {
  const stored = localStorage.getItem(getStorageKey());
  if (stored === null) return [...DEMO_APPLICATIONS];

  const applications: unknown = JSON.parse(stored);
  if (!Array.isArray(applications) || !applications.every(isMockApplication)) {
    throw new Error('Збережена історія заявок має неправильний формат.');
  }
  return applications;
}

export function createMockApplication(input: NewMockApplication): MockApplication {
  const application: MockApplication = {
    ...input,
    id: `NK-${Date.now().toString(36).toUpperCase()}`,
    createdAt: new Date().toISOString(),
    status: 'new',
  };
  const applications = getMockApplications();
  localStorage.setItem(getStorageKey(), JSON.stringify([application, ...applications]));
  return application;
}
