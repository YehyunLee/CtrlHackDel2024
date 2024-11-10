// Navbar.js
import React from 'react';
import Image from 'next/image';

export default function Navbar() {
  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-16 flex items-center">
          <Image src="/Logo.png" alt="Logo" width={32} height={32} />
          <span className="text-white font-semibold text-xl">MagicQuill</span>
        </div>
      </div>
    </nav>
  )
}