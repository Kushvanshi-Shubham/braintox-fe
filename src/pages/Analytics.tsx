import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { SEOHead } from "../components/SEOHead";
import {
  ChartBarIcon,
  TagIcon,
  FolderIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface OverviewData {
  totalLinks: number;
  totalCollections: number;
  totalTags: number;
  typeBreakdown: { _id: string; count: number }[];
  topTags: { name: string; count: number }[];
}

interface ActivityData {
  activity: { date: string; count: number }[];
}

export default function Analytics() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [activity, setActivity] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      axios.get(`${BACKEND_URL}/api/v1/analytics/overview`, { headers }),
      axios.get(`${BACKEND_URL}/api/v1/analytics/activity`, { headers }),
    ])
      .then(([overviewRes, activityRes]) => {
        setOverview(overviewRes.data);
        setActivity(activityRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  const totalSaves30d = activity ? activity.activity.reduce((sum, d) => sum + d.count, 0) : 0;

  const statCards = overview
    ? [
        { label: "Total Links", value: overview.totalLinks, icon: LinkIcon, color: "purple" },
        { label: "Collections", value: overview.totalCollections, icon: FolderIcon, color: "pink" },
        { label: "Unique Tags", value: overview.totalTags, icon: TagIcon, color: "blue" },
        { label: "Saves (30d)", value: totalSaves30d, icon: ChartBarIcon, color: "green" },
      ]
    : [];

  const colorMap: Record<string, string> = {
    purple: "from-purple-500 to-purple-600",
    pink: "from-pink-500 to-pink-600",
    blue: "from-blue-500 to-blue-600",
    green: "from-emerald-500 to-emerald-600",
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <SEOHead title="Analytics" description="Your Braintox usage analytics and activity." path="/analytics" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
          Your <span className="gradient-text">Analytics</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Track your knowledge-building activity.</p>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative overflow-hidden rounded-3xl p-6 glass border border-purple-100 dark:border-gray-700/50 shadow-lg group hover:shadow-xl transition-all"
            >
              <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${colorMap[stat.color]} opacity-[0.08] group-hover:scale-110 transition-transform duration-500`} />
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${colorMap[stat.color]} bg-opacity-10 text-white shadow-inner`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <p className="text-4xl font-bold text-gray-900 dark:text-white mb-1 tracking-tight">{stat.value.toLocaleString()}</p>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Activity Chart */}
        {activity && (
          <div className="rounded-3xl p-6 md:p-8 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 shadow-lg backdrop-blur-sm mb-8 relative overflow-hidden">
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
              <ChartBarIcon className="w-6 h-6 text-purple-500" />
              30-Day Activity
            </h2>
            
            {activity.activity.reduce((sum, d) => sum + d.count, 0) === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <ChartBarIcon className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600" />
                <p className="text-lg font-medium">No activity in the last 30 days</p>
                <p className="text-sm">Start saving links to see your stats grow!</p>
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={activity.activity}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(156, 163, 175, 0.2)" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      minTickGap={30}
                    />
                    <YAxis 
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        color: '#fff'
                      }}
                      labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#a855f7" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorCount)" 
                      activeDot={{ r: 6, strokeWidth: 0, fill: '#ec4899' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Content Type & Top Tags */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Type Breakdown */}
          {overview && overview.typeBreakdown.length > 0 && (
            <div className="rounded-xl p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Content Types</h2>
              <div className="space-y-3">
                {overview.typeBreakdown.map((type) => {
                  const pct = Math.round((type.count / overview.totalLinks) * 100);
                  return (
                    <div key={type._id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 dark:text-gray-300 capitalize">{type._id}</span>
                        <span className="text-gray-500">{type.count} ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Top Tags */}
          {overview && overview.topTags.length > 0 && (
            <div className="rounded-xl p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Top Tags</h2>
              <div className="flex flex-wrap gap-2">
                {overview.topTags.map((tag) => (
                  <span
                    key={tag.name}
                    className="px-3 py-1.5 rounded-full text-sm font-medium bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/30"
                  >
                    #{tag.name}
                    <span className="ml-1 text-xs text-purple-400">({tag.count})</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
