import { useState, useEffect, memo } from 'react';
import apiClient from '../../utlis/apiClient';

interface LinkMetadata {
  title: string;
  description: string;
  image: string;
  siteName: string;
}

interface LinkPreviewProps {
  url: string;
  title: string;
}

const LinkPreviewComponent = ({ url, title }: LinkPreviewProps) => {
  const [metadata, setMetadata] = useState<LinkMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.post('/api/v1/link-preview/fetch-metadata', { url });
        
        if (response.data.success && response.data.metadata) {
          setMetadata(response.data.metadata);
        }
      } catch {
        console.log('Link preview unavailable for:', url);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetadata();
  }, [url]);

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full h-48 rounded-t-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 animate-pulse" />
    );
  }

  // If we have an image, show it
  if (metadata?.image) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full group"
      >
        <div className="relative w-full h-48 rounded-t-xl overflow-hidden bg-gray-100 dark:bg-gray-900">
          <img 
            src={metadata.image} 
            alt={metadata.title || title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 will-change-transform"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          {/* Subtle gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </a>
    );
  }

  // Fallback: No preview available, return null (Card will handle display)
  return null;
};

export const LinkPreview = memo(LinkPreviewComponent);
