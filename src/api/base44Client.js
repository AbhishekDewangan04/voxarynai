import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

const createMockEntity = () => ({
  filter: async () => ({ items: [] }),
  list: async () => [],
  get: async () => null,
  create: async (data) => ({ id: 'mock-id', ...data }),
  update: async (id, data) => ({ id, ...data }),
  delete: async () => ({ success: true }),
  deleteMany: async () => ({ success: true }),
  bulkCreate: async (items = []) => items.map((item, idx) => ({ id: `mock-${idx}`, ...item }))
});

const mockEntities = new Proxy({}, {
  get: () => createMockEntity()
});

const mockClient = {
  auth: {
    me: async () => null,
    logout: async () => {},
    loginViaEmailPassword: async () => ({ user: null }),
    loginWithProvider: () => {},
    register: async () => ({ success: true }),
    verifyOtp: async () => ({ access_token: 'mock-token' }),
    resendOtp: async () => ({ success: true }),
    resetPasswordRequest: async () => ({ success: true }),
    resetPassword: async () => ({ success: true }),
    updateMe: async (data) => data,
    setToken: () => {},
    isAuthenticated: () => false
  },
  entities: mockEntities,
  app: {
    getPublicSettings: async () => null
  },
  functions: {
    invoke: async () => ({ data: { success: true } })
  }
};

const serverUrl =
  import.meta.env.VITE_BASE44_BACKEND_URL ||
  import.meta.env.VITE_BASE44_APP_BASE_URL ||
  appBaseUrl ||
  (appId ? `https://${appId}.base44.app` : 'https://base44.app');

const resolvedAppBaseUrl =
  appBaseUrl ||
  import.meta.env.VITE_BASE44_APP_BASE_URL ||
  serverUrl;

const hasValidAppId = Boolean(appId && typeof appId === 'string' && appId.trim().length > 0 && appId !== 'undefined');

export const base44 = hasValidAppId
  ? createClient({
      appId: appId.trim(),
      token,
      functionsVersion,
      serverUrl,
      appBaseUrl: resolvedAppBaseUrl,
      analytics: false
    })
  : mockClient;
