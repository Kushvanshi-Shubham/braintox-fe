import { useState, useRef } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { BACKEND_URL } from "../config";
import { cn } from "../utlis/cn";
import {
  ArrowUpTrayIcon,
  DocumentTextIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

interface ParsedBookmark {
  title: string;
  url: string;
  tags: string[];
  selected: boolean;
}

function parseBookmarkHTML(html: string): ParsedBookmark[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const links = doc.querySelectorAll("a");
  const bookmarks: ParsedBookmark[] = [];

  links.forEach((link) => {
    const url = link.getAttribute("href");
    const title = link.textContent?.trim();

    if (url && title && url.startsWith("http")) {
      // Extract folder names as tags from parent DL/DT structure
      const tags: string[] = [];
      let parent = link.parentElement;
      while (parent) {
        if (parent.tagName === "DT") {
          const prevH3 = parent.parentElement?.querySelector(":scope > dt > h3");
          if (prevH3 && prevH3.textContent) {
            const tag = prevH3.textContent.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, "");
            if (tag && !tags.includes(tag)) {
              tags.push(tag);
            }
          }
        }
        parent = parent.parentElement;
      }

      bookmarks.push({
        title: title.slice(0, 200),
        url,
        tags: tags.slice(0, 5),
        selected: true,
      });
    }
  });

  return bookmarks;
}

export default function ImportBookmarks() {
  const [bookmarks, setBookmarks] = useState<ParsedBookmark[]>([]);
  const [importing, setImporting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [result, setResult] = useState<{
    imported: number;
    skipped: number;
    total: number;
  } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function processFile(file: File) {
    if (!file.name.endsWith(".html") && !file.name.endsWith(".htm")) {
      toast.error("Please upload an HTML bookmark file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const html = e.target?.result as string;
      const parsed = parseBookmarkHTML(html);
      if (parsed.length === 0) {
        toast.error("No bookmarks found in this file.");
        return;
      }
      setBookmarks(parsed);
      setResult(null);
      toast.success(`Found ${parsed.length} bookmarks!`);
    };
    reader.readAsText(file);
  }

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    processFile(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  function toggleBookmark(index: number) {
    setBookmarks((prev) =>
      prev.map((b, i) => (i === index ? { ...b, selected: !b.selected } : b))
    );
  }

  function selectAll() {
    setBookmarks((prev) => prev.map((b) => ({ ...b, selected: true })));
  }

  function deselectAll() {
    setBookmarks((prev) => prev.map((b) => ({ ...b, selected: false })));
  }

  async function handleImport() {
    const selected = bookmarks.filter((b) => b.selected);
    if (selected.length === 0) {
      toast.error("No bookmarks selected for import.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in first.");
      return;
    }

    setImporting(true);
    try {
      const response = await axios.post(
        BACKEND_URL + "/api/v1/import/bookmarks",
        {
          bookmarks: selected.map((b) => ({
            title: b.title,
            url: b.url,
            tags: b.tags,
          })),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setResult(response.data);
      toast.success(response.data.message);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data?.message || "Import failed.");
      } else {
        toast.error("Import failed. Please try again.");
      }
    } finally {
      setImporting(false);
    }
  }

  const selectedCount = bookmarks.filter((b) => b.selected).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
          Import <span className="gradient-text">Bookmarks</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Import bookmarks from Chrome, Firefox, or any browser that exports
          HTML bookmark files.
        </p>

        {/* Upload Area */}
        {bookmarks.length === 0 && !result && (
          <motion.div
            className={cn(
              "border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer relative overflow-hidden",
              isDragging 
                ? "border-purple-500 bg-purple-100 dark:bg-purple-900/30 shadow-inner" 
                : "border-purple-300 dark:border-purple-700 hover:border-purple-500 dark:hover:border-purple-500 bg-white/50 dark:bg-purple-900/10 backdrop-blur-sm",
              "transition-all duration-300"
            )}
            whileHover={{ scale: 1.02 }}
            onClick={() => fileRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isDragging && <div className="absolute inset-0 bg-purple-500/10 animate-pulse pointer-events-none" />}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <ArrowUpTrayIcon className="w-16 h-16 mx-auto mb-4 text-purple-500 drop-shadow-md" />
            </motion.div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              Upload Bookmark File
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Drop your HTML bookmark file here or click to browse
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Export from: Chrome (⋮ → Bookmarks → Bookmark Manager → ⋮ →
              Export)
            </p>
            <input
              ref={fileRef}
              type="file"
              accept=".html,.htm"
              onChange={handleFileUpload}
              className="hidden"
            />
          </motion.div>
        )}

        {/* Bookmark List */}
        {bookmarks.length > 0 && !result && (
          <div>
            {/* Controls */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5 text-purple-500" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  {selectedCount} of {bookmarks.length} selected
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="text-sm px-3 py-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                >
                  Select All
                </button>
                <button
                  onClick={deselectAll}
                  className="text-sm px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Deselect All
                </button>
                <button
                  onClick={() => {
                    setBookmarks([]);
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                  className="text-sm px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Scrollable List */}
            <div className="max-h-96 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-700 mb-4">
              {bookmarks.map((bookmark, index) => (
                <div
                  key={index}
                  onClick={() => toggleBookmark(index)}
                  className={cn(
                    "flex items-center gap-3 p-3 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0",
                    bookmark.selected
                      ? "bg-purple-50 dark:bg-purple-900/10"
                      : "bg-white dark:bg-gray-900 opacity-60"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={bookmark.selected}
                    onChange={() => toggleBookmark(index)}
                    className="h-4 w-4 text-purple-600 rounded border-gray-300 dark:border-gray-600 focus:ring-purple-500 cursor-pointer flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {bookmark.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {bookmark.url}
                    </div>
                  </div>
                  {bookmark.tags.length > 0 && (
                    <div className="flex gap-1 flex-shrink-0">
                      {bookmark.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Import Button */}
            <button
              onClick={handleImport}
              disabled={importing || selectedCount === 0}
              className={cn(
                "w-full py-3 rounded-xl font-semibold text-white transition-all duration-200",
                "bg-gradient-to-r from-purple-600 to-pink-600",
                "hover:from-purple-700 hover:to-pink-700",
                "active:scale-[0.98]",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {importing
                ? "Importing..."
                : `Import ${selectedCount} Bookmark${selectedCount !== 1 ? "s" : ""}`}
            </button>
          </div>
        )}

        {/* Result */}
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "p-8 rounded-2xl text-center",
              "bg-green-50 dark:bg-green-900/10",
              "border border-green-200 dark:border-green-800/30"
            )}
          >
            <CheckCircleIcon className="w-16 h-16 mx-auto mb-4 text-green-600 dark:text-green-400" />
            <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              Import Complete!
            </h3>
            <div className="text-gray-600 dark:text-gray-400 space-y-1 mb-6">
              <p>
                <span className="font-semibold text-green-600">{result.imported}</span>{" "}
                bookmarks imported
              </p>
              {result.skipped > 0 && (
                <p>
                  <span className="font-semibold text-yellow-600">{result.skipped}</span>{" "}
                  duplicates skipped
                </p>
              )}
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  setBookmarks([]);
                  setResult(null);
                  if (fileRef.current) fileRef.current.value = "";
                }}
                className="px-6 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Import More
              </button>
              <a
                href="/dashboard"
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                Go to Dashboard
              </a>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
