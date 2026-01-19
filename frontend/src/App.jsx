import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Browse from './pages/Browse'
import Upload from './pages/Upload'
import Admin from './pages/Admin'
import Auth from './pages/Auth'
import Footer from './components/Footer'
import AuthService from './AuthService'

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    setIsAuthenticated(AuthService.isAuthenticated())
    setLoading(false)
  }, [])

  useEffect(() => {
    // Disable browser back/forward buttons more aggressively
    const preventNavigation = () => {
      window.history.pushState(null, '', window.location.pathname)
    }

    const handlePopState = (e) => {
      e.preventDefault()
      e.stopPropagation()
      preventNavigation()
      return false
    }

    // Push multiple states to make back button ineffective
    for (let i = 0; i < 10; i++) {
      window.history.pushState(null, '', window.location.pathname)
    }

    window.addEventListener('popstate', handlePopState, true)
    
    // Also disable keyboard shortcuts
    const handleKeyDown = (e) => {
      // Disable Alt+Left, Alt+Right, Backspace navigation
      if ((e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) ||
          (e.key === 'Backspace' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA')) {
        e.preventDefault()
        e.stopPropagation()
        return false
      }
    }

    document.addEventListener('keydown', handleKeyDown, true)

    return () => {
      window.removeEventListener('popstate', handlePopState, true)
      document.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [])

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={{
            width: '60px',
            height: '60px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%'
          }}
        />
      </div>
    )
  }

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && (location.pathname === '/login' || location.pathname === '/signup')) {
    return <Navigate to="/" replace />
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      {isAuthenticated && <Navbar />}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {!isAuthenticated ? (
          <Routes>
            <Route path="*" element={<Auth />} />
          </Routes>
        ) : (
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </motion.main>
      {isAuthenticated && <Footer />}
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App