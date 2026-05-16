import { useState, useEffect, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { BACKEND_URL } from "../config";
import { BellIcon, FollowersIcon, FeedIcon, CheckCircleIcon } from "../Icons/IconsImport";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/button";
import { Spinner } from "../components/ui/Spinner";
import { 
  SparklesIcon, 
  UserGroupIcon, 
  DocumentTextIcon,
  BellAlertIcon 
} from "@heroicons/react/24/outline";
import { cn } from "../utlis/cn";

interface Notification {
  _id: string;
  type: "follow" | "content";
  actorId: {
    _id: string;
    username: string;
    profilePic?: string;
  };
  contentId?: {
    _id: string;
    title: string;
    type: string;
  };
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationResponse {
  success: boolean;
  notifications: Notification[];
  unreadCount: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

type FilterType = "all" | "follow" | "content" | "unread";

const FILTER_TABS = [
  { value: "all" as FilterType, label: "All", IconComponent: BellAlertIcon },
  { value: "unread" as FilterType, label: "Unread", IconComponent: SparklesIcon },
  { value: "follow" as FilterType, label: "Follows", IconComponent: UserGroupIcon },
  { value: "content" as FilterType, label: "Content", IconComponent: DocumentTextIcon },
];

export const ActivityFeed = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<FilterType>("all");
  const [stats, setStats] = useState({
    total: 0,
    follows: 0,
    unread: 0,
  });

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to view notifications");
        navigate("/login");
        return;
      }
      const response = await axios.get<NotificationResponse>(
        `${BACKEND_URL}/api/v1/notifications?page=${page}&limit=20`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const { notifications, unreadCount, pagination } = response.data;
        setNotifications(notifications);
        setUnreadCount(unreadCount);
        setTotalPages(pagination.pages);
        
        setStats({
          total: pagination.total,
          follows: notifications.filter(n => n.type === "follow").length,
          unread: unreadCount,
        });
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const message = error.response.data?.message || "Failed to load notifications";
          toast.error(message);
          if (error.response.status === 401) {
            navigate("/login");
          }
        } else if (error.request) {
          toast.error("Cannot connect to server. Please ensure the backend is running.");
        } else {
          toast.error("An unexpected error occurred.");
        }
      } else {
        toast.error("Failed to load notifications");
      }
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [page, navigate]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      await axios.put(
        `${BACKEND_URL}/api/v1/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      toast.success("Marked as read");
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Failed to mark as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      await axios.put(
        `${BACKEND_URL}/api/v1/notifications/read-all`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Failed to mark all as read");
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      await axios.delete(
        `${BACKEND_URL}/api/v1/notifications/${notificationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      toast.success("Notification deleted");
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    
    if (notification.type === "follow") {
      navigate(`/user/${notification.actorId._id}`);
    }
  };

  const getTimeAgo = useCallback((date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
  }, []);

  const filteredNotifications = notifications.filter(n => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.isRead;
    return n.type === filter;
  });

  if (loading && notifications.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-purple-600 dark:text-purple-400">
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-4 sm:mb-6 md:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text mb-1 sm:mb-2">
            Activity Feed
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Stay updated with your notifications and interactions
          </p>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className={cn(
            "glass-panel border border-purple-200/50 dark:border-purple-800/30",
            "rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl mb-4 sm:mb-6 md:mb-8"
          )}
        >
          <div className="grid grid-cols-3 gap-3 sm:gap-6">
            <div className="text-center">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold gradient-text">{stats.total}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1">Total</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold gradient-text">{stats.follows}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1">Follows</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold gradient-text">{stats.unread}</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1">Unread</div>
            </div>
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mb-4 sm:mb-6"
        >
          <div className="flex gap-1.5 sm:gap-2 flex-wrap glass-panel p-1.5 sm:p-2 rounded-2xl shadow-lg">
            {FILTER_TABS.map((tab) => {
              const TabIcon = tab.IconComponent;
              return (
                <button
                  key={tab.value}
                  onClick={() => setFilter(tab.value)}
                  className={cn(
                    "flex-1 px-3 sm:px-5 py-2 sm:py-3 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-1 sm:gap-2",
                    filter === tab.value
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                >
                  <TabIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Unread Banner */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 sm:mb-6"
            >
              <div className={cn(
                "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3",
                "glass-panel border border-purple-300/50 dark:border-purple-700/50",
                "rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg"
              )}>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-purple-600 to-pink-600">
                    <span className="text-white font-bold text-sm sm:text-base">{unreadCount}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
                      {unreadCount} unread notification{unreadCount === 1 ? "" : "s"}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      Click to view or mark all as read
                    </p>
                  </div>
                </div>
                <Button
                  onClick={markAllAsRead}
                  variant="secondary"
                  className={cn(
                    "bg-gradient-to-r from-purple-600 to-pink-600",
                    "hover:from-purple-700 hover:to-pink-700",
                    "text-white border-0"
                  )}
                  size="sm"
                >
                  <CheckCircleIcon className="w-4 h-4 mr-2" />
                  Mark all read
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center py-16"
          >
            <div className="glass-panel border border-purple-200/50 dark:border-purple-800/30 rounded-3xl p-12 shadow-lg">
              <div className={cn(
                "w-20 h-20 mx-auto mb-6 rounded-full",
                "bg-gradient-to-br from-purple-100 to-pink-100",
                "dark:from-purple-900/30 dark:to-pink-900/30",
                "flex items-center justify-center"
              )}>
                <BellIcon className="w-10 h-10 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold gradient-text mb-3">
                {filter === "all" ? "No notifications yet" : `No ${filter} notifications`}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {filter === "all"
                  ? "When someone follows you or interacts with your content, you'll see it here."
                  : `You don't have any ${filter} notifications at the moment.`}
              </p>
              {filter !== "all" && (
                <Button onClick={() => setFilter("all")} variant="secondary">
                  View all notifications
                </Button>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredNotifications.map((notification, index) => (
                <NotificationCard
                  key={notification._id}
                  notification={notification}
                  index={index}
                  onDelete={deleteNotification}
                  onClick={handleNotificationClick}
                  getTimeAgo={getTimeAgo}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center items-center gap-4 mt-8 glass-panel p-5 rounded-3xl shadow-lg border border-gray-200/50 dark:border-gray-700/50"
          >
            <Button
              onClick={() => setPage(p => p - 1)}
              disabled={page === 1}
              variant="secondary"
              size="sm"
            >
              ← Previous
            </Button>
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  className={`
                    w-10 h-10 rounded-xl font-bold transition-all
                    ${page === i + 1
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20"
                      : "text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50"
                    }
                  `}
                >
                  {i + 1}
                </button>
              ))}
              {totalPages > 5 && <span className="text-gray-400">...</span>}
            </div>
            <Button
              onClick={() => setPage(p => p + 1)}
              disabled={page === totalPages}
              variant="secondary"
              size="sm"
            >
              Next →
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Notification Card Component
const NotificationCard = memo(({
  notification,
  index,
  onDelete,
  onClick,
  getTimeAgo,
}: {
  notification: Notification;
  index: number;
  onDelete: (id: string) => void;
  onClick: (notification: Notification) => void;
  getTimeAgo: (date: string) => string;
}) => {
  const isFollow = notification.type === "follow";
  const Icon = isFollow ? FollowersIcon : FeedIcon;
  const iconColor = isFollow ? "text-blue-500" : "text-green-500";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -100, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      onClick={() => onClick(notification)}
      className={cn(
        "group relative overflow-hidden rounded-3xl cursor-pointer",
        "transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1",
        notification.isRead
          ? "glass-panel border border-gray-200/50 dark:border-gray-700/50"
          : "glass-panel border border-purple-300/50 dark:border-purple-600/50 shadow-md"
      )}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {/* Unread indicator line */}
      {!notification.isRead && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-blue-500" />
      )}

      <div className="relative p-5 flex items-start gap-4">
        {/* Icon Badge */}
        <div className={`
          flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center
          ${notification.isRead ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-800 shadow-lg'}
        `}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>

        {/* Avatar */}
        <Avatar
          profilePic={notification.actorId.profilePic}
          username={notification.actorId.username}
          size="lg"
          showOnlineIndicator={!notification.isRead}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              @{notification.actorId.username}
            </h3>
            {!notification.isRead && (
              <div className="flex items-center gap-1 px-2 py-1 bg-purple-600 text-white text-xs font-bold rounded-full">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                <span>NEW</span>
              </div>
            )}
          </div>

          <p className="text-gray-700 dark:text-gray-300 mb-2 line-clamp-2">
            {notification.message}
          </p>

          {notification.contentId && (
            <div className="mb-2 p-3 bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-inner">
              <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <FeedIcon className="w-4 h-4 text-purple-500" />
                {notification.contentId.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Type: {notification.contentId.type}
              </p>
            </div>
          )}

          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {getTimeAgo(notification.createdAt)}
            </span>
            {isFollow && (
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-xs font-medium flex items-center gap-1">
                <UserGroupIcon className="w-3 h-3" />
                New Follower
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notification._id);
            }}
            className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
            title="Delete notification"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Hover Effect Border */}
      <div className="absolute inset-0 border-2 border-purple-500 opacity-0 group-hover:opacity-20 rounded-xl transition-opacity" />
    </motion.div>
  );
});

NotificationCard.displayName = "NotificationCard";

