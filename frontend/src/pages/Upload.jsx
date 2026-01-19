import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'

const Upload = () => {
  const [subjects, setSubjects] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    subjectName: '',
    year: new Date().getFullYear()
  })
  const [file, setFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchSubjects()
  }, [])

  const fetchSubjects = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/subjects')
      setSubjects(response.data)
    } catch (error) {
      console.error('Error fetching subjects:', error)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile)
    } else {
      setUploadStatus({ type: 'error', message: 'Please select a PDF file only' })
    }
  }

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      setUploadStatus(null)
    } else {
      setUploadStatus({ type: 'error', message: 'Please select a PDF file only' })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file || !formData.title || !formData.subjectName) {
      setUploadStatus({ type: 'error', message: 'Please fill all fields and select a PDF file' })
      return
    }

    setUploading(true)
    setUploadStatus(null)

    const uploadFormData = new FormData()
    uploadFormData.append('pdf', file)
    uploadFormData.append('title', formData.title)
    uploadFormData.append('subjectName', formData.subjectName)
    uploadFormData.append('year', formData.year)

    try {
      await axios.post('http://localhost:8000/api/upload-requests', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      setUploadStatus({ 
        type: 'success', 
        message: 'Upload request submitted successfully! It will be reviewed by our admin team.' 
      })
      
      // Reset form
      setFormData({ title: '', subjectName: '', year: new Date().getFullYear() })
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      
    } catch (error) {
      setUploadStatus({ 
        type: 'error', 
        message: error.response?.data?.message || 'Upload failed. Please try again.' 
      })
    } finally {
      setUploading(false)
    }
  }

  const removeFile = () => {
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

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
          <h1 style={{ fontSize: '4rem', fontWeight: '900', color: 'white', marginBottom: '20px' }}>
            <span className="gradient-text">Upload</span> Question Paper
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.8)', maxWidth: '600px', margin: '0 auto' }}>
            Contribute to the community by sharing previous year question papers
          </p>
        </motion.div>

        {/* Upload Form */}
        <motion.div 
          className="card"
          style={{ maxWidth: '800px', margin: '0 auto' }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            {/* File Upload Area */}
            <div>
              <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', color: 'white', fontSize: '1.1rem' }}>
                📄 Question Paper (PDF)
              </label>
              
              {!file ? (
                <motion.div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  whileHover={{ scale: 1.02 }}
                  style={{
                    border: `2px dashed ${dragActive ? '#667eea' : 'rgba(255,255,255,0.3)'}`,
                    borderRadius: '20px',
                    padding: '60px 20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    background: dragActive ? 'rgba(102, 126, 234, 0.1)' : 'rgba(255,255,255,0.05)'
                  }}
                >
                  <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📤</div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '600', color: 'white', marginBottom: '10px' }}>
                    Drop your PDF here or click to browse
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem' }}>
                    Supports PDF files up to 10MB
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    border: '2px solid #48bb78',
                    borderRadius: '20px',
                    padding: '20px',
                    background: 'rgba(72, 187, 120, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '50px', height: '50px', background: '#48bb78', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                      📄
                    </div>
                    <div>
                      <h4 style={{ fontWeight: '600', color: 'white', marginBottom: '5px' }}>{file.name}</h4>
                      <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <motion.button
                    type="button"
                    onClick={removeFile}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    style={{
                      width: '35px',
                      height: '35px',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      fontSize: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ×
                  </motion.button>
                </motion.div>
              )}
            </div>

            {/* Form Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'white' }}>
                  📝 Paper Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Mathematics Final Exam 2023"
                  style={{
                    width: '100%',
                    padding: '15px 20px',
                    borderRadius: '15px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    fontSize: '16px',
                    backdropFilter: 'blur(10px)',
                    outline: 'none'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'white' }}>
                  📚 Subject Name
                </label>
                <input
                  type="text"
                  value={formData.subjectName}
                  onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                  placeholder="Enter subject name (e.g., Mathematics, Physics, Chemistry...)"
                  list="subjects-list"
                  style={{
                    width: '100%',
                    padding: '15px 20px',
                    borderRadius: '15px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    fontSize: '16px',
                    backdropFilter: 'blur(10px)',
                    outline: 'none'
                  }}
                  required
                />
                <datalist id="subjects-list">
                  {subjects.map(subject => (
                    <option key={subject._id} value={subject.name} />
                  ))}
                </datalist>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginTop: '8px' }}>
                  💡 You can enter a new subject name. If approved, it will be added to our database.
                </p>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'white' }}>
                📅 Year
              </label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                min="2000"
                max={new Date().getFullYear()}
                style={{
                  width: '200px',
                  padding: '15px 20px',
                  borderRadius: '15px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  fontSize: '16px',
                  backdropFilter: 'blur(10px)',
                  outline: 'none'
                }}
                required
              />
            </div>

            {/* Status Message */}
            <AnimatePresence>
              {uploadStatus && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{
                    padding: '15px 20px',
                    borderRadius: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: uploadStatus.type === 'success' ? 'rgba(72, 187, 120, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    border: `1px solid ${uploadStatus.type === 'success' ? '#48bb78' : '#ef4444'}`,
                    color: 'white'
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>
                    {uploadStatus.type === 'success' ? '✅' : '❌'}
                  </span>
                  <span>{uploadStatus.message}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={uploading || !file}
              whileHover={{ scale: uploading ? 1 : 1.05 }}
              whileTap={{ scale: uploading ? 1 : 0.95 }}
              style={{
                padding: '18px 40px',
                borderRadius: '50px',
                border: 'none',
                background: uploading || !file ? 'rgba(255,255,255,0.2)' : 'var(--primary-gradient)',
                color: 'white',
                fontSize: '18px',
                fontWeight: '600',
                cursor: uploading || !file ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: uploading || !file ? 'none' : '0 10px 30px rgba(102, 126, 234, 0.4)'
              }}
            >
              {uploading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <div style={{ width: '20px', height: '20px', border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                  <span>Uploading...</span>
                </div>
              ) : (
                '🚀 Submit for Review'
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Guidelines */}
        <motion.div
          className="card"
          style={{ marginTop: '40px', maxWidth: '800px', margin: '40px auto 0', background: 'rgba(102, 126, 234, 0.1)', border: '1px solid rgba(102, 126, 234, 0.3)' }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h3 style={{ fontSize: '1.3rem', fontWeight: '600', color: 'white', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            📋 Upload Guidelines
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, color: 'rgba(255,255,255,0.8)', lineHeight: '1.8' }}>
            <li style={{ marginBottom: '8px' }}>• Only PDF files are accepted (max 10MB)</li>
            <li style={{ marginBottom: '8px' }}>• Ensure the question paper is clear and readable</li>
            <li style={{ marginBottom: '8px' }}>• All uploads are reviewed by our admin team</li>
            <li style={{ marginBottom: '8px' }}>• You'll be notified once your submission is approved</li>
            <li>• Help fellow students by contributing quality content</li>
          </ul>
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

export default Upload