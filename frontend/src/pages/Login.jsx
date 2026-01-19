import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const Login = () => {
  const [activeTab, setActiveTab] = useState('user')
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const endpoint = activeTab === 'admin' 
        ? 'http://localhost:8000/api/auth/admin/login'
        : 'http://localhost:8000/api/auth/signin'
      
      const response = await axios.post(endpoint, formData)
      
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      
      // Refresh the page to trigger auth state update
      window.location.href = activeTab === 'admin' ? '/admin' : '/'
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const tabVariants = {
    inactive: { opacity: 0.6, scale: 0.95 },
    active: { opacity: 1, scale: 1 }
  }

  const formVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
        className="card"
        style={{ 
          width: '100%', 
          maxWidth: '450px',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          padding: '40px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Animated Background */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: activeTab === 'admin' 
            ? 'linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(255, 142, 83, 0.1) 100%)'
            : 'linear-gradient(135deg, rgba(74, 144, 226, 0.1) 0%, rgba(80, 200, 120, 0.1) 100%)',
          transition: 'all 0.5s ease',
          zIndex: -1
        }} />

        {/* Header */}
        <motion.div 
          style={{ textAlign: 'center', marginBottom: '40px' }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div style={{ 
            width: '80px', 
            height: '80px', 
            background: activeTab === 'admin' 
              ? 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)'
              : 'linear-gradient(135deg, #4a90e2 0%, #50c878 100%)',
            borderRadius: '20px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '2.5rem',
            margin: '0 auto 20px',
            transition: 'all 0.5s ease'
          }}>
            {activeTab === 'admin' ? '🛡️' : '👤'}
          </div>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: '900', 
            color: 'white',
            marginBottom: '10px'
          }}>
            Welcome Back
          </h1>
          <p style={{ 
            color: 'rgba(255,255,255,0.7)', 
            fontSize: '1.1rem' 
          }}>
            Sign in to continue to PYQ Hub
          </p>
        </motion.div>

        {/* Tabs */}
        <div style={{ 
          display: 'flex', 
          marginBottom: '30px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
          padding: '6px',
          position: 'relative'
        }}>
          <motion.div
            style={{
              position: 'absolute',
              top: '6px',
              bottom: '6px',
              left: activeTab === 'user' ? '6px' : '50%',
              right: activeTab === 'user' ? '50%' : '6px',
              background: activeTab === 'admin' 
                ? 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)'
                : 'linear-gradient(135deg, #4a90e2 0%, #50c878 100%)',
              borderRadius: '12px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            layout
          />
          
          <motion.button
            variants={tabVariants}
            animate={activeTab === 'user' ? 'active' : 'inactive'}
            onClick={() => setActiveTab('user')}
            style={{
              flex: 1,
              padding: '16px',
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontWeight: '600',
              fontSize: '1rem',
              borderRadius: '12px',
              cursor: 'pointer',
              position: 'relative',
              zIndex: 1,
              transition: 'all 0.3s ease'
            }}
          >
            👤 Sign In as User
          </motion.button>
          
          <motion.button
            variants={tabVariants}
            animate={activeTab === 'admin' ? 'active' : 'inactive'}
            onClick={() => setActiveTab('admin')}
            style={{
              flex: 1,
              padding: '16px',
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontWeight: '600',
              fontSize: '1rem',
              borderRadius: '12px',
              cursor: 'pointer',
              position: 'relative',
              zIndex: 1,
              transition: 'all 0.3s ease'
            }}
          >
            🛡️ Sign In as Admin
          </motion.button>
        </div>

        {/* Form */}
        <AnimatePresence mode="wait">
          <motion.form
            key={activeTab}
            variants={formVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit}
            style={{ marginBottom: '30px' }}
          >
            <div style={{ marginBottom: '25px' }}>
              <label style={{ 
                display: 'block', 
                color: 'rgba(255,255,255,0.9)', 
                marginBottom: '8px',
                fontWeight: '600'
              }}>
                {activeTab === 'admin' ? 'Admin Email' : 'Email'}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = activeTab === 'admin' ? '#ff6b6b' : '#4a90e2'
                  e.target.style.boxShadow = `0 0 0 3px ${activeTab === 'admin' ? 'rgba(255, 107, 107, 0.2)' : 'rgba(74, 144, 226, 0.2)'}`
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{ 
                display: 'block', 
                color: 'rgba(255,255,255,0.9)', 
                marginBottom: '8px',
                fontWeight: '600'
              }}>
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = activeTab === 'admin' ? '#ff6b6b' : '#4a90e2'
                  e.target.style.boxShadow = `0 0 0 3px ${activeTab === 'admin' ? 'rgba(255, 107, 107, 0.2)' : 'rgba(74, 144, 226, 0.2)'}`
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#ef4444',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  marginBottom: '20px',
                  fontSize: '0.9rem',
                  fontWeight: '500'
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
                padding: '18px',
                background: activeTab === 'admin' 
                  ? 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)'
                  : 'linear-gradient(135deg, #4a90e2 0%, #50c878 100%)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '1.1rem',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
            >
              {loading ? (
                <>
                  <div style={{ 
                    width: '20px', 
                    height: '20px', 
                    border: '2px solid rgba(255,255,255,0.3)', 
                    borderTop: '2px solid white', 
                    borderRadius: '50%', 
                    animation: 'spin 1s linear infinite' 
                  }} />
                  Signing In...
                </>
              ) : (
                <>
                  {activeTab === 'admin' ? '🛡️' : '🚀'} 
                  Sign In {activeTab === 'admin' ? 'as Admin' : ''}
                </>
              )}
            </motion.button>
          </motion.form>
        </AnimatePresence>

        {/* Sign Up Link */}
        <div style={{ textAlign: 'center', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '10px' }}>
            Don't have an account?
          </p>
          <motion.button
            onClick={() => navigate('/signup')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: 'transparent',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '1rem',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = activeTab === 'admin' ? '#ff6b6b' : '#4a90e2'
              e.target.style.background = activeTab === 'admin' 
                ? 'rgba(255, 107, 107, 0.1)' 
                : 'rgba(74, 144, 226, 0.1)'
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'
              e.target.style.background = 'transparent'
            }}
          >
            ✨ Sign Up
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

export default Login