import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { Footer } from '../../components/Footer';

export const TermsAndConditions: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
             <ShieldCheck className="w-8 h-8" />
             TaskRipple
          </Link>
          <Link to="/" className="text-gray-600 hover:text-indigo-600 font-medium text-sm flex items-center gap-1">
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </nav>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Terms & Conditions</h1>
          <p className="text-sm text-gray-500 mb-8">Effective Date: October 24, 2025</p>
          
          <div className="prose prose-indigo max-w-none text-gray-600 space-y-6">
            <p>
              Please read these Terms & Conditions ("Terms") carefully before using the TaskRipple website and services. By accessing or using the Service, you agree to be bound by these Terms.
            </p>

            <h3 className="text-xl font-bold text-gray-800">1. Account Eligibility</h3>
            <p>
              You must be at least 18 years old to create an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate.
            </p>

            <h3 className="text-xl font-bold text-gray-800">2. User Conduct</h3>
            <p>You agree NOT to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Submit fake proofs or spam tasks.</li>
              <li>Use automated scripts or bots to complete tasks.</li>
              <li>Create multiple accounts to exploit the referral system or task limits.</li>
              <li>Post content that is illegal, offensive, or infringes on intellectual property rights.</li>
            </ul>
            <p className="text-red-600 text-sm">Violation of these rules will result in immediate account ban and forfeiture of funds.</p>

            <h3 className="text-xl font-bold text-gray-800">3. Payments and Withdrawals</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Activation Fee:</strong> A one-time activation fee may be required to access certain earning features. This fee is non-refundable once the account is active.</li>
              <li><strong>Withdrawals:</strong> The minimum withdrawal amount is $5.00. Withdrawals are processed within 24-48 hours but may take longer depending on network conditions.</li>
              <li><strong>Currency:</strong> All balances are tracked in USD ($).</li>
            </ul>

            <h3 className="text-xl font-bold text-gray-800">4. Task Approvals</h3>
            <p>
              TaskRipple acts as a marketplace. Task creators (or Admins) reserve the right to reject submissions that do not meet the specific requirements outlined in the task description. Repeatedly submitted low-quality work may lead to account suspension.
            </p>

            <h3 className="text-xl font-bold text-gray-800">5. Limitation of Liability</h3>
            <p>
              TaskRipple is provided on an "AS IS" basis. We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform. We do not guarantee that tasks will always be available.
            </p>

            <h3 className="text-xl font-bold text-gray-800">6. Changes to Terms</h3>
            <p>
              We reserve the right to modify these Terms at any time. Continued use of the platform after changes constitutes acceptance of the new Terms.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};