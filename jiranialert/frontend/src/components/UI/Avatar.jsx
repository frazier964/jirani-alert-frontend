// src/components/UI/Avatar.jsx
import React from 'react';

export default function Avatar({ src = '/images/default-avatar.png', alt = 'User avatar', size = 32 }) {
  return (
    <img
      src={src}
      alt={alt}
      className={`rounded-full object-cover w-${size} h-${size}`}
      style={{ width: size, height: size }}
    />
  );
}
