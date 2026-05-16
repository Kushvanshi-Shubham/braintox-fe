import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { SearchIcon} from "../Icons/IconsImport";
import { BACKEND_URL } from "../config";
import { Avatar } from "../components/ui/Avatar";
import { FollowButton } from "../components/ui/FollowButton";
import { useNavigate } from "react-router-dom";
import { Input } from "../components/ui/Input";
import { Spinner } from "../components/ui/Spinner";
import { UserGroupIcon } from "@heroicons/react/24/outline";
import { cn } from "../utlis/cn";

interface DiscoverUser {
  _id: string;
  username: string;
  email: string;
  profilePic?: string;
  bio?: string;
  followersCount: number;
  followingCount: number;
  contentCount: number;
  createdAt: string;
}

export default function Discover() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<DiscoverUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchDiscoverUsers();
  }, []);

  const fetchDiscoverUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      const { data } = await axios.get(`${BACKEND_URL}/api/v1/users/discover`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(data.users || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchDiscoverUsers();
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      const { data } = await axios.get(`${BACKEND_URL}/api/v1/users/search`, {
        params: { q: searchQuery },
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(data.users || []);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-purple-600 dark:text-purple-400">
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-4 sm:mb-6 md:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text mb-1 sm:mb-2">
            Discover People
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Find interesting people to follow and see what they're saving
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.form
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSearch}
          className="mb-4 sm:mb-6 md:mb-8"
        >
          <div className="relative">
            <SearchIcon className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 w-full text-sm sm:text-base md:text-lg"
            />
          </div>
        </motion.form>

        {/* Users Grid */}
        {users.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center py-12 sm:py-16 glass border border-purple-200/50 dark:border-purple-800/30 rounded-xl sm:rounded-2xl"
          >
            <div className={cn(
              "w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full",
              "bg-gradient-to-br from-purple-100 to-pink-100",
              "dark:from-purple-900/30 dark:to-pink-900/30",
              "flex items-center justify-center"
            )}>
              <UserGroupIcon className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold gradient-text mb-2 sm:mb-3">
              No users found
            </h3>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400">
              {searchQuery ? "Try a different search query" : "No suggested users at the moment"}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {users.map((user, index) => (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03, duration: 0.3 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={cn(
                  "group relative glass border border-purple-200/50 dark:border-purple-800/30",
                  "rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all p-4 sm:p-6",
                  "hover:border-purple-400 dark:hover:border-purple-500"
                )}
              >
                {/* Card Banner */}
                <div className="absolute top-0 left-0 right-0 h-20 sm:h-24 bg-gradient-to-br from-purple-500/20 to-pink-500/20 dark:from-purple-900/40 dark:to-pink-900/40" />

                {/* User Avatar and Info */}
                <div className="relative flex flex-col items-center text-center mt-6 sm:mt-8 mb-3 sm:mb-4">
                  <button
                    onClick={() => navigate(`/user/${user._id}`)}
                    className="mb-3 sm:mb-4 hover:scale-105 transition-transform duration-200 z-10"
                  >
                    <div className="p-1 rounded-full bg-white dark:bg-gray-800 shadow-md">
                      <Avatar
                        profilePic={user.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=a855f7&color=fff&bold=true`}
                        username={user.username}
                        size="lg"
                        showOnlineIndicator={false}
                      />
                    </div>
                  </button>

                  <button
                    onClick={() => navigate(`/user/${user._id}`)}
                    className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors mb-1 z-10"
                  >
                    {user.username}
                  </button>

                  {user.bio ? (
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 px-4 h-8 sm:h-10 z-10">
                      {user.bio}
                    </p>
                  ) : (
                    <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 italic line-clamp-2 px-4 h-8 sm:h-10 z-10">
                      No bio yet
                    </p>
                  )}
                </div>

                {/* Stats */}
                <div className="flex justify-center items-center gap-4 sm:gap-6 mb-4 sm:mb-6 py-3 border-y border-gray-100 dark:border-gray-700/50">
                  <div className="text-center">
                    <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                      {user.contentCount}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider font-semibold">Saves</p>
                  </div>
                  <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
                  <div className="text-center">
                    <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                      {user.followersCount}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider font-semibold">Followers</p>
                  </div>
                  <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
                  <div className="text-center">
                    <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                      {user.followingCount}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider font-semibold">Following</p>
                  </div>
                </div>

                {/* Follow Button */}
                <FollowButton
                  userId={user._id}
                  username={user.username}
                  className="w-full btn-gradient py-2 rounded-xl"
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
