
import React from 'react';
import { Check } from 'lucide-react';
import { User } from '../../types';

interface AvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
  className?: string;
}

export const VerifiedBadge: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <div 
    title="Verified Official User"
    className="inline-flex items-center justify-center bg-blue-500 text-white rounded-full border-2 border-white shadow-sm ml-1"
    style={{ width: size, height: size, minWidth: size, minHeight: size }}
  >
    <Check size={size * 0.6} strokeWidth={4} />
  </div>
);

export const Avatar: React.FC<AvatarProps> = ({ 
  user, 
  size = 'md', 
  showStatus = true,
  className = '' 
}) => {
  const neonColor = user.neonColor || '#3b82f6'; // Fallback blue

  // Size mapping
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const statusSize = {
    sm: 12,
    md: 14,
    lg: 20,
    xl: 24
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* The Avatar Container with Neon Glow */}
      <div 
        className={`rounded-full flex items-center justify-center overflow-hidden bg-gray-900 border-2 transition-all duration-500 ${sizeClasses[size]}`}
        style={{
          borderColor: neonColor,
          boxShadow: `0 0 8px ${neonColor}, inset 0 0 4px ${neonColor}`
        }}
      >
        <img 
          src={user.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`} 
          alt={user.fullName} 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Verified Badge (Overlay) */}
      {showStatus && user.isVerified && (
        <div className="absolute bottom-0 right-0 transform translate-x-10% translate-y-10%">
          <VerifiedBadge size={statusSize[size]} />
        </div>
      )}
    </div>
  );
};
