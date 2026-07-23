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
} from "@heroicons/react/24/outline";

// Collections store their icon as a NAME string (see Collections.tsx ICON_OPTIONS),
// not an emoji — so it must be mapped to a component before rendering, never
// printed directly (that shows raw text like "Fire" / "Computer").
export const COLLECTION_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Folder: FolderIcon, Book: BookOpenIcon, LightBulb: LightBulbIcon, Fire: FireIcon,
  Star: StarIcon, Briefcase: BriefcaseIcon, Paint: PaintBrushIcon, Rocket: RocketLaunchIcon,
  Pin: MapPinIcon, Trophy: TrophyIcon, Computer: ComputerDesktopIcon, Bookmark: BookmarkIcon,
  Music: MusicalNoteIcon, Film: FilmIcon, Home: HomeIcon,
};

export function CollectionIcon({
  name,
  color,
  className,
}: Readonly<{ name?: string; color?: string; className?: string }>) {
  const Icon = (name && COLLECTION_ICON_MAP[name]) || FolderIcon;
  return (
    <span
      className={className ?? "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"}
      style={{ backgroundColor: `${color || "#8B5CF6"}20`, color: color || "#8B5CF6" }}
    >
      <Icon className="w-5 h-5" />
    </span>
  );
}
