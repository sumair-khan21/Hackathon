import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Login from './Pages/Login'
import Dashboard from './Pages/Dashboard'
import Signup from './Pages/Signup'
import ForgotPassword from './Pages/ForgotPassword'
import UpdatePassword from './Pages/UpdatePassword'
import { Toaster } from 'react-hot-toast'

const App = () => {
  
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/update-password" element={<UpdatePassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    
      <Toaster position="top-center" reverseOrder={false} />
    </>
  )
}

export default App