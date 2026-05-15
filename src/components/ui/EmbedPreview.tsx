import { useEffect, useRef, memo, useState, type ReactNode } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { getEmbedUrl, type ContentType } from "../../utlis/contentTypeDetection";
import { PlatformIcon } from "../../utlis/PlatformIcon";
import { LinkPreview } from "./LinkPreview";

interface EmbedPreviewProps {
  url: string;
  type: ContentType;
  title: string;
}

// Loading skeleton component
const LoadingSkeleton = ({ icon }: { icon: ReactNode }) => (
  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 animate-pulse">
    <div className="text-center">
      <div className="flex justify-center mb-3 opacity-60">{icon}</div>
      <div className="text-sm text-gray-500 dark:text-gray-400">Loading preview...</div>
    </div>
  </div>
);

// Error fallback component
const ErrorFallback = ({ url }: { url: string }) => (
  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
    <div className="text-center p-4">
      <ExclamationTriangleIcon className="w-12 h-12 text-red-400 mx-auto mb-3" />
      <div className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-2">Failed to load preview</div>
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
      >
        Open link directly →
      </a>
    </div>
  </div>
);

const EmbedPreviewComponent = ({ url, type, title }: EmbedPreviewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const embedUrl = getEmbedUrl(url, type);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Reset states when URL changes
    setIsLoading(true);
    setHasError(false);

    // Load Twitter widget
    const win = globalThis as typeof globalThis & { twttr?: { widgets: { load: (el?: HTMLElement) => void } } };
    if (type === 'twitter' && win.twttr) {
      win.twttr.widgets.load(containerRef.current || undefined);
      // Twitter doesn't provide load callback, use timeout
      setTimeout(() => setIsLoading(false), 2000);
    }
    
    // Load Instagram embed script
    const winInsta = globalThis as typeof globalThis & { instgrm?: { Embeds: { process: () => void } } };
    if (type === 'instagram' && winInsta.instgrm) {
      winInsta.instgrm.Embeds.process();
      // Instagram doesn't provide load callback, use timeout
      setTimeout(() => setIsLoading(false), 2000);
    }

    // Set loading timeout for other embed types
    const loadTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(loadTimeout);
  }, [type, url]);

  // YouTube & Shorts
  if (type === 'youtube' && embedUrl) {
    return (
      <div className="relative w-full aspect-video rounded-t-xl overflow-hidden bg-black shadow-inner">
        {isLoading && <LoadingSkeleton icon={<PlatformIcon type={type} className="w-10 h-10" />} />}
        {hasError && <ErrorFallback url={url} />}
        <iframe
          src={embedUrl}
          title={title}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          loading="lazy"
        />
      </div>
    );
  }

  // Twitter/X
  if (type === 'twitter') {
    return (
      <div ref={containerRef} className="relative w-full">
        {isLoading && <LoadingSkeleton icon={<PlatformIcon type={type} className="w-10 h-10" />} />}
        <blockquote className="twitter-tweet" data-theme="dark">
          <a href={url}>Loading tweet...</a>
        </blockquote>
      </div>
    );
  }

  // Instagram
  if (type === 'instagram' && embedUrl) {
    return (
      <div className="relative w-full max-h-[600px] flex justify-center bg-gradient-to-b from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-850 rounded-t-xl overflow-hidden py-4">
        {isLoading && <LoadingSkeleton icon={<PlatformIcon type={type} className="w-10 h-10" />} />}
        <blockquote 
          className="instagram-media" 
          data-instgrm-permalink={url}
          data-instgrm-version="14"
          style={{ maxWidth: '540px', width: '100%', margin: 0, maxHeight: '600px', overflow: 'hidden' }}
        >
          <a href={url} target="_blank" rel="noopener noreferrer">
            View on Instagram
          </a>
        </blockquote>
      </div>
    );
  }

  // TikTok
  if (type === 'tiktok' && embedUrl) {
    return (
      <div className="relative w-full max-w-md mx-auto aspect-[9/16] rounded-t-xl overflow-hidden bg-black shadow-inner">
        {isLoading && <LoadingSkeleton icon={<PlatformIcon type={type} className="w-10 h-10" />} />}
        <iframe
          src={embedUrl}
          title={title}
          className="w-full h-full"
          allow="encrypted-media"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
          loading="lazy"
        />
      </div>
    );
  }

  // Spotify
  if (type === 'spotify' && embedUrl) {
    return (
      <div className="relative w-full rounded-t-xl overflow-hidden bg-gradient-to-b from-green-50 to-gray-50 dark:from-gray-800 dark:to-gray-850">
        {isLoading && <LoadingSkeleton icon={<PlatformIcon type={type} className="w-10 h-10" />} />}
        <iframe
          src={embedUrl}
          title={title}
          className="w-full h-80"
          allow="encrypted-media"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
          loading="lazy"
        />
      </div>
    );
  }

  // Vimeo
  if (type === 'vimeo' && embedUrl) {
    return (
      <div className="relative w-full aspect-video rounded-t-xl overflow-hidden bg-black shadow-inner">
        {isLoading && <LoadingSkeleton icon={<PlatformIcon type={type} className="w-10 h-10" />} />}
        <iframe
          src={embedUrl}
          title={title}
          className="w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
          loading="lazy"
        />
      </div>
    );
  }

  // CodePen
  if (type === 'codepen' && embedUrl) {
    return (
      <div className="relative w-full aspect-video rounded-t-xl overflow-hidden bg-gray-900 shadow-inner">
        {isLoading && <LoadingSkeleton icon={<PlatformIcon type={type} className="w-10 h-10" />} />}
        <iframe
          src={embedUrl}
          title={title}
          className="w-full h-full"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
          loading="lazy"
        />
      </div>
    );
  }

  // Twitch
  if (type === 'twitch' && embedUrl) {
    return (
      <div className="relative w-full aspect-video rounded-t-xl overflow-hidden bg-purple-900/10 dark:bg-purple-900/20 shadow-inner">
        {isLoading && <LoadingSkeleton icon={<PlatformIcon type={type} className="w-10 h-10" />} />}
        <iframe
          src={embedUrl}
          title={title}
          className="w-full h-full"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
          loading="lazy"
        />
      </div>
    );
  }

  // SoundCloud (requires oEmbed API - simplified version)
  if (type === 'soundcloud') {
    return (
      <div className="relative w-full rounded-t-xl overflow-hidden bg-gradient-to-b from-orange-50 to-gray-50 dark:from-gray-800 dark:to-gray-850 p-4">
        {isLoading && <LoadingSkeleton icon={<PlatformIcon type={type} className="w-10 h-10" />} />}
        <iframe
          width="100%"
          height="166"
          title={title}
          allow="autoplay"
          src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`}
          className="rounded-lg"
          onLoad={() => setIsLoading(false)}
          loading="lazy"
        />
      </div>
    );
  }

  // LinkedIn, Reddit, Medium, GitHub, Facebook, Pinterest - Show link preview
  return <LinkPreview url={url} title={title} />;
};

// Memoize to prevent iframe reloads (keeps videos playing, music playing during refresh)
export const EmbedPreview = memo(EmbedPreviewComponent, (prevProps, nextProps) => {
  // Only re-render if URL or type changed
  return prevProps.url === nextProps.url && prevProps.type === nextProps.type;
});

EmbedPreview.displayName = 'EmbedPreview';

// Extend global window for Instagram embed
declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: (element?: HTMLElement) => void;
      };
    };
    instgrm?: {
      Embeds: {
        process: () => void;
      };
    };
  }
}

