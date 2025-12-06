import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { Footer } from '../../components/Footer';

export const UserAgreement: React.FC = () => {
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
          <h1 className="text-3xl font-extrabold text-gray-900 mb-6">User Agreement</h1>
          
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-6 mb-8">
            <p className="text-indigo-900 font-medium">
              This User Agreement ("Agreement") constitutes a binding legal agreement between you ("User") and TaskRipple ("Platform"). By creating an account, you acknowledge that you have read, understood, and agree to be bound by this Agreement.
            </p>
          </div>

          <div className="prose prose-indigo max-w-none text-gray-600 space-y-6">
            <h3 className="text-xl font-bold text-gray-800">1. Independent Contractor Status</h3>
            <p>
              Users performing tasks on TaskRipple are independent contractors and not employees, partners, or agents of TaskRipple. You are solely responsible for reporting and paying any applicable taxes on income earned through the Platform.
            </p>

            <h3 className="text-xl font-bold text-gray-800">2. User Obligations</h3>
            <p>You agree to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Perform tasks honestly and to the best of your ability.</li>
              <li>Respect the confidentiality of any sensitive information encountered during tasks.</li>
              <li>Not solicit other users to join competing platforms via TaskRipple's communication channels.</li>
            </ul>

            <h3 className="text-xl font-bold text-gray-800">3. Termination</h3>
            <p>
              TaskRipple reserves the right to terminate or suspend your account at any time, with or without cause, specifically if we suspect fraudulent activity, harassment, or violation of the Terms & Conditions. Upon termination, any pending balance derived from fraudulent means will be forfeited.
            </p>

            <h3 className="text-xl font-bold text-gray-800">4. Dispute Resolution</h3>
            <p>
              Any disputes arising between you and TaskRipple shall first be addressed through informal negotiation via our support channels. If a resolution cannot be reached, you agree to binding arbitration in accordance with the laws of the jurisdiction in which TaskRipple operates.
            </p>

            <h3 className="text-xl font-bold text-gray-800">5. Indemnification</h3>
            <p>
              You agree to indemnify and hold TaskRipple harmless from any claims, damages, or expenses arising out of your use of the Platform or your violation of this Agreement.
            </p>
            
            <div className="mt-8 p-4 bg-gray-100 rounded text-sm text-gray-500">
              By clicking "Register" or "Sign Up" on our platform, you electronically sign this Agreement and agree to its terms.
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};