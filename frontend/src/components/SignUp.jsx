import { UserPlus } from 'lucide-react'
import React, { useState } from 'react'
import axios from 'axios'

const API_URL = "http://localhost:4000"
const INITIAL_FORM = { name: "", email: "", password: "" }

const Signup = ({ onSwitchMode }) => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: "", type: "" })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ text: "", type: "" })

    try {
      const { data } = await axios.post(`${API_URL}/api/user/register`, formData)
      setMessage({ text: "Registration successful! You can now log in.", type: "success" })
      setFormData(INITIAL_FORM)
    }
    catch (err) {
      setMessage({ 
        text: err.response?.data?.message || "An error occurred. Please try again.", 
        type: "error" 
      })
    }
    finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md bg-white w-full shadow-xl rounded-2xl p-8 border border-slate-100">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
            <UserPlus className="w-10 h-10 text-white" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-slate-800">
            Create Account
          </h2>
          <p className="text-slate-500 text-base">Join TaskFlow to manage your tasks</p>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl mb-6 text-sm ${
          message.type === 'success' 
            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
            : 'bg-red-50 text-red-600 border border-red-100'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="relative">
            <div className="flex items-center border border-slate-200 rounded-xl px-4 py-3 bg-white shadow-sm focus-within:ring-2 focus-within:ring-blue-300 transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="text-blue-500 h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full focus:outline-none text-base text-slate-700 placeholder-slate-400"
                required
              />
            </div>
          </div>
          
          <div className="relative">
            <div className="flex items-center border border-slate-200 rounded-xl px-4 py-3 bg-white shadow-sm focus-within:ring-2 focus-within:ring-blue-300 transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="text-blue-500 h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full focus:outline-none text-base text-slate-700 placeholder-slate-400"
                required
              />
            </div>
          </div>
          
          <div className="relative">
            <div className="flex items-center border border-slate-200 rounded-xl px-4 py-3 bg-white shadow-sm focus-within:ring-2 focus-within:ring-blue-300 transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="text-blue-500 h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full focus:outline-none text-base text-slate-700 placeholder-slate-400"
                required
              />
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-base font-medium py-4 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Account...
            </span>
          ) : (
            <>
              <UserPlus className="w-5 h-5" />
              Sign Up
            </>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-100">
        <p className="text-center text-sm text-slate-600">
          Already have an account?{' '}
          <button
            type="button"
            className="text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors"
            onClick={onSwitchMode}
          >
            Log In
          </button>
        </p>
      </div>
    </div>
  )
}

export default Signup