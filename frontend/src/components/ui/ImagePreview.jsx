import { useState, useEffect } from 'react';
import { cn } from '../../utils/helpers';

const ImagePreview = ({ 
  file, 
  src, 
  alt = 'Preview',
  className,
  onRemove,
  showRemove = true,
  size = 'md' // 'sm', 'md', 'lg'
}) => {
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.onerror = () => setError(true);
      reader.readAsDataURL(file);
    } else if (src) {
      setPreview(src);
    }
    return () => setPreview(null);
  }, [file, src]);

  const sizes = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24',
    lg: 'h-32 w-32'
  };

  if (error) {
    return (
      <div className={cn(
        'flex items-center justify-center bg-muted rounded-lg text-muted-foreground text-xs',
        sizes[size],
        className
      )}>
        Failed to load
      </div>
    );
  }

  if (!preview) {
    return (
      <div className={cn(
        'flex items-center justify-center bg-muted rounded-lg animate-pulse',
        sizes[size],
        className
      )} />
    );
  }

  return (
    <div className={cn('relative group', className)}>
      <img
        src={preview}
        alt={alt}
        className={cn(
          'object-cover rounded-lg',
          sizes[size]
        )}
      />
      {showRemove && onRemove && (
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default ImagePreview;
