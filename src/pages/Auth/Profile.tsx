import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { UserIcon, CalendarIcon, ArchiveIcon, LogOutIcon } from "../../Icons/IconsImport";
import { Button } from "../../components/ui/button";
import { BACKEND_URL } from "../../config";
import { logout } from "../../utlis/logout";
import { Avatar } from "../../components/ui/Avatar";
import ImageCropper from "../../components/ui/ImageCropper";
import type { ProfileData } from "../../types";
import { getPlatformMeta, type ContentType } from "../../utlis/contentTypeDetection";
import { PlatformIcon } from "../../utlis/PlatformIcon";
import { useFollowers, useFollowing } from "../../hooks/useFollow";
import { FireIcon, LightBulbIcon, TagIcon, ChartBarIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [profilePicUrl, setProfilePicUrl] = useState("");
  const [bio, setBio] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);

  // Get user ID from token
  const getUserIdFromToken = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id;
    } catch {
      return null;
    }
  };

  const currentUserId = getUserIdFromToken();
  const { count: followersCount } = useFollowers(currentUserId);
  const { count: followingCount } = useFollowing(currentUserId);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("You are not logged in.");
        setLoading(false);
        return;
      }

      const res = await axios.get<ProfileData>(`${BACKEND_URL}/api/v1/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProfile(res.data);
      setProfilePicUrl(res.data.profilePic || "");
      setBio(res.data.bio || "");
    } catch (err) {
      console.error("Error fetching profile:", err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to load profile. Please try again.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchProfile();
  }, []);

  const handleUpdateProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await axios.put(
        `${BACKEND_URL}/api/v1/profile`,
        { profilePic: profilePicUrl, bio },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Profile updated successfully!");
      setEditMode(false);
      setImagePreview(null);
      void fetchProfile();
      
      // Emit event to update profile picture everywhere
      globalThis.dispatchEvent(new Event('profileUpdated'));
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("Failed to update profile");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    // Create preview for cropper
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageToCrop(reader.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedImage: string) => {
    setUploadingImage(true);
    setShowCropper(false);

    try {
      // Set preview immediately
      setImagePreview(croppedImage);

      // Upload to Cloudinary
      const formData = new FormData();
      
      // Convert base64 to blob
      const blob = await fetch(croppedImage).then(r => r.blob());
      formData.append('file', blob);
      formData.append('upload_preset', 'braintox_profiles'); // You'll need to create this in Cloudinary
      formData.append('cloud_name', 'YOUR_CLOUD_NAME'); // Replace with your Cloudinary cloud name

      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload', // Replace YOUR_CLOUD_NAME
        formData
      );

      setProfilePicUrl(response.data.secure_url);
      toast.success('Image uploaded successfully!');
    } catch (err) {
      console.error('Image upload failed:', err);
      toast.error('Failed to upload image. Please try again.');
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
    }
  };

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-32 bg-white dark:bg-gray-800 rounded-lg"></div>
              <div className="h-32 bg-white dark:bg-gray-800 rounded-lg"></div>
              <div className="h-32 bg-white dark:bg-gray-800 rounded-lg"></div>
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
          <p className="font-semibold mb-3 flex items-center gap-2"><ExclamationCircleIcon className="w-5 h-5" /> Oh no! {error}</p>
          <Button onClick={fetchProfile} variant="primary" text="Retry Loading Profile" />
        </div>
      </div>
    );
  }

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
          <div className="absolute top-0 left-0 right-0 h-32 sm:h-40 bg-gradient-to-br from-purple-500/20 to-pink-500/20 dark:from-purple-900/40 dark:to-pink-900/40 -z-10" />

          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 sm:gap-6 pt-16 sm:pt-20">
            {/* Profile Picture */}
            <div className="relative">
              <div className="rounded-full p-1 bg-white dark:bg-gray-800 shadow-xl">
                <Avatar
                  profilePic={profile?.profilePic}
                  username={profile?.username || 'User'}
                  size="xl"
                  showOnlineIndicator={true}
                />
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left mt-2 md:mt-4">
              <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center md:justify-start gap-2">
                {profile?.username}
              </h1>
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 font-medium mb-1">{profile?.email}</p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center md:justify-start gap-1">
                <CalendarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Joined </span>
                {profile?.joinedAt ? new Date(profile.joinedAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long' }) : 'N/A'}
              </p>
              {!editMode && profile?.bio && (
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mt-4 max-w-2xl text-center md:text-left mx-auto md:mx-0 leading-relaxed">"{profile.bio}"</p>
              )}
            </div>

            {/* Edit/Logout Buttons */}
            <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto mt-6 md:mt-4 justify-center md:justify-start">
              {!editMode ? (
                <>
                  <Button
                    onClick={() => setEditMode(true)}
                    variant="primary"
                    text="Edit Profile"
                    className="flex-1 md:flex-none rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/25 px-6 py-2.5"
                  />
                  <Button
                    onClick={logout}
                    variant="ghost"
                    text=""
                    startIcon={<LogOutIcon className="w-4 h-4" />}
                    className="flex-1 md:flex-none rounded-2xl text-red-600 dark:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800/30 shadow-sm"
                  />
                </>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleUpdateProfile}
                    className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium shadow-lg flex items-center gap-2 transition-all"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Save Changes
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setEditMode(false);
                      setProfilePicUrl(profile?.profilePic || "");
                      setBio(profile?.bio || "");
                      setImagePreview(null);
                    }}
                    className="px-6 py-3 bg-gray-200/50 dark:bg-gray-700/50 hover:bg-gray-300/50 dark:hover:bg-gray-600/50 text-gray-700 dark:text-gray-300 rounded-2xl font-bold flex items-center gap-2 transition-all backdrop-blur-md"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Cancel
                  </motion.button>
                </>
              )}
            </div>
          </div>

          {/* Edit Mode Fields */}
          {editMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-6"
            >
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Profile Picture
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Preview */}
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-200 dark:border-purple-700 shadow-lg">
                      {imagePreview || profilePicUrl ? (
                        <img
                          src={imagePreview || profilePicUrl}
                          alt="Profile preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white text-4xl font-bold">
                          {profile?.username?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    {(imagePreview || profilePicUrl) && (
                      <button
                        onClick={() => {
                          setImagePreview(null);
                          setProfilePicUrl("");
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-colors"
                        title="Remove image"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Upload Button */}
                  <div className="flex-1 w-full">
                    <label className="block">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                      <div className="cursor-pointer group">
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300 bg-gray-50 dark:bg-gray-800/50 group-hover:scale-[1.02]">
                          {uploadingImage ? (
                            <div className="flex flex-col items-center gap-2">
                              <svg className="animate-spin h-8 w-8 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Uploading...</p>
                            </div>
                          ) : (
                            <>
                              <svg className="mx-auto h-12 w-12 text-gray-400 group-hover:text-purple-500 transition-colors" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-semibold text-purple-600 dark:text-purple-400">Click to upload</span> or drag and drop
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                PNG, JPG, GIF up to 5MB
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </label>
                    
                    {/* Alternative: Paste URL */}
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Or paste an image URL:</p>
                        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-[10px] font-medium rounded-full">
                          Optional
                        </span>
                      </div>
                      <input
                        type="url"
                        value={profilePicUrl}
                        onChange={(e) => {
                          setProfilePicUrl(e.target.value);
                          setImagePreview(null);
                        }}
                        placeholder="https://i.imgur.com/example.jpg"
                        disabled={uploadingImage}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                  <label className="block text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3 uppercase tracking-wider">
                    Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself... What makes you unique?"
                    rows={4}
                    maxLength={500}
                    className="w-full px-5 py-4 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none transition-all shadow-inner"
                  />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 italic flex items-center gap-1">
                    <LightBulbIcon className="w-3.5 h-3.5 flex-shrink-0" /> Tip: Share your interests, expertise, or what you're learning
                  </p>
                  <p className={`text-xs font-medium ${
                    bio.length > 450 
                      ? 'text-red-600 dark:text-red-400' 
                      : bio.length > 350 
                      ? 'text-orange-600 dark:text-orange-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {bio.length}/500
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel border border-purple-200/50 dark:border-purple-800/30 rounded-3xl shadow-xl p-6 sm:p-8 mb-6"
        >
          <div className="grid grid-cols-2 md:grid-cols-5 gap-y-8 divide-x-0 md:divide-x divide-gray-200 dark:divide-gray-700">
            {[
              { label: "Brain Power", value: profile?.brainPower || 0, icon: FireIcon, color: "text-yellow-500", bg: "bg-yellow-500/10" },
              { label: "Total Saves", value: profile?.contentCount || 0, icon: ArchiveIcon, color: "text-purple-500", bg: "bg-purple-500/10" },
              { label: "Followers", value: followersCount, icon: UserIcon, color: "text-green-500", bg: "bg-green-500/10" },
              { label: "Following", value: followingCount, icon: UserIcon, color: "text-orange-500", bg: "bg-orange-500/10" },
              { label: "Unique Tags", value: profile?.totalTags || 0, icon: TagIcon, color: "text-blue-500", bg: "bg-blue-500/10" },
            ].map((stat, i) => (
              <div key={stat.label} className="text-center px-4 group">
                <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center ${stat.bg} transition-transform group-hover:scale-110`}>
                  <stat.icon className={`w-7 h-7 ${stat.color} opacity-90`} />
                </div>
                <p className="text-4xl font-black bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent tracking-tight mb-1">{stat.value}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Type Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-panel border border-gray-200/50 dark:border-gray-700/50 rounded-2xl sm:rounded-3xl shadow-lg p-5 sm:p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
                <ChartBarIcon className="w-6 h-6 text-purple-500" />
                <span className="hidden sm:inline">Content by Type</span><span className="sm:hidden">By Type</span>
              </h2>
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800">
                {profile?.contentCount || 0} total
              </span>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {profile?.typeBreakdown && profile.typeBreakdown.length > 0 ? (
                profile.typeBreakdown.map((item, index) => {
                  const platformMeta = getPlatformMeta(item._id as ContentType);
                  const percentage = Math.round((item.count / (profile?.contentCount || 1)) * 100);
                  return (
                  <div key={item._id || index} className="group hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 sm:p-3 rounded-lg transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <PlatformIcon type={item._id as ContentType} className="w-6 h-6 sm:w-8 sm:h-8" />
                        <div>
                          <span className="font-semibold text-gray-800 dark:text-gray-200 capitalize block text-sm sm:text-base">
                            {item._id}
                          </span>
                          <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                            {percentage}%
                          </span>
                        </div>
                      </div>
                      <span className="text-lg sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {item.count}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 sm:h-2.5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                        className="h-2 sm:h-2.5 rounded-full"
                        style={{ backgroundColor: platformMeta.color }}
                      ></motion.div>
                    </div>
                  </div>
                  );
                })
              ) : (
                <div className="text-center py-8 sm:py-12">
                    <ChartBarIcon className="w-16 h-16 sm:w-24 sm:h-24 text-gray-400 opacity-20 mx-auto mb-3 sm:mb-4" />
                  <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                    No content types yet. Start saving content!
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Top Tags */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-panel border border-gray-200/50 dark:border-gray-700/50 rounded-2xl sm:rounded-3xl shadow-lg p-5 sm:p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
                <TagIcon className="w-6 h-6 text-purple-500" />
                <span className="hidden sm:inline">Most Used Tags</span><span className="sm:hidden">Top Tags</span>
              </h2>
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800">
                {profile?.totalTags || 0} unique
              </span>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {profile?.topTags && profile.topTags.length > 0 ? (
                profile.topTags.map((tag) => {
                  const percentage = profile.contentCount > 0 
                    ? Math.round((tag.count / profile.contentCount) * 100) 
                    : 0;
                  return (
                    <button
                      key={tag._id}
                      onClick={() => navigate(`/explore?tag=${encodeURIComponent(tag.name)}`)}
                      className="group relative px-3 sm:px-4 py-1.5 sm:py-2.5 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/40 dark:to-blue-900/40 hover:from-purple-200 hover:to-blue-200 dark:hover:from-purple-800/60 dark:hover:to-blue-800/60 rounded-full transition-all cursor-pointer shadow-sm hover:shadow-md text-sm sm:text-base"
                      title={`Explore content tagged with ${tag.name}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-purple-800 dark:text-purple-300">
                          #{tag.name}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="bg-purple-600 dark:bg-purple-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                            {tag.count}
                          </span>
                          <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                            {percentage}%
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="text-center w-full py-12">
                    <TagIcon className="w-16 h-16 text-gray-400 opacity-20 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No tags used yet. Add tags to your content!
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Recent Activity Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-panel border border-gray-200/50 dark:border-gray-700/50 rounded-3xl shadow-lg p-6 lg:col-span-2"
          >
            <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
              Recent Activity
            </h2>
            <div className="space-y-4">
              {profile?.recentActivity && profile.recentActivity.length > 0 ? (
                profile.recentActivity.map((item) => {
                  const platformMeta = getPlatformMeta(item.type as ContentType);
                  return (
                  <div
                    key={item._id}
                    className="flex items-start gap-4 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0"
                  >
                    <div 
                      className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: platformMeta.color }}
                    >
                      <PlatformIcon type={item.type as ContentType} className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span 
                          className="px-2 py-0.5 rounded text-xs font-medium text-white"
                          style={{ backgroundColor: platformMeta.color }}
                        >
                          {item.type}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  );
                })
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No recent activity
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Image Cropper Modal */}
      {imageToCrop && (
        <ImageCropper
          image={imageToCrop}
          isOpen={showCropper}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setShowCropper(false);
            setImageToCrop(null);
          }}
        />
      )}
    </div>
  );
}
