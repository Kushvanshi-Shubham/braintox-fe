import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import { BACKEND_URL } from "../config";
import { Spinner } from "../components/ui/Spinner";
import { SearchIcon, CalendarIcon, ShareIcon } from "../Icons/IconsImport";
import type { Content, DiscoveryData, SearchFilters } from "../types";
import { getPlatformMeta, type ContentType } from "../utlis/contentTypeDetection";
import { PlatformIcon } from "../utlis/PlatformIcon";
import { FireIcon, MagnifyingGlassIcon, ChartBarIcon, CubeIcon, HashtagIcon, ClockIcon } from "@heroicons/react/24/outline";
import { cn } from "../utlis/cn";

const Explore = () => {
  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') || '';
  const urlTag = searchParams.get('tag') || '';
  
  const [activeTab, setActiveTab] = useState<"discover" | "search">((urlQuery || urlTag) ? "search" : "discover");
  
  // Discovery state
  const [discoveryData, setDiscoveryData] = useState<DiscoveryData | null>(null);
  const [discoveryLoading, setDiscoveryLoading] = useState(true);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState(urlQuery);
  const [searchResults, setSearchResults] = useState<Content[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({ types: [], tags: [] });
  const [selectedType, setSelectedType] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>(urlTag ? [urlTag] : []);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch Discovery Data
  useEffect(() => {
    if (activeTab === "discover") {
      fetchDiscoveryData();
    }
  }, [activeTab]);

  // Fetch Search Filters
  useEffect(() => {
    if (activeTab === "search") {
      fetchSearchFilters();
    }
  }, [activeTab]);

  // Debounced Search
  useEffect(() => {
    if (activeTab === "search") {
      const timer = setTimeout(() => {
        void performSearch();
      }, 500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedType, selectedTags, startDate, endDate, currentPage, activeTab]);

  const fetchDiscoveryData = async () => {
    try {
      setDiscoveryLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;
      
      const { data } = await axios.get(`${BACKEND_URL}/api/v1/discovery/feed`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDiscoveryData(data);
    } catch (error) {
      console.error("Failed to fetch discovery data:", error);
      toast.error("Failed to load discovery feed");
    } finally {
      setDiscoveryLoading(false);
    }
  };

  const fetchSearchFilters = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      const { data } = await axios.get(`${BACKEND_URL}/api/v1/search/filters`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFilters(data);
    } catch (error) {
      console.error("Failed to fetch filters:", error);
    }
  };

  const performSearch = async () => {
    try {
      setSearchLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;
      
      const params: Record<string, unknown> = {
        page: currentPage,
        limit: 12,
        ...(searchQuery && { query: searchQuery }),
        ...(selectedType && { type: selectedType }),
        ...(selectedTags.length && { tags: selectedTags.join(",") }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      };

      const { data } = await axios.get(`${BACKEND_URL}/api/v1/search`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      setSearchResults(data.results || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Search failed:", error);
      toast.error("Search failed");
    } finally {
      setSearchLoading(false);
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
    setCurrentPage(1);
  };

  return (
    <div className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
      <div className="max-w-7xl mx-auto">{" "}
        {/* Header */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
            Explore
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Discover insights and search your content
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 border-b border-gray-200/50 dark:border-gray-700/50 overflow-x-auto">
          <button
            onClick={() => setActiveTab("discover")}
            className={cn(
              "px-4 sm:px-6 py-2.5 sm:py-3 font-semibold transition-all relative flex items-center gap-1.5 sm:gap-2 whitespace-nowrap text-sm sm:text-base",
              activeTab === "discover"
                ? "text-purple-600 dark:text-purple-400"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            )}
          >
            <FireIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            Discover
            {activeTab === "discover" && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 dark:bg-purple-400"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab("search")}
            className={cn(
              "px-4 sm:px-6 py-2.5 sm:py-3 font-semibold transition-all relative flex items-center gap-1.5 sm:gap-2 whitespace-nowrap text-sm sm:text-base",
              activeTab === "search"
                ? "text-purple-600 dark:text-purple-400"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            )}
          >
            <MagnifyingGlassIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            Search
            {activeTab === "search" && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 dark:bg-purple-400"
              />
            )}
          </button>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "discover" ? (
            <motion.div
              key="discover"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {discoveryLoading ? (
                <div className="flex justify-center items-center py-20">
                  <Spinner />
                </div>
              ) : discoveryData ? (
                <div className="space-y-4 sm:space-y-6">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="glass border border-purple-200/50 dark:border-purple-800/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg"
                    >
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
                        <ChartBarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                        Activity Overview
                      </h3>
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">This Week</span>
                          <span className="text-xl sm:text-2xl font-bold gradient-text">
                            {discoveryData.weeklyContent}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">This Month</span>
                          <span className="text-xl sm:text-2xl font-bold gradient-text">
                            {discoveryData.monthlyContent}
                          </span>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                      className="glass border border-purple-200/50 dark:border-purple-800/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg"
                    >
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
                        <CubeIcon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                        Rediscover
                      </h3>
                      {discoveryData.randomItem ? (
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">
                            {discoveryData.randomItem.title}
                          </h4>
                          <a
                            href={discoveryData.randomItem.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-purple-600 dark:text-purple-400 hover:underline line-clamp-1"
                          >
                            {discoveryData.randomItem.link}
                          </a>
                          <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: getPlatformMeta(discoveryData.randomItem.type as ContentType).color }}>
                            <PlatformIcon type={discoveryData.randomItem.type as ContentType} className="w-3 h-3" /> {discoveryData.randomItem.type}
                          </span>
                        </div>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400">No content to rediscover yet</p>
                      )}
                    </motion.div>
                  </div>

                  {/* Type Breakdown */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                    className="glass border border-purple-200/50 dark:border-purple-800/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg"
                  >
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                      Content by Type
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                      {discoveryData.typeBreakdown.map((item) => (
                        <div
                          key={item._id}
                          className="glass border border-gray-200/50 dark:border-gray-700/50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center"
                        >
                          <div className="flex justify-center mb-1 sm:mb-2">
                            <PlatformIcon type={item._id as ContentType} className="w-6 h-6 sm:w-8 sm:h-8" />
                          </div>
                          <div className="text-lg sm:text-2xl font-bold gradient-text">
                            {item.count}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 capitalize truncate">
                            {item._id}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Tag Cloud */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.3 }}
                    className="glass border border-purple-200/50 dark:border-purple-800/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg"
                  >
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
                      <HashtagIcon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                      Popular Tags
                    </h3>
                    {discoveryData.tagStats.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {discoveryData.tagStats.map((tag) => (
                          <button
                            key={tag._id}
                            onClick={() => {
                              setActiveTab("search");
                              setSelectedTags([tag.name]);
                              setSearchQuery("");
                            }}
                            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-xs sm:text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors cursor-pointer"
                            title={`Filter by ${tag.name}`}
                          >
                            #{tag.name} ({tag.count})
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No tags found. Start tagging your content!</p>
                    )}
                  </motion.div>

                  {/* On This Day */}
                  {discoveryData.onThisDay.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.3 }}
                      className="glass border border-purple-200/50 dark:border-purple-800/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg"
                    >
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
                        <ClockIcon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                        On This Day
                      </h3>
                      <div className="space-y-2 sm:space-y-3">
                        {discoveryData.onThisDay.map((item) => (
                          <div
                            key={item._id}
                            className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                          >
                            <div className="text-xl sm:text-2xl flex">
                              <PlatformIcon type={item.type as ContentType} className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm sm:text-base text-gray-900 dark:text-white line-clamp-1">
                                {item.title}
                              </h4>
                              <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs sm:text-sm text-purple-600 dark:text-purple-400 hover:underline line-clamp-1"
                              >
                                {item.link}
                              </a>
                              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">
                                {new Date(item.createdAt || Date.now()).getFullYear()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              ) : null}
            </motion.div>
          ) : (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Search Bar */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 shadow-lg mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <div className="flex-1 relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search with filters..."
                      className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                    />
                  </div>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                      showFilters
                        ? "bg-purple-600 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                    }`}
                  >
                    Filters {showFilters ? "▲" : "▼"}
                  </button>
                </div>
                <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                  Search across all platform content with advanced filtering options
                </p>

                {/* Filters Panel */}
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4"
                  >
                    {/* Type Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Content Type
                      </label>
                      <select
                        value={selectedType}
                        onChange={(e) => { setSelectedType(e.target.value); setCurrentPage(1); }}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">All Types</option>
                        {filters.types.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Tags Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tags
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {filters.tags.map((tag) => (
                          <button
                            key={tag._id}
                            onClick={() => toggleTag(tag._id)}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                              selectedTags.includes(tag._id)
                                ? "bg-purple-600 text-white"
                                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                            }`}
                          >
                            #{tag.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Search Results */}
              {searchLoading ? (
                <div className="flex justify-center items-center py-20">
                  <Spinner />
                </div>
              ) : searchResults.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {searchResults.map((item) => (
                      <motion.div
                        key={item._id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                      >
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: getPlatformMeta(item.type as ContentType).color }}>
                              <PlatformIcon type={item.type as ContentType} className="w-3 h-3" /> {item.type}
                            </span>
                          </div>
                          <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                            {item.title}
                          </h3>
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 mb-3 line-clamp-1"
                          >
                            <ShareIcon className="w-4 h-4 flex-shrink-0" />
                            <span className="line-clamp-1">{item.link}</span>
                          </a>
                          {item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {item.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag._id}
                                  className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded text-xs"
                                >
                                  #{tag.name}
                                </span>
                              ))}
                              {item.tags.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                                  +{item.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <CalendarIcon className="w-4 h-4" />
                            {new Date(item.createdAt || Date.now()).toLocaleDateString()}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Previous
                      </button>
                      <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    No results found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Try adjusting your search or filters
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Explore;
