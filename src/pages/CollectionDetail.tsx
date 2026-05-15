import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useCollections } from "../hooks/useCollections";
import { collectionsService } from "../services/collectionsService";
import { Spinner } from "../components/ui/Spinner";
import { Card } from "../components/ui/Card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/Dialog";
import { Button } from "../components/ui/button";
import type { Collection, Content } from "../types";
import {
  FolderIcon, BookOpenIcon, LightBulbIcon, FlagIcon, StarIcon,
  FireIcon, BriefcaseIcon, PaintBrushIcon, RocketLaunchIcon, MapPinIcon,
  TrophyIcon, ComputerDesktopIcon, BookmarkIcon, MusicalNoteIcon, FilmIcon,
  HomeIcon, LockClosedIcon, InboxIcon,
} from "@heroicons/react/24/outline";

const CollectionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateCollection, deleteCollection } = useCollections();
  
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Edit form state
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editColor, setEditColor] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [editIsPrivate, setEditIsPrivate] = useState(false);

  const ICON_OPTIONS = [
    { name: "Folder",   component: FolderIcon },
    { name: "Book",     component: BookOpenIcon },
    { name: "LightBulb",component: LightBulbIcon },
    { name: "Flag",     component: FlagIcon },
    { name: "Star",     component: StarIcon },
    { name: "Fire",     component: FireIcon },
    { name: "Briefcase",component: BriefcaseIcon },
    { name: "Paint",    component: PaintBrushIcon },
    { name: "Rocket",   component: RocketLaunchIcon },
    { name: "Pin",      component: MapPinIcon },
    { name: "Trophy",   component: TrophyIcon },
    { name: "Computer", component: ComputerDesktopIcon },
    { name: "Bookmark", component: BookmarkIcon },
    { name: "Music",    component: MusicalNoteIcon },
    { name: "Film",     component: FilmIcon },
    { name: "Home",     component: HomeIcon },
  ];
  const colorOptions = [
    { name: "Purple", value: "#9333ea" },
    { name: "Blue", value: "#3b82f6" },
    { name: "Green", value: "#10b981" },
    { name: "Red", value: "#ef4444" },
    { name: "Orange", value: "#f59e0b" },
    { name: "Pink", value: "#ec4899" },
    { name: "Indigo", value: "#6366f1" },
    { name: "Teal", value: "#14b8a6" },
  ];

  useEffect(() => {
    const fetchCollection = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await collectionsService.getCollection(id);
        setCollection(data);
        setEditName(data.name);
        setEditDescription(data.description || "");
        setEditColor(data.color);
        setEditIcon(data.icon);
        setEditIsPrivate(data.isPrivate || false);
      } catch (error) {
        console.error("Failed to fetch collection:", error);
        toast.error("Failed to load collection");
      } finally {
        setLoading(false);
      }
    };

    fetchCollection();
  }, [id]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (collection) {
      setEditName(collection.name);
      setEditDescription(collection.description || "");
      setEditColor(collection.color);
      setEditIcon(collection.icon);
      setEditIsPrivate(collection.isPrivate || false);
    }
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!collection || !editName.trim()) {
      toast.error("Collection name is required");
      return;
    }

    try {
      await updateCollection(collection.id, {
        name: editName,
        description: editDescription,
        color: editColor,
        icon: editIcon,
        isPrivate: editIsPrivate,
      });
      toast.success("Collection updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update collection:", error);
      toast.error("Failed to update collection");
    }
  };

  const handleDelete = async () => {
    if (!collection) return;

    setIsDeleting(true);
    try {
      await deleteCollection(collection.id);
      toast.success("Collection deleted successfully");
      navigate("/collections");
    } catch (error) {
      console.error("Failed to delete collection:", error);
      toast.error("Failed to delete collection");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleContentRemoved = (contentId: string) => {
    if (!collection) return;
    
    // Update local state to remove the content
    setCollection({
      ...collection,
      content: collection.content?.filter(c => c._id !== contentId),
      contentCount: (collection.contentCount || 0) - 1,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Collection not found</h1>
        <Button onClick={() => navigate("/collections")} variant="primary" text="Back to Collections" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6"
        >
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:mb-4">
            <div className="flex items-center gap-3 sm:gap-4 flex-1 w-full">
              {isEditing ? (
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-4 w-full">
                  {ICON_OPTIONS.map(({ name, component: Icon }) => (
                    <button
                      key={name}
                      onClick={() => setEditIcon(name)}
                      className={`flex items-center justify-center p-1.5 sm:p-2 rounded-lg transition-all ${
                        editIcon === name
                          ? "bg-purple-100 dark:bg-purple-900/30 scale-110"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                      title={name}
                    >
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  ))}
                </div>
              ) : (
                <div
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0"
                  style={{ backgroundColor: collection.color }}
                >
                  {(() => {
                    const found = ICON_OPTIONS.find(o => o.name === collection.icon);
                    const Icon = found?.component ?? FolderIcon;
                    return <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />;
                  })()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <div className="space-y-2 sm:space-y-3">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value.slice(0, 100))}
                      className="w-full px-3 py-2 text-sm sm:text-base bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent text-gray-900 dark:text-white"
                      placeholder="Collection name"
                    />
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value.slice(0, 500))}
                      className="w-full px-3 py-2 text-sm sm:text-base bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent text-gray-900 dark:text-white resize-none"
                      placeholder="Description (optional)"
                      rows={2}
                    />
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => setEditColor(color.value)}
                          className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full transition-transform ${
                            editColor === color.value
                              ? "scale-110 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-800"
                              : "hover:scale-105"
                          }`}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        />
                      ))}
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editIsPrivate}
                        onChange={(e) => setEditIsPrivate(e.target.checked)}
                        className="w-4 h-4 text-purple-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-purple-500 dark:focus:ring-purple-400"
                      />
                      <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Private</span>
                    </label>
                  </div>
                ) : (
                  <>
                    <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2 truncate">
                      {collection.name}
                    </h1>
                    {collection.description && (
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 line-clamp-2">{collection.description}</p>
                    )}
                    <div className="flex items-center gap-3 sm:gap-4 mt-2 sm:mt-3">
                      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        {collection.contentCount || 0} {collection.contentCount === 1 ? "item" : "items"}
                      </span>
                      {collection.isPrivate && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-[10px] sm:text-xs rounded-full">
                          <LockClosedIcon className="w-3 h-3" />
                          <span className="hidden sm:inline">Private</span>
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              {isEditing ? (
                <>
                  <Button onClick={handleCancelEdit} variant="ghost" text="Cancel" className="flex-1 sm:flex-none text-sm" />
                  <Button onClick={handleSaveEdit} variant="primary" text="Save" className="flex-1 sm:flex-none text-sm" />
                </>
              ) : (
                <>
                  <Button onClick={handleEdit} variant="primary" text="Edit" className="flex-1 sm:flex-none text-sm" />
                  <Button
                    onClick={() => setShowDeleteDialog(true)}
                    variant="danger"
                    text="Delete"
                    className="flex-1 sm:flex-none text-sm"
                  />
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Content Grid */}
        {collection.content && collection.content.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            <AnimatePresence mode="popLayout">
              {collection.content.map((content: Content, index: number) => (
                <motion.div
                  key={content._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    content={content}
                    refresh={() => {}}
                    collectionId={collection.id}
                    onContentRemoved={() => handleContentRemoved(content._id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-8 sm:p-12 text-center"
          >
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4 flex justify-center">
              <InboxIcon className="w-16 h-16 sm:w-24 sm:h-24 text-gray-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No content yet
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
              Start adding content to this collection
            </p>
            <Button onClick={() => navigate("/dashboard")} variant="primary" text="Go to Dashboard" className="text-sm sm:text-base" />
          </motion.div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Collection</DialogTitle>
          </DialogHeader>
          <div className="py-3 sm:py-4">
            <p className="text-sm sm:text-base text-gray-900 dark:text-white mb-2">
              Are you sure you want to delete this collection?
            </p>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              This will only delete the collection, not the content inside it.
            </p>
            <p className="font-semibold mt-2 sm:mt-3 text-sm sm:text-base text-gray-900 dark:text-white truncate">
              "{collection.name}"
            </p>
          </div>
          <DialogFooter className="flex justify-end gap-2 sm:gap-3 mt-3 sm:mt-4">
            <Button
              onClick={() => setShowDeleteDialog(false)}
              variant="ghost"
              text="Cancel"
              disabled={isDeleting}
              className="text-sm"
            />
            <Button
              onClick={handleDelete}
              variant="danger"
              loading={isDeleting}
              loadingText="Deleting..."
              text="Delete"
              className="text-sm"
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CollectionDetail;
