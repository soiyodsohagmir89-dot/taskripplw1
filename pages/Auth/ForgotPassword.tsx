
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { resetPasswordWithoutToken } from '../../services/mockBackend';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, CheckCircle } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
     if (newPassword.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
    }
    
    try {
      await resetPasswordWithoutToken(email, newPassword);
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <Link to="/login" className="text-gray-500 hover:text-gray-900 flex items-center gap-1 mb-6 text-sm">
            <ArrowLeft size={16} /> Back to Login
        </Link>
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Reset Your Password</h2>
          <p className="text-gray-500 mt-2">Enter your email and set a new password directly.</p>
        </div>

        {isSubmitted ? (
             <div className="bg-green-50 p-6 rounded-xl text-center">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle size={24} />
                </div>
                <h3 className="font-bold text-green-800 mb-2">Password Reset Successfully!</h3>
                <p className="text-sm text-green-700 mb-4">
                    You can now log in with your new password.
                </p>
                <Button onClick={() => navigate('/login')}>Go to Login</Button>
             </div>
        ) : (
            <>
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  
                  <div className="border-t pt-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                  </div>
                  <Button type="submit" className="w-full py-3">Reset Password</Button>
                </form>
            </>
        )}
      </div>
    </div>
  );
};
