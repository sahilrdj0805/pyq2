import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminDashboard from './AdminDashboard'

const Admin = () => {
  // This component now serves as a wrapper/redirect
  // You can add any admin-specific logic here
  
  return <AdminDashboard />
}

export default Admin