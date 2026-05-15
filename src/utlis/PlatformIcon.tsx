import {
  CameraIcon,
  MusicalNoteIcon,
  BriefcaseIcon,
  UserGroupIcon,
  NewspaperIcon,
  CodeBracketIcon,
  PlayCircleIcon,
  SignalIcon,
  MapPinIcon,
  FilmIcon,
  BookOpenIcon,
  LinkIcon,
  SpeakerWaveIcon,
} from "@heroicons/react/24/outline";
import { YoutubeIcon, TwitterIcon, GithubIcon } from "../Icons/IconsImport";
import type { ContentType } from "./contentTypeDetection";

type IconComponent = React.ComponentType<{ className?: string }>;

const PLATFORM_ICONS: Record<ContentType, IconComponent> = {
  youtube:    YoutubeIcon,
  twitter:    TwitterIcon,
  instagram:  CameraIcon,
  tiktok:     MusicalNoteIcon,
  linkedin:   BriefcaseIcon,
  reddit:     UserGroupIcon,
  medium:     NewspaperIcon,
  github:     GithubIcon,
  codepen:    CodeBracketIcon,
  spotify:    MusicalNoteIcon,
  soundcloud: SpeakerWaveIcon,
  vimeo:      PlayCircleIcon,
  twitch:     SignalIcon,
  facebook:   UserGroupIcon,
  pinterest:  MapPinIcon,
  article:    NewspaperIcon,
  video:      FilmIcon,
  resource:   BookOpenIcon,
  other:      LinkIcon,
};

interface PlatformIconProps {
  readonly type: ContentType;
  readonly className?: string;
}

export function PlatformIcon({ type, className = "w-5 h-5" }: PlatformIconProps) {
  const Icon = PLATFORM_ICONS[type] ?? LinkIcon;
  return <Icon className={className} />;
}
