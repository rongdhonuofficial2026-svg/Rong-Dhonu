'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ImageIcon } from 'lucide-react';

interface PremiumImageProps extends Omit<ImageProps, 'src' | 'onLoad' | 'onError'> {
  src?: string | null;
  fallbackSrc?: string;
  containerClassName?: string;
}

export function PremiumImage({
  src,
  alt,
  className,
  containerClassName,
  fallbackSrc = '/images/placeholder.jpg',
  fill,
  ...props
}: PremiumImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // If no source is provided at all
  if (!src) {
    return (
      <div className={cn('flex items-center justify-center bg-gray-100 rounded-lg', containerClassName)}>
        <ImageIcon className="text-gray-300 w-1/4 h-1/4" />
      </div>
    );
  }

  const imageSrc = (error || !src) ? fallbackSrc : src;

  // When using the fill prop, the image must be a direct child of a positioned container.
  // We must NOT add our own wrapper div as it breaks the fill layout.
  // Instead we render the Image directly so it fills the parent container.
  if (fill) {
    return (
      <Image
        src={imageSrc}
        alt={alt || 'Image'}
        fill={fill}
        className={cn(
          'transition-all duration-700 ease-in-out',
          isLoading ? 'scale-105 blur-sm opacity-0' : 'scale-100 blur-0 opacity-100',
          className
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setError(true);
        }}
        {...props}
      />
    );
  }

  return (
    <div className={cn('relative overflow-hidden bg-muted/20', containerClassName)}>
      <Image
        src={imageSrc}
        alt={alt || 'Image'}
        className={cn(
          'transition-all duration-700 ease-in-out',
          isLoading ? 'scale-105 blur-sm opacity-0' : 'scale-100 blur-0 opacity-100',
          className
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setError(true);
        }}
        {...props}
      />
    </div>
  );
}
