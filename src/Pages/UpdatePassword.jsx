import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Lock, ArrowRight, Rocket, Sparkles, ShieldCheck, Eye, EyeOff } from 'lucide-react'

const UpdatePassword = () => {
  const navigate = useNavigate()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(true)
  const [userReady, setUserReady] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Check for existing session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session error:', error)
          toast.error('Invalid or expired recovery link')
          setTimeout(() => navigate('/forgot-password'), 2000)
          return
        }

        if (session) {
          setUserReady(true)
          setVerifying(false)
        } else {
          // Listen for auth state changes
          const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth event:', event)
            
            if (event === 'PASSWORD_RECOVERY' && session) {
              setUserReady(true)
              setVerifying(false)
            } else if (event === 'SIGNED_IN' && session) {
              setUserReady(true)
              setVerifying(false)
            }
          })

          // Timeout fallback
          setTimeout(() => {
            if (!userReady) {
              setVerifying(false)
              toast.error('Recovery session expired. Please request a new link.')
              setTimeout(() => navigate('/forgot-password'), 2000)
            }
          }, 5000)

          return () => subscription.unsubscribe()
        }
      } catch (err) {
        console.error('Verification error:', err)
        toast.error('Something went wrong')
        setVerifying(false)
      }
    }

    checkSession()
  }, [navigate, userReady])

  const handleUpdate = async (e) => {
    e.preventDefault()
    
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.auth.updateUser({ 
        password: newPassword 
      })

      if (error) throw error

      toast.success('Password updated successfully!')
      
      // Sign out to clear recovery session
      await supabase.auth.signOut()
      
      setTimeout(() => {
        navigate('/')
      }, 1500)

    } catch (error) {
      console.error('Update error:', error)
      toast.error(error.message || 'Could not update password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle Background Glow Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        {/* Header/Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl mb-4 shadow-lg shadow-cyan-500/20">
            <Rocket className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            PitchCraft
            <Sparkles className="w-5 h-5 text-cyan-400" />
          </h1>
          <p className="text-slate-400 text-sm">Your AI Startup Partner</p>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800 p-8 shadow-2xl">
          <div className="mb-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-cyan-500/10 rounded-full mb-3">
              <ShieldCheck className="w-6 h-6 text-cyan-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">
              Set New Password
            </h2>
            <p className="text-slate-400 text-sm">
              Choose a strong password for your account
            </p>
          </div>

          {verifying ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center mb-4">
                <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
              </div>
              <p className="text-slate-400 text-sm">Verifying recovery link...</p>
            </div>
          ) : !userReady ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-full mb-4">
                <ShieldCheck className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Link Expired</h3>
              <p className="text-slate-400 text-sm mb-4">
                This recovery link has expired or is invalid.
              </p>
              <button
                onClick={() => navigate('/forgot-password')}
                className="text-cyan-400 hover:text-cyan-300 font-medium text-sm"
              >
                Request New Link →
              </button>
            </div>
          ) : (
            <form onSubmit={handleUpdate} className="space-y-4">
              {/* New Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">New Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-12 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all hover:border-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-cyan-400 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Confirm Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                  </div>
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-12 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all hover:border-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-cyan-400 transition-colors"
                  >
                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Password Strength Indicator */}
              <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-2">Password must contain:</p>
                <ul className="space-y-1">
                  <li className={`text-xs flex items-center gap-2 ${newPassword.length >= 6 ? 'text-green-400' : 'text-slate-500'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${newPassword.length >= 6 ? 'bg-green-400' : 'bg-slate-600'}`}></div>
                    At least 6 characters
                  </li>
                  <li className={`text-xs flex items-center gap-2 ${newPassword && confirmPassword && newPassword === confirmPassword ? 'text-green-400' : 'text-slate-500'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${newPassword && confirmPassword && newPassword === confirmPassword ? 'bg-green-400' : 'bg-slate-600'}`}></div>
                    Passwords match
                  </li>
                </ul>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-teal-500 text-white py-3.5 rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Updating Password...
                  </>
                ) : (
                  <>
                    Update Password
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center">
          <p className="text-slate-500 text-xs">
            Your password will be encrypted and stored securely
          </p>
        </div>
      </div>
    </div>
  )
}

export default UpdatePassword