import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthAPI } from '../ApiService'
import AuthService from '../AuthService'

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [activeTab, setActiveTab] = useState('user')
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let response
      
      if (isSignUp) {
        response = await AuthAPI.signup({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      } else {
        if (activeTab === 'admin') {
          response = await AuthAPI.adminLogin({
            email: formData.email,
            password: formData.password
          })
        } else {
          response = await AuthAPI.signin({
            email: formData.email,
            password: formData.password
          })
        }
      }
      
      // Store auth data using AuthService
      AuthService.setToken(response.token)
      AuthService.setUser(response.user)
      
      // Redirect based on role
      window.location.href = (activeTab === 'admin' && !isSignUp) ? '/admin' : '/'
    } catch (error) {
      setError(error.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setIsSignUp(!isSignUp)
    setFormData({ name: '', email: '', password: '' })
    setError('')
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative'
    }}>
      {/* Background Animation */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: '200px',
              height: '200px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              top: `${20 + i * 30}%`,
              left: `${10 + i * 40}%`,
            }}
            animate={{
              y: [0, -20, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 6 + i * 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        style={{ 
          width: '100%', 
          maxWidth: '400px',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '20px',
          padding: '30px',
          position: 'relative',
          zIndex: 1
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <motion.div 
            style={{ 
              width: '60px', 
              height: '60px', 
              background: isSignUp 
                ? 'linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%)'
                : activeTab === 'admin' 
                  ? 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)'
                  : 'linear-gradient(135deg, #4a90e2 0%, #50c878 100%)',
              borderRadius: '15px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '1.8rem',
              margin: '0 auto 15px',
              transition: 'all 0.3s ease'
            }}
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            {isSignUp ? '✨' : activeTab === 'admin' ? '🛡️' : '👤'}
          </motion.div>
          <h2 style={{ 
            fontSize: '1.8rem', 
            fontWeight: '800', 
            color: 'white',
            marginBottom: '8px'
          }}>
            {isSignUp ? 'Join PYQ Hub' : 'Welcome Back'}
          </h2>
          <p style={{ 
            color: 'rgba(255,255,255,0.7)', 
            fontSize: '0.9rem' 
          }}>
            {isSignUp ? 'Create your account' : 'Sign in to continue'}
          </p>
        </div>

        {/* Tabs - Only show for Sign In */}
        {!isSignUp && (
          <div style={{ 
            display: 'flex', 
            marginBottom: '20px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '4px',
            position: 'relative'
          }}>
            <motion.div
              style={{
                position: 'absolute',
                top: '4px',
                bottom: '4px',
                left: activeTab === 'user' ? '4px' : '50%',
                right: activeTab === 'user' ? '50%' : '4px',
                background: activeTab === 'admin' 
                  ? 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)'
                  : 'linear-gradient(135deg, #4a90e2 0%, #50c878 100%)',
                borderRadius: '8px',
                transition: 'all 0.3s ease'
              }}
              layout
            />
            
            <button
              onClick={() => setActiveTab('user')}
              style={{
                flex: 1,
                padding: '10px',
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontWeight: '600',
                fontSize: '0.85rem',
                borderRadius: '8px',
                cursor: 'pointer',
                position: 'relative',
                zIndex: 1
              }}
            >
              👤 User
            </button>
            
            <button
              onClick={() => setActiveTab('admin')}
              style={{
                flex: 1,
                padding: '10px',
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontWeight: '600',
                fontSize: '0.85rem',
                borderRadius: '8px',
                cursor: 'pointer',
                position: 'relative',
                zIndex: 1
              }}
            >
              🛡️ Admin
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={isSignUp ? 'signup' : 'signin'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {isSignUp && (
                <div style={{ marginBottom: '15px' }}>
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.15)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '10px',
                      color: 'white',
                      fontSize: '0.9rem',
                      outline: 'none',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#4ecdc4'
                      e.target.style.boxShadow = '0 0 0 2px rgba(78, 205, 196, 0.2)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>
              )}

              <div style={{ marginBottom: '15px' }}>
                <input
                  type="email"
                  name="email"
                  placeholder={!isSignUp && activeTab === 'admin' ? 'Admin Email' : 'Email'}
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    const color = isSignUp ? '#4ecdc4' : activeTab === 'admin' ? '#ff6b6b' : '#4a90e2'
                    e.target.style.borderColor = color
                    e.target.style.boxShadow = `0 0 0 2px ${color}20`
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    const color = isSignUp ? '#4ecdc4' : activeTab === 'admin' ? '#ff6b6b' : '#4a90e2'
                    e.target.style.borderColor = color
                    e.target.style.boxShadow = `0 0 0 2px ${color}20`
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>
            </motion.div>
          </AnimatePresence>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#ff6b6b',
                padding: '10px 12px',
                borderRadius: '8px',
                marginBottom: '15px',
                fontSize: '0.85rem',
                fontWeight: '500',
                textAlign: 'center'
              }}
            >
              {error}
            </motion.div>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              width: '100%',
              padding: '14px',
              background: isSignUp 
                ? 'linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%)'
                : activeTab === 'admin' 
                  ? 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)'
                  : 'linear-gradient(135deg, #4a90e2 0%, #50c878 100%)',
              border: 'none',
              borderRadius: '10px',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {loading ? (
              <>
                <div style={{ 
                  width: '16px', 
                  height: '16px', 
                  border: '2px solid rgba(255,255,255,0.3)', 
                  borderTop: '2px solid white', 
                  borderRadius: '50%', 
                  animation: 'spin 1s linear infinite' 
                }} />
                {isSignUp ? 'Creating...' : 'Signing In...'}
              </>
            ) : (
              <>
                {isSignUp ? '🚀 Create Account' : `🔑 Sign In${activeTab === 'admin' ? ' as Admin' : ''}`}
              </>
            )}
          </motion.button>
        </form>

        {/* Toggle Mode */}
        <div style={{ textAlign: 'center', paddingTop: '15px', borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '10px', fontSize: '0.85rem' }}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          </p>
          <motion.button
            onClick={toggleMode}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: 'white',
              padding: '8px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.85rem',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = isSignUp ? '#4a90e2' : '#4ecdc4'
              e.target.style.background = isSignUp ? 'rgba(74, 144, 226, 0.1)' : 'rgba(78, 205, 196, 0.1)'
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)'
              e.target.style.background = 'transparent'
            }}
          >
            {isSignUp ? '🔑 Sign In' : '✨ Sign Up'}
          </motion.button>
        </div>
      </motion.div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default Auth