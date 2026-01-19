import axios from 'axios'
import AuthService from './AuthService'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth headers
api.interceptors.request.use(
  (config) => {
    try {
      const authHeaders = AuthService.getAuthHeaders()
      config.headers = { ...config.headers, ...authHeaders }
    } catch (error) {
      // If no token, continue without auth headers for public endpoints
      console.warn('No auth token available')
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle auth errors globally
    if (AuthService.handleAuthError(error)) {
      return Promise.reject(new Error('Authentication failed'))
    }
    return Promise.reject(error)
  }
)

// Admin API methods
export const AdminAPI = {
  // Get pending requests
  async getPendingRequests() {
    try {
      const response = await api.get('/admin/pending')
      return response.data
    } catch (error) {
      console.error('Failed to fetch pending requests:', error)
      throw new Error('Failed to fetch pending requests')
    }
  },

  // Approve request
  async approveRequest(requestId) {
    try {
      const response = await api.put(`/admin/approve/${requestId}`)
      return response.data
    } catch (error) {
      console.error('Failed to approve request:', error)
      throw new Error('Failed to approve request')
    }
  },

  // Reject request
  async rejectRequest(requestId) {
    try {
      const response = await api.put(`/admin/reject/${requestId}`)
      return response.data
    } catch (error) {
      console.error('Failed to reject request:', error)
      throw new Error('Failed to reject request')
    }
  }
}

// Auth API methods
export const AuthAPI = {
  // User signup
  async signup(userData) {
    try {
      const response = await api.post('/auth/signup', userData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Signup failed')
    }
  },

  // User signin
  async signin(credentials) {
    try {
      const response = await api.post('/auth/signin', credentials)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed')
    }
  },

  // Admin login
  async adminLogin(credentials) {
    try {
      const response = await api.post('/auth/admin/login', credentials)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Admin login failed')
    }
  },

  // Get current user
  async getMe() {
    try {
      const response = await api.get('/auth/me')
      return response.data
    } catch (error) {
      throw new Error('Failed to get user info')
    }
  }
}

export default api