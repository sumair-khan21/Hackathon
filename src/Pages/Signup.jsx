// import React, { useState } from 'react'
// import { supabase } from '../lib/supabaseClient'
// import { Link, useNavigate } from 'react-router-dom'

// const Signup = () => {
//     console.log("supabase", supabase);
    
//   const navigate = useNavigate()
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')

//   const handleSignup = async (e) => {
//     e.preventDefault()
//     setLoading(true)
//     setError('')
//     const { error } = await supabase.auth.signUp({ email, password })
//     setLoading(false)

//     if (error) setError(error.message)
//     else {
//       alert('Signup successful! Check your email for confirmation.')
//       navigate('/')
//     }
//   }

//   return (
//     <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md">
//       <h2 className="text-2xl font-bold text-center mb-6">Create an Account</h2>
//       <form onSubmit={handleSignup} className="space-y-4">
//         <input
//           type="email"
//           placeholder="Email"
//           onChange={(e) => setEmail(e.target.value)}
//           value={email}
//           required
//           className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//         />
//         <input
//           type="password"
//           placeholder="Password"
//           onChange={(e) => setPassword(e.target.value)}
//           value={password}
//           required
//           className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//         />
//         <button
//           type="submit"
//           disabled={loading}
//           className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-all"
//         >
//           {loading ? 'Creating Account...' : 'Sign Up'}
//         </button>
//       </form>
//       {error && <p className="text-red-500 mt-3 text-center">{error}</p>}
//       <p className="text-center mt-4 text-gray-600">
//         Already have an account?{' '}
//         <Link to="/" className="text-indigo-600 hover:underline">
//           Login
//         </Link>
//       </p>
//     </div>
//   )
// }

// export default Signup






import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const Signup = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // ✅ Handle email/password signup
  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { 'Display name': displayName, 'Phone': phone }, // 👈 exact column names
      },
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      toast.error(error.message)
    } else {
      toast.success('Signup successful!')
      navigate('/')
    }
  }

  // ✅ Google login
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
  }

  // ✅ Facebook login
  const handleFacebookLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'facebook',
    })
  }

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md mx-auto mt-10">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
        Create an Account
      </h2>

      <form onSubmit={handleSignup} className="space-y-4">
        <input
          type="text"
          placeholder="Full Name"
          onChange={(e) => setDisplayName(e.target.value)}
          value={displayName}
          required
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="tel"
          placeholder="Phone Number"
          onChange={(e) => setPhone(e.target.value)}
          value={phone}
          required
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          required
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          required
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-all"
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>

      {error && <p className="text-red-500 mt-3 text-center">{error}</p>}

      <div className="mt-6">
        <p className="text-center text-gray-500 mb-3">or sign up with</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={handleGoogleLogin}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            <i className="fa-brands fa-google"></i> Google
          </button>
          <button
            onClick={handleFacebookLogin}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            <i className="fa-brands fa-facebook"></i> Facebook
          </button>
        </div>
      </div>

      <p className="text-center mt-4 text-gray-600">
        Already have an account?{' '}
        <Link to="/" className="text-indigo-600 hover:underline">
          Login
        </Link>
      </p>
    </div>
  )
}

export default Signup
