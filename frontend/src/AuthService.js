// Auth utility for centralized token management
class AuthService {
  static TOKEN_KEY = 'pyq_token'
  static USER_KEY = 'pyq_user'
  static REFRESH_KEY = 'pyq_refresh'

  // Get token with validation
  static getToken() {
    try {
      const token = localStorage.getItem(this.TOKEN_KEY)
      if (!token) return null
      
      // Basic JWT validation
      const parts = token.split('.')
      if (parts.length !== 3) {
        this.clearAuth()
        return null
      }
      
      return token
    } catch (error) {
      console.error('Token retrieval failed:', error)
      return null
    }
  }

  // Set token securely
  static setToken(token) {
    if (!token) return false
    try {
      localStorage.setItem(this.TOKEN_KEY, token)
      return true
    } catch (error) {
      console.error('Token storage failed:', error)
      return false
    }
  }

  // Get user data
  static getUser() {
    try {
      const user = localStorage.getItem(this.USER_KEY)
      return user ? JSON.parse(user) : null
    } catch (error) {
      console.error('User retrieval failed:', error)
      return null
    }
  }

  // Set user data
  static setUser(user) {
    if (!user) return false
    try {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user))
      return true
    } catch (error) {
      console.error('User storage failed:', error)
      return false
    }
  }

  // Clear all auth data
  static clearAuth() {
    try {
      localStorage.removeItem(this.TOKEN_KEY)
      localStorage.removeItem(this.USER_KEY)
      localStorage.removeItem(this.REFRESH_KEY)
      // Clear legacy keys
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    } catch (error) {
      console.error('Auth clear failed:', error)
    }
  }

  // Check authentication status
  static isAuthenticated() {
    const token = this.getToken()
    const user = this.getUser()
    return !!(token && user)
  }

  // Get auth headers for API calls
  static getAuthHeaders() {
    const token = this.getToken()
    if (!token) {
      throw new Error('No authentication token found')
    }
    
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  // Logout user
  static logout() {
    this.clearAuth()
    window.location.href = '/login'
  }

  // Handle auth errors
  static handleAuthError(error) {
    if (error.response?.status === 401) {
      console.warn('Authentication failed, logging out...')
      this.logout()
      return true
    }
    return false
  }
}

export default AuthService