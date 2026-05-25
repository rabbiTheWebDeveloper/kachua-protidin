'use client';

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';

interface LazyImageProps extends Omit<ImageProps, 'onLoad'> {
  // Extra props can be defined here if necessary
}

export function LazyImage({ src, alt, className = '', ...props }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative w-full h-full bg-gray-100 overflow-hidden">
      {/* Premium Shimmer Loading State */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse z-10" />
      )}
      <Image
        src={src}
        alt={alt}
        className={`${className} transition-all duration-700 ease-out-expo ${
          isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        onLoad={() => setIsLoaded(true)}
        loading="lazy"
        {...props}
      />
    </div>
  );
}
