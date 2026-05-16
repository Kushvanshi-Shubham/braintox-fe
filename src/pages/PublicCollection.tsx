import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { SEOHead } from "../components/SEOHead";
import { LinkIcon } from "@heroicons/react/24/outline";

interface PublicCollectionData {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  owner: { _id: string; username: string; profilePic?: string };
  contentCount: number;
  content: {
    _id: string;
    title: string;
    link: string;
    type: string;
    tags: { _id: string; name: string }[];
    createdAt: string;
  }[];
  createdAt: string;
}

export default function PublicCollection() {
  const { id } = useParams<{ id: string }>();
  const [collection, setCollection] = useState<PublicCollectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetch() {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/v1/public/collection/${id}`);
        setCollection(res.data);
      } catch {
        setError("Collection not found or is private");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetch();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
        <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Link to="/" className="font-semibold gradient-text">Go Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
      <SEOHead
        title={`${collection.name} — Collection`}
        description={collection.description || `A curated collection by ${collection.owner.username} on Braintox.`}
        path={`/collection/${collection.id}/public`}
      />

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold gradient-text">Braintox</Link>
          <Link
            to="/signup"
            className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-2xl sm:rounded-3xl text-sm font-bold uppercase tracking-wider text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/25 transition-all"
          >
            Join Braintox
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">{collection.icon}</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{collection.name}</h1>
              {collection.description && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">{collection.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <Link to={`/@${collection.owner.username}`} className="font-semibold text-purple-600 hover:underline">
              @{collection.owner.username}
            </Link>
            <span>·</span>
            <span>{collection.contentCount} bookmarks</span>
          </div>
        </motion.div>

        {/* Content Grid */}
        <div className="space-y-3">
          {collection.content.map((item, i) => (
            <motion.a
              key={item._id}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="block p-5 sm:p-6 rounded-2xl sm:rounded-3xl glass-panel border border-gray-200/50 dark:border-gray-700/50 hover:border-purple-300 dark:hover:border-purple-700 transition-all hover:shadow-lg hover:-translate-y-1 group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 truncate">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 truncate">
                    <LinkIcon className="w-3 h-3 inline mr-1" />
                    {new URL(item.link).hostname}
                  </p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 capitalize shrink-0">
                  {item.type}
                </span>
              </div>
              {item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {item.tags.map((tag) => (
                    <span key={tag._id} className="text-[10px] sm:text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full font-bold uppercase tracking-wider bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 border border-purple-200/50 dark:border-purple-800/30">
                      #{tag.name}
                    </span>
                  ))}
                </div>
              )}
            </motion.a>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center py-12 mt-8 border-t border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
            Build your own <span className="gradient-text">collections</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Organize your bookmarks with AI-powered tagging.</p>
          <Link
            to="/signup"
            className="inline-block px-8 py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/25 transition-all"
          >
            Get Started Free
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
