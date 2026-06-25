import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { CalendarIcon } from "../../Icons/IconsImport";
import { Button } from "../../components/ui/button";
import { BACKEND_URL } from "../../config";
import { Avatar } from "../../components/ui/Avatar";
import { FollowButton } from "../../components/ui/FollowButton";
import type { ContentType } from "../../utlis/contentTypeDetection";
import { PlatformIcon } from "../../utlis/PlatformIcon";

// Only allow http(s) links as href, to prevent javascript:/data: URI XSS.
const safeUrl = (url: string) => (/^https?:\/\//i.test(url || "") ? url : "#");

interface UserProfileData {
  userId: string;
  username: string;
  email: string;
  profilePic?: string;
  bio?: string;
  joinedAt: string;
  contentCount: number;
  typeBreakdown: { _id: ContentType; count: number }[];
  recentActivity: { _id: string; title: string; link: string; type: ContentType; createdAt: string; cloneCount?: number; tags?: { _id: string; name: string }[] }[];
  topTags: { name: string; count: number }[];
  totalTags: number;
  followersCount: number;
  followingCount: number;
}

export default function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentUserId = useMemo(() => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id;
    } catch {
      return null;
    }
  }, []);

  const isOwnProfile = currentUserId === userId;

  const fetchUserProfile = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You need to be logged in to view profiles.");
        return;
      }

      const { data } = await axios.get<UserProfileData>(
        `${BACKEND_URL}/api/v1/user/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile(data);
    } catch (err) {
      console.error("Error fetching user profile:", err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to load profile.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isOwnProfile) {
      navigate("/profile");
      return;
    }
    fetchUserProfile();
  }, [userId, isOwnProfile, navigate, fetchUserProfile]);

  if (loading) {
    return (
      <div className="px-4 py-8">
        <div className="max-w-6xl mx-auto mt-8 p-8">
          <div className="animate-pulse space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8">
              <div className="flex items-center gap-6">
                <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 w-1/3 rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 w-1/4 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-8">
        <div className="max-w-md mx-auto mt-20 p-6 rounded-lg shadow-lg bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-center">
          <p className="font-semibold mb-3">🚨 {error}</p>
          <Button onClick={fetchUserProfile} variant="primary" text="Retry" />
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="px-3 sm:px-4 py-4 sm:py-8">
      <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel border border-purple-200/50 dark:border-purple-800/30 rounded-2xl sm:rounded-3xl shadow-xl p-5 sm:p-8 mb-4 sm:mb-6 relative overflow-hidden"
        >
          {/* Banner */}
          <div className="absolute top-0 left-0 right-0 h-24 sm:h-36 -z-10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-500" />
            <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(255,255,255,0.3),transparent_55%)]" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/95 dark:to-gray-900/95" />
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 sm:gap-6 pt-12 sm:pt-16">
            <div className="rounded-full p-1 bg-white dark:bg-gray-800 shadow-xl">
              <Avatar profilePic={profile.profilePic} username={profile.username} size="xl" />
            </div>

            <div className="flex-1 text-center md:text-left mt-2">
              <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {profile.username}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 justify-center md:justify-start">
                <CalendarIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Member since </span>
                {new Date(profile.joinedAt).toLocaleDateString("en-US", { year: 'numeric', month: 'short' })}
              </p>
              {profile.bio && (
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mt-3 italic max-w-2xl mx-auto md:mx-0">"{profile.bio}"</p>
              )}
            </div>

            <div className="w-full sm:w-auto mt-4 md:mt-2">
              <FollowButton
                userId={userId!}
                username={profile.username}
                className="w-full sm:min-w-[120px]"
              />
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-lg shadow-lg p-3 sm:p-6"
          >
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-medium">Saves</p>
              <p className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1 sm:mt-2">
                {profile.contentCount}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-lg shadow-lg p-3 sm:p-6"
          >
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-medium">Tags</p>
              <p className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1 sm:mt-2">
                {profile.totalTags}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-lg shadow-lg p-3 sm:p-6 cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => navigate(`/user/${userId}/followers`)}
          >
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-medium">Followers</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 mt-1 sm:mt-2">
                {profile.followersCount}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-lg shadow-lg p-3 sm:p-6 cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => navigate(`/user/${userId}/following`)}
          >
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-medium">Following</p>
              <p className="text-2xl sm:text-3xl font-bold text-orange-600 dark:text-orange-400 mt-1 sm:mt-2">
                {profile.followingCount}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Saves */}
        {profile.recentActivity.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="glass-panel border border-gray-200/50 dark:border-gray-700/50 rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6"
          >
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {profile.username}'s saves
            </h2>
            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
              {profile.recentActivity.map((item) => (
                <a
                  key={item._id}
                  href={safeUrl(item.link)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-2xl border border-gray-200/60 dark:border-gray-700/60 bg-white/60 dark:bg-gray-800/40 p-4 hover:-translate-y-0.5 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <PlatformIcon type={item.type} className="w-5 h-5" />
                    <span className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400">{item.type}</span>
                    {item.cloneCount ? (
                      <span className="ml-auto text-[10px] font-semibold text-purple-600 dark:text-purple-400" title="Times cloned by others">🔁 {item.cloneCount}</span>
                    ) : null}
                  </div>
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white line-clamp-2">{item.title}</h3>
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {item.tags.slice(0, 4).map((t) => (
                        <span key={t._id} className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300">#{t.name}</span>
                      ))}
                    </div>
                  )}
                </a>
              ))}
            </div>
          </motion.div>
        )}

        {/* Content Type Breakdown */}
        {profile.typeBreakdown.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6"
          >
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Content Types</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {profile.typeBreakdown.map((type) => (
                <div key={type._id} className="text-center p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 capitalize">{type._id}</p>
                  <p className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                    {type.count}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Top Tags */}
        {profile.topTags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-lg shadow-lg p-4 sm:p-6"
          >
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Top Tags</h2>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {profile.topTags.map((tag) => (
                <span
                  key={tag.name}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-xs sm:text-sm font-medium"
                >
                  {tag.name} ({tag.count})
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
