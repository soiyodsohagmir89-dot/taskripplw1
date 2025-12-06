
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { registerUser } from '../../services/mockBackend';
import { Button } from '../../components/ui/Button';
import { CheckCircle } from 'lucide-react';

const COUNTRY_CODES = [
  { code: '+1', flag: '🇺🇸', country: 'USA' },
  { code: '+44', flag: '🇬🇧', country: 'UK' },
  { code: '+91', flag: '🇮🇳', country: 'India' },
  { code: '+880', flag: '🇧🇩', country: 'Bangladesh' },
  { code: '+86', flag: '🇨🇳', country: 'China' },
  { code: '+81', flag: '🇯🇵', country: 'Japan' },
  { code: '+49', flag: '🇩🇪', country: 'Germany' },
  { code: '+33', flag: '🇫🇷', country: 'France' },
  { code: '+971', flag: '🇦🇪', country: 'UAE' },
  { code: '+61', flag: '🇦🇺', country: 'Australia' },
  { code: '+55', flag: '🇧🇷', country: 'Brazil' },
  { code: '+234', flag: '🇳🇬', country: 'Nigeria' },
  { code: '+92', flag: '🇵🇰', country: 'Pakistan' },
  { code: '+62', flag: '🇮🇩', country: 'Indonesia' },
];

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlRefCode = searchParams.get('ref');
  
  const [formData, setFormData] = useState({
    fullName: '', 
    email: '', 
    phone: '', 
    countryCode: '+880', 
    password: '', 
    referralCode: ''
  });
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Priority 1: URL Parameter
    if (urlRefCode) {
        setFormData(prev => ({ ...prev, referralCode: urlRefCode }));
        localStorage.setItem('tr_referral_code', urlRefCode);
    } else {
        // Priority 2: Stored in LocalStorage
        const storedRef = localStorage.getItem('tr_referral_code');
        if (storedRef) {
            setFormData(prev => ({ ...prev, referralCode: storedRef }));
        }
    }
  }, [urlRefCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await registerUser({
        fullName: formData.fullName,
        email: formData.email,
        phone: `${formData.countryCode} ${formData.phone}`,
        passwordHash: formData.password, // In backend this is treated as the code
        referrerId: formData.referralCode // In backend this is treated as the code
      });
      // Clear stored ref after successful registration
      localStorage.removeItem('tr_referral_code');
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // If referral code came from URL or Storage, visually lock it if it was from URL to prevent tampering
  const isReferralLocked = !!urlRefCode;

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center animate-in zoom-in-95">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Success!</h2>
          <p className="text-gray-600 mb-8 text-lg">Your account was successfully created.</p>
          
          <Button 
            onClick={() => navigate('/login')} 
            className="w-full py-3 text-lg font-medium shadow-md hover:shadow-lg transition-all"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="text-gray-500 mt-2">Join TaskRipple today</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="fullName"
            placeholder="Full Name"
            className="w-full px-3 py-2 border rounded-lg"
            onChange={handleChange}
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email Address"
            className="w-full px-3 py-2 border rounded-lg"
            onChange={handleChange}
            required
          />
          
          <div className="flex">
            <select
              name="countryCode"
              className="px-2 py-2 border border-r-0 rounded-l-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
              value={formData.countryCode}
              onChange={handleChange}
            >
              {COUNTRY_CODES.map(c => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code}
                </option>
              ))}
            </select>
            <input
              name="phone"
              type="tel"
              placeholder="Phone Number"
              className="w-full px-3 py-2 border rounded-r-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              onChange={handleChange}
              required
            />
          </div>

          <input
            name="password"
            type="password"
            placeholder="Password"
            className="w-full px-3 py-2 border rounded-lg"
            onChange={handleChange}
            required
          />
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Referral Code {isReferralLocked && <span className="text-indigo-600">- Auto-filled</span>}
            </label>
            <input
              name="referralCode"
              placeholder="Enter valid referral code"
              className={`w-full px-3 py-2 border rounded-lg bg-gray-50 ${isReferralLocked ? 'cursor-not-allowed opacity-75 text-gray-600' : ''}`}
              onChange={handleChange}
              value={formData.referralCode}
              readOnly={isReferralLocked}
              title={isReferralLocked ? "Referral code is locked from link" : ""}
              required
            />
            <p className="text-[10px] text-gray-400 mt-1">A referral code is required to join TaskRipple.</p>
          </div>
          <Button type="submit" className="w-full py-3">Register</Button>
        </form>
        <div className="mt-6 text-center">
          <Link to="/login" className="text-indigo-600 text-sm hover:underline">Already have an account? Log In</Link>
        </div>
      </div>
    </div>
  );
};
