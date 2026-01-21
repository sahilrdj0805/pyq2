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
      const token = AuthService.getToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (error) {
      // Continue without auth headers for public endpoints
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
      throw new Error('Failed to fetch pending requests')
    }
  },

  // Get dashboard statistics
  async getDashboardStats() {
    try {
      const response = await api.get('/admin/stats')
      return response.data.stats || {
        totalUsers: 0,
        totalPYQs: 0,
        pendingRequests: 0,
        totalDownloads: 0,
        approvedToday: 0,
        rejectedToday: 0,
        popularSubjects: []
      }
    } catch (error) {
      return {
        totalUsers: 0,
        totalPYQs: 0,
        pendingRequests: 0,
        totalDownloads: 0,
        approvedToday: 0,
        rejectedToday: 0,
        popularSubjects: []
      }
    }
  },

  // Approve request
  async approveRequest(requestId) {
    try {
      const response = await api.put(`/admin/approve/${requestId}`)
      return response.data
    } catch (error) {
      throw new Error('Failed to approve request')
    }
  },

  // Reject request
  async rejectRequest(requestId) {
    try {
      const response = await api.put(`/admin/reject/${requestId}`)
      return response.data
    } catch (error) {
      throw new Error('Failed to reject request')
    }
  },

  // Get subjects
  async getSubjects() {
    try {
      const response = await api.get('/admin/subjects')
      return response.data
    } catch (error) {
      throw new Error('Failed to fetch subjects')
    }
  },

  // Admin direct upload PYQ (same as user upload)
  async uploadPYQ(formData) {
    try {
      const response = await axios.post('http://localhost:8000/api/admin/upload-pyq', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          ...AuthService.getAuthHeaders(null)
        },
        timeout: 120000 // 2 minute timeout for uploads
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Get all users
  async getAllUsers() {
    try {
      const response = await api.get('/admin/users')
      return response.data
    } catch (error) {
      throw new Error('Failed to fetch users')
    }
  },

  // Delete user
  async deleteUser(userId) {
    try {
      const response = await api.delete(`/admin/users/${userId}`)
      return response.data
    } catch (error) {
      throw new Error('Failed to delete user')
    }
  },

  // Delete subject
  async deleteSubject(subjectId) {
    try {
      const response = await api.delete(`/admin/subjects/${subjectId}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete subject')
    }
  },

  // Delete PYQ
  async deletePYQ(pyqId) {
    try {
      const response = await api.delete(`/admin/pyqs/${pyqId}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete PYQ')
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