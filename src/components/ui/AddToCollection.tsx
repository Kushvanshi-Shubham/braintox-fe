import { useState } from "react";
import { FolderIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useCollections } from "../../hooks/useCollections";
import type { Collection } from "../../types";

interface AddToCollectionProps {
  contentId: string;
  onClose?: () => void;
}

export function AddToCollection({ contentId, onClose }: Readonly<AddToCollectionProps>) {
  const { collections, loading, addToCollection, createCollection } = useCollections();
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [selectedColor, setSelectedColor] = useState("#8B5CF6");
  const [adding, setAdding] = useState<string | null>(null);

  const handleAddToCollection = async (collectionId: string) => {
    setAdding(collectionId);
    try {
      await addToCollection(collectionId, contentId);
      onClose?.();
    } catch (error) {
      console.error("Failed to add to collection:", error);
    } finally {
      setAdding(null);
    }
  };

  const handleCreateAndAdd = async () => {
    if (!newCollectionName.trim()) return;

    setAdding("new");
    try {
      const newCollection = await createCollection({
        name: newCollectionName.trim(),
        color: selectedColor,
      });
      await addToCollection(newCollection.id, contentId);
      setNewCollectionName("");
      setShowCreateNew(false);
      onClose?.();
    } catch (error) {
      console.error("Failed to create and add:", error);
    } finally {
      setAdding(null);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin h-6 w-6 border-2 border-purple-600 border-t-transparent rounded-full mx-auto" />
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Loading collections...</p>
      </div>
    );
  }

  return (
    <div className="py-2">
      {/* Header */}
      <div className="px-4 pb-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white">Add to Collection</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Choose where to save this</p>
      </div>

      {/* Collections List */}
      <div className="max-h-64 overflow-y-auto">
        {collections.length === 0 ? (
          <div className="p-4 text-center">
            <FolderIcon className="w-10 h-10 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No collections yet</p>
          </div>
        ) : (
          <div className="py-2">
            {collections.map((collection: Collection) => (
              <motion.button
                key={collection.id}
                whileHover={{ backgroundColor: "rgba(139, 92, 246, 0.05)" }}
                onClick={() => handleAddToCollection(collection.id)}
                disabled={adding === collection.id}
                className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                  style={{ backgroundColor: `${collection.color}20` }}
                >
                  {collection.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {collection.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {collection.contentCount} {collection.contentCount === 1 ? "item" : "items"}
                  </p>
                </div>
                {adding === collection.id && (
                  <div className="animate-spin h-4 w-4 border-2 border-purple-600 border-t-transparent rounded-full" />
                )}
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Create New Collection */}
      <div className="border-t border-gray-200 dark:border-gray-700">
        {!showCreateNew ? (
          <button
            onClick={() => setShowCreateNew(true)}
            className="w-full px-4 py-3 flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create New Collection
          </button>
        ) : (
          <div className="p-4 space-y-3 bg-gray-50 dark:bg-gray-800/50">
            <input
              type="text"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder="Collection name..."
              maxLength={100}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && newCollectionName.trim()) {
                  void handleCreateAndAdd();
                } else if (e.key === "Escape") {
                  setShowCreateNew(false);
                  setNewCollectionName("");
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none text-sm"
            />
            <div className="flex gap-2">
              {["#8B5CF6", "#3B82F6", "#10B981", "#F59E0B", "#EC4899"].map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full transition-transform ${
                    selectedColor === color ? "scale-110 ring-2 ring-offset-2 ring-offset-gray-50 dark:ring-offset-gray-800" : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowCreateNew(false);
                  setNewCollectionName("");
                }}
                disabled={adding === "new"}
                className="flex-1 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAndAdd}
                disabled={!newCollectionName.trim() || adding === "new"}
                className="flex-1 px-3 py-2 text-sm text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {adding === "new" ? (
                  <>
                    <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" />
                    Creating...
                  </>
                ) : (
                  "Create & Add"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
