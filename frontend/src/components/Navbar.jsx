import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import AuthService from '../AuthService'

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState(() => AuthService.getUser())
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const location = useLocation()
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false)
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = () => {
    AuthService.logout()
  }

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Browse', path: '/browse' },
    { name: 'Upload', path: '/upload' },
    ...(user?.role === 'admin' ? [{ name: 'Admin', path: '/admin' }] : []),
  ]

  return (
    <nav 
      className={`navbar ${scrolled ? 'scrolled' : ''}`}
    >
      <div className="container">
        <div className="nav-content">
          <Link to="/" className="logo">
            <div className="logo-icon">P</div>
            <span className="logo-text">PYQ Hub</span>
          </Link>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
            <ul className="nav-links">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link 
                    to={item.path} 
                    className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
            
            {user && (
              <div className="profile-section" ref={dropdownRef} style={{ position: 'relative' }}>
                <motion.div 
                  className="profile-trigger"
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 12px',
                    borderRadius: '25px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <div className="profile-avatar" style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: user.role === 'admin' ? 'linear-gradient(135deg, #ff6b6b, #ee5a52)' : 'linear-gradient(135deg, #4a90e2, #357abd)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: 'white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}>
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  
                  <div className="profile-info" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start'
                  }}>
                    <span style={{
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '600',
                      lineHeight: '1.2'
                    }}>
                      {user.name}
                    </span>
                    <span style={{
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {user.role === 'admin' ? 'Admin' : 'Student'}
                    </span>
                  </div>
                  
                  <motion.div
                    animate={{ rotate: showProfileDropdown ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '12px'
                    }}
                  >
                    ▼
                  </motion.div>
                </motion.div>

                <AnimatePresence>
                  {showProfileDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="profile-dropdown"
                      style={{
                        position: 'absolute',
                        top: '100%',
                        right: '0',
                        marginTop: '8px',
                        width: '280px',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '16px',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        overflow: 'hidden',
                        zIndex: 1000
                      }}
                    >
                      <div className="dropdown-header" style={{
                        padding: '20px',
                        background: user.role === 'admin' ? 'linear-gradient(135deg, #ff6b6b, #ee5a52)' : 'linear-gradient(135deg, #4a90e2, #357abd)',
                        color: 'white'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px',
                            fontWeight: '600'
                          }}>
                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '2px' }}>
                              {user.name}
                            </div>
                            <div style={{ fontSize: '13px', opacity: 0.9 }}>
                              {user.email}
                            </div>
                            <div style={{
                              display: 'inline-block',
                              background: 'rgba(255, 255, 255, 0.2)',
                              padding: '2px 8px',
                              borderRadius: '10px',
                              fontSize: '11px',
                              fontWeight: '600',
                              marginTop: '4px'
                            }}>
                              {user.role === 'admin' ? '🛡️ Administrator' : '🎓 Student'}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="dropdown-menu" style={{ padding: '8px' }}>
                        <motion.div
                          className="dropdown-item"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '16px 20px',
                            borderRadius: '12px',
                            color: '#333',
                            fontSize: '14px',
                            fontWeight: '500',
                            background: 'linear-gradient(135deg, rgba(72, 187, 120, 0.1) 0%, rgba(56, 161, 105, 0.1) 100%)',
                            border: '1px solid rgba(72, 187, 120, 0.2)',
                            margin: '0 8px'
                          }}
                        >
                          <div style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #48bb78, #38a169)',
                            flexShrink: 0,
                            boxShadow: '0 0 8px rgba(72, 187, 120, 0.4)',
                            animation: 'pulse 2s infinite'
                          }}></div>
                          <div>
                            <div style={{ fontWeight: '700', color: '#2d3748', fontSize: '15px' }}>Status: Active</div>
                            <div style={{ fontSize: '12px', color: '#48bb78', fontWeight: '600' }}>Online and ready</div>
                          </div>
                        </motion.div>
                        
                        <div style={{
                          height: '1px',
                          background: 'rgba(0,0,0,0.1)',
                          margin: '16px 16px 12px 16px'
                        }} />
                        
                        <motion.div
                          whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                          onClick={() => {
                            setShowProfileDropdown(false)
                            handleLogout()
                          }}
                          className="dropdown-item"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '14px 16px',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            color: '#ef4444',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <span style={{ fontSize: '18px' }}>🚪</span>
                          <div>
                            <div style={{ fontWeight: '600' }}>Sign Out</div>
                            <div style={{ fontSize: '12px', color: '#ef4444', opacity: 0.7 }}>End your session</div>
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar