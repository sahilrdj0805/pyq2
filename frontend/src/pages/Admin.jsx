import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AdminAPI } from '../ApiService'
import AuthService from '../AuthService'

const Admin = () => {
  const [pendingRequests, setPendingRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState(null)
  const [notification, setNotification] = useState(null)
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 })

  useEffect(() => {
    fetchPendingRequests()
  }, [])

  const fetchPendingRequests = async () => {
    try {
      setLoading(true)
      const data = await AdminAPI.getPendingRequests()
      setPendingRequests(data)
      setStats(prev => ({ ...prev, pending: data.length }))
    } catch (error) {
      console.error('Error fetching pending requests:', error)
      showNotification('error', error.message || 'Failed to fetch pending requests')
    } finally {
      setLoading(false)
    }
  }

  const showNotification = (type, message) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  const handleApprove = async (requestId) => {
    setProcessingId(requestId)
    try {
      await AdminAPI.approveRequest(requestId)
      setPendingRequests(prev => prev.filter(req => req._id !== requestId))
      setStats(prev => ({ ...prev, pending: prev.pending - 1, approved: prev.approved + 1 }))
      showNotification('success', 'Request approved and published successfully!')
    } catch (error) {
      console.error('Error approving request:', error)
      showNotification('error', error.message || 'Failed to approve request')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (requestId) => {
    setProcessingId(requestId)
    try {
      await AdminAPI.rejectRequest(requestId)
      setPendingRequests(prev => prev.filter(req => req._id !== requestId))
      setStats(prev => ({ ...prev, pending: prev.pending - 1, rejected: prev.rejected + 1 }))
      showNotification('success', 'Request rejected successfully')
    } catch (error) {
      console.error('Error rejecting request:', error)
      showNotification('error', error.message || 'Failed to reject request')
    } finally {
      setProcessingId(null)
    }
  }

  const RequestCard = ({ request, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      className="card"
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      {/* Status Badge */}
      <div style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255, 193, 7, 0.2)', color: '#ffc107', padding: '8px 15px', borderRadius: '20px', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
        ⏳ Pending
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
        <div style={{ width: '50px', height: '50px', background: 'var(--secondary-gradient)', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
          📄
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: 'white', marginBottom: '5px' }}>
            {request.title}
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontWeight: '500' }}>
            {request.subjectName}
          </p>
        </div>
      </div>

      {/* Details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '15px', marginBottom: '25px' }}>
        <div style={{ textAlign: 'center', padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>
          <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', marginBottom: '5px' }}>Year</div>
          <div style={{ fontSize: '1.1rem', fontWeight: '600', color: 'white' }}>{request.year}</div>
        </div>
        <div style={{ textAlign: 'center', padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>
          <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', marginBottom: '5px' }}>Uploaded By</div>
          <div style={{ fontSize: '1.1rem', fontWeight: '600', color: 'white' }}>{request.uploadedByUser || 'Anonymous'}</div>
        </div>
        <div style={{ textAlign: 'center', padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>
          <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', marginBottom: '5px' }}>Submitted</div>
          <div style={{ fontSize: '1.1rem', fontWeight: '600', color: 'white' }}>{new Date(request.createdAt).toLocaleDateString()}</div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            const proxyUrl = `http://localhost:8000/api/pdf/${request._id}?url=${encodeURIComponent(request.fileUrl)}`
            window.open(proxyUrl, '_blank')
          }}
          style={{
            padding: '12px',
            borderRadius: '12px',
            border: 'none',
            background: 'var(--accent-blue)',
            color: 'white',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px'
          }}
        >
          👁️ Preview
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleApprove(request._id)}
          disabled={processingId === request._id}
          style={{
            padding: '12px',
            borderRadius: '12px',
            border: 'none',
            background: processingId === request._id ? 'rgba(255,255,255,0.2)' : '#48bb78',
            color: 'white',
            fontWeight: '600',
            cursor: processingId === request._id ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px'
          }}
        >
          {processingId === request._id ? (
            <div style={{ width: '16px', height: '16px', border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          ) : (
            <>✅ Approve</>
          )}
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleReject(request._id)}
          disabled={processingId === request._id}
          style={{
            padding: '12px',
            borderRadius: '12px',
            border: 'none',
            background: processingId === request._id ? 'rgba(255,255,255,0.2)' : '#ef4444',
            color: 'white',
            fontWeight: '600',
            cursor: processingId === request._id ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px'
          }}
        >
          {processingId === request._id ? (
            <div style={{ width: '16px', height: '16px', border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          ) : (
            <>❌ Reject</>
          )}
        </motion.button>
      </div>
    </motion.div>
  )

  return (
    <div style={{ minHeight: '100vh', paddingTop: '120px', paddingBottom: '50px' }}>
      <div className="container">
        {/* Header */}
        <motion.div 
          style={{ textAlign: 'center', marginBottom: '60px' }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
            <div style={{ width: '60px', height: '60px', background: 'var(--primary-gradient)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
              🛡️
            </div>
            <h1 style={{ fontSize: '4rem', fontWeight: '900', color: 'white' }}>
              <span className="gradient-text">Admin</span> Dashboard
            </h1>
          </div>
          <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.8)', maxWidth: '600px', margin: '0 auto' }}>
            Review and manage pending question paper submissions
          </p>
        </motion.div>

        {/* Notification */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              style={{
                position: 'fixed',
                top: '100px',
                right: '20px',
                zIndex: 1000,
                padding: '15px 25px',
                borderRadius: '15px',
                background: notification.type === 'success' ? '#48bb78' : '#ef4444',
                color: 'white',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontWeight: '600'
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>
                {notification.type === 'success' ? '✅' : '❌'}
              </span>
              <span>{notification.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        <motion.div 
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '25px', marginBottom: '50px' }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="card" style={{ textAlign: 'center', background: 'rgba(255, 193, 7, 0.1)', border: '1px solid rgba(255, 193, 7, 0.3)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>⏳</div>
            <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#ffc107', marginBottom: '5px' }}>{stats.pending}</div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontWeight: '600' }}>Pending Reviews</div>
          </div>
          
          <div className="card" style={{ textAlign: 'center', background: 'rgba(72, 187, 120, 0.1)', border: '1px solid rgba(72, 187, 120, 0.3)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>✅</div>
            <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#48bb78', marginBottom: '5px' }}>{stats.approved}</div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontWeight: '600' }}>Approved Today</div>
          </div>
          
          <div className="card" style={{ textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>❌</div>
            <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#ef4444', marginBottom: '5px' }}>{stats.rejected}</div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontWeight: '600' }}>Rejected Today</div>
          </div>
        </motion.div>

        {/* Pending Requests */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h2 style={{ fontSize: '2rem', fontWeight: '700', color: 'white', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            📋 Pending Requests
            {pendingRequests.length > 0 && (
              <span style={{ background: '#ffc107', color: '#000', padding: '5px 12px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: '600' }}>
                {pendingRequests.length}
              </span>
            )}
          </h2>
          
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '25px' }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card" style={{ height: '250px', background: 'rgba(255,255,255,0.1)' }}>
                  <div style={{ height: '20px', background: 'rgba(255,255,255,0.2)', borderRadius: '10px', marginBottom: '15px' }}></div>
                  <div style={{ height: '15px', background: 'rgba(255,255,255,0.2)', borderRadius: '8px', marginBottom: '10px', width: '70%' }}></div>
                  <div style={{ height: '15px', background: 'rgba(255,255,255,0.2)', borderRadius: '8px', width: '50%' }}></div>
                </div>
              ))}
            </div>
          ) : pendingRequests.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '25px' }}>
              {pendingRequests.map((request, index) => (
                <RequestCard key={request._id} request={request} index={index} />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ textAlign: 'center', padding: '80px 20px' }}
            >
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎉</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'white', marginBottom: '10px' }}>
                All caught up!
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.7)' }}>
                No pending requests to review at the moment
              </p>
            </motion.div>
          )}
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

export default Admin