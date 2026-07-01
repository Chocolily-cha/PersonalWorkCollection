import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Work } from '@/data/types';
import { useVideoFirstFrame } from '@/hooks/useVideoFirstFrame';
import { useMediaOrder } from '@/hooks/useMediaOrder';
import { getMediaUrl } from '@/config/paths';

interface WorkCardProps {
  work: Work;
  onClick: () => void;
  index: number;
  editMode?: boolean;
  detailEditMode?: boolean;
}

export default function WorkCard({ work, onClick, index, editMode = false }: WorkCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [shouldPrefetch, setShouldPrefetch] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const allFilenames = work.mediaFiles.map((m) => m.filename);
  const { sortMedia, hydrated } = useMediaOrder(work.id, allFilenames);
  const sortedFilenames = hydrated ? sortMedia(allFilenames) : allFilenames;
  const firstFilename = sortedFilenames[0];
  const firstMedia = work.mediaFiles.find((m) => m.filename === firstFilename) || work.mediaFiles[0];
  const isVideo = firstMedia?.isVideo && firstMedia.extension !== 'gif';

  const videoUrl = isVideo ? getMediaUrl(firstMedia.filePath) : undefined;
  const webpFallbackUrl = firstMedia?.webpThumbnail ? getMediaUrl(firstMedia.webpThumbnail) : undefined;
  const fallbackUrl = webpFallbackUrl || (firstMedia?.thumbnail ? getMediaUrl(firstMedia.thumbnail) : undefined);

  useEffect(() => {
    if (!isVideo || !cardRef.current) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            setShouldPrefetch(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: '800px 0px', threshold: 0.01 },
    );
    io.observe(cardRef.current);
    return () => io.disconnect();
  }, [isVideo]);

  const { thumb, loading } = useVideoFirstFrame(
    shouldPrefetch ? videoUrl : undefined,
    fallbackUrl,
  );

  const displayThumb = thumb;

  const handleImageLoad = () => setIsImageLoaded(true);
  const handleImageError = () => {
    setImageError(true);
    setIsImageLoaded(true);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={editMode ? undefined : { scale: 1.02 }}
      onClick={onClick}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      className={`group ${editMode ? '' : 'cursor-pointer'}`}
      style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
    >
      <div className="glass-card rounded-xl overflow-hidden h-full flex flex-col transition-all duration-500 hover:glass-card-hover hover:neon-border">
        <div className="relative aspect-[4/3] overflow-hidden bg-black/30">
          {isVideo ? (
            <>
              {displayThumb ? (
                <div className="relative w-full h-full">
                  {!isImageLoaded && (
                    <div className="absolute inset-0 bg-gradient-to-br from-cyber-purple/20 via-cyber-blue/10 to-cyber-cyan/20 animate-pulse" />
                  )}
                  <picture>
                    {firstMedia?.webpThumbnail && (
                      <source srcSet={webpFallbackUrl} type="image/webp" />
                    )}
                    <img
                      src={displayThumb}
                      alt={work.title}
                      className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                      loading="lazy"
                      decoding="async"
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                    />
                  </picture>
                </div>
              ) : loading || inView ? (
                <div className="w-full h-full bg-gradient-to-br from-cyber-purple/30 via-cyber-blue/20 to-cyber-cyan/30 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="text-xs text-white/60">提取首帧…</span>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-cyber-purple/20 via-cyber-blue/10 to-cyber-cyan/20" />
              )}

              <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-red-500/80 backdrop-blur text-xs text-white flex items-center gap-1 z-10">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span>视频</span>
              </div>

              <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none">
                <div className="w-14 h-14 rounded-full bg-white/0 group-hover:bg-white/20 backdrop-blur-0 group-hover:backdrop-blur flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100">
                  <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </>
          ) : (
            <div className="relative w-full h-full">
              {!isImageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-cyber-purple/20 via-cyber-blue/10 to-cyber-cyan/20 animate-pulse" />
              )}
              <img
                src={fallbackUrl || getMediaUrl(firstMedia.filePath)}
                alt={work.title}
                className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                loading="lazy"
                decoding="async"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            </div>
          )}

          <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/50 backdrop-blur text-xs text-white z-10">
            {work.category}
          </div>

          {work.mediaFiles.length > 1 && (
            <div className="absolute bottom-3 left-3 px-2 py-1 rounded-full bg-black/50 backdrop-blur text-xs text-white z-10">
              {work.mediaFiles.length} {isVideo ? '段' : '张'}
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col flex-1">
          <h3 className="text-lg font-semibold text-white mb-2 truncate group-hover:text-cyber-cyan transition-colors">
            {work.title}
          </h3>
          <p className="text-gray-400 text-sm flex-1 line-clamp-2">
            {work.description}
          </p>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {work.tools.slice(0, 2).map((tool) => (
                <span key={tool} className="px-2 py-1 rounded-full bg-white/10 text-xs text-gray-300">
                  {tool}
                </span>
              ))}
              {work.tools.length > 2 && (
                <span className="px-2 py-1 rounded-full bg-white/10 text-xs text-gray-300">
                  +{work.tools.length - 2}
                </span>
              )}
            </div>
            {work.createdAt && (
              <span className="text-xs text-gray-500">{work.createdAt}</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
