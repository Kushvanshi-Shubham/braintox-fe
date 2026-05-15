import axios from "axios";
import { BACKEND_URL } from "../../config";
import { DeleteIcon, ShareIcon, EditIcon, StarIcon, ArchiveIcon } from "../../Icons/IconsImport";
import { useState, memo, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Button } from "./button";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "./Dialog";
import { EmbedPreview } from "./EmbedPreview";
import { AddToCollection } from "./AddToCollection";
import { useCollections } from "../../hooks/useCollections";
import { getPlatformMeta, type ContentType } from "../../utlis/contentTypeDetection";
import { PlatformIcon } from "../../utlis/PlatformIcon";
import { StarIcon as HeroStarIcon, ArchiveBoxIcon, ChatBubbleLeftEllipsisIcon } from "@heroicons/react/24/outline";
import type { Content } from "../../types";
import { triggerContentUpdate } from "../../utlis/events";
import { Spinner } from "./Spinner";
import { cn } from "../../utlis/cn";

// Lazy load EditContentModal for better performance
const EditContentModal = lazy(() => 
  import("./EditContentModal").then(module => ({ 
    default: module.EditContentModal 
  }))
);

interface CardProps {
  content: Content;
  refresh: () => void;
  collectionId?: string;
  onContentRemoved?: () => void;
}

