// Local in-memory and localStorage-backed client for entities, auth, and functions.

const isBrowser = typeof window !== 'undefined';

function getStorage(key, fallback = []) {
  if (!isBrowser) return fallback;
  try {
    const val = window.localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

function setStorage(key, value) {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage quota or disabled
  }
}

const DEFAULT_USER = {
  id: "user_default",
  email: "marcus@voxaryn.ai",
  full_name: "Marcus Vance",
  role: "user",
  recording_retention: "off"
};

class EntityManager {
  constructor(entityName) {
    this.name = entityName;
    this.storageKey = `voxaryn_${entityName.toLowerCase()}`;
  }

  _getAll() {
    return getStorage(this.storageKey, []);
  }

  _saveAll(items) {
    setStorage(this.storageKey, items);
  }

  async filter(query = {}, options = {}) {
    let items = this._getAll();
    if (query && typeof query === 'object') {
      items = items.filter(item => {
        return Object.entries(query).every(([k, v]) => {
          if (v === undefined) return true;
          return item[k] === v;
        });
      });
    }

    if (options.sort) {
      const isDesc = options.sort.startsWith('-');
      const field = isDesc ? options.sort.slice(1) : options.sort;
      items.sort((a, b) => {
        const valA = a[field] ?? '';
        const valB = b[field] ?? '';
        if (valA < valB) return isDesc ? 1 : -1;
        if (valA > valB) return isDesc ? -1 : 1;
        return 0;
      });
    }

    if (options.limit && typeof options.limit === 'number') {
      items = items.slice(0, options.limit);
    }

    return { items };
  }

  async list(options = {}) {
    const { items } = await this.filter({}, options);
    return items;
  }

  async get(id) {
    const items = this._getAll();
    return items.find(item => item.id === id) || null;
  }

  async create(data) {
    const items = this._getAll();
    const id = data.id || `${this.name.toLowerCase()}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const created = {
      id,
      created_date: new Date().toISOString(),
      ...data
    };
    items.unshift(created);
    this._saveAll(items);
    return created;
  }

  async update(id, data) {
    const items = this._getAll();
    const index = items.findIndex(item => item.id === id);
    if (index === -1) {
      const created = { id, ...data };
      items.unshift(created);
      this._saveAll(items);
      return created;
    }
    items[index] = { ...items[index], ...data, updated_date: new Date().toISOString() };
    this._saveAll(items);
    return items[index];
  }

  async delete(id) {
    const items = this._getAll().filter(item => item.id !== id);
    this._saveAll(items);
    return { success: true };
  }

  async deleteMany(query = {}) {
    let items = this._getAll();
    if (query && Object.keys(query).length > 0) {
      items = items.filter(item => {
        return !Object.entries(query).every(([k, v]) => {
          if (v === undefined) return false;
          return item[k] === v;
        });
      });
    } else {
      items = [];
    }
    this._saveAll(items);
    return { success: true };
  }

  async bulkCreate(records = []) {
    const items = this._getAll();
    const created = records.map((record, idx) => ({
      id: record.id || `${this.name.toLowerCase()}_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 6)}`,
      created_date: new Date().toISOString(),
      ...record
    }));
    items.unshift(...created);
    this._saveAll(items);
    return created;
  }
}

const entityCache = {};
const entities = new Proxy({}, {
  get: (_target, prop) => {
    if (typeof prop !== 'string') return undefined;
    if (!entityCache[prop]) {
      entityCache[prop] = new EntityManager(prop);
    }
    return entityCache[prop];
  }
});

const auth = {
  me: async () => {
    const saved = getStorage('voxaryn_current_user', DEFAULT_USER);
    return saved;
  },
  logout: async (redirectUrl) => {
    if (isBrowser) {
      window.localStorage.removeItem('access_token');
      window.localStorage.removeItem('token');
      window.localStorage.removeItem('voxaryn_current_user');
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    }
  },
  loginViaEmailPassword: async (email, _password) => {
    const user = { ...DEFAULT_USER, email };
    setStorage('voxaryn_current_user', user);
    if (isBrowser) {
      window.localStorage.setItem('access_token', 'local_token_' + Date.now());
    }
    return { user };
  },
  loginWithProvider: (_provider, returnTo) => {
    setStorage('voxaryn_current_user', DEFAULT_USER);
    if (isBrowser) {
      window.localStorage.setItem('access_token', 'local_token_' + Date.now());
      if (returnTo) window.location.href = returnTo;
    }
  },
  register: async ({ email }) => {
    const user = { ...DEFAULT_USER, email };
    setStorage('voxaryn_current_user', user);
    return { success: true };
  },
  verifyOtp: async () => {
    const token = 'local_token_' + Date.now();
    if (isBrowser) {
      window.localStorage.setItem('access_token', token);
    }
    return { access_token: token };
  },
  resendOtp: async () => ({ success: true }),
  resetPasswordRequest: async () => ({ success: true }),
  resetPassword: async () => ({ success: true }),
  updateMe: async (data) => {
    const current = getStorage('voxaryn_current_user', DEFAULT_USER);
    const updated = { ...current, ...data };
    setStorage('voxaryn_current_user', updated);
    return updated;
  },
  setToken: (token) => {
    if (isBrowser) {
      window.localStorage.setItem('access_token', token);
    }
  },
  isAuthenticated: () => {
    if (!isBrowser) return false;
    return Boolean(window.localStorage.getItem('access_token') || window.localStorage.getItem('token') || true);
  }
};

const functions = {
  invoke: async (name, payload = {}) => {
    if (name === 'createWaitlistEntry') {
      const waitlistManager = entities.WaitlistEntry;
      await waitlistManager.create({ email: payload.email, source: payload.source || 'home' });
      return { data: { success: true } };
    }
    if (name === 'summarizeCall') {
      return { data: { summary: "Call completed and recorded successfully." } };
    }
    if (name === 'extractMemories') {
      return { data: { memories: [] } };
    }
    return { data: { success: true } };
  }
};

const app = {
  getPublicSettings: async () => ({ id: 'voxaryn', public_settings: {} })
};

export const api = {
  auth,
  entities,
  functions,
  app
};

export const client = api;
export const voxaryn = api;

