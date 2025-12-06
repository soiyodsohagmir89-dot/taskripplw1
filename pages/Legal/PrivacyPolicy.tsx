
import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { Footer } from '../../components/Footer';

export const PrivacyPolicy: React.FC = () => {
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
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-8">Last Updated: October 24, 2025</p>
          
          <div className="prose prose-indigo max-w-none text-gray-600 space-y-6">
            <p>
              At TaskRipple, we value your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website or use our services.
            </p>

            <h3 className="text-xl font-bold text-gray-800">1. Information We Collect</h3>
            <p>We collect information that you provide directly to us, including:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Account Information:</strong> Name, email address, phone number, and password when you register.</li>
              <li><strong>Payment Information:</strong> Binance IDs or other wallet addresses for processing withdrawals and deposits.</li>
              <li><strong>Activity Data:</strong> Details of tasks you complete and your interactions with other users.</li>
              <li><strong>Proof of Work:</strong> Screenshots or text submitted as evidence for completed tasks.</li>
            </ul>

            <h3 className="text-xl font-bold text-gray-800">2. How We Use Your Information</h3>
            <p>We use your data to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Provide, maintain, and improve our services.</li>
              <li>Process transactions and send related information, including confirmations and invoices.</li>
              <li>Verify your identity and prevent fraud (e.g., verifying task proofs).</li>
              <li>Respond to your comments, questions, and customer service requests.</li>
            </ul>

            <h3 className="text-xl font-bold text-gray-800">3. Cookies and Local Storage</h3>
            <p>
              We use local storage technologies to maintain your session and save your preferences. By using TaskRipple, you consent to the use of these technologies to enhance your experience.
            </p>

            <h3 className="text-xl font-bold text-gray-800">4. Data Sharing</h3>
            <p>
              We do not sell your personal data. We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>With other users solely for the purpose of task verification (e.g., a task creator seeing your proof).</li>
              <li>To comply with legal obligations or strictly enforce our Terms & Conditions.</li>
            </ul>

            <h3 className="text-xl font-bold text-gray-800">5. Security</h3>
            <p>
              We implement reasonable security measures to protect your information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>

            <h3 className="text-xl font-bold text-gray-800">6. Contact Us</h3>
            <p>
              If you have any questions about this Privacy Policy, please contact us at privacy@taskripple.com.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
