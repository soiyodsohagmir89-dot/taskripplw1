
import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { Footer } from '../../components/Footer';

export const AboutUs: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Public Header */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
             <ShieldCheck className="w-8 h-8" />
             TaskRipple
          </Link>
          <div className="flex gap-4">
            <Link to="/" className="text-gray-600 hover:text-indigo-600 font-medium text-sm flex items-center gap-1">
              <ArrowLeft size={16} /> Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-6">About Us</h1>
          
          <div className="prose prose-indigo max-w-none text-gray-600 space-y-6">
            <p className="text-lg leading-relaxed">
              Welcome to <strong>TaskRipple</strong>, the next-generation platform designed to bridge the gap between businesses needing micro-tasks completed and individuals looking to earn extra income on their own schedule.
            </p>

            <h3 className="text-2xl font-bold text-gray-800 mt-8">Our Mission</h3>
            <p>
              Our mission is simple: <strong>Master Your Time. Maximize Your Earnings.</strong> We believe that everyone should have the opportunity to monetize their spare time, whether it's 5 minutes on a commute or a few hours on the weekend. For businesses, we provide a reliable, verified workforce ready to amplify social proof, test products, and perform data entry at scale.
            </p>

            <h3 className="text-2xl font-bold text-gray-800 mt-8">How It Works</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>For Earners:</strong> Sign up, browse a variety of simple tasks (like social media engagement, surveys, or app testing), complete them, and get paid instantly to your wallet. Unlock higher earning potential with our 5-level referral system.</li>
              <li><strong>For Creators:</strong> Post Campaigns to get thousands of real users to interact with your content, providing authentic growth and feedback.</li>
            </ul>

            <h3 className="text-2xl font-bold text-gray-800 mt-8">Why Choose TaskRipple?</h3>
            <p>
              Unlike other platforms, we prioritize <strong>transparency</strong> and <strong>community growth</strong>. Our unique tiered referral system rewards you not just for your work, but for building the community. We ensure secure transactions, verifying every proof of work to protect both workers and employers.
            </p>
            
            <p className="mt-8 pt-8 border-t border-gray-100 italic">
              TaskRipple is more than just a gig site; it's a ripple effect of opportunity. Join us today and start making waves.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
