import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Shield, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function ConfirmSignUp() {
  const [confirmationCode, setConfirmationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const { confirmSignUp, resendConfirmationCode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || '';

  useEffect(() => {
    if (!email) {
      navigate('/signup');
    }
  }, [email, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await confirmSignUp(email, confirmationCode);
      setSuccess(true);
      // Redirect to sign in after 2 seconds
      setTimeout(() => {
        navigate('/signin', {
          state: { message: 'Account confirmed! Please sign in.' }
        });
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Confirmation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    setError('');

    try {
      await resendConfirmationCode(email);
      setError(''); // Clear any previous errors
      // Show success message temporarily
      const originalError = error;
      setError('Verification code sent!');
      setTimeout(() => setError(originalError), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setResendLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f1b2a] to-[#1a2332] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-[#232f3e] rounded-lg shadow-2xl p-8 border border-gray-700 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
              <Shield size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Account Confirmed!</h2>
            <p className="text-gray-300 mb-4">
              Your account has been successfully verified.
            </p>
            <p className="text-sm text-gray-400">
              Redirecting to sign in...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1b2a] to-[#1a2332] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Sign Up
          </Link>
        </div>

        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FF9900] rounded-xl mb-4">
            <Mail size={32} className="text-[#232f3e]" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Check Your Email</h1>
          <p className="text-gray-400">
            We've sent a verification code to
          </p>
          <p className="text-[#FF9900] font-medium">{email}</p>
        </div>

        {/* Confirmation Form */}
        <div className="bg-[#232f3e] rounded-lg shadow-2xl p-8 border border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error/Success Message */}
            {error && (
              <div className={`p-4 rounded-lg border text-sm ${
                error === 'Verification code sent!'
                  ? 'bg-green-900/20 border-green-700 text-green-300'
                  : 'bg-red-900/20 border-red-700 text-red-300'
              }`}>
                {error}
              </div>
            )}

            {/* Confirmation Code Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                maxLength={6}
                className="w-full px-4 py-3 bg-[#1a2332] border border-gray-600 rounded-lg text-white text-center text-2xl font-mono tracking-widest placeholder-gray-400 focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] transition-colors"
                placeholder="000000"
              />
              <p className="text-xs text-gray-400 mt-1 text-center">
                Enter the 6-digit code from your email
              </p>
            </div>

            {/* Confirm Button */}
            <button
              type="submit"
              disabled={isLoading || confirmationCode.length !== 6}
              className="w-full bg-[#FF9900] text-[#232f3e] py-3 px-4 rounded-lg font-semibold hover:bg-[#FF9900]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-[#232f3e]/30 border-t-[#232f3e] rounded-full animate-spin" />
                  Confirming...
                </>
              ) : (
                <>
                  <Shield size={20} />
                  Confirm Account
                </>
              )}
            </button>
          </form>

          {/* Resend Code */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm mb-2">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResendCode}
              disabled={resendLoading}
              className="text-[#FF9900] hover:text-[#FF9900]/80 transition-colors font-medium text-sm disabled:opacity-50"
            >
              {resendLoading ? 'Sending...' : 'Resend verification code'}
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-[#1a2332] rounded-lg">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Having trouble?</h3>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Check your spam/junk folder</li>
              <li>• Make sure you entered the correct email</li>
              <li>• The code expires after 24 hours</li>
              <li>• Contact support if you continue having issues</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}