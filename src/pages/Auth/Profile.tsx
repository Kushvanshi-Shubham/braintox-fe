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
          className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-lg shadow-lg p-4 sm:p-8 mb-4 sm:mb-6"
        >
          <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6">
            {/* Profile Picture */}
            <Avatar
              profilePic={profile?.profilePic}
              username={profile?.username || 'User'}
              size="xl"
              showOnlineIndicator={true}
            />

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2 justify-center md:justify-start">
                <UserIcon className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 dark:text-purple-400" />
                {profile?.username}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-2">{profile?.email}</p>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 flex items-center gap-2 justify-center md:justify-start">
                <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Member since </span>
                {profile?.joinedAt ? new Date(profile.joinedAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long' }) : 'N/A'}
              </p>
              {!editMode && profile?.bio && (
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mt-3 italic line-clamp-2 sm:line-clamp-none">"{profile.bio}"</p>
              )}
            </div>

            {/* Edit/Logout Buttons */}
            <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
              {!editMode ? (
                <>
                  <Button
                    onClick={() => setEditMode(true)}
                    variant="primary"
                    text="Edit"
                    className="flex-1 sm:flex-none bg-purple-600 hover:bg-purple-700 text-white text-sm sm:text-base"
                  />
                  <Button
                    onClick={logout}
                    variant="ghost"
                    text=""
                    startIcon={<LogOutIcon className="w-4 h-4" />}
                    className="flex-1 sm:flex-none text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 border border-red-300 dark:border-red-700"
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
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setEditMode(false);
                      setProfilePicUrl(profile?.profilePic || "");
                      setBio(profile?.bio || "");
                      setImagePreview(null);
                    }}
                    className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium flex items-center gap-2 transition-all"
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
                <label className="block text-sm font-medium bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself... What makes you unique?"
                  rows={4}
                  maxLength={500}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none transition-all"
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-6 mb-4 sm:mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-lg shadow-lg p-3 sm:p-6 cursor-default border border-yellow-200 dark:border-yellow-900/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-medium">Brain Power</p>
                <p className="text-2xl sm:text-4xl font-bold text-yellow-600 dark:text-yellow-400 mt-1 sm:mt-2 flex items-center gap-1">
                  {profile?.brainPower || 0}
                </p>
              </div>
              <FireIcon className="w-8 h-8 sm:w-12 sm:h-12 text-yellow-500 opacity-20" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-lg shadow-lg p-3 sm:p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-medium">Total Saves</p>
                <p className="text-2xl sm:text-4xl font-bold text-purple-600 dark:text-purple-400 mt-1 sm:mt-2">
                  {profile?.contentCount || 0}
                </p>
              </div>
              <ArchiveIcon className="w-8 h-8 sm:w-12 sm:h-12 text-purple-600 dark:text-purple-400 opacity-20" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-lg shadow-lg p-3 sm:p-6 cursor-pointer hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-medium">Followers</p>
                <p className="text-2xl sm:text-4xl font-bold text-green-600 dark:text-green-400 mt-1 sm:mt-2">
                  {followersCount}
                </p>
              </div>
              <UserIcon className="w-8 h-8 sm:w-12 sm:h-12 text-green-600 dark:text-green-400 opacity-20" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-lg shadow-lg p-3 sm:p-6 cursor-pointer hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-medium">Following</p>
                <p className="text-2xl sm:text-4xl font-bold text-orange-600 dark:text-orange-400 mt-1 sm:mt-2">
                  {followingCount}
                </p>
              </div>
              <UserIcon className="w-8 h-8 sm:w-12 sm:h-12 text-orange-600 dark:text-orange-400 opacity-20" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-lg shadow-lg p-3 sm:p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-medium">Unique Tags</p>
                <p className="text-2xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400 mt-1 sm:mt-2">
                  {profile?.totalTags || 0}
                </p>
              </div>
              <TagIcon className="w-8 h-8 sm:w-12 sm:h-12 text-blue-600 dark:text-blue-400 opacity-20" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-lg shadow-lg p-3 sm:p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-medium">Content Types</p>
                <p className="text-2xl sm:text-4xl font-bold text-green-600 dark:text-green-400 mt-1 sm:mt-2">
                  {profile?.typeBreakdown?.length || 0}
                </p>
              </div>
              <ChartBarIcon className="w-8 h-8 sm:w-12 sm:h-12 text-green-600 dark:text-green-400 opacity-20" />
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Type Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-lg shadow-lg p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Content by Type</span><span className="sm:hidden">By Type</span>
              </h2>
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
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
            className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-lg shadow-lg p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <TagIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Most Used Tags</span><span className="sm:hidden">Top Tags</span>
              </h2>
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
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
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 lg:col-span-2"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
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
