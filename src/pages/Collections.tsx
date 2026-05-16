import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCollections } from "../hooks/useCollections";
import { collectionsService } from "../services/collectionsService";
import { useNavigate } from "react-router-dom";
import { Spinner } from "../components/ui/Spinner";
import { EmptyState } from "../components/EmptyState";
import {
  FolderIcon,
  BookOpenIcon,
  LightBulbIcon,
  FireIcon,
  StarIcon,
  BriefcaseIcon,
  PaintBrushIcon,
  RocketLaunchIcon,
  MapPinIcon,
  TrophyIcon,
  ComputerDesktopIcon,
  BookmarkIcon,
  MusicalNoteIcon,
  FilmIcon,
  HomeIcon,
  PlusIcon
} from "@heroicons/react/24/outline";
import { cn } from "../utlis/cn";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Collection } from "../types";

const ICON_OPTIONS = [
  { name: "Folder", component: FolderIcon },
  { name: "Book", component: BookOpenIcon },
  { name: "LightBulb", component: LightBulbIcon },
  { name: "Fire", component: FireIcon },
  { name: "Star", component: StarIcon },
  { name: "Briefcase", component: BriefcaseIcon },
  { name: "Paint", component: PaintBrushIcon },
  { name: "Rocket", component: RocketLaunchIcon },
  { name: "Pin", component: MapPinIcon },
  { name: "Trophy", component: TrophyIcon },
  { name: "Computer", component: ComputerDesktopIcon },
  { name: "Bookmark", component: BookmarkIcon },
  { name: "Music", component: MusicalNoteIcon },
  { name: "Film", component: FilmIcon },
  { name: "Home", component: HomeIcon }
];
const COLOR_OPTIONS = [
  { name: "Purple", value: "#8B5CF6" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Green", value: "#10B981" },
  { name: "Red", value: "#EF4444" },
  { name: "Orange", value: "#F59E0B" },
  { name: "Pink", value: "#EC4899" },
  { name: "Indigo", value: "#6366F1" },
  { name: "Teal", value: "#14B8A6" },
];

// Sortable Collection Card Component
interface SortableCollectionCardProps {
  collection: Collection;
  onClick: () => void;
}

function SortableCollectionCard({ collection, onClick }: Readonly<SortableCollectionCardProps>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: collection.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <motion.div
        whileHover={{ y: -4, scale: 1.01 }}
        className="cursor-pointer group relative"
      >
        <div
          className="rounded-2xl sm:rounded-3xl p-5 sm:p-7 glass-panel hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all duration-300 relative overflow-hidden group-hover:-translate-y-1"
          style={{
            borderLeft: `4px solid ${collection.color}`,
          }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle, ${collection.color} 1px, transparent 1px)`,
                backgroundSize: "20px 20px",
              }}
            />
          </div>

          {/* Content */}
          <div className="relative">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Drag Handle */}
                <button
                  {...listeners}
                  className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors hidden sm:block"
                  title="Drag to reorder"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
                <div 
                  onClick={onClick}
                  className={cn(
                    "w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center",
                    "bg-gradient-to-br from-white/60 to-white/20 shadow-sm border border-white/40",
                    "dark:from-gray-800/60 dark:to-gray-800/20 dark:border-gray-700/50"
                  )}
                  style={{ color: collection.color }}
                >
                  {(() => {
                    const IconOption = ICON_OPTIONS.find(opt => opt.name === collection.icon);
                    const IconComponent = IconOption?.component || FolderIcon;
                    return <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />;
                  })()}
                </div>
              </div>
              {collection.isPrivate && (
                <div className="bg-gray-800 dark:bg-gray-700 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex items-center gap-0.5 sm:gap-1">
                  <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="hidden sm:inline">Private</span>
                </div>
              )}
            </div>

            <div onClick={onClick}>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">
                {collection.name}
              </h3>

              {collection.description && (
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4 line-clamp-2">
                  {collection.description}
                </p>
              )}

              <div className="flex items-center justify-between">
                <div
                  className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider"
                  style={{ color: collection.color }}
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                  </svg>
                  {collection.contentCount} {collection.contentCount === 1 ? "item" : "items"}
                </div>

                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-white/50 dark:group-hover:bg-gray-800/50 transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-gray-600 dark:text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function Collections() {
  const navigate = useNavigate();
  const { collections: fetchedCollections, loading, createCollection } = useCollections();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  // Local state for collections with optimistic updates
  const [collections, setCollections] = useState(fetchedCollections);

  // Sync with fetched collections
  useEffect(() => {
    setCollections(fetchedCollections);
  }, [fetchedCollections]);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0].value);
  const [selectedIcon, setSelectedIcon] = useState(ICON_OPTIONS[0].name);
  const [isPrivate, setIsPrivate] = useState(false);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = collections.findIndex((c) => c.id === active.id);
    const newIndex = collections.findIndex((c) => c.id === over.id);

    // Optimistically update UI
    const newCollections = arrayMove(collections, oldIndex, newIndex);
    setCollections(newCollections);

    // Send reorder request to backend
    try {
      const collectionIds = newCollections.map((c) => c.id);
      await collectionsService.reorderCollections(collectionIds);
    } catch (error) {
      console.error("Failed to reorder collections:", error);
      // Revert on error
      setCollections(fetchedCollections);
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) return;

    setCreating(true);
    try {
      await createCollection({
        name: name.trim(),
        description: description.trim(),
        color: selectedColor,
        icon: selectedIcon,
        isPrivate,
      });
      // Reset form
      setName("");
      setDescription("");
      setSelectedColor(COLOR_OPTIONS[0].value);
      setSelectedIcon(ICON_OPTIONS[0].name);
      setIsPrivate(false);
      setShowCreateModal(false);
    } catch (error) {
      console.error("Failed to create collection:", error);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text">
              My Collections
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
              Organize your saved content into custom collections
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className={cn(
              "px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl font-semibold shadow-lg shadow-purple-500/20 text-sm sm:text-base",
              "bg-gradient-to-r from-purple-600 to-pink-600",
              "hover:from-purple-700 hover:to-pink-700",
              "text-white transition-all flex items-center gap-2"
            )}
          >
            <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">New Collection</span>
            <span className="sm:hidden">New</span>
          </motion.button>
        </div>

        {/* Collections Grid */}
        {collections.length === 0 ? (
          <EmptyState
            icon={<FolderIcon className="w-full h-full" />}
            title="No Collections Yet"
            description="Create your first collection to organize your content"
            action={
              <button
                onClick={() => setShowCreateModal(true)}
                className={cn(
                  "px-6 py-3.5 rounded-2xl font-semibold shadow-lg shadow-purple-500/20 text-base",
                  "bg-gradient-to-r from-purple-600 to-pink-600",
                  "hover:from-purple-700 hover:to-pink-700",
                  "text-white transition-all flex items-center gap-2"
                )}
              >
                <PlusIcon className="w-5 h-5" />
                Create Collection
              </button>
            }
          />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={collections.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {collections.map((collection) => (
                  <SortableCollectionCard
                    key={collection.id}
                    collection={collection}
                    onClick={() => navigate(`/collections/${collection.id}`)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Create Collection Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-3 sm:px-4"
            onClick={() => !creating && setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20 dark:border-gray-700/50"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 px-5 sm:px-8 py-4 sm:py-5 flex items-center justify-between z-10">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Create New Collection
                </h2>
                <button
                  onClick={() => !creating && setShowCreateModal(false)}
                  disabled={creating}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {/* Form */}
              <div className="p-6 space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Collection Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Web Development Resources"
                    maxLength={100}
                    className="w-full px-4 sm:px-5 py-3 sm:py-4 border border-gray-200/80 dark:border-gray-700/80 rounded-2xl bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all shadow-inner"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {name.length}/100 characters
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What's this collection about?"
                    rows={3}
                    maxLength={500}
                    className="w-full px-4 sm:px-5 py-3 sm:py-4 border border-gray-200/80 dark:border-gray-700/80 rounded-2xl bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none transition-all shadow-inner"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {description.length}/500 characters
                  </p>
                </div>

                {/* Icon Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Choose an Icon
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {ICON_OPTIONS.map((iconOption) => {
                      const IconComponent = iconOption.component;
                      return (
                        <motion.button
                          key={iconOption.name}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setSelectedIcon(iconOption.name)}
                          className={cn(
                            "p-3 rounded-lg transition-all",
                            selectedIcon === iconOption.name
                              ? 'bg-purple-100 dark:bg-purple-900 ring-2 ring-purple-500'
                              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                          )}
                        >
                          <IconComponent className="w-6 h-6 mx-auto text-gray-700 dark:text-gray-300" />
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Color Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Choose a Color
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                    {COLOR_OPTIONS.map((color) => (
                      <motion.button
                        key={color.value}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedColor(color.value)}
                        className={`relative w-full aspect-square rounded-lg transition-all ${
                          selectedColor === color.value
                            ? 'ring-4 ring-offset-2 ring-offset-white dark:ring-offset-gray-800'
                            : 'hover:scale-105'
                        }`}
                        style={{
                          backgroundColor: color.value,
                        }}
                      >
                        {selectedColor === color.value && (
                          <svg className="w-6 h-6 text-white absolute inset-0 m-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Privacy Toggle */}
                <div className="flex items-center justify-between p-4 sm:p-5 bg-gray-50/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Private Collection</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Only you can see this collection</p>
                  </div>
                  <button
                    onClick={() => setIsPrivate(!isPrivate)}
                    className={`relative w-14 h-8 rounded-full transition-colors ${
                      isPrivate ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <motion.div
                      animate={{ x: isPrivate ? 24 : 2 }}
                      className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
                    />
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-700/50 px-6 sm:px-8 py-4 sm:py-5 flex justify-end gap-3 z-10">
                <button
                  onClick={() => setShowCreateModal(false)}
                  disabled={creating}
                  className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-2xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: creating ? 1 : 1.02 }}
                  whileTap={{ scale: creating ? 1 : 0.98 }}
                  onClick={handleCreate}
                  disabled={!name.trim() || creating}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {creating ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Create Collection
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
