import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import { registerUser } from '../../lib/auth'

const accountTypes = [
  { value: 'resident', label: 'Resident / Community Member' },
  { value: 'responder', label: 'Emergency Responder' },
  { value: 'admin', label: 'Local Admin' },
]

export default function SignUp() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'resident',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email'
    
    if (!formData.password) newErrors.password = 'Password is required'
    else if (formData.password.length < 8) newErrors.password = 'Min 8 characters'
    
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirm password'
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    try {
      await registerUser({
        email: formData.email,
        password: formData.password,
        role: formData.role,
        displayName: formData.fullName,
      })
      navigate(`/${formData.role}/dashboard`)
    } catch (err) {
      const msg = String(err.message || err)
      // if the email is already in use, redirect user to login with email prefilled
      if (msg.startsWith('auth/email-already-in-use')) {
        navigate(`/login?prefillEmail=${encodeURIComponent(formData.email)}`)
        return
      }
      setErrors({ submit: msg })
    } finally {
      setLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 via-purple-500 to-indigo-700 relative overflow-hidden flex items-center justify-center px-3 py-6 sm:px-4 md:px-8">
      {/* 3D Geometric Decorative Elements */}
      
      {/* Blue Cube - Top Right */}
      <motion.div
        className="absolute top-12 right-20 w-40 h-40 rounded-3xl bg-gradient-to-br from-blue-300 to-blue-600 shadow-2xl hidden lg:block"
        animate={{ y: [0, -25, 0], rotateX: [0, 20, 0], rotateZ: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
        style={{ perspective: '1200px' }}
      />
      
      {/* Blue Torus - Bottom Left */}
      <motion.div
        className="absolute bottom-20 left-10 w-32 h-32 rounded-full border-8 border-blue-300 shadow-xl hidden lg:block opacity-70"
        animate={{ rotate: [0, 360], scale: [0.9, 1.1, 0.9] }}
        transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
      />

      {/* Black Sphere - Bottom Right */}
      <motion.div
        className="absolute -bottom-12 -right-8 w-36 h-36 rounded-full bg-gray-900 shadow-2xl hidden lg:block"
        animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
      />

      {/* Light gray shapes - Top area */}
      <motion.div
        className="absolute top-20 right-32 w-12 h-12 rounded-lg bg-gray-300 shadow-lg hidden lg:block"
        animate={{ rotate: [0, 360], opacity: [0.5, 0.8, 0.5] }}
        transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
      />

      {/* Main Container - Card with semi-transparent background */}
      <motion.div
        className="relative z-10 w-full max-w-6xl"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="bg-white bg-opacity-15 backdrop-blur-3xl rounded-3xl p-5 sm:p-8 md:p-10 lg:p-16 shadow-2xl border border-white border-opacity-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
            
            {/* Left Side - Form */}
            <motion.div className="flex flex-col justify-center order-1 lg:order-1" variants={itemVariants}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-8 sm:mb-10 text-center lg:text-left">Sign Up</h1>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <motion.div variants={itemVariants}>
                  <input
                    type="text"
                    name="fullName"
                    autoComplete="name"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Full Name"
                    className={`w-full px-6 py-4 rounded-full bg-white placeholder-gray-400 text-gray-800 font-medium focus:outline-none transition-all duration-300 ${
                      errors.fullName
                        ? 'ring-2 ring-red-400 focus:ring-red-500'
                        : 'hover:shadow-lg focus:ring-2 focus:ring-blue-300'
                    }`}
                  />
                  {errors.fullName && (
                    <motion.p className="text-red-200 text-sm mt-1 flex items-center gap-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <AlertCircle className="w-4 h-4" /> {errors.fullName}
                    </motion.p>
                  )}
                </motion.div>

                {/* Email */}
                <motion.div variants={itemVariants}>
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email Address"
                    className={`w-full px-6 py-4 rounded-full bg-white placeholder-gray-400 text-gray-800 font-medium focus:outline-none transition-all duration-300 ${
                      errors.email
                        ? 'ring-2 ring-red-400 focus:ring-red-500'
                        : 'hover:shadow-lg focus:ring-2 focus:ring-blue-300'
                    }`}
                  />
                  {errors.email && (
                    <motion.p className="text-red-200 text-sm mt-1 flex items-center gap-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <AlertCircle className="w-4 h-4" /> {errors.email}
                    </motion.p>
                  )}
                </motion.div>

                {/* Account Type */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-semibold text-black/80 mb-2">Account Type</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-6 py-4 rounded-2xl bg-white text-gray-800 font-medium focus:outline-none transition-all duration-300 hover:shadow-lg focus:ring-2 focus:ring-blue-300"
                  >
                    {accountTypes.map((accountType) => (
                      <option key={accountType.value} value={accountType.value}>
                        {accountType.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs text-black/70">
                    Choose the role that matches how you will use Jirani Alert.
                  </p>
                </motion.div>

                {/* Password */}
                <motion.div variants={itemVariants}>
                  <div className="relative">
                    <input
                      key={`password-${showPassword ? 'text' : 'password'}`}
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="new-password"
                      placeholder="Password"
                      className={`w-full px-6 py-4 pr-12 rounded-full bg-white placeholder-gray-400 text-gray-800 font-medium focus:outline-none transition-all duration-300 ${
                        errors.password
                          ? 'ring-2 ring-red-400 focus:ring-red-500'
                          : 'hover:shadow-lg focus:ring-2 focus:ring-blue-300'
                      }`}
                    />
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      aria-pressed={showPassword}
                      className="absolute right-3 top-1/2 z-10 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                    >
                      {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <motion.p className="text-red-200 text-sm mt-1 flex items-center gap-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <AlertCircle className="w-4 h-4" /> {errors.password}
                    </motion.p>
                  )}
                </motion.div>

                {/* Confirm Password */}
                <motion.div variants={itemVariants}>
                  <div className="relative">
                    <input
                      key={`confirm-password-${showConfirmPassword ? 'text' : 'password'}`}
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      autoComplete="new-password"
                      placeholder="Confirm Password"
                      className={`w-full px-6 py-4 pr-12 rounded-full bg-white placeholder-gray-400 text-gray-800 font-medium focus:outline-none transition-all duration-300 ${
                        errors.confirmPassword
                          ? 'ring-2 ring-red-400 focus:ring-red-500'
                          : 'hover:shadow-lg focus:ring-2 focus:ring-blue-300'
                      }`}
                    />
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      aria-pressed={showConfirmPassword}
                      className="absolute right-3 top-1/2 z-10 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <motion.p className="text-red-200 text-sm mt-1 flex items-center gap-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <AlertCircle className="w-4 h-4" /> {errors.confirmPassword}
                    </motion.p>
                  )}
                </motion.div>

                {errors.submit && (
                  <motion.div
                    className="bg-red-500 bg-opacity-30 border border-red-300 rounded-lg p-3 flex items-center gap-2 text-red-200 text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <AlertCircle className="w-5 h-5" />
                    <span>{errors.submit}</span>
                  </motion.div>
                )}
              </form>
            </motion.div>

            {/* Right Side - Buttons & Links */}
            <motion.div
              className="flex flex-col items-center justify-center gap-5 order-2 lg:order-2"
              variants={containerVariants}
            >
              {/* Sign Up Button */}
              <motion.button
                onClick={handleSubmit}
                disabled={loading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                variants={itemVariants}
                className="w-full max-w-md px-8 py-4 rounded-full bg-gray-900 text-white font-bold text-lg hover:bg-black transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-xl"
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
              </motion.button>

              {/* Login Link */}
              <motion.p className="text-gray-900 font-semibold text-center px-2" variants={itemVariants}>
                Already have an account?{' '}
                <Link to="/login" className="underline hover:text-blue-900 transition-colors">
                  Log in
                </Link>
              </motion.p>

              {/* Divider */}
              <motion.div className="w-full flex items-center gap-3" variants={itemVariants}>
                <div className="flex-1 h-px bg-gray-400 opacity-50" />
                <span className="text-gray-700 text-sm font-medium">Or</span>
                <div className="flex-1 h-px bg-gray-400 opacity-50" />
              </motion.div>

              {/* Social Sign Up Buttons */}
              <motion.div className="w-full flex flex-col gap-3" variants={containerVariants}>
                {/* Google */}
                <motion.button
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full max-w-md mx-auto px-6 py-3 rounded-full border-2 border-gray-700 text-gray-900 font-semibold flex items-center justify-center gap-3 hover:bg-gray-100 hover:shadow-lg transition-all duration-300"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Sign up with Google
                </motion.button>

                {/* Facebook */}
                <motion.button
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full max-w-md mx-auto px-6 py-3 rounded-full border-2 border-gray-700 text-gray-900 font-semibold flex items-center justify-center gap-3 hover:bg-gray-100 hover:shadow-lg transition-all duration-300"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
                  </svg>
                  Sign up with Facebook
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

