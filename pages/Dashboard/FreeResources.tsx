import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getResourceSettings } from '../../services/mockBackend';
import { Button } from '../../components/ui/Button';
import { Download, Lock, BadgeCheck, FileText, LayoutTemplate, Film, Monitor, BookOpen, Key, Globe, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FreeResources: React.FC = () => {
  const { user } = useAuth();
  const [downloadLink, setDownloadLink] = useState('');

  useEffect(() => {
    const settings = getResourceSettings();
    setDownloadLink(settings.downloadLink);
  }, []);

  if (!user) return null;

  if (!user.isVerified) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center max-w-2xl mx-auto p-6">
        <div className="bg-gray-100 p-6 rounded-full mb-6 relative">
          <Lock className="w-12 h-12 text-gray-400" />
          <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-1.5 rounded-full border-2 border-white">
             <BadgeCheck size={16} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Resources Locked</h2>
        <p className="text-gray-500 max-w-md mb-8">
          This premium section containing over <strong>$5,000 worth of digital assets</strong> is exclusive to <strong>Verified Users</strong>. 
          Please activate your account to access these free resources.
        </p>
        <Link 
          to="/activation" 
          className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-transform hover:scale-105"
        >
          Verify My Account
        </Link>
      </div>
    );
  }

  const features = [
    { icon: FileText, title: "Graphics & Design", desc: "650+ GB of fonts, vectors, PSDs, and logos." },
    { icon: LayoutTemplate, title: "Premium Templates", desc: "Website, App UI, and PowerPoint presentation kits." },
    { icon: Film, title: "Video Editing Pack", desc: "LUTs, transitions, sound effects, and stock footage." },
    { icon: Monitor, title: "Productivity Tools", desc: "Premium software versions and office tools." },
    { icon: BookOpen, title: "eBooks & Guides", desc: "Learning materials for marketing, coding, and business." },
    { icon: Key, title: "Premium Methods", desc: "Netflix, Spotify, Adobe CC, Canva Pro, ChatGPT Premium & more." },
    { icon: Globe, title: "Web Assets", desc: "2500+ Landing Pages, Laravel E-commerce scripts." },
    { icon: Shield, title: "VPN & Security", desc: "Windows Keys, VPN methods, and security tools." },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-12">
        {/* Hero Section */}
        <div className="text-center space-y-6 pt-8">
            <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Free Digital Resources
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Unlock a massive library of premium tools, templates, and guides to accelerate your digital journey. 
                Exclusively for our verified community.
            </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                        <f.icon size={24} />
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg mb-2">{f.title}</h3>
                    <p className="text-sm text-gray-500">{f.desc}</p>
                </div>
            ))}
        </div>

        {/* Resource Highlights */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
            <div className="relative z-10 max-w-3xl">
                <h2 className="text-3xl font-bold mb-6">What's Inside the Pack?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-indigo-100">
                    <ul className="space-y-3 list-disc pl-5">
                        <li>Netflix, Gemini & YouTube Premium Methods</li>
                        <li>Adobe Creative Cloud & Canva Pro Methods</li>
                        <li>ChatGPT Premium & All Subscription Methods</li>
                        <li>Windows Key & VPN Methods</li>
                    </ul>
                    <ul className="space-y-3 list-disc pl-5">
                        <li>10 Million Ready Digital Products</li>
                        <li>2500+ High-Converting Landing Pages</li>
                        <li>Full Laravel E-commerce Website Scripts</li>
                        <li>650 GB+ Graphics Resource Files</li>
                    </ul>
                </div>
            </div>
            {/* Decorative blob */}
            <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
        </div>

        {/* Download Action */}
        <div className="flex flex-col items-center justify-center space-y-6 bg-indigo-50 rounded-2xl p-10 border border-indigo-100">
            <div className="text-center">
                <h3 className="text-2xl font-bold text-indigo-900">Ready to Download?</h3>
                <p className="text-indigo-700 mt-2">Access the full Google Drive repository instantly.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                <a 
                    href={downloadLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                >
                    <Download size={24} />
                    Download Now
                </a>
                <Button 
                    variant="secondary" 
                    className="py-4 px-6 rounded-xl border-indigo-200 text-indigo-700 hover:bg-white"
                    onClick={() => { navigator.clipboard.writeText(downloadLink); alert("Link copied to clipboard!"); }}
                >
                    Copy Link
                </Button>
            </div>
            <p className="text-xs text-indigo-400">
                Secure SSL Encrypted Link • Hosted on Google Drive
            </p>
        </div>
    </div>
  );
};