import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function SignUp() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    givenName: '',
    familyName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.givenName || !formData.familyName) {
      return 'All fields are required';
    }

    if (formData.password.length < 8) {
      return 'Password must be at least 8 characters long';
    }

    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      await signUp(formData.email, formData.password, formData.givenName, formData.familyName);
      setSuccess(true);
      // Redirect to confirmation page after 2 seconds
      setTimeout(() => {
        navigate('/confirm-signup', { 
          state: { email: formData.email } 
        });
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Sign up failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f1b2a] to-[#1a2332] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-[#232f3e] rounded-lg shadow-2xl p-8 border border-gray-700 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
              <UserPlus size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Account Created!</h2>
            <p className="text-gray-300 mb-4">
              We've sent a verification code to <strong>{formData.email}</strong>
            </p>
            <p className="text-sm text-gray-400">
              Redirecting to verification page...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1b2a] to-[#1a2332] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FF9900] rounded-xl mb-4">
            <UserPlus size={32} className="text-[#232f3e]" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-gray-400">Join Financial Planner and start saving smarter</p>
        </div>

        {/* Sign Up Form */}
        <div className="bg-[#232f3e] rounded-lg shadow-2xl p-8 border border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-lg bg-red-900/20 border border-red-700 text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  First Name
                </label>
                <div className="relative">
                  <User size={20} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    value={formData.givenName}
                    onChange={(e) => handleChange('givenName', e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-[#1a2332] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] transition-colors"
                    placeholder="First name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <User size={20} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    value={formData.familyName}
                    onChange={(e) => handleChange('familyName', e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-[#1a2332] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] transition-colors"
                    placeholder="Last name"
                  />
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail size={20} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#1a2332] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] transition-colors"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  required
                  className="w-full pl-10 pr-12 py-3 bg-[#1a2332] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] transition-colors"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Must be 8+ characters with uppercase, lowercase, and number
              </p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  required
                  className="w-full pl-10 pr-12 py-3 bg-[#1a2332] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] transition-colors"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="text-xs text-gray-400">
              By creating an account, you agree to our{' '}
              <Link to="/terms" className="text-[#FF9900] hover:text-[#FF9900]/80">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-[#FF9900] hover:text-[#FF9900]/80">
                Privacy Policy
              </Link>
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#FF9900] text-[#232f3e] py-3 px-4 rounded-lg font-semibold hover:bg-[#FF9900]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-[#232f3e]/30 border-t-[#232f3e] rounded-full animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  Create Account
                </>
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link
                to="/signin"
                className="text-[#FF9900] hover:text-[#FF9900]/80 transition-colors font-medium"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}