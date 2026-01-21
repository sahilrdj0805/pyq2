import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AdminAPI } from '../ApiService'
import AuthService from '../AuthService'

const AdminDashboard = () => {
  const [user] = useState(() => AuthService.getUser())
  const [activeModule, setActiveModule] = useState('overview')
  const [stats, setStats] = useState(() => {
    const cached = localStorage.getItem('dashboardStats')
    return cached ? JSON.parse(cached) : {
      totalUsers: 0,
      totalSubjects: 0,
      totalPYQs: 0,
      pendingRequests: 0,
      totalDownloads: 0
    }
  })
  const [pendingRequests, setPendingRequests] = useState([])
  const [uploadForm, setUploadForm] = useState({
    title: '',
    subjectName: '',
    year: new Date().getFullYear(),
    file: null
  })
  const [subjects, setSubjects] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState(null)
  const [processingRequest, setProcessingRequest] = useState(null)
  const [processingAction, setProcessingAction] = useState(null) // 'approve' or 'reject'
  const [users, setUsers] = useState([])
  const [deletingUser, setDeletingUser] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [adminManagementTab, setAdminManagementTab] = useState('overview')
  const [admins, setAdmins] = useState([])
  const [newAdminForm, setNewAdminForm] = useState({ name: '', email: '', password: '' })
  const [creatingAdmin, setCreatingAdmin] = useState(false)

  useEffect(() => {
    fetchDashboardData()
    fetchSubjects()
    if (activeModule === 'users') {
      fetchUsers()
    }
  }, [activeModule])

  const fetchSubjects = async () => {
    try {
      const response = await AdminAPI.getSubjects()
      setSubjects(response)
    } catch (error) {
      console.error('Failed to fetch subjects:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await AdminAPI.getAllUsers()
      setUsers(response)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  const fetchAdmins = async () => {
    try {
      const response = await AdminAPI.getAllAdmins()
      setAdmins(response)
    } catch (error) {
      console.error('Failed to fetch admins:', error)
    }
  }

  const handleCreateAdmin = async (e) => {
    e.preventDefault()
    if (!newAdminForm.name || !newAdminForm.email || !newAdminForm.password) {
      setUploadStatus({ type: 'error', message: 'Please fill all fields' })
      return
    }

    setCreatingAdmin(true)
    try {
      await AdminAPI.createAdmin(newAdminForm)
      setUploadStatus({ type: 'success', message: 'Admin created successfully!' })
      setNewAdminForm({ name: '', email: '', password: '' })
      await fetchAdmins()
      await fetchDashboardData()
    } catch (error) {
      setUploadStatus({ type: 'error', message: error.message })
    } finally {
      setCreatingAdmin(false)
    }
  }

  const handleDeleteUser = async (userId) => {
    setConfirmDelete(userId)
  }

  const confirmDeleteUser = async () => {
    const userId = confirmDelete
    setConfirmDelete(null)
    setDeletingUser(userId)
    
    try {
      await AdminAPI.deleteUser(userId)
      await fetchUsers() // Refresh users list
      await fetchDashboardData() // Refresh stats
      setUploadStatus({ type: 'success', message: 'User deleted successfully!' })
    } catch (error) {
      setUploadStatus({ type: 'error', message: 'Failed to delete user' })
    } finally {
      setDeletingUser(null)
    }
  }

  const fetchDashboardData = async () => {
    try {
      const [requests, dashboardStats] = await Promise.all([
        AdminAPI.getPendingRequests(),
        AdminAPI.getDashboardStats()
      ])
      
      setPendingRequests(requests)
      setStats({
        totalUsers: dashboardStats.totalUsers || 0,
        totalSubjects: dashboardStats.totalSubjects || 0,
        totalPYQs: dashboardStats.totalPYQs || 0,
        pendingRequests: dashboardStats.pendingRequests || 0,
        totalDownloads: dashboardStats.totalDownloads || 0,
        approvedToday: dashboardStats.approvedToday || 0,
        rejectedToday: dashboardStats.rejectedToday || 0
      })
      
      // Cache stats for next refresh
      localStorage.setItem('dashboardStats', JSON.stringify({
        totalUsers: dashboardStats.totalUsers || 0,
        totalSubjects: dashboardStats.totalSubjects || 0,
        totalPYQs: dashboardStats.totalPYQs || 0,
        pendingRequests: dashboardStats.pendingRequests || 0,
        totalDownloads: dashboardStats.totalDownloads || 0
      }))
    } catch (error) {
      if (error.response?.status === 401) {
        AuthService.logout()
        return
      }
      
      setStats({
        totalUsers: 0,
        totalSubjects: 0,
        totalPYQs: 0,
        pendingRequests: 0,
        totalDownloads: 0,
        approvedToday: 0,
        rejectedToday: 0
      })
    }
  }

  const handleLogout = () => {
    AuthService.logout()
  }

  const handleModuleChange = (module) => {
    setActiveModule(module)
  }

  const handleCloseModule = () => {
    setActiveModule('overview')
  }

  const handleApproveRequest = async (requestId) => {
    setProcessingRequest(requestId)
    setProcessingAction('approve')
    try {
      await AdminAPI.approveRequest(requestId)
      await fetchDashboardData() // Refresh data
      setUploadStatus({ type: 'success', message: 'Request approved successfully!' })
    } catch (error) {
      setUploadStatus({ type: 'error', message: 'Failed to approve request' })
    } finally {
      setProcessingRequest(null)
      setProcessingAction(null)
    }
  }

  const handleRejectRequest = async (requestId) => {
    setProcessingRequest(requestId)
    setProcessingAction('reject')
    try {
      await AdminAPI.rejectRequest(requestId)
      await fetchDashboardData() // Refresh data
      setUploadStatus({ type: 'success', message: 'Request rejected successfully!' })
    } catch (error) {
      setUploadStatus({ type: 'error', message: 'Failed to reject request' })
    } finally {
      setProcessingRequest(null)
      setProcessingAction(null)
    }
  }

  const handleViewPDF = (fileUrl, title, requestId) => {
    // Use PDF proxy for proper viewing (same as Browse page)
    // For upload requests, we'll use a generic ID since they're not PYQs yet
    const proxyUrl = `http://localhost:8000/api/pdf/request-${requestId}?url=${encodeURIComponent(fileUrl)}`
    window.open(proxyUrl, '_blank')
  }

  const handleUploadSubmit = async (e) => {
    e.preventDefault()
    if (!uploadForm.file || !uploadForm.title || !uploadForm.subjectName) {
      setUploadStatus({ type: 'error', message: 'Please fill all fields and select a PDF file' })
      return
    }

    setUploading(true)
    setUploadStatus(null)

    const formData = new FormData()
    formData.append('pdf', uploadForm.file)
    formData.append('title', uploadForm.title)
    formData.append('subjectName', uploadForm.subjectName)
    formData.append('year', uploadForm.year)

    try {
      await AdminAPI.uploadPYQ(formData)
      setUploadStatus({ type: 'success', message: 'PYQ uploaded successfully!' })
      setUploadForm({ title: '', subjectName: '', year: new Date().getFullYear(), file: null })
      fetchDashboardData()
    } catch (error) {
      setUploadStatus({ type: 'error', message: error.response?.data?.message || 'Upload failed' })
    } finally {
      setUploading(false)
    }
  }

  const StatCard = ({ icon, title, value, color }) => (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '16px',
        padding: '20px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        flex: '1',
        minWidth: '180px',
        maxWidth: '220px'
      }}
    >
      <div style={{ 
        fontSize: '2.2rem', 
        marginBottom: '10px',
        color: color 
      }}>
        {icon}
      </div>
      <div style={{ 
        fontSize: '1.8rem', 
        fontWeight: '900', 
        color: 'white',
        marginBottom: '6px' 
      }}>
        {(value || 0).toLocaleString()}
      </div>
      <div style={{ 
        color: 'rgba(255,255,255,0.8)', 
        fontSize: '0.85rem',
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
                background: user?.role === 'superadmin' ? '#ff6b6b' : user?.role === 'admin' ? '#9b59b6' : '#4ecdc4',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: '600'
              }}>
                {user?.role === 'superadmin' ? '🛡️ Super Admin' : user?.role === 'admin' ? '🛡️ Admin' : '👤 User'}
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
            display: 'flex',
            flexWrap: 'wrap',
            gap: '20px',
            justifyContent: 'space-between'
          }}>
            <StatCard 
              icon="👥" 
              title="Total Users" 
              value={stats.totalUsers} 
              color="#4ecdc4" 
            />
            <StatCard 
              icon="📚" 
              title="Total Subjects" 
              value={stats.totalSubjects} 
              color="#9b59b6" 
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

        {/* Admin Management Section - Only show when no other module is active */}
        {user?.role === 'superadmin' && activeModule === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{ marginBottom: '40px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '40px' }}>
              {/* Left Side - Admin Management */}
              <div style={{ flex: 2 }}>
                <h2 style={{ 
                  color: 'white', 
                  fontSize: '1.8rem', 
                  fontWeight: '700',
                  marginBottom: '24px' 
                }}>
                  Admin Management
                </h2>
                
                <div style={{ 
                  display: 'flex', 
                  gap: '16px', 
                  marginBottom: '32px',
                  flexWrap: 'wrap' 
                }}>
                  <motion.button
                    onClick={() => { setAdminManagementTab('overview'); fetchAdmins(); }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      background: adminManagementTab === 'overview' 
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        : 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      padding: '12px 20px',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '600'
                    }}
                  >
                    🛡️ Manage Admins
                  </motion.button>
                  <motion.button
                    onClick={() => setAdminManagementTab('add')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      background: adminManagementTab === 'add' 
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        : 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      padding: '12px 20px',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '600'
                    }}
                  >
                    ➕ Add New Admin
                  </motion.button>
                  <motion.button
                    onClick={() => setAdminManagementTab('permissions')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      background: adminManagementTab === 'permissions' 
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        : 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      padding: '12px 20px',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '600'
                    }}
                  >
                    🔐 Admin Permissions
                  </motion.button>
                </div>

                {/* Admin Management Content */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '16px',
                  padding: '32px',
                  minHeight: '400px'
                }}>
                  {adminManagementTab === 'overview' && (
                    <div>
                      <h3 style={{ color: 'white', fontSize: '1.3rem', fontWeight: '600', marginBottom: '20px' }}>
                        All Admins ({admins.length})
                      </h3>
                      {admins.map((admin) => (
                        <div key={admin._id} style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '12px',
                          padding: '20px',
                          marginBottom: '16px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '1.5rem' }}>🛡️</span>
                            <div>
                              <div style={{ color: 'white', fontWeight: '600', fontSize: '1.1rem' }}>
                                {admin.name}
                              </div>
                              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                                {admin.email}
                              </div>
                            </div>
                          </div>
                          <span style={{
                            background: '#ff6b6b',
                            padding: '6px 16px',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            color: 'white'
                          }}>
                            Admin
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {adminManagementTab === 'add' && (
                    <div>
                      <h3 style={{ color: 'white', fontSize: '1.3rem', fontWeight: '600', marginBottom: '20px' }}>
                        Add New Admin
                      </h3>
                      <form onSubmit={handleCreateAdmin} style={{ display: 'grid', gap: '20px', maxWidth: '400px' }}>
                        <input
                          type="text"
                          placeholder="Admin Name"
                          value={newAdminForm.name}
                          onChange={(e) => setNewAdminForm({...newAdminForm, name: e.target.value})}
                          style={{
                            padding: '12px 16px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '0.9rem',
                            outline: 'none'
                          }}
                        />
                        <input
                          type="email"
                          placeholder="Admin Email"
                          value={newAdminForm.email}
                          onChange={(e) => setNewAdminForm({...newAdminForm, email: e.target.value})}
                          style={{
                            padding: '12px 16px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '0.9rem',
                            outline: 'none'
                          }}
                        />
                        <input
                          type="password"
                          placeholder="Admin Password"
                          value={newAdminForm.password}
                          onChange={(e) => setNewAdminForm({...newAdminForm, password: e.target.value})}
                          style={{
                            padding: '12px 16px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '0.9rem',
                            outline: 'none'
                          }}
                        />
                        <motion.button
                          type="submit"
                          disabled={creatingAdmin}
                          whileHover={{ scale: creatingAdmin ? 1 : 1.02 }}
                          whileTap={{ scale: creatingAdmin ? 1 : 0.98 }}
                          style={{
                            background: creatingAdmin ? 'rgba(255,255,255,0.2)' : 'linear-gradient(135deg, #4a90e2 0%, #50c878 100%)',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '14px 24px',
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: creatingAdmin ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {creatingAdmin ? 'Creating...' : '➕ Create Admin'}
                        </motion.button>
                      </form>
                    </div>
                  )}

                  {adminManagementTab === 'permissions' && (
                    <div>
                      <h3 style={{ color: 'white', fontSize: '1.3rem', fontWeight: '600', marginBottom: '20px' }}>
                        Admin Permissions
                      </h3>
                      <div style={{
                        background: 'rgba(255, 107, 107, 0.1)',
                        border: '1px solid rgba(255, 107, 107, 0.3)',
                        borderRadius: '12px',
                        padding: '20px'
                      }}>
                        <h4 style={{ color: '#ff6b6b', fontSize: '1.1rem', fontWeight: '600', marginBottom: '12px' }}>
                          🛡️ Admin Permissions
                        </h4>
                        <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                          ✅ Manage PYQs (Upload, Approve, Reject)<br/>
                          ✅ Manage Users (View, Delete)<br/>
                          ✅ Manage Admins (Add, Remove)<br/>
                          ✅ View Analytics & Statistics<br/>
                          ✅ Full System Access
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side - Current User Profile */}
              <div style={{ flex: 1 }}>
                <h2 style={{ 
                  color: 'white', 
                  fontSize: '1.8rem', 
                  fontWeight: '700',
                  marginBottom: '24px' 
                }}>
                  Your Profile
                </h2>
                
                <div style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '16px',
                  padding: '32px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🛡️</div>
                  <h3 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '700', marginBottom: '8px' }}>
                    {user?.name}
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', marginBottom: '16px' }}>
                    {user?.email}
                  </p>
                  <span style={{
                    background: user?.role === 'superadmin' ? '#ff6b6b' : '#9b59b6',
                    padding: '8px 20px',
                    borderRadius: '25px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: 'white',
                    display: 'inline-block',
                    marginBottom: '20px'
                  }}>
                    {user?.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                  </span>
                  
                  <div style={{ 
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    padding: '20px',
                    marginTop: '20px'
                  }}>
                    <h4 style={{ color: 'white', fontSize: '1.1rem', fontWeight: '600', marginBottom: '12px' }}>
                      Quick Stats
                    </h4>
                    <div style={{ display: 'grid', gap: '8px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>
                      <div>📊 Total Users: {stats.totalUsers}</div>
                      <div>📄 Total PYQs: {stats.totalPYQs}</div>
                      <div>⏳ Pending: {stats.pendingRequests}</div>
                      <div>📥 Downloads: {stats.totalDownloads}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ 
                  color: 'white', 
                  fontSize: '1.5rem', 
                  fontWeight: '700',
                  margin: 0
                }}>
                  Upload PYQ
                </h3>
                <motion.button
                  onClick={handleCloseModule}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '8px',
                    padding: '8px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px'
                  }}
                >
                  ✕
                </motion.button>
              </div>
              
              <form onSubmit={handleUploadSubmit} style={{ 
                display: 'grid', 
                gap: '20px',
                maxWidth: '600px' 
              }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    color: 'rgba(255,255,255,0.9)', 
                    marginBottom: '8px',
                    fontWeight: '600' 
                  }}>
                    📝 Paper Title
                  </label>
                  <input
                    type="text"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                    placeholder="e.g., Mathematics Final Exam 2023"
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

                <div>
                  <label style={{ 
                    display: 'block', 
                    color: 'rgba(255,255,255,0.9)', 
                    marginBottom: '8px',
                    fontWeight: '600' 
                  }}>
                    📚 Subject Name
                  </label>
                  <input
                    type="text"
                    value={uploadForm.subjectName}
                    onChange={(e) => setUploadForm({...uploadForm, subjectName: e.target.value})}
                    placeholder="Enter subject name (e.g., Mathematics, Physics...)"
                    list="admin-subjects-list"
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
                  <datalist id="admin-subjects-list">
                    {subjects.map(subject => (
                      <option key={subject._id} value={subject.name} />
                    ))}
                  </datalist>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '6px' }}>
                    💡 You can create new subjects by typing a new name
                  </p>
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    color: 'rgba(255,255,255,0.9)', 
                    marginBottom: '8px',
                    fontWeight: '600' 
                  }}>
                    📅 Year
                  </label>
                  <input
                    type="number"
                    value={uploadForm.year}
                    onChange={(e) => setUploadForm({...uploadForm, year: parseInt(e.target.value)})}
                    min="2000"
                    max={new Date().getFullYear()}
                    required
                    style={{
                      width: '200px',
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

                <div>
                  <label style={{ 
                    display: 'block', 
                    color: 'rgba(255,255,255,0.9)', 
                    marginBottom: '8px',
                    fontWeight: '600' 
                  }}>
                    📄 PDF File
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

                {/* Status Message */}
                {uploadStatus && (
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: uploadStatus.type === 'success' ? 'rgba(72, 187, 120, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    border: `1px solid ${uploadStatus.type === 'success' ? '#48bb78' : '#ef4444'}`,
                    color: 'white',
                    fontSize: '0.9rem'
                  }}>
                    <span>{uploadStatus.type === 'success' ? '✅' : '❌'}</span>
                    <span>{uploadStatus.message}</span>
                  </div>
                )}

                <motion.button
                  type="submit"
                  disabled={uploading}
                  whileHover={{ scale: uploading ? 1 : 1.02 }}
                  whileTap={{ scale: uploading ? 1 : 0.98 }}
                  style={{
                    background: uploading ? 'rgba(255,255,255,0.2)' : 'linear-gradient(135deg, #4a90e2 0%, #50c878 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '14px 24px',
                    color: 'white',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {uploading ? (
                    <>
                      <div style={{ width: '16px', height: '16px', border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                      Uploading...
                    </>
                  ) : (
                    <>📤 Upload PYQ</>
                  )}
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
                padding: '32px',
                marginBottom: '40px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ 
                  color: 'white', 
                  fontSize: '1.5rem', 
                  fontWeight: '700',
                  margin: 0
                }}>
                  Pending Upload Requests ({pendingRequests.length})
                </h3>
                <motion.button
                  onClick={handleCloseModule}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '8px',
                    padding: '8px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px'
                  }}
                >
                  ✕
                </motion.button>
              </div>
              
              {/* Status Message */}
              {uploadStatus && (
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: uploadStatus.type === 'success' ? 'rgba(72, 187, 120, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  border: `1px solid ${uploadStatus.type === 'success' ? '#48bb78' : '#ef4444'}`,
                  color: 'white',
                  fontSize: '0.9rem',
                  marginBottom: '20px'
                }}>
                  <span>{uploadStatus.type === 'success' ? '✅' : '❌'}</span>
                  <span>{uploadStatus.message}</span>
                </div>
              )}
              
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
                      <div style={{ flex: 1 }}>
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
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <motion.button
                          onClick={() => handleViewPDF(request.fileUrl, request.title, request._id)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          style={{
                            background: '#4a90e2',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '8px 16px',
                            color: 'white',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          👁️ View PDF
                        </motion.button>
                        <motion.button
                          onClick={() => handleApproveRequest(request._id)}
                          disabled={processingRequest === request._id}
                          whileHover={{ scale: (processingRequest === request._id) ? 1 : 1.05 }}
                          whileTap={{ scale: (processingRequest === request._id) ? 1 : 0.95 }}
                          style={{
                            background: (processingRequest === request._id && processingAction === 'approve') ? 'rgba(72, 187, 120, 0.5)' : '#48bb78',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '8px 16px',
                            color: 'white',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            cursor: (processingRequest === request._id) ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          {(processingRequest === request._id && processingAction === 'approve') ? (
                            <>
                              <div style={{ width: '12px', height: '12px', border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                              Processing...
                            </>
                          ) : (
                            <>✅ Approve</>
                          )}
                        </motion.button>
                        <motion.button
                          onClick={() => handleRejectRequest(request._id)}
                          disabled={processingRequest === request._id}
                          whileHover={{ scale: (processingRequest === request._id) ? 1 : 1.05 }}
                          whileTap={{ scale: (processingRequest === request._id) ? 1 : 0.95 }}
                          style={{
                            background: (processingRequest === request._id && processingAction === 'reject') ? 'rgba(239, 68, 68, 0.5)' : '#ef4444',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '8px 16px',
                            color: 'white',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            cursor: (processingRequest === request._id) ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          {(processingRequest === request._id && processingAction === 'reject') ? (
                            <>
                              <div style={{ width: '12px', height: '12px', border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                              Processing...
                            </>
                          ) : (
                            <>❌ Reject</>
                          )}
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

          {activeModule === 'users' && (
            <motion.div
              key="users"
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ 
                  color: 'white', 
                  fontSize: '1.5rem', 
                  fontWeight: '700',
                  margin: 0
                }}>
                  Manage Users ({users.length})
                </h3>
                <motion.button
                  onClick={handleCloseModule}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '8px',
                    padding: '8px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px'
                  }}
                >
                  ✕
                </motion.button>
              </div>
              
              {users.length > 0 ? (
                <div style={{ 
                  display: 'grid', 
                  gap: '16px' 
                }}>
                  {users.map((userItem) => (
                    <div
                      key={userItem._id}
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
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '12px',
                          marginBottom: '8px' 
                        }}>
                          <span style={{ fontSize: '1.2rem' }}>
                            {userItem.role === 'admin' ? '🛡️' : '👤'}
                          </span>
                          <div>
                            <div style={{ 
                              color: 'white', 
                              fontWeight: '600',
                              fontSize: '1.1rem' 
                            }}>
                              {userItem.name}
                            </div>
                            <div style={{ 
                              color: 'rgba(255,255,255,0.7)', 
                              fontSize: '0.9rem' 
                            }}>
                              {userItem.email}
                            </div>
                          </div>
                        </div>
                        <div style={{ 
                          display: 'flex', 
                          gap: '12px',
                          alignItems: 'center' 
                        }}>
                          <span style={{
                            background: userItem.role === 'admin' ? '#ff6b6b' : '#4a90e2',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            color: 'white'
                          }}>
                            {userItem.role === 'admin' ? 'Admin' : 'User'}
                          </span>
                          <span style={{ 
                            color: 'rgba(255,255,255,0.6)', 
                            fontSize: '0.8rem' 
                          }}>
                            Joined: {new Date(userItem.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      {user?.role === 'admin' && userItem._id !== user?.id && (
                        <motion.button
                          onClick={() => handleDeleteUser(userItem._id)}
                          disabled={deletingUser === userItem._id}
                          whileHover={{ scale: deletingUser === userItem._id ? 1 : 1.05 }}
                          whileTap={{ scale: deletingUser === userItem._id ? 1 : 0.95 }}
                          style={{
                            background: deletingUser === userItem._id ? 'rgba(239, 68, 68, 0.5)' : '#ef4444',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '10px 16px',
                            color: 'white',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            cursor: deletingUser === userItem._id ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          {deletingUser === userItem._id ? (
                            <>
                              <div style={{ width: '14px', height: '14px', border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                              Deleting...
                            </>
                          ) : (
                            <>🗑️ Delete User</>
                          )}
                        </motion.button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '40px',
                  color: 'rgba(255,255,255,0.7)' 
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '16px' }}>👥</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                    No users found.
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Custom Confirmation Modal */}
      {confirmDelete && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '400px',
              width: '90%',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
            <h3 style={{
              color: 'white',
              fontSize: '1.3rem',
              fontWeight: '700',
              marginBottom: '12px'
            }}>
              Delete User?
            </h3>
            <p style={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: '0.95rem',
              marginBottom: '24px',
              lineHeight: '1.5'
            }}>
              Are you sure you want to delete this user? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <motion.button
                onClick={() => setConfirmDelete(null)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  color: 'white',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={confirmDeleteUser}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: '#ef4444',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  color: 'white',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                🗑️ Delete User
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default AdminDashboard