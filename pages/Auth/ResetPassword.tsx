

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { resetUserPassword, verifyPasswordResetToken } from '../../services/mockBackend';
import { Button } from '../../components/ui/Button';
import { Lock, AlertTriangle, Loader2 } from 'lucide-react';

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [validity, setValidity] = useState<'verifying' | 'valid' | 'invalid'>('verifying');
  const [validityError, setValidityError] = useState('');

  useEffect(() => {
    if (!token) {
        setValidity('invalid');
        setValidityError('No reset token provided.');
        return;
    }

    const checkToken = async () => {
        try {
            await verifyPasswordResetToken(token);
            setValidity('valid');
        } catch (err: any) {
            setValidity('invalid');
            setValidityError(err.message || 'Invalid or expired token.');
        }
    };
    checkToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
    }
    
    if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
    }

    if (!token) {
        setError("Token is missing.");
        return;
    }

    try {
        await resetUserPassword(token, password);
        alert('Password updated successfully! Please log in.');
        navigate('/login');
    } catch (err: any) {
        setError(err.message);
    }
  };

  const renderContent = () => {
      switch(validity) {
          case 'verifying':
              return <div className="text-center p-8 flex flex-col items-center gap-2 text-gray-500"><Loader2 className="animate-spin" /> Verifying link...</div>;
          case 'invalid':
              return (
                  <div className="text-center p-8 bg-red-50 rounded-xl">
                      <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                          <AlertTriangle size={24} />
                      </div>
                      <h3 className="font-bold text-red-800 mb-2">Invalid Link</h3>
                      <p className="text-sm text-red-700 mb-4">{validityError}</p>
                      <Link to="/forgot-password" className="text-indigo-600 font-bold underline text-sm">
                          Request a new link
                      </Link>
                  </div>
              );
          case 'valid':
              return (
                <>
                  <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                       <Lock size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Set New Password</h2>
                    <p className="text-gray-500 mt-2">Enter and confirm your new password.</p>
                  </div>
                  
                  {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full py-3">Update Password</Button>
                  </form>
                </>
              );
      }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        {renderContent()}
      </div>
    </div>
  );
};
