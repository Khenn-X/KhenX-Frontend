import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ImageWithFallbackProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  objectFit?: 'cover' | 'contain';
}

/**
 * Always use this instead of a raw <img> tag.
 * Shows a placeholder if the image fails to load or src is missing.
 */
const ImageWithFallback = ({
  src,
  alt,
  className,
  fallbackClassName,
  objectFit = 'cover',
}: ImageWithFallbackProps) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-slate-100',
          fallbackClassName || className
        )}
      >
        <ImageOff className="h-8 w-8 text-slate-300" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className={cn(
        objectFit === 'cover' ? 'object-cover' : 'object-contain',
        className
      )}
    />
  );
};

export default ImageWithFallback;
