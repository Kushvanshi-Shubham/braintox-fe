import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LockClosedIcon,
  LockOpenIcon,
  FolderPlusIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useCollections } from "../../hooks/useCollections";
import type { Collection } from "../../types";

interface BulkActionBarProps {
  count: number;
  busy?: boolean;
  onMakePrivate: () => void;
  onMakePublic: () => void;
  onAddToCollection: (collectionId: string) => void;
  onDelete: () => void;
  onClear: () => void;
}

export function BulkActionBar({
  count,
  busy,
  onMakePrivate,
  onMakePublic,
  onAddToCollection,
  onDelete,
  onClear,
}: Readonly<BulkActionBarProps>) {
  const [showCollections, setShowCollections] = useState(false);
  const { collections } = useCollections();

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-2xl"
        >
          <div className="relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 rounded-2xl bg-gray-900/95 dark:bg-gray-800/95 backdrop-blur-xl shadow-2xl border border-white/10">
            <span className="text-sm font-semibold text-white whitespace-nowrap pr-1">
              {count} selected
            </span>

            <div className="h-5 w-px bg-white/15 mx-0.5" />

            <BarButton onClick={onMakePrivate} disabled={busy} icon={<LockClosedIcon className="w-4 h-4" />} label="Private" />
            <BarButton onClick={onMakePublic} disabled={busy} icon={<LockOpenIcon className="w-4 h-4" />} label="Public" />

            <div className="relative">
              <BarButton
                onClick={() => setShowCollections((s) => !s)}
                disabled={busy}
                icon={<FolderPlusIcon className="w-4 h-4" />}
                label="Collection"
              />
              <AnimatePresence>
                {showCollections && (
                  <motion.div
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 8, opacity: 0 }}
                    className="absolute bottom-full mb-2 left-0 w-60 max-h-64 overflow-y-auto rounded-xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 py-1.5"
                  >
                    <p className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      Add to collection
                    </p>
                    {collections.length === 0 ? (
                      <p className="px-3 py-2 text-sm text-gray-500">No collections yet</p>
                    ) : (
                      collections.map((c: Collection) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            setShowCollections(false);
                            onAddToCollection(c.id);
                          }}
                          className="w-full px-3 py-2 flex items-center gap-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors"
                        >
                          <span
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                            style={{ backgroundColor: `${c.color}20` }}
                          >
                            {c.icon}
                          </span>
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                            {c.name}
                          </span>
                        </button>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <BarButton onClick={onDelete} disabled={busy} icon={<TrashIcon className="w-4 h-4" />} label="Delete" danger />

            <div className="ml-auto">
              <button
                onClick={onClear}
                disabled={busy}
                aria-label="Clear selection"
                className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function BarButton({
  onClick,
  disabled,
  icon,
  label,
  danger,
}: Readonly<{
  onClick: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
}>) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors disabled:opacity-50 ${
        danger
          ? "text-red-300 hover:text-red-200 hover:bg-red-500/15"
          : "text-gray-200 hover:text-white hover:bg-white/10"
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
