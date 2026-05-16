import { useEffect, useState, useMemo, memo } from "react";
import { motion } from "framer-motion";
import { useContent } from "../hooks/useContent";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/EmptyState";
import { FolderIcon } from "@heroicons/react/24/outline";
import { FilterSort } from "../components/ui/FilterSort";
import { ContentGridSkeleton } from "../components/ui/Skeleton";

// Local alias that works with both Content and ContentItem shapes
type ExportableContent = {
  _id: string;
  title: string;
  link: string;
  type: string;
  tags?: Array<string | { name: string }>;
  createdAt?: string;
  notes?: string;
};

// ── Export to Markdown ────────────────────────────────────────────────────────
function exportToMarkdown(contents: ExportableContent[]) {
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  // Group by first tag (or "Uncategorised")
  const groups = new Map<string, ExportableContent[]>();
  for (const c of contents) {
    const tag = c.tags?.[0] ? (typeof c.tags[0] === "string" ? c.tags[0] : c.tags[0].name) : "Uncategorised";
    if (!groups.has(tag)) groups.set(tag, []);
    groups.get(tag)!.push(c);
  }

  const lines: string[] = [
    `# My Knowledge Base`,
    ``,
    `> Exported from Braintox on ${date}`,
    `> ${contents.length} saved items`,
    ``,
  ];

  for (const [tag, items] of [...groups.entries()].sort()) {
    lines.push(`## #${tag}`, ``);
    for (const item of items) {
      lines.push(`### [${item.title}](${item.link})`);
      lines.push(`- **Type:** ${item.type}`);
      if (item.tags && item.tags.length > 0) {
  const tagNames = item.tags.map(t => `#${typeof t === "string" ? t : t.name}`).join(" ");
        lines.push(`- **Tags:** ${tagNames}`);
      }
      if (item.createdAt) {
        lines.push(`- **Saved:** ${new Date(item.createdAt).toLocaleDateString()}`);
      }
      if (item.notes) {
        lines.push(`- **Notes:** ${item.notes}`);
      }
      lines.push(``);
    }
  }

  const blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `braintox-export-${new Date().toISOString().slice(0, 10)}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

function Dashboard() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showFavorites, setShowFavorites] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const { contents, loading, error, refresh } = useContent();

  // Extract unique tags from all content
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    for (const content of contents) {
      if (content.tags) {
        for (const tag of content.tags) {
          const tagName = typeof tag === 'string' ? tag : tag.name;
          if (tagName) tagSet.add(tagName);
        }
      }
    }
    return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
  }, [contents]);

  // Debounce search input to avoid excessive re-renders
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const filteredContents = useMemo(() => {
    const searchLower = debouncedSearch.toLowerCase();
    
    const filtered = contents
      .filter(c => !debouncedSearch || c.title.toLowerCase().includes(searchLower))
      .filter(c => typeFilter === "all" || c.type === typeFilter)
      .filter(c => {
        if (selectedTag === "all") return true;
        return c.tags?.some(tag => {
          const tagName = typeof tag === 'string' ? tag : tag.name;
          return tagName === selectedTag;
        });
      })
      .filter(c => !showFavorites || c.isFavorite)
      .filter(c => showArchived ? c.isArchived : !c.isArchived);

    // Sort
    if (sortBy === "newest") {
      return filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    } else if (sortBy === "oldest") {
      return filtered.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
    } else if (sortBy === "title") {
      return filtered.sort((a, b) => a.title.localeCompare(b.title));
    }
    return filtered;
  }, [contents, debouncedSearch, typeFilter, selectedTag, sortBy, showFavorites, showArchived]);

  return (
    <div className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
      <motion.div
        className="max-w-7xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Search Bar + Export */}
        <div className="mb-4 sm:mb-6 flex gap-3 items-start">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search your saved content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-2xl sm:rounded-3xl border border-gray-200/50 dark:border-gray-700/50 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all shadow-sm hover:shadow-md text-sm sm:text-base"
            />
            <p className="mt-1 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
              Search through your personal saved content only
            </p>
          </div>
          {contents.length > 0 && (
            <button
              onClick={() => exportToMarkdown(filteredContents)}
              title="Export visible content as Markdown"
              className="flex items-center gap-1.5 px-4 sm:px-5 py-3 sm:py-4 rounded-2xl sm:rounded-3xl border border-gray-200/50 dark:border-gray-700/50 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl text-gray-700 dark:text-gray-300 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 hover:border-purple-400/50 hover:text-purple-600 dark:hover:text-purple-400 transition-all text-sm font-semibold whitespace-nowrap shadow-sm hover:shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              <span className="hidden sm:inline">Export .md</span>
            </button>
          )}
        </div>

        {/* Tag Filter */}
        {availableTags.length > 0 && (
          <div className="mb-4 sm:mb-6 glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-5">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 sm:mb-4">
              Filter by Tag
            </h3>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              <button
                onClick={() => setSelectedTag("all")}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-semibold transition-all shadow-sm ${
                  selectedTag === "all"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-purple-500/25"
                    : "bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700"
                }`}
              >
                All ({contents.length})
              </button>
              {availableTags.map((tag) => {
                const count = contents.filter(c => 
                  c.tags?.some(t => (typeof t === 'string' ? t : t.name) === tag)
                ).length;
                return (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-semibold transition-all shadow-sm ${
                      selectedTag === tag
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-purple-500/25"
                        : "bg-purple-50/80 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 border border-purple-100 dark:border-purple-800/30"
                    }`}
                  >
                    #{tag} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Filter & Sort */}
        <FilterSort
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          showFavorites={showFavorites}
          setShowFavorites={setShowFavorites}
          showArchived={showArchived}
          setShowArchived={setShowArchived}
        />

        {/* Content Display */}
        {loading && (
          <ContentGridSkeleton count={8} />
        )}
        
        {!loading && error && (
          <div className="text-center mt-20 text-red-500 dark:text-red-400">
            Error: {error}
          </div>
        )}
        
        {!loading && !error && contents.length === 0 && (
          <EmptyState 
            icon={<FolderIcon className="w-full h-full" />}
            title="Your brain is empty"
            description="Save your first link to start building your personal knowledge base."
          />
        )}
        
        {!loading && !error && contents.length > 0 && filteredContents.length === 0 && (
          <div className="text-center mt-20">
            <p className="text-lg font-medium text-gray-500 dark:text-gray-400">
              No content matches your search.
            </p>
            <p className="mt-2 text-sm">Try a different keyword!</p>
          </div>
        )}
        
        {!loading && !error && filteredContents.length > 0 && (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6"
          >
            {filteredContents.map((content) => (
              <Card
                key={content._id}
                content={{ ...content, tags: content.tags || [] }}
                refresh={refresh}
              />
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default memo(Dashboard);
