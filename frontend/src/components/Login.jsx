import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, Lock, LogIn, Mail } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';

const INITIAL_FORM = { email: '', password: '' };

const Login = ({ onSubmit, onSwitchMode }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const url = 'http://localhost:4000';

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    if (token) {
      (async () => {
        try {
          const { data } = await axios.get(`${url}/api/user/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (data.success) {
            onSubmit?.({ token, userId, ...data.user });
            toast.success('Session restored. Redirecting...');
            navigate('/');
          } else {
            localStorage.clear();
            sessionStorage.clear();
          }
        } catch {
          localStorage.clear();
          sessionStorage.clear();
        }
      })();
    }
  }, [navigate, onSubmit]);

  const fields = () => [
    {
      name: 'email',
      type: 'email',
      placeholder: 'Email',
      icon: Mail,
    },
    {
      name: 'password',
      type: showPassword ? 'text' : 'password',
      placeholder: 'Password',
      icon: Lock,
      isPassword: true,
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(`${url}/api/user/login`, formData);
      if (!data.token) throw new Error(data.message || 'Login failed');

      if (rememberMe) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.user.id);
      } else {
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('userId', data.user.id);
      }

      setFormData(INITIAL_FORM);
      onSubmit?.({ token: data.token, userId: data.user.id, ...data.user });
      toast.success('Login successful! Redirecting...');
      setTimeout(() => navigate('/'), 1000);
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchMode = () => {
    toast.dismiss();
    onSwitchMode?.();
  };

  return (
    <div className="max-w-md bg-white w-full shadow-xl rounded-2xl p-8 border border-slate-100">
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
      
      <div className="mb-8 text-center">
        <div className="mx-auto mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
            <LogIn className="w-10 h-10 text-white" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-slate-800">Welcome Back</h2>
          <p className="text-slate-500 text-base">Sign in to continue to TaskFlow</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {fields().map(({ name, type, placeholder, icon: Icon, isPassword }) => (
          <div key={name} className="relative">
            <div className="flex items-center border border-slate-200 rounded-xl px-4 py-3 bg-white shadow-sm focus-within:ring-2 focus-within:ring-blue-300 transition-all duration-300">
              <Icon className="text-blue-500 h-5 w-5 mr-3" />
              <input
                type={type}
                name={name}
                placeholder={placeholder}
                value={formData[name]}
                onChange={(e) =>
                  setFormData({ ...formData, [name]: e.target.value })
                }
                className="w-full focus:outline-none text-base text-slate-700 pr-10 placeholder-slate-400"
                required
              />
              {isPassword && (
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 text-slate-400 hover:text-blue-500 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              )}
            </div>
          </div>
        ))}

        <div className="flex items-center">
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={() => setRememberMe(!rememberMe)}
            className="h-5 w-5 text-blue-500 focus:ring-blue-300 border-slate-300 rounded"
          />
          <label
            htmlFor="rememberMe"
            className="ml-3 block text-sm text-slate-600"
          >
            Remember Me
          </label>
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
              Logging in...
            </span>
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              Login
            </>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-100">
        <p className="text-center text-sm text-slate-600">
          Don't have an account?{' '}
          <button
            type="button"
            className="text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors"
            onClick={handleSwitchMode}
          >
            Create Account
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;