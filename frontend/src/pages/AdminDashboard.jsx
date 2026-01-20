import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AdminAPI } from '../ApiService'
import AuthService from '../AuthService'

const AdminDashboard = () => {
  const [user, setUser] = useState(null)
  const [activeModule, setActiveModule] = useState('overview')
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPYQs: 0,
    pendingRequests: 0,
    totalDownloads: 0
  })
  const [pendingRequests, setPendingRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploadForm, setUploadForm] = useState({
    subject: '',
    year: '',
    file: null
  })

  useEffect(() => {
    const userData = AuthService.getUser()
    setUser(userData)
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch both pending requests and dashboard stats
      const [requests, dashboardStats] = await Promise.all([
        AdminAPI.getPendingRequests(),
        AdminAPI.getDashboardStats()
      ])
      
      setPendingRequests(requests)
      setStats({
        totalUsers: dashboardStats.totalUsers,
        totalPYQs: dashboardStats.totalPYQs,
        pendingRequests: dashboardStats.pendingRequests,
        totalDownloads: dashboardStats.totalDownloads,
        approvedToday: dashboardStats.approvedToday,
        rejectedToday: dashboardStats.rejectedToday
      })
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      // Fallback to basic data if API fails
      setStats({
        totalUsers: 0,
        totalPYQs: 0,
        pendingRequests: 0,
        totalDownloads: 0,
        approvedToday: 0,
        rejectedToday: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    AuthService.logout()
  }

  const handleModuleChange = (module) => {
    setActiveModule(module)
  }

  const handleUploadSubmit = (e) => {
    e.preventDefault()
    // Handle upload logic here
    console.log('Upload form:', uploadForm)
  }

  const StatCard = ({ icon, title, value, color }) => (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '16px',
        padding: '24px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}
    >
      <div style={{ 
        fontSize: '2.5rem', 
        marginBottom: '12px',
        color: color 
      }}>
        {icon}
      </div>
      <div style={{ 
        fontSize: '2rem', 
        fontWeight: '900', 
        color: 'white',
        marginBottom: '8px' 
      }}>
        {value.toLocaleString()}
      </div>
      <div style={{ 
        color: 'rgba(255,255,255,0.8)', 
        fontSize: '0.9rem',
        fontWeight: '500' 
      }}>
        {title}
      </div>
    </motion.div>
  )

  const QuickActionButton = ({ icon, label, module, isActive }) => (
    <motion.button
      onClick={() => handleModuleChange(module)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      style={{
        background: isActive 
          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          : 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '12px',
        padding: '16px 24px',
        color: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '0.9rem',
        fontWeight: '600',
        transition: 'all 0.3s ease',
        minWidth: '140px',
        justifyContent: 'center'
      }}
    >
      <span style={{ fontSize: '1.2rem' }}>{icon}</span>
      {label}
    </motion.button>
  )

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
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

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative'
    }}>
      {/* Top Navbar */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        border: 'none',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '16px 32px'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          {/* Left Side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}>
              🛡️
            </div>
            <h1 style={{ 
              color: 'white', 
              fontSize: '1.5rem', 
              fontWeight: '800',
              margin: 0 
            }}>
              Admin Dashboard
            </h1>
          </div>

          {/* Right Side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              color: 'white'
            }}>
              <span style={{ fontWeight: '600' }}>{user?.name}</span>
              <span style={{
                background: user?.role === 'admin' ? '#ff6b6b' : '#4ecdc4',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: '600'
              }}>
                {user?.role === 'admin' ? '🛡️ Super Admin' : '👤 Admin'}
              </span>
            </div>
            
            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                padding: '8px 16px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              🚪 Logout
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ 
        paddingTop: '100px', 
        paddingBottom: '40px',
        paddingLeft: '32px',
        paddingRight: '32px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Dashboard Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: '40px' }}
        >
          <h2 style={{ 
            color: 'white', 
            fontSize: '1.8rem', 
            fontWeight: '700',
            marginBottom: '24px' 
          }}>
            Dashboard Overview
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '24px' 
          }}>
            <StatCard 
              icon="👥" 
              title="Total Users" 
              value={stats.totalUsers} 
              color="#4ecdc4" 
            />
            <StatCard 
              icon="📄" 
              title="Total PYQs" 
              value={stats.totalPYQs} 
              color="#4a90e2" 
            />
            <StatCard 
              icon="⏳" 
              title="Pending Requests" 
              value={stats.pendingRequests} 
              color="#ffc107" 
            />
            <StatCard 
              icon="📥" 
              title="Total Downloads" 
              value={stats.totalDownloads} 
              color="#48bb78" 
            />
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ marginBottom: '40px' }}
        >
          <h2 style={{ 
            color: 'white', 
            fontSize: '1.8rem', 
            fontWeight: '700',
            marginBottom: '24px' 
          }}>
            Quick Actions
          </h2>
          
          <div style={{ 
            display: 'flex', 
            gap: '16px', 
            flexWrap: 'wrap' 
          }}>
            <QuickActionButton 
              icon="📄" 
              label="Manage PYQs" 
              module="pyqs"
              isActive={activeModule === 'pyqs'}
            />
            <QuickActionButton 
              icon="👥" 
              label="Manage Users" 
              module="users"
              isActive={activeModule === 'users'}
            />
            <QuickActionButton 
              icon="📤" 
              label="Upload PYQs" 
              module="upload"
              isActive={activeModule === 'upload'}
            />
            <QuickActionButton 
              icon="📊" 
              label="Analytics" 
              module="analytics"
              isActive={activeModule === 'analytics'}
            />
            {user?.role === 'admin' && (
              <QuickActionButton 
                icon="🛡️" 
                label="Manage Admins" 
                module="admins"
                isActive={activeModule === 'admins'}
              />
            )}
          </div>
        </motion.div>

        {/* Module Content */}
        <AnimatePresence mode="wait">
          {activeModule === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '16px',
                padding: '32px',
                marginBottom: '40px'
              }}
            >
              <h3 style={{ 
                color: 'white', 
                fontSize: '1.5rem', 
                fontWeight: '700',
                marginBottom: '24px' 
              }}>
                Upload PYQ
              </h3>
              
              <form onSubmit={handleUploadSubmit} style={{ 
                display: 'grid', 
                gap: '20px',
                maxWidth: '500px' 
              }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    color: 'rgba(255,255,255,0.9)', 
                    marginBottom: '8px',
                    fontWeight: '600' 
                  }}>
                    Subject
                  </label>
                  <select
                    value={uploadForm.subject}
                    onChange={(e) => setUploadForm({...uploadForm, subject: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  >
                    <option value="">Select Subject</option>
                    <option value="mathematics">Mathematics</option>
                    <option value="physics">Physics</option>
                    <option value="chemistry">Chemistry</option>
                    <option value="computer-science">Computer Science</option>
                  </select>
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    color: 'rgba(255,255,255,0.9)', 
                    marginBottom: '8px',
                    fontWeight: '600' 
                  }}>
                    Year
                  </label>
                  <select
                    value={uploadForm.year}
                    onChange={(e) => setUploadForm({...uploadForm, year: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  >
                    <option value="">Select Year</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                    <option value="2021">2021</option>
                  </select>
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    color: 'rgba(255,255,255,0.9)', 
                    marginBottom: '8px',
                    fontWeight: '600' 
                  }}>
                    PDF File
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setUploadForm({...uploadForm, file: e.target.files[0]})}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    background: 'linear-gradient(135deg, #4a90e2 0%, #50c878 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '14px 24px',
                    color: 'white',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  📤 Upload PYQ
                </motion.button>
              </form>
            </motion.div>
          )}

          {activeModule === 'admins' && user?.role === 'admin' && (
            <motion.div
              key="admins"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Role Permissions Cards */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                gap: '24px',
                marginBottom: '40px' 
              }}>
                {/* Super Admin Card */}
                <div style={{
                  background: 'rgba(255, 107, 107, 0.1)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 107, 107, 0.3)',
                  borderRadius: '16px',
                  padding: '24px'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    marginBottom: '16px' 
                  }}>
                    <span style={{ fontSize: '1.5rem' }}>🛡️</span>
                    <h3 style={{ 
                      color: '#ff6b6b', 
                      fontSize: '1.3rem', 
                      fontWeight: '700',
                      margin: 0 
                    }}>
                      Super Admin
                    </h3>
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.9)' }}>
                    <div style={{ marginBottom: '8px' }}>✅ Manage PYQs</div>
                    <div style={{ marginBottom: '8px' }}>✅ Upload PYQs</div>
                    <div style={{ marginBottom: '8px' }}>✅ Manage Users</div>
                    <div style={{ marginBottom: '8px' }}>✅ Manage Admins</div>
                    <div>✅ View Analytics</div>
                  </div>
                </div>

                {/* Admin Card */}
                <div style={{
                  background: 'rgba(74, 144, 226, 0.1)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(74, 144, 226, 0.3)',
                  borderRadius: '16px',
                  padding: '24px'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    marginBottom: '16px' 
                  }}>
                    <span style={{ fontSize: '1.5rem' }}>👤</span>
                    <h3 style={{ 
                      color: '#4a90e2', 
                      fontSize: '1.3rem', 
                      fontWeight: '700',
                      margin: 0 
                    }}>
                      Admin
                    </h3>
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.9)' }}>
                    <div style={{ marginBottom: '8px' }}>✅ Manage PYQs</div>
                    <div style={{ marginBottom: '8px' }}>✅ Upload PYQs</div>
                    <div style={{ marginBottom: '8px' }}>❌ Manage Users</div>
                    <div style={{ marginBottom: '8px' }}>❌ Manage Admins</div>
                    <div>✅ View Analytics</div>
                  </div>
                </div>
              </div>

              {/* Add New Admin Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '16px 24px',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '32px'
                }}
              >
                ➕ Add New Admin
              </motion.button>

              {/* Current Admins List */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '16px',
                padding: '24px'
              }}>
                <h3 style={{ 
                  color: 'white', 
                  fontSize: '1.3rem', 
                  fontWeight: '700',
                  marginBottom: '20px' 
                }}>
                  Current Admins
                </h3>
                
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  marginBottom: '12px'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px' 
                  }}>
                    <span style={{ fontSize: '1.2rem' }}>🛡️</span>
                    <div>
                      <div style={{ 
                        color: 'white', 
                        fontWeight: '600' 
                      }}>
                        {user?.name}
                      </div>
                      <div style={{ 
                        color: 'rgba(255,255,255,0.7)', 
                        fontSize: '0.8rem' 
                      }}>
                        {user?.email}
                      </div>
                    </div>
                  </div>
                  <span style={{
                    background: '#ff6b6b',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    color: 'white'
                  }}>
                    Super Admin
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {activeModule === 'pyqs' && (
            <motion.div
              key="pyqs"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '16px',
                padding: '32px'
              }}
            >
              <h3 style={{ 
                color: 'white', 
                fontSize: '1.5rem', 
                fontWeight: '700',
                marginBottom: '24px' 
              }}>
                Pending Upload Requests ({pendingRequests.length})
              </h3>
              
              {pendingRequests.length > 0 ? (
                <div style={{ 
                  display: 'grid', 
                  gap: '16px' 
                }}>
                  {pendingRequests.slice(0, 3).map((request, index) => (
                    <div
                      key={request._id}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        padding: '20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ 
                          color: 'white', 
                          fontWeight: '600',
                          marginBottom: '4px' 
                        }}>
                          {request.title || request.subjectName}
                        </div>
                        <div style={{ 
                          color: 'rgba(255,255,255,0.7)', 
                          fontSize: '0.9rem' 
                        }}>
                          Year: {request.year} • Uploaded by: {request.uploadedByUser || 'Anonymous'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          style={{
                            background: '#48bb78',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '8px 16px',
                            color: 'white',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          ✅ Approve
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          style={{
                            background: '#ef4444',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '8px 16px',
                            color: 'white',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          ❌ Reject
                        </motion.button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '40px',
                  color: 'rgba(255,255,255,0.7)' 
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎉</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                    All caught up! No pending requests.
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default AdminDashboard