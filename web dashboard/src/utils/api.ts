import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401/403 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only log out on 401 (authentication failure), not on 403 (authorization/permission failure)
    // 403 errors are expected for non-admin users accessing admin-only endpoints
    if (error.response?.status === 401) {
      // Only clear auth if it's a real authentication error (not just a missing token on public endpoints)
      const errorMessage = error.response?.data?.error || '';
      if (errorMessage.includes('token') || errorMessage.includes('authentication') || errorMessage.includes('expired')) {
        // Clear auth data on actual authentication failure
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        // Redirect to login if not already there
        if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
          window.location.href = '/login';
        }
      }
    }
    // For 403 errors, just reject - don't log out (user might just not have permission for that endpoint)
    return Promise.reject(error);
  }
);

// Backend event format
export interface BackendVehicleEvent {
  id: string | number;
  plate: string;
  make: string;
  model: string;
  confidence: number;
  weather: string;
  timestamp: string;
  image: string;
  status: 'Allowed' | 'Denied';
  temporaryAccess?: boolean;
  expiry?: string | null; // Expiry date for temporary vehicles
  isGuest?: boolean;
  isPersonalVehicle?: boolean;
  guestInfo?: {
    visitorName: string;
    purpose: string;
    owner?: {
      id: number;
      username: string;
      email: string;
    };
  };
  vehicleInfo?: {
    owner?: {
      id: number;
      username: string;
      email: string;
    };
    color?: string;
    year?: number;
  };
}

// Frontend event format (matching existing interface)
export interface VehicleEvent {
  id: string;
  vehicle_id?: string;
  plate_number: string;
  make: string;
  model: string;
  confidence: number;
  image_url: string;
  weather_condition: string;
  temperature?: number;
  status: 'allowed' | 'denied';
  gate_action: 'opened' | 'closed';
  timestamp: string;
  created_at: string;
  temporaryAccess?: boolean; // Flag for temporary access
  entryTime?: string | null; // Entry time for temporary vehicles
  expiry?: string | null; // Expiry date for temporary vehicles
  isGuest?: boolean;
  isPersonalVehicle?: boolean;
  guestInfo?: {
    visitorName: string;
    purpose: string;
    owner?: {
      id: number;
      username: string;
      email: string;
    };
  };
  vehicleInfo?: {
    owner?: {
      id: number;
      username: string;
      email: string;
    };
    color?: string;
    year?: number;
  };
}

// Convert backend format to frontend format
function mapBackendToFrontend(backendEvent: BackendVehicleEvent): VehicleEvent {
  // Handle image URL - if it starts with /, prepend backend URL
  let imageUrl = backendEvent.image;
  if (imageUrl && imageUrl.startsWith('/') && !imageUrl.startsWith('http')) {
    const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';
    // Handle both /uploads and /samples paths
    imageUrl = `${backendUrl}${backendEvent.image}`;
  }
  
  return {
    id: String(backendEvent.id),
    plate_number: backendEvent.plate,
    make: backendEvent.make,
    model: backendEvent.model,
    confidence: backendEvent.confidence,
    image_url: imageUrl,
    weather_condition: backendEvent.weather,
    status: backendEvent.status.toLowerCase() as 'allowed' | 'denied',
    gate_action: backendEvent.status === 'Allowed' ? 'opened' : 'closed',
    timestamp: backendEvent.timestamp,
    created_at: backendEvent.timestamp,
    temporaryAccess: (backendEvent as any).temporaryAccess || false,
    entryTime: (backendEvent as any).entryTime || null,
    expiry: (backendEvent as any).expiry || null,
    isGuest: backendEvent.isGuest || false,
    isPersonalVehicle: backendEvent.isPersonalVehicle || false,
    guestInfo: backendEvent.guestInfo,
    vehicleInfo: backendEvent.vehicleInfo,
  };
}

// API functions
export const vehicleAPI = {
  // Get all events with pagination and filters
  async getEvents(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    weather?: string;
    make?: string;
    model?: string;
  }): Promise<{ events: VehicleEvent[]; pagination: any }> {
    const response = await api.get('/events', { params });
    return {
      events: response.data.events.map(mapBackendToFrontend),
      pagination: response.data.pagination,
    };
  },

  // Create a new event
  async createEvent(event: Partial<VehicleEvent>): Promise<VehicleEvent> {
    const backendEvent = {
      plate: event.plate_number || '',
      make: event.make || '',
      model: event.model || '',
      confidence: event.confidence || 0.9,
      weather: event.weather_condition || 'Sunny',
      timestamp: event.timestamp || new Date().toISOString(),
      image: event.image_url || '/samples/vehicle_1.jpg',
      status: event.status === 'allowed' ? 'Allowed' : 'Denied',
      temporaryAccess: event.temporaryAccess || false,
      entryTime: event.entryTime || null,
      expiry: event.expiry || null,
    };

    const response = await api.post('/events', backendEvent);
    return mapBackendToFrontend(response.data);
  },

  // Get weather
  async getWeather(): Promise<{ condition: string; visibility: string; temp: number }> {
    const response = await api.get('/weather');
    return response.data;
  },

  // Create override
  async createOverride(vehicle: { plate: string; make?: string; model?: string }, action: string) {
    const response = await api.post('/override', {
      vehicle,
      action,
    });
    return response.data;
  },

  // Get prediction (for testing)
  async getPrediction(): Promise<VehicleEvent> {
    const response = await api.post('/predict');
    return mapBackendToFrontend(response.data);
  },

  // Upload vehicle image
  async uploadImage(file: File): Promise<{ image_url: string; filename: string }> {
    const formData = new FormData();
    formData.append('image', file);
    
    // Get token from localStorage for manual header
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Don't set Content-Type - let browser set it with boundary for multipart/form-data
    const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
      headers,
    });
    
    return response.data;
  },
};

