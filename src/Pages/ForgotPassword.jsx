
import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSendReset = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // redirectTo should match Redirect URLs in Supabase dashboard
    const redirectTo = `${window.location.origin}/update-password`

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      toast.error(error.message)
    } else {
      toast.success('Password reset email sent. Check your inbox (and spam).')
      setEmail('')
    }
  }

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Forgot Password</h2>

      <form onSubmit={handleSendReset} className="space-y-4">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-all"
        >
          {loading ? 'Sending...' : 'Send Reset Email'}
        </button>
      </form>

      {error && <p className="text-red-500 mt-3 text-center">{error}</p>}

      <p className="text-center mt-4 text-gray-600">
        Go back to{' '}
        <Link to="/" className="text-indigo-600 hover:underline">
          Login
        </Link>
      </p>
    </div>
  )
}

export default ForgotPassword
