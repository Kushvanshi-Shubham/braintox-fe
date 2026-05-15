// Shared type definitions across the application

export interface Tag {
  _id: string;
  name: string;
}

export interface Content {
  _id: string;
  title: string;
  link: string;
  type: string;
  tags: Tag[];
  createdAt?: string;
  isFavorite?: boolean;
  isArchived?: boolean;
  notes?: string;
  userId?: {
    _id: string;
    username: string;
    profilePic?: string;
  };
}

export interface TypeBreakdown {
  _id: string;
  count: number;
}

export interface RecentActivity {
  _id: string;
  title: string;
  type: string;
  createdAt: string;
}

export interface TopTag {
  _id: string;
  name: string;
  count: number;
}

export interface ProfileData {
  username: string;
  email: string;
  profilePic: string;
  bio: string;
  joinedAt: string;
  brainPower: number;
  contentCount: number;
  typeBreakdown: TypeBreakdown[];
  recentActivity: RecentActivity[];
  topTags: TopTag[];
  totalTags: number;
}

export interface DiscoveryData {
  weeklyContent: number;
  monthlyContent: number;
  typeBreakdown: TypeBreakdown[];
  tagStats: TopTag[];
  randomItem?: {
    _id: string;
    title: string;
    link: string;
    type: string;
  };
  onThisDay: Content[];
}

export interface SearchFilters {
  types: string[];
  tags: Tag[];
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  contentCount: number;
  contentPreview?: Content[];
  content?: Content[];
  isPrivate: boolean;
  order: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  contentCount: number;
  contentPreview?: Content[];
  content?: Content[];
  isPrivate: boolean;
  order: number;
  createdAt: string;
  updatedAt?: string;
}