// Authentication API
export const authAPI = {
  async register(username: string, email: string, password: string) {
    const response = await api.post('/auth/register', {
      username,
      email,
      password,
    });
    return response.data;
  },

  async login(email: string, password: string) {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  },
};

// Vehicle Management API
export interface Vehicle {
  id: number;
  licensePlate: string;
  make: string;
  model: string;
  ownerName?: string;
  notes?: string;
  accessType: 'allow' | 'deny' | 'temp';
  entryTime?: string | null; // Entry time for temporary visitors
  expiry?: string | null;
  photo?: string | null;
  addedBy: number;
  role: 'admin' | 'user';
  addedByInfo?: {
    username: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const vehicleManagementAPI = {
  async getVehicles(filters?: { search?: string; accessType?: string }): Promise<{ vehicles: Vehicle[]; count: number }> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.accessType) params.append('accessType', filters.accessType);
    
    const response = await api.get(`/vehicles?${params.toString()}`);
    return response.data;
  },

  async getVehicle(id: number): Promise<Vehicle> {
    const response = await api.get(`/vehicles/${id}`);
    return response.data;
  },

  async addVehicle(vehicleData: {
    licensePlate: string;
    make: string;
    model: string;
    ownerName?: string;
    notes?: string;
    accessType: 'allow' | 'deny' | 'temp';
    entryTime?: string | null;
    expiry?: string | null;
    photo?: File | null;
  }): Promise<{ message: string; vehicle: Vehicle }> {
    const formData = new FormData();
    formData.append('licensePlate', vehicleData.licensePlate);
    formData.append('make', vehicleData.make);
    formData.append('model', vehicleData.model);
    if (vehicleData.ownerName) formData.append('ownerName', vehicleData.ownerName);
    if (vehicleData.notes) formData.append('notes', vehicleData.notes);
    formData.append('accessType', vehicleData.accessType);
    if (vehicleData.entryTime) formData.append('entryTime', vehicleData.entryTime);
    if (vehicleData.expiry) formData.append('expiry', vehicleData.expiry);
    if (vehicleData.photo) formData.append('photo', vehicleData.photo);

    const response = await api.post('/vehicles/add', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async updateVehicle(id: number, updates: {
    licensePlate?: string;
    make?: string;
    model?: string;
    ownerName?: string;
    notes?: string;
    accessType?: 'allow' | 'deny' | 'temp';
    entryTime?: string | null;
    expiry?: string | null;
    photo?: File | null;
  }): Promise<{ message: string; vehicle: Vehicle }> {
    const formData = new FormData();
    if (updates.licensePlate) formData.append('licensePlate', updates.licensePlate);
    if (updates.make) formData.append('make', updates.make);
    if (updates.model) formData.append('model', updates.model);
    if (updates.ownerName !== undefined) formData.append('ownerName', updates.ownerName);
    if (updates.notes !== undefined) formData.append('notes', updates.notes);
    if (updates.accessType) formData.append('accessType', updates.accessType);
    if (updates.entryTime !== undefined) formData.append('entryTime', updates.entryTime || '');
    if (updates.expiry !== undefined) formData.append('expiry', updates.expiry || '');
    if (updates.photo) formData.append('photo', updates.photo);

    const response = await api.put(`/vehicles/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async deleteVehicle(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/vehicles/${id}`);
    return response.data;
  },
};

// User Management API
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
  hasAdminAccess: boolean;
  createdAt: string;
  updatedAt?: string;
}

export const userManagementAPI = {
  async getUsers(): Promise<{ users: User[]; count: number }> {
    const response = await api.get('/users');
    return response.data;
  },

  async updateAdminAccess(userId: number, hasAdminAccess: boolean): Promise<{ message: string; user: User }> {
    const response = await api.put(`/users/${userId}/admin-access`, { hasAdminAccess });
    return response.data;
  },
};

export default vehicleAPI;

