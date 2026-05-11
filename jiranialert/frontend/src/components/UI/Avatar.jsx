// src/components/UI/Avatar.jsx
import React from 'react';
import { User } from 'lucide-react';

export default function Avatar({ src = '/images/default-avatar.png', alt = 'User avatar', size = 32 }) {
  const [imageError, setImageError] = React.useState(false);

  return (
    <div
      className="flex items-center justify-center rounded-full border-2 border-slate-200 bg-gradient-to-br from-slate-100 to-slate-50 flex-shrink-0 overflow-hidden"
      style={{ width: size, height: size }}
      title={alt}
    >
      {!imageError && src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          style={{ width: size, height: size }}
          onError={() => setImageError(true)}
        />
      ) : (
        <User className="text-slate-400" size={Math.max(size - 12, 16)} />
      )}
    </div>
  );
}