const CardComponent = ({ content, refresh, collectionId, onContentRemoved }: CardProps) => {
  const navigate = useNavigate();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCollectionDialog, setShowCollectionDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFavorite, setIsFavorite] = useState(content.isFavorite || false);
  const [isArchived, setIsArchived] = useState(content.isArchived || false);
  const [isExpanded, setIsExpanded] = useState(false);

  const { _id: contentId, title, link, type, notes, userId } = content;
  const platformMeta = getPlatformMeta(type as ContentType);

  const handleDelete = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication error. Please log in again.");
      return;
    }

    setIsDeleting(true);
    try {
      await axios.delete(`${BACKEND_URL}/api/v1/content/${contentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success("Content deleted successfully!");
      triggerContentUpdate();
      refresh();
      setShowConfirmModal(false);
    } catch (err) {
      console.error("Failed to delete content:", err);
      toast.error("Failed to delete content. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleFavorite = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${BACKEND_URL}/api/v1/content/${contentId}/favorite`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newFavorite = !isFavorite;
      setIsFavorite(newFavorite);
      toast.success(newFavorite ? "Added to favorites" : "Removed from favorites");
      triggerContentUpdate();
      refresh();
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      toast.error("Failed to update favorite status");
    }
  };

  const toggleArchive = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${BACKEND_URL}/api/v1/content/${contentId}/archive`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newArchived = !isArchived;
      setIsArchived(newArchived);
      toast.success(newArchived ? "Archived" : "Unarchived");
      triggerContentUpdate();
      refresh();
    } catch (error) {
      console.error("Failed to toggle archive:", error);
      toast.error("Failed to update archive status");
    }
  };

  const { removeFromCollection } = useCollections();
  
  const handleRemoveFromCollection = async () => {
    if (!collectionId) return;
    
    try {
      await removeFromCollection(collectionId, contentId);
      if (onContentRemoved) {
        onContentRemoved();
      }
    } catch (error) {
      console.error("Failed to remove from collection:", error);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4, scale: 1.005 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "group relative overflow-hidden will-change-transform",
        "bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl",
        "rounded-2xl sm:rounded-3xl",
        "border border-white/50 dark:border-gray-700/50",
        "shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)]",
        "hover:shadow-[0_20px_40px_rgba(168,85,247,0.15)] dark:hover:shadow-[0_20px_40px_rgba(168,85,247,0.2)]",
        "hover:border-purple-300/50 dark:hover:border-purple-500/50",
        "transition-all duration-500 hover:-translate-y-2"
      )}
    >
      {/* Gradient glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Embed preview - Full width at top */}
      <div className="w-full max-h-[300px] sm:max-h-[600px] overflow-hidden">
        <EmbedPreview url={link} type={type as ContentType} title={title} />
      </div>

      {/* Content section */}
      <div className="relative p-3 sm:p-5">
        {/* Header with platform badge and title */}
        <div className="mb-3 sm:mb-4">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
            <span style={{ color: platformMeta.color }}>
              <PlatformIcon type={type as ContentType} className="w-5 h-5 sm:w-6 sm:h-6" />
            </span>
            <span 
              className="text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-3 py-1 sm:py-1.5 rounded-full backdrop-blur-sm"
              style={{ 
                backgroundColor: platformMeta.color + '15',
                color: platformMeta.color,
                border: `1px solid ${platformMeta.color}30`
              }}
            >
              {type}
            </span>
            {isFavorite && (
              <HeroStarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 animate-pulse fill-yellow-400" />
            )}
            {isArchived && (
              <ArchiveBoxIcon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
            )}
          </div>

          {/* Username - clickable */}
          {userId && (
            <button
              onClick={() => navigate(`/user/${userId._id}`)}
              className={cn(
                "text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 transition-all duration-200",
                "text-gray-500 dark:text-gray-400",
                "hover:text-purple-600 dark:hover:text-purple-400",
                "hover:underline underline-offset-2"
              )}
            >
              @{userId.username}
            </button>
          )}

          <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white leading-snug mb-1.5 sm:mb-2 line-clamp-2">
            {title}
          </h3>
          
          <a 
            href={link} 
            target="_blank" 
            rel="noopener noreferrer"
            className={cn(
              "text-xs sm:text-sm line-clamp-1 transition-all duration-200",
              "text-gray-400 dark:text-gray-500",
              "hover:text-purple-600 dark:hover:text-purple-400",
              "hover:underline underline-offset-2"
            )}
          >
            {link}
          </a>
        </div>
        
        {/* Notes section */}
        {notes && (
          <div className={cn(
            "mb-3 sm:mb-4 p-3 sm:p-4 rounded-lg sm:rounded-xl",
            "bg-gradient-to-br from-purple-50 to-pink-50",
            "dark:from-purple-900/20 dark:to-pink-900/20",
            "border border-purple-200/50 dark:border-purple-800/30"
          )}>
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              <span className="font-semibold text-purple-600 dark:text-purple-400 inline-flex items-center gap-1"><ChatBubbleLeftEllipsisIcon className="w-3.5 h-3.5" /> Note:</span> {notes}
            </p>
          </div>
        )}

        {/* Tags */}
        {content.tags && content.tags.length > 0 && (
          <div className="mb-3 sm:mb-4 flex flex-wrap gap-1.5 sm:gap-2">
            {content.tags.slice(0, isExpanded ? content.tags.length : 5).map((tag, index) => {
              const tagName = typeof tag === 'string' ? tag : tag.name;
              return (
                <button
                  key={`${tagName}-${index}`}
                  onClick={() => navigate(`/explore?tag=${encodeURIComponent(tagName)}`)}
                  className={cn(
                    "px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-semibold rounded-full",
                    "bg-gradient-to-r from-purple-100 to-pink-100",
                    "dark:from-purple-900/30 dark:to-pink-900/30",
                    "text-purple-700 dark:text-purple-300",
                    "border border-purple-200/50 dark:border-purple-700/50",
                    "hover:from-purple-200 hover:to-pink-200",
                    "dark:hover:from-purple-900/50 dark:hover:to-pink-900/50",
                    "transition-all duration-200 cursor-pointer"
                  )}
                  title={`Search for content tagged with ${tagName}`}
                >
                  #{tagName}
                </button>
              );
            })}
            {content.tags.length > 5 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-full",
                  "text-purple-600 dark:text-purple-400",
                  "hover:bg-purple-100 dark:hover:bg-purple-900/30",
                  "transition-colors"
                )}
              >
                {isExpanded ? '− Show less' : `+ ${content.tags.length - 5} more`}
              </button>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="flex gap-1.5">
            {collectionId && (
              <button
                onClick={handleRemoveFromCollection}
                className={cn(
                  "p-2.5 rounded-xl transition-all duration-200 active-scale",
                  "text-gray-400 dark:text-gray-500",
                  "hover:bg-red-100 dark:hover:bg-red-900/30",
                  "hover:text-red-600 dark:hover:text-red-400"
                )}
                title="Remove from collection"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <button
              onClick={toggleFavorite}
              className={cn(
                "p-2.5 rounded-xl transition-all duration-200 active-scale",
                isFavorite 
                  ? "bg-yellow-100/80 dark:bg-yellow-900/40 text-yellow-500 shadow-sm shadow-yellow-200/50" 
                  : "text-gray-400 dark:text-gray-500 hover:bg-gray-100/50 dark:hover:bg-gray-700/50"
              )}
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <StarIcon className="w-5 h-5" filled={isFavorite} />
            </button>
            <button
              onClick={() => setShowCollectionDialog(true)}
              className={cn(
                "p-2.5 rounded-xl transition-all duration-200",
                "text-gray-400 dark:text-gray-500",
                "hover:bg-purple-100 dark:hover:bg-purple-900/30",
                "hover:text-purple-600 dark:hover:text-purple-400"
              )}
              title="Add to collection"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
              </svg>
            </button>
            <button
              onClick={() => setShowEditModal(true)}
              className={cn(
                "p-2.5 rounded-xl transition-all duration-200",
                "text-gray-400 dark:text-gray-500",
                "hover:bg-blue-100 dark:hover:bg-blue-900/30",
                "hover:text-blue-600 dark:hover:text-blue-400"
              )}
              title="Edit content"
            >
              <EditIcon className="w-5 h-5" />
            </button>
            <button
              onClick={toggleArchive}
              className={cn(
                "p-2.5 rounded-xl transition-all duration-200 active-scale",
                "text-gray-400 dark:text-gray-500",
                "hover:bg-purple-100/80 dark:hover:bg-purple-900/40",
                "hover:text-purple-600 dark:hover:text-purple-400"
              )}
              title={isArchived ? "Unarchive" : "Archive"}
            >
              <ArchiveIcon className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex gap-1.5">
            <a 
              href={link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={cn(
                "p-2.5 rounded-xl transition-all duration-200",
                "text-gray-400 dark:text-gray-500",
                "hover:bg-purple-100 dark:hover:bg-purple-900/30",
                "hover:text-purple-600 dark:hover:text-purple-400"
              )}
              title="Open Link"
            >
              <ShareIcon className="w-5 h-5" />
            </a>
            <button 
              onClick={() => setShowConfirmModal(true)} 
              className={cn(
                "p-2.5 rounded-xl transition-all duration-200",
                "text-gray-400 dark:text-gray-500",
                "hover:bg-red-100 dark:hover:bg-red-900/30",
                "hover:text-red-600 dark:hover:text-red-400"
              )}
              title="Delete" 
              disabled={isDeleting}
            >
              <DeleteIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className={cn(
          "sm:max-w-[425px] p-6 rounded-2xl",
          "bg-white dark:bg-gray-800",
          "text-gray-900 dark:text-white",
          "shadow-2xl shadow-gray-900/20 dark:shadow-black/40",
          "border border-gray-200/50 dark:border-gray-700/50"
        )}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold mb-2">Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600 dark:text-gray-300">Are you sure you want to delete this content? This action cannot be undone.</p>
            <p className="font-semibold mt-3 text-gray-900 dark:text-white break-words">"{title}"</p>
          </div>
          <DialogFooter className="flex justify-end gap-3 mt-4">
            <Button onClick={() => setShowConfirmModal(false)} variant="ghost" text="Cancel" disabled={isDeleting} />
            <Button onClick={handleDelete} variant="danger" loading={isDeleting} loadingText="Deleting..." text="Delete" />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showEditModal && (
        <Suspense fallback={<div className="fixed inset-0 bg-black/20 dark:bg-black/40 flex items-center justify-center z-50"><Spinner /></div>}>
          <EditContentModal
            open={showEditModal}
            onClose={() => setShowEditModal(false)}
            content={content}
            refreshContent={refresh}
          />
        </Suspense>
      )}

      <Dialog open={showCollectionDialog} onOpenChange={setShowCollectionDialog}>
        <AddToCollection 
          contentId={content._id} 
          onClose={() => setShowCollectionDialog(false)} 
        />
      </Dialog>
    </motion.div>
  );
};

// Memoize to prevent unnecessary re-renders (keeps embeds playing during data refresh)
export const Card = memo(CardComponent, (prevProps, nextProps) => {
  // Only re-render if content actually changed
  return (
    prevProps.content._id === nextProps.content._id &&
    prevProps.content.isFavorite === nextProps.content.isFavorite &&
    prevProps.content.isArchived === nextProps.content.isArchived &&
    prevProps.content.title === nextProps.content.title &&
    prevProps.content.notes === nextProps.content.notes
  );
});

Card.displayName = 'Card';
