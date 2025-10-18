
import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const UpdatePassword = () => {
  const navigate = useNavigate()
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [userReady, setUserReady] = useState(false)

  useEffect(() => {
    // check if a session/user exists after redirect
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data?.user) {
        setUserReady(true)
      } else {
        // listen for auth events (PASSWORD_RECOVERY or SIGNED_IN)
        const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
            setUserReady(true)
          }
        })
        // cleanup
        return () => sub?.subscription?.unsubscribe?.()
      }
    }
    checkUser()
  }, [])

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.')
      return
    }
    setLoading(true)

    // updateUser requires an authenticated session; password recovery link provides it
    const { data, error } = await supabase.auth.updateUser({ password: newPassword })
    setLoading(false)

    if (error) {
      toast.error(error.message || 'Could not update password.')
      console.error('updateUser error:', error)
    } else {
      toast.success('Password updated! Please login with your new password.')
      // optional: sign out to clear recovery session
      await supabase.auth.signOut()
      navigate('/')
    }
  }

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Set a New Password</h2>

      {!userReady ? (
        <p className="text-center text-gray-500">Waiting for recovery session...</p>
      ) : (
        <form onSubmit={handleUpdate} className="space-y-4">
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-all"
          >
            {loading ? 'Updating...' : 'Set New Password'}
          </button>
        </form>
      )}

    </div>
  )
}

export default UpdatePassword
