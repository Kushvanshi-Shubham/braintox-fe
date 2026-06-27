import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LockClosedIcon,
  LockOpenIcon,
  FolderPlusIcon,
  TrashIcon,
  XMarkIcon,
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
} from "@heroicons/react/24/outline";
import { useCollections } from "../../hooks/useCollections";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./Dialog";
import type { Collection } from "../../types";

// Collections store their icon as a name string (see Collections.tsx ICON_OPTIONS)
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Folder: FolderIcon, Book: BookOpenIcon, LightBulb: LightBulbIcon, Fire: FireIcon,
  Star: StarIcon, Briefcase: BriefcaseIcon, Paint: PaintBrushIcon, Rocket: RocketLaunchIcon,
  Pin: MapPinIcon, Trophy: TrophyIcon, Computer: ComputerDesktopIcon, Bookmark: BookmarkIcon,
  Music: MusicalNoteIcon, Film: FilmIcon, Home: HomeIcon,
};

function CollectionIcon({ name, color }: { name?: string; color?: string }) {
  const Icon = (name && ICON_MAP[name]) || FolderIcon;
  return (
    <span
      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: `${color || "#8B5CF6"}20` }}
    >
      <Icon className="w-5 h-5" />
    </span>
  );
}

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
    <>
      <AnimatePresence>
        {count > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-2xl"
          >
            <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 rounded-2xl bg-gray-900/95 dark:bg-gray-800/95 backdrop-blur-xl shadow-2xl border border-white/10">
              <span className="text-sm font-semibold text-white whitespace-nowrap pr-1">
                {count} selected
              </span>
              <div className="h-5 w-px bg-white/15 mx-0.5" />
              <BarButton onClick={onMakePrivate} disabled={busy} icon={<LockClosedIcon className="w-4 h-4" />} label="Private" />
              <BarButton onClick={onMakePublic} disabled={busy} icon={<LockOpenIcon className="w-4 h-4" />} label="Public" />
              <BarButton onClick={() => setShowCollections(true)} disabled={busy} icon={<FolderPlusIcon className="w-4 h-4" />} label="Collection" />
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

      {/* Centered modal to pick a collection — no floating-popover overlap issues */}
      <Dialog open={showCollections} onOpenChange={setShowCollections}>
        <DialogContent className="sm:max-w-[420px] p-0 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          <DialogHeader className="px-5 pt-5 pb-3 border-b border-gray-200 dark:border-gray-700">
            <DialogTitle className="text-lg font-bold">Add {count} to a collection</DialogTitle>
          </DialogHeader>
          <div className="max-h-80 overflow-y-auto py-2">
            {collections.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                No collections yet. Create one from the Collections page.
              </div>
            ) : (
              collections.map((c: Collection) => (
                <button
                  key={c.id}
                  disabled={busy}
                  onClick={() => {
                    setShowCollections(false);
                    onAddToCollection(c.id);
                  }}
                  className="w-full px-5 py-3 flex items-center gap-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors disabled:opacity-50"
                  style={{ color: c.color }}
                >
                  <CollectionIcon name={c.icon} color={c.color} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{c.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {c.contentCount} {c.contentCount === 1 ? "item" : "items"}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
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
