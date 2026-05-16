import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { SEOHead } from "../components/SEOHead";
import { cn } from "../utlis/cn";
import {
  UserCircleIcon,
  FolderIcon,
  LinkIcon,
  TagIcon,
  FireIcon,
} from "@heroicons/react/24/outline";

interface PublicProfileData {
  username: string;
  bio: string;
  profilePic: string;
  joinedAt: string;
  brainPower: number;
  followersCount: number;
  followingCount: number;
  contentCount: number;
  collections: { _id: string; name: string; description: string; contentCount: number }[];
  typeBreakdown: { _id: string; count: number }[];
  topTags: { name: string; count: number }[];
}

export default function PublicProfile() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/v1/public/user/${username}`);
        setProfile(res.data);
      } catch {
        setError("User not found");
      } finally {
        setLoading(false);
      }
    }
    if (username) fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
        <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">User Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The profile you're looking for doesn't exist.</p>
          <Link to="/" className="font-semibold gradient-text hover:opacity-80">Go Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
      <SEOHead
        title={`${profile.username}'s Profile`}
        description={profile.bio || `Check out ${profile.username}'s knowledge collection on Braintox.`}
        path={`/@${profile.username}`}
      />

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold gradient-text">Braintox</Link>
          <Link
            to="/signup"
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-semibold text-white",
              "bg-gradient-to-r from-purple-600 to-pink-600",
              "hover:from-purple-700 hover:to-pink-700 transition-all"
            )}
          >
            Join Braintox
          </Link>
        </div>
      </nav>

      {/* Profile Header */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10 relative"
        >
          {/* Banner */}
          <div className="absolute top-0 left-0 right-0 h-32 sm:h-40 bg-gradient-to-br from-purple-500/20 to-pink-500/20 dark:from-purple-900/40 dark:to-pink-900/40 rounded-3xl -z-10" />
          
          <div className="pt-16 sm:pt-20">
            {profile.profilePic ? (
            <img
              src={profile.profilePic}
              alt={profile.username}
              className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white dark:border-gray-800 shadow-lg object-cover"
            />
          ) : (
            <UserCircleIcon className="w-24 h-24 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          )}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            @{profile.username}
          </h1>
          {profile.bio && (
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">{profile.bio}</p>
          )}
          <div className="flex items-center justify-center gap-6 mt-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400 font-semibold bg-yellow-100/50 dark:bg-yellow-900/20 px-2 py-0.5 rounded-full"><FireIcon className="w-4 h-4" /> {profile.brainPower} Brain Power</span>
            <span><strong className="text-gray-900 dark:text-white">{profile.followersCount}</strong> followers</span>
            <span><strong className="text-gray-900 dark:text-white">{profile.followingCount}</strong> following</span>
            <span className="hidden sm:inline">Joined {new Date(profile.joinedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
          </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: LinkIcon, label: "Links", value: profile.contentCount },
            { icon: FolderIcon, label: "Collections", value: profile.collections.length },
            { icon: TagIcon, label: "Top Tags", value: profile.topTags.length },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="text-center p-4 sm:p-6 rounded-3xl glass-panel shadow-lg border border-purple-200/50 dark:border-purple-800/30"
            >
              <stat.icon className="w-6 h-6 mx-auto mb-2 text-purple-500" />
              <p className="text-2xl sm:text-3xl font-bold gradient-text">{stat.value}</p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Top Tags */}
        {profile.topTags.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Top Tags</h2>
            <div className="flex flex-wrap gap-2">
              {profile.topTags.map((tag) => (
                <span key={tag.name} className="px-4 py-1.5 rounded-full text-sm font-semibold bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/30 shadow-sm">
                  #{tag.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Collections */}
        {profile.collections.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Collections</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {profile.collections.map((col) => (
                <div key={col._id} className="p-5 sm:p-6 rounded-3xl glass-panel border border-gray-200/50 dark:border-gray-700/50 shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">{col.name}</h3>
                  {col.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">{col.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center py-12 mt-8 border-t border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
            Build your own <span className="gradient-text">knowledge network</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Join Braintox for free and start organizing your knowledge today.</p>
          <Link
            to="/signup"
            className={cn(
              "inline-block px-8 py-3.5 rounded-2xl font-bold text-white",
              "bg-gradient-to-r from-purple-600 to-pink-600",
              "hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/25"
            )}
          >
            Get Started Free
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
