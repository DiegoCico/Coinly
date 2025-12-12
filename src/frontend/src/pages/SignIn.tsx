import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, LogIn, Sun, Moon, Palette } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const ACCENT_COLORS = [
  { name: "Orange", value: "#FF9900", light: "#FFA726" },
  { name: "Purple", value: "#9333EA", light: "#A855F7" },
  { name: "Blue", value: "#0EA5E9", light: "#38BDF8" },
  { name: "Green", value: "#10B981", light: "#34D399" },
  { name: "Pink", value: "#EC4899", light: "#F472B6" },
  { name: "Teal", value: "#14B8A6", light: "#2DD4BF" },
];

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Theme and color controls
  const [darkMode, setDarkMode] = useState(true);
  const [accentColor, setAccentColor] = useState('#FF9900');
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  const toggleTheme = () => setDarkMode(prev => !prev);

  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signIn(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 flex items-center justify-center p-4 ${
      darkMode 
        ? 'bg-gradient-to-br from-[#0f1b2a] to-[#1a2332]' 
        : 'bg-gradient-to-br from-gray-50 to-gray-100'
    }`}>
      {/* Theme and Color Controls */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-lg transition-colors ${
            darkMode 
              ? 'bg-[#232f3e] text-gray-300 hover:text-white hover:bg-[#364150]' 
              : 'bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 shadow-md'
          }`}
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="relative">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className={`p-2 rounded-lg transition-colors ${
              darkMode 
                ? 'bg-[#232f3e] text-gray-300 hover:text-white hover:bg-[#364150]' 
                : 'bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 shadow-md'
            }`}
            title="Change accent color"
          >
            <Palette size={18} />
          </button>

          {showColorPicker && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowColorPicker(false)}
              />
              <div className={`absolute right-0 top-12 p-4 rounded-lg shadow-2xl border z-50 min-w-[200px] ${
                darkMode ? "bg-[#1b2635] border-gray-700" : "bg-white border-gray-200"
              }`}>
                <p className={`text-xs font-semibold mb-3 uppercase tracking-wider ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}>
                  Accent Color
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {ACCENT_COLORS.map((color) => (
                    <div key={color.value} className="flex flex-col items-center gap-1">
                      <button
                        onClick={() => {
                          setAccentColor(color.value);
                          setShowColorPicker(false);
                        }}
                        className={`w-12 h-12 rounded-lg transition-all hover:scale-110 shadow-md ${
                          accentColor === color.value ? "ring-2 ring-offset-2 scale-105" : ""
                        } ${darkMode ? "ring-offset-gray-800" : "ring-offset-white"}`}
                        style={{ 
                          backgroundColor: color.value,
                          ...(accentColor === color.value ? { '--tw-ring-color': color.value } as any : {})
                        }}
                        title={color.name}
                      />
                      <span className={`text-[10px] font-medium ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}>
                        {color.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="w-full max-w-md mx-auto">
        {/* Logo/Brand */}
        <div className="text-center mb-6 sm:mb-8">
          <div 
            className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl mb-4 shadow-lg"
            style={{ backgroundColor: accentColor }}
          >
            <LogIn size={28} className={darkMode ? "text-[#232f3e]" : "text-white"} />
          </div>
          <h1 className={`text-2xl sm:text-3xl font-bold mb-2 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Welcome Back
          </h1>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            Sign in to your Financial Planner account
          </p>
        </div>

        {/* Sign In Form */}
        <div className={`rounded-lg shadow-2xl p-6 sm:p-8 border transition-colors duration-300 ${
          darkMode 
            ? 'bg-[#232f3e] border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {/* Error Message */}
            {error && (
              <div className={`p-4 rounded-lg text-sm border ${
                darkMode 
                  ? 'bg-red-900/20 border-red-700 text-red-300' 
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                {error}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Email Address
              </label>
              <div className="relative">
                <Mail size={20} className={`absolute left-3 top-3 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`w-full pl-10 pr-4 py-3 rounded-lg transition-colors ${
                    darkMode 
                      ? 'bg-[#1a2332] border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                  } border focus:ring-1 transition-colors`}
                  style={{ 
                    '--tw-ring-color': accentColor,
                    borderColor: darkMode ? '#4b5563' : '#d1d5db'
                  } as any}
                  onFocus={(e) => e.target.style.borderColor = accentColor}
                  onBlur={(e) => e.target.style.borderColor = darkMode ? '#4b5563' : '#d1d5db'}
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Password
              </label>
              <div className="relative">
                <Lock size={20} className={`absolute left-3 top-3 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`w-full pl-10 pr-12 py-3 rounded-lg transition-colors ${
                    darkMode 
                      ? 'bg-[#1a2332] border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                  } border focus:ring-1 transition-colors`}
                  style={{ 
                    '--tw-ring-color': accentColor,
                    borderColor: darkMode ? '#4b5563' : '#d1d5db'
                  } as any}
                  onFocus={(e) => e.target.style.borderColor = accentColor}
                  onBlur={(e) => e.target.style.borderColor = darkMode ? '#4b5563' : '#d1d5db'}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-3 transition-colors ${
                    darkMode 
                      ? 'text-gray-400 hover:text-white' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm hover:opacity-80 transition-colors"
                style={{ color: accentColor }}
              >
                Forgot your password?
              </Link>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
              style={{ 
                backgroundColor: accentColor,
                color: darkMode ? '#232f3e' : 'white'
              }}
            >
              {isLoading ? (
                <>
                  <div 
                    className="w-5 h-5 border-2 rounded-full animate-spin"
                    style={{ 
                      borderColor: `${darkMode ? '#232f3e' : 'white'}30`,
                      borderTopColor: darkMode ? '#232f3e' : 'white'
                    }}
                  />
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="hover:opacity-80 transition-colors font-medium"
                style={{ color: accentColor }}
              >
                Sign up here
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Account Info */}
        <div className={`mt-6 p-4 rounded-lg border transition-colors duration-300 ${
          darkMode 
            ? 'bg-[#232f3e]/50 border-gray-700' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          <h3 className={`text-sm font-medium mb-2 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Demo Account
          </h3>
          <p className={`text-xs mb-3 ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Try the app with a demo account (no registration required)
          </p>
          <button
            onClick={() => {
              setEmail('demo@example.com');
              setPassword('DemoPassword123');
            }}
            className="block w-full text-left text-xs hover:opacity-80 transition-colors font-medium p-2 rounded border"
            style={{ 
              color: accentColor,
              borderColor: darkMode ? '#374151' : '#e5e7eb'
            }}
          >
            <div className="font-semibold">Demo User</div>
            <div className={`text-[10px] ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              demo@example.com
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}