import React from 'react'
import { motion } from 'framer-motion'

const Footer = () => {
  return (
    <motion.footer 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '40px 0',
        marginTop: '80px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        opacity: 0.3
      }}></div>
      
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 32px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '40px',
          marginBottom: '40px'
        }}>
          {/* Brand Section */}
          <div style={{ textAlign: 'center' }}>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px'
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: '800'
              }}>
                P
              </div>
              <span style={{
                fontSize: '24px',
                fontWeight: '800',
                background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                PYQ Hub
              </span>
            </motion.div>
            <p style={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: '16px',
              lineHeight: '1.6',
              margin: 0
            }}>
              Your ultimate destination for Previous Year Questions.
              <br />Empowering students with quality resources.
            </p>
          </div>
          
          {/* Quick Links */}
          <div style={{ textAlign: 'center' }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '700',
              marginBottom: '16px',
              color: 'white'
            }}>
              Quick Links
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['Browse PYQs', 'Upload Questions', 'About Us', 'Contact'].map((link) => (
                <motion.a
                  key={link}
                  href="#"
                  whileHover={{ scale: 1.05, x: 5 }}
                  style={{
                    color: 'rgba(255,255,255,0.8)',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    padding: '4px 0'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = 'white'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = 'rgba(255,255,255,0.8)'
                  }}
                >
                  {link}
                </motion.a>
              ))}
            </div>
          </div>
          
          {/* Stats */}
          <div style={{ textAlign: 'center' }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '700',
              marginBottom: '16px',
              color: 'white'
            }}>
              Platform Stats
            </h3>
            <div style={{ display: 'grid', gap: '8px' }}>
              {[
                { label: 'Active Students', value: '1000+', icon: '👥' },
                { label: 'Question Papers', value: '500+', icon: '📄' },
                { label: 'Subjects Covered', value: '50+', icon: '📚' }
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  whileHover={{ scale: 1.05 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{stat.icon}</span>
                  <span>{stat.value} {stat.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Divider */}
        <div style={{
          height: '1px',
          background: 'rgba(255, 255, 255, 0.2)',
          margin: '32px 0'
        }}></div>
        
        {/* Bottom Section */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{
              margin: 0,
              color: 'rgba(255,255,255,0.8)',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            © 2024 PYQ Hub. Made with ❤️ for students by students.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}
          >
            <span style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              Follow us:
            </span>
            {['📧', '🐦', '📘', '📷'].map((icon, index) => (
              <motion.a
                key={index}
                href="#"
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)'
                }}
              >
                {icon}
              </motion.a>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.footer>
  )
}

export default Footer 