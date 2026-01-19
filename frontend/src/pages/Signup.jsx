import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const Signup = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [step, setStep] = useState(1)
  const navigate = useNavigate()

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleNext = () => {
    if (step === 1) {
      if (!formData.name.trim()) {
        setError('Name is required')
        return
      }
      if (!formData.email.trim()) {
        setError('Email is required')
        return
      }
      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        setError('Please enter a valid email')
        return
      }
    }
    setStep(step + 1)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await axios.post('http://localhost:8000/api/auth/signup', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      })
      
      setSuccess(true)
      setTimeout(() => {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        window.location.href = '/'
      }, 2000)
    } catch (error) {
      setError(error.response?.data?.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.8,
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, type: "spring", bounce: 0.4 }
    }
  }

  const stepVariants = {
    hidden: { opacity: 0, x: 50, scale: 0.9 },
    visible: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: -50, scale: 0.9 }
  }

  if (success) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.6 }}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: '30px',
            padding: '60px',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            style={{ fontSize: '5rem', marginBottom: '20px' }}
          >
            🎉
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{ color: 'white', fontSize: '2.5rem', fontWeight: '900', marginBottom: '15px' }}
          >
            Welcome to PYQ Hub!
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.2rem' }}
          >
            Your account has been created successfully
          </motion.p>
        </motion.div>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Elements */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: `${Math.random() * 300 + 100}px`,
              height: `${Math.random() * 300 + 100}px`,
              background: `rgba(255, 255, 255, ${Math.random() * 0.1 + 0.05})`,
              borderRadius: '50%',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px',
        position: 'relative',
        zIndex: 1
      }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="card"
          style={{ 
            width: '100%', 
            maxWidth: '500px',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(30px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '30px',
            padding: '50px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.2)'
          }}
        >
          {/* Progress Bar */}
          <motion.div
            variants={itemVariants}
            style={{
              width: '100%',
              height: '6px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '3px',
              marginBottom: '40px',
              overflow: 'hidden'
            }}
          >
            <motion.div
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #ff6b6b, #4ecdc4)',
                borderRadius: '3px',
                width: `${(step / 2) * 100}%`
              }}
              initial={{ width: 0 }}
              animate={{ width: `${(step / 2) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </motion.div>

          {/* Header */}
          <motion.div 
            variants={itemVariants}
            style={{ textAlign: 'center', marginBottom: '40px' }}
          >
            <motion.div 
              style={{ 
                width: '100px', 
                height: '100px', 
                background: 'linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%)',
                borderRadius: '25px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '3rem',
                margin: '0 auto 25px',
                boxShadow: '0 15px 35px rgba(255, 107, 107, 0.3)'
              }}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              ✨
            </motion.div>
            <h1 style={{ 
              fontSize: '3rem', 
              fontWeight: '900', 
              color: 'white',
              marginBottom: '15px',
              background: 'linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Join PYQ Hub
            </h1>
            <p style={{ 
              color: 'rgba(255,255,255,0.8)', 
              fontSize: '1.2rem',
              fontWeight: '500'
            }}>
              {step === 1 ? 'Let\'s get you started' : 'Secure your account'}
            </p>
          </motion.div>

          {/* Form Steps */}
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.4 }}
              >
                <div style={{ marginBottom: '25px' }}>
                  <label style={{ 
                    display: 'block', 
                    color: 'rgba(255,255,255,0.9)', 
                    marginBottom: '10px',
                    fontWeight: '600',
                    fontSize: '1.1rem'
                  }}>
                    Full Name
                  </label>
                  <motion.input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    whileFocus={{ scale: 1.02 }}
                    style={{
                      width: '100%',
                      padding: '18px 24px',
                      background: 'rgba(255, 255, 255, 0.15)',
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '15px',
                      color: 'white',
                      fontSize: '1.1rem',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      fontWeight: '500'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#4ecdc4'
                      e.target.style.boxShadow = '0 0 0 4px rgba(78, 205, 196, 0.2)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '35px' }}>
                  <label style={{ 
                    display: 'block', 
                    color: 'rgba(255,255,255,0.9)', 
                    marginBottom: '10px',
                    fontWeight: '600',
                    fontSize: '1.1rem'
                  }}>
                    Email Address
                  </label>
                  <motion.input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    whileFocus={{ scale: 1.02 }}
                    style={{
                      width: '100%',
                      padding: '18px 24px',
                      background: 'rgba(255, 255, 255, 0.15)',
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '15px',
                      color: 'white',
                      fontSize: '1.1rem',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      fontWeight: '500'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#4ecdc4'
                      e.target.style.boxShadow = '0 0 0 4px rgba(78, 205, 196, 0.2)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>

                <motion.button
                  type="button"
                  onClick={handleNext}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    width: '100%',
                    padding: '20px',
                    background: 'linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%)',
                    border: 'none',
                    borderRadius: '15px',
                    color: 'white',
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 10px 30px rgba(255, 107, 107, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Continue →
                </motion.button>
              </motion.div>
            ) : (
              <motion.form
                key="step2"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.4 }}
                onSubmit={handleSubmit}
              >
                <div style={{ marginBottom: '25px' }}>
                  <label style={{ 
                    display: 'block', 
                    color: 'rgba(255,255,255,0.9)', 
                    marginBottom: '10px',
                    fontWeight: '600',
                    fontSize: '1.1rem'
                  }}>
                    Password
                  </label>
                  <motion.input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    whileFocus={{ scale: 1.02 }}
                    style={{
                      width: '100%',
                      padding: '18px 24px',
                      background: 'rgba(255, 255, 255, 0.15)',
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '15px',
                      color: 'white',
                      fontSize: '1.1rem',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      fontWeight: '500'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#4ecdc4'
                      e.target.style.boxShadow = '0 0 0 4px rgba(78, 205, 196, 0.2)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '35px' }}>
                  <label style={{ 
                    display: 'block', 
                    color: 'rgba(255,255,255,0.9)', 
                    marginBottom: '10px',
                    fontWeight: '600',
                    fontSize: '1.1rem'
                  }}>
                    Confirm Password
                  </label>
                  <motion.input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    whileFocus={{ scale: 1.02 }}
                    style={{
                      width: '100%',
                      padding: '18px 24px',
                      background: 'rgba(255, 255, 255, 0.15)',
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '15px',
                      color: 'white',
                      fontSize: '1.1rem',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      fontWeight: '500'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#4ecdc4'
                      e.target.style.boxShadow = '0 0 0 4px rgba(78, 205, 196, 0.2)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                  <motion.button
                    type="button"
                    onClick={() => setStep(1)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      flex: 1,
                      padding: '20px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '15px',
                      color: 'white',
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    ← Back
                  </motion.button>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      flex: 2,
                      padding: '20px',
                      background: 'linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%)',
                      border: 'none',
                      borderRadius: '15px',
                      color: 'white',
                      fontSize: '1.2rem',
                      fontWeight: '700',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.7 : 1,
                      boxShadow: '0 10px 30px rgba(255, 107, 107, 0.3)',
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
                        Creating...
                      </>
                    ) : (
                      <>🚀 Create Account</>
                    )}
                  </motion.button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '2px solid rgba(239, 68, 68, 0.4)',
                color: '#ff6b6b',
                padding: '15px 20px',
                borderRadius: '12px',
                marginTop: '20px',
                fontSize: '1rem',
                fontWeight: '600',
                textAlign: 'center'
              }}
            >
              {error}
            </motion.div>
          )}

          {/* Sign In Link */}
          <motion.div 
            variants={itemVariants}
            style={{ 
              textAlign: 'center', 
              paddingTop: '30px', 
              borderTop: '1px solid rgba(255, 255, 255, 0.2)',
              marginTop: '30px'
            }}
          >
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '15px', fontSize: '1.1rem' }}>
              Already have an account?
            </p>
            <motion.button
              onClick={() => navigate('/login')}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: 'transparent',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
                padding: '15px 30px',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1.1rem',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#4ecdc4'
                e.target.style.background = 'rgba(78, 205, 196, 0.1)'
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                e.target.style.background = 'transparent'
              }}
            >
              🔑 Sign In
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default Signup