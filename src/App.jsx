// import React from 'react'
// import { Route, Routes } from 'react-router-dom'
// import Login from './Pages/Login'
// import Dashboard from './Pages/Dashboard'
// import Signup from './Pages/SignUp'
// import { Toaster } from 'react-hot-toast'

// const App = () => {
  
//   return (
//     <>
//      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
//       <Routes>
//         <Route path="/" element={<Login />} />
//         <Route path="/signup" element={<Signup />} />
//         <Route path="/dashboard" element={<Dashboard />} />
//       </Routes>
    
//             <Toaster position="top-center" reverseOrder={false} />

//     </div>
//     </>
//   )
// }

// export default App






import React from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Login from './Pages/Login'
import Dashboard from './Pages/Dashboard'
import Signup from './Pages/SignUp'
import ForgotPassword from './Pages/ForgotPassword'
import UpdatePassword from './Pages/UpdatePassword'
import { Toaster } from 'react-hot-toast'

const App = () => {
  const location = useLocation()
  const isDashboard = location.pathname === '/dashboard'

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />

      <div
        className={
          isDashboard
            ? 'min-h-screen bg-gray-100'
            : 'min-h-screen bg-gray-100 flex items-center justify-center'
        }
      >
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/update-password" element={<UpdatePassword />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </>
  )
}

export default App
