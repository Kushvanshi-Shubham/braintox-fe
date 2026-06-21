import { useState, useRef, useEffect, memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { logout } from "../../utlis/logout";
import { motion, AnimatePresence } from "framer-motion";
import { UserIcon, LogOutIcon, ChevronDownIcon } from "../../Icons/IconsImport"; 
import { BACKEND_URL } from "../../config";
import { Avatar } from "./Avatar";

function useClickOutside(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

const UserMenuComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState("User");
  const [profilePic, setProfilePic] = useState("");
  const [role, setRole] = useState("user");
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);

  // Fetch user data on mount and when returning from profile page
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const response = await axios.get(`${BACKEND_URL}/api/v1/profile`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setUsername(response.data.username);
          setProfilePic(response.data.profilePic);

          // Fetch role to decide whether to show the Admin link.
          try {
            const planRes = await axios.get(`${BACKEND_URL}/api/v1/plan`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setRole(planRes.data?.role || "user");
          } catch {
            // ignore — default role stays 'user'
          }
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };
    
    fetchUserData();
    
    // Listen for profile update events
    const handleProfileUpdate = () => {
      fetchUserData();
    };
    
    globalThis.addEventListener('profileUpdated', handleProfileUpdate);
    
    return () => {
      globalThis.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [location.pathname]); // Refetch when route changes

  // Use the custom hook to close the menu
  useClickOutside(menuRef, () => setIsOpen(false));

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const handleProfile = () => {
    navigate("/profile");
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Avatar 
          profilePic={profilePic}
          username={username}
          size="sm"
        />
        <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-48 origin-top-right bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-30"
          >
            <div className="py-1">
              <button
                onClick={handleProfile}
                className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <UserIcon className="w-4 h-4" />
                <span>Profile</span>
              </button>
              <button
                onClick={() => {
                  navigate("/pricing");
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                <span>Plans &amp; pricing</span>
              </button>
              {role === "admin" && (
                <button
                  onClick={() => {
                    navigate("/admin");
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span>Admin</span>
                </button>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50"
              >
                <LogOutIcon className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MemoizedUserMenu = memo(UserMenuComponent);
MemoizedUserMenu.displayName = "UserMenu";

export { MemoizedUserMenu as UserMenu };
