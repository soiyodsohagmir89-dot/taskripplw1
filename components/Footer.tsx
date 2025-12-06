import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Linkedin } from 'lucide-react';
import { getSocialSettings } from '../services/mockBackend';
import { SocialSettings } from '../types';

export const Footer: React.FC = () => {
  const [socials, setSocials] = useState<SocialSettings | null>(null);

  useEffect(() => {
    setSocials(getSocialSettings());
  }, []);

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto w-full">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* Links Section */}
          <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-sm text-gray-600 font-medium">
             <Link to="/about-us" className="hover:text-indigo-600 transition-colors">About Us</Link>
             <Link to="/privacy-policy" className="hover:text-indigo-600 transition-colors">Privacy Policy</Link>
             <Link to="/terms" className="hover:text-indigo-600 transition-colors">Terms & Conditions</Link>
             <Link to="/agreement" className="hover:text-indigo-600 transition-colors">Agreement</Link>
             <Link to="/tasks" className="hover:text-indigo-600 transition-colors">Task Job</Link>
          </div>

          {/* Social Media Section - Dynamic */}
          {socials && (
            <div className="flex items-center gap-3">
              {socials.facebook && (
                <a href={socials.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-50 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 rounded-full transition-all">
                  <Facebook size={18} />
                </a>
              )}
              {socials.instagram && (
                <a href={socials.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-50 text-gray-500 hover:bg-pink-50 hover:text-pink-600 rounded-full transition-all">
                  <Instagram size={18} />
                </a>
              )}
              {socials.twitter && (
                <a href={socials.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-50 text-gray-500 hover:bg-blue-50 hover:text-blue-400 rounded-full transition-all">
                  <Twitter size={18} />
                </a>
              )}
              {socials.youtube && (
                <a href={socials.youtube} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-full transition-all">
                  <Youtube size={18} />
                </a>
              )}
              {socials.linkedin && (
                <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-50 text-gray-500 hover:bg-blue-50 hover:text-blue-700 rounded-full transition-all">
                  <Linkedin size={18} />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Copyright Section */}
        <div className="mt-8 pt-8 border-t border-gray-100 flex justify-center items-center text-sm text-gray-500">
          <p>&copy; 2025 TaskRipple. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};