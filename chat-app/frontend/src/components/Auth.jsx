import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (!isLogin && !formData.name.trim()) newErrors.name = 'Name is required';
    if (!isLogin && formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form first
    if (!validateForm()) {
      toast.error('Please fix form errors');
      return;
    }

    setLoading(true);
    
    try {
      const endpoint = isLogin ? 'login' : 'register';
      
      // PERFECT payload structure
      const payload = isLogin 
        ? { 
            email: formData.email.trim(), 
            password: formData.password 
          }
        : { 
            name: formData.name.trim(), 
            email: formData.email.trim(), 
            password: formData.password, 
            confirmPassword: formData.confirmPassword 
          };

      console.log(`🔗 Sending ${endpoint.toUpperCase()} request:`, payload); // DEBUG

      const res = await axios.post(`http://localhost:5000/api/auth/${endpoint}`, payload, {
        timeout: 10000 // 10 second timeout
      });

      console.log('✅ Auth success:', res.data.token ? 'Token received' : 'No token'); // DEBUG

      // Store tokens properly
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!');
      navigate('/chat/general');
      
    } catch (err) {
      console.error('❌ Auth error:', err.response?.data || err.message); 
      
      // Specific error messages
      if (err.response?.status === 401) {
        toast.error('Invalid email or password');
      } else if (err.response?.status === 400) {
        toast.error(err.response.data.msg || 'Invalid data');
      } else if (err.code === 'ECONNABORTED') {
        toast.error('Request timeout. Please try again.');
      } else {
        toast.error(err.response?.data?.msg || 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!formData.email.trim()) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/forgot-password', { 
        email: formData.email.trim() 
      });
      toast.success('Password reset link sent! Check your email.');
      setShowForgotPassword(false);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Error sending reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/30 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-2xl">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 bg-clip-text text-transparent mb-3">
            {isLogin ? 'Welcome Back' : 'Join The Chat'}
          </h1>
          <p className="text-gray-600 text-lg">{isLogin ? 'Sign in to your account' : 'Create your free account'}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name - Register only */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Sofiya Yasin"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className={`w-full p-4 border-2 rounded-2xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300 bg-white/50'
                }`}
                required
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              placeholder="sofiyasin190@gmail.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className={`w-full p-4 border-2 rounded-2xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300 bg-white/50'
              }`}
              required
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className={`w-full p-4 border-2 rounded-2xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300 bg-white/50'
              }`}
              required
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password - Register only */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className={`w-full p-4 border-2 rounded-2xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                  errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300 bg-white/50'
                }`}
                required
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>
          )}

          {/* Forgot Password */}
          {showForgotPassword && isLogin && (
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={loading}
              className="w-full text-blue-600 hover:text-blue-700 font-semibold py-3 bg-blue-50 rounded-xl border-2 border-blue-200 hover:border-blue-300 transition-all duration-200"
            >
              📧 Send Reset Link
            </button>
          )}

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={loading || Object.keys(errors).length > 0}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-2xl font-bold text-lg shadow-2xl hover:from-blue-600 hover:to-purple-700 active:scale-[0.98] transform transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                ⏳ Processing...
              </span>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        {/* Toggle & Forgot Password */}
        <div className="mt-8 space-y-3 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setErrors({});
              setShowForgotPassword(false);
            }}
            disabled={loading}
            className="w-full text-gray-700 hover:text-gray-900 font-semibold py-3 hover:bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200"
          >
            {isLogin 
              ? "👤 Don't have an account? Create one" 
              : "📱 Already have an account? Sign in"
            }
          </button>
          
          {isLogin && (
            <button
              type="button"
              onClick={() => setShowForgotPassword(!showForgotPassword)}
              disabled={loading}
              className="w-full text-orange-600 hover:text-orange-700 font-semibold py-3 hover:bg-orange-50 rounded-xl border-2 border-orange-200 hover:border-orange-300 transition-all duration-200"
            >
              🔑 Forgot Password?
            </button>
          )}
        </div>

        
        
      </div>
    </div>
  );
};

export default Auth;
