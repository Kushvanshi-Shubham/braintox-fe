import { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "./button";
import { Input } from "./Input";
import axios from "axios";
import { BACKEND_URL } from "../../config";
import { motion, AnimatePresence } from "framer-motion";
import { CrossIcon } from "../../Icons/IconsImport";
import { SparklesIcon, BoltIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { detectContentType, type ContentType } from "../../utlis/contentTypeDetection";
import { triggerContentUpdate } from "../../utlis/events";

interface CreateContentModalProps {
  open: boolean;
  onClose: () => void;
  refreshContent: () => void;
}

interface AiSuggestion {
  suggestedTitle: string;
  suggestedType?: string;
  tags: string[];
  summary: string;
  ai: boolean;
}

export function CreateContentModal({ open, onClose, refreshContent }: Readonly<CreateContentModalProps>) {
  const titleRef = useRef<HTMLInputElement>(null);
  const linkRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const [type, setType] = useState<ContentType>("article");
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tags state (user can edit/remove each tag)
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // AI-generated summary pre-fills the notes field
  const [notes, setNotes] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState<AiSuggestion | null>(null);

  const resetForm = useCallback(() => {
    if (titleRef.current) titleRef.current.value = "";
    if (linkRef.current) linkRef.current.value = "";
    setType("article");
    setLoading(false);
    setAiLoading(false);
    setError(null);
    setTags([]);
    setTagInput("");
    setNotes("");
    setAiSuggestion(null);
  }, []);

  // Auto-detect content type from URL
  const handleLinkChange = (url: string) => {
    if (url) setType(detectContentType(url));
  };

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      linkRef.current?.focus();
      const handleEscape = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.body.style.overflow = "";
        document.removeEventListener("keydown", handleEscape);
        resetForm();
      };
    }
  }, [open, onClose, resetForm]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) onClose();
  };

  // ── AI Suggest ──────────────────────────────────────────────────────────────
  const handleAiSuggest = async () => {
    const link = linkRef.current?.value.trim();
    if (!link) {
      setError("Paste a URL first, then click AI Suggest.");
      return;
    }
    try { new URL(link); } catch {
      setError("Enter a valid URL before using AI Suggest.");
      return;
    }

    setError(null);
    setAiLoading(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        `${BACKEND_URL}/api/v1/ai/extract`,
        { url: link },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAiSuggestion(data);
      // Auto-fill title if empty
      if (titleRef.current && !titleRef.current.value.trim()) {
        titleRef.current.value = data.suggestedTitle;
      }
      // Auto-fill content type if the AI detected one
      if (data.suggestedType) {
        setType(data.suggestedType as ContentType);
      }
      // Pre-fill tags (replace existing)
      setTags(data.tags ?? []);
      // Pre-fill notes with AI summary
      if (data.summary) setNotes(data.summary);

      toast.success(data.ai ? "AI suggestions applied!" : "Smart suggestions applied!");
    } catch {
      toast.error("AI suggest failed. Fill in manually.");
    } finally {
      setAiLoading(false);
    }
  };

  // ── Tag management ───────────────────────────────────────────────────────────
  const addTag = (value: string) => {
    const cleaned = value.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, "");
    if (cleaned && !tags.includes(cleaned) && tags.length < 10) {
      setTags(prev => [...prev, cleaned]);
    }
    setTagInput("");
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      setTags(prev => prev.slice(0, -1));
    }
  };

  // ── Submit ───────────────────────────────────────────────────────────────────
  async function addContent() {
    setError(null);
    const title = titleRef.current?.value.trim();
    const link = linkRef.current?.value.trim();

    if (!title || !link) {
      setError("Title and link are required.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication error. Please log in again.");
        setLoading(false);
        return;
      }

      await axios.post(
        `${BACKEND_URL}/api/v1/content`,
        { link, type, title, tags, notes: notes.trim() || undefined },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Content added successfully!");
      triggerContentUpdate();
      refreshContent();
      onClose();
    } catch (err) {
      console.error("Failed to add content:", err);
      setError("Failed to add content. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          onClick={handleOverlayClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <motion.div
            className="absolute inset-0 bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
          <motion.div
            ref={modalRef}
            className="relative z-20 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg mx-auto border border-gray-200 dark:border-gray-700 overflow-hidden"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            role="document"
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-700">
              <h2 id="modal-title" className="text-xl font-bold text-gray-900 dark:text-white">
                Add New Content
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <CrossIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-2.5 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {/* URL + AI Suggest row */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                  URL *
                </label>
                <div className="flex gap-2">
                  <Input
                    ref={linkRef}
                    placeholder="https://..."
                    onChange={(e) => handleLinkChange(e.target.value)}
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleAiSuggest}
                    disabled={aiLoading}
                    title="Auto-fill title, tags and summary using AI"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold whitespace-nowrap
                      bg-gradient-to-r from-violet-500 to-purple-600
                      hover:from-violet-600 hover:to-purple-700
                      text-white shadow-md hover:shadow-lg
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-all duration-200 active:scale-95"
                  >
                    {aiLoading ? (
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <SparklesIcon className="h-4 w-4" />
                    )}
                    {aiLoading ? "..." : "AI"}
                  </button>
                </div>
                {aiSuggestion && (
                  <p className="mt-1.5 text-xs text-purple-600 dark:text-purple-400 flex items-center gap-1">
                    {aiSuggestion.ai ? <><SparklesIcon className="w-3.5 h-3.5" /> Powered by Gemini AI</> : <><BoltIcon className="w-3.5 h-3.5" /> Smart suggestions applied</>}
                  </p>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                  Title *
                </label>
                <Input ref={titleRef} placeholder="Content title..." />
              </div>

              {/* Content Type */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                  Type
                  <span className="ml-2 normal-case font-normal text-purple-500 dark:text-purple-400">
                    (auto-detected: {type})
                  </span>
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as ContentType)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                >
                  <optgroup label="Social Media">
                    <option value="youtube">YouTube</option>
                    <option value="twitter">Twitter / X</option>
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="reddit">Reddit</option>
                    <option value="facebook">Facebook</option>
                    <option value="pinterest">Pinterest</option>
                  </optgroup>
                  <optgroup label="Media">
                    <option value="spotify">Spotify</option>
                    <option value="soundcloud">SoundCloud</option>
                    <option value="vimeo">Vimeo</option>
                    <option value="twitch">Twitch</option>
                  </optgroup>
                  <optgroup label="Dev & Writing">
                    <option value="github">GitHub</option>
                    <option value="codepen">CodePen</option>
                    <option value="medium">Medium</option>
                    <option value="article">Article</option>
                  </optgroup>
                  <optgroup label="Other">
                    <option value="video">Video</option>
                    <option value="resource">Resource</option>
                    <option value="other">Other</option>
                  </optgroup>
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                  Tags
                  <span className="ml-2 normal-case font-normal text-gray-400">press Enter or comma to add</span>
                </label>
                <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 min-h-[44px] focus-within:ring-2 focus-within:ring-purple-500">
                  {tags.map(tag => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300"
                    >
                      #{tag}
                      <button
                        onClick={() => setTags(prev => prev.filter(t => t !== tag))}
                        className="hover:text-red-500 transition-colors leading-none"
                        aria-label={`Remove tag ${tag}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    onBlur={() => tagInput && addTag(tagInput)}
                    placeholder={tags.length === 0 ? "e.g. javascript, tutorial..." : ""}
                    className="flex-1 min-w-[100px] bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Notes (AI summary pre-fills this) */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                  Notes
                  {aiSuggestion?.summary && (
                    <span className="ml-2 normal-case font-normal text-purple-500 inline-flex items-center gap-0.5"><SparklesIcon className="w-3 h-3" /> AI summary</span>
                  )}
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Why are you saving this? (optional)"
                  maxLength={1000}
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none text-sm resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <Button
                variant="primary"
                text="Save"
                size="md"
                onClick={addContent}
                loading={loading}
                loadingText="Saving..."
                disabled={loading}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
