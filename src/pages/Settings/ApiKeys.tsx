import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import { BACKEND_URL } from "../../config";
import { SEOHead } from "../../components/SEOHead";
import { TrashIcon, PlusIcon, ClipboardIcon, KeyIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface ApiKey {
  _id: string;
  name: string;
  key?: string; // Only on creation
  lastUsed?: string;
  createdAt: string;
}

export default function ApiKeys() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyValue, setNewKeyValue] = useState("");

  const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };

  useEffect(() => {
    fetchKeys();
  }, []);

  async function fetchKeys() {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/v1/settings/api-keys`, { headers });
      setKeys(res.data.keys);
    } catch {
      toast.error("Failed to load API keys");
    } finally {
      setLoading(false);
    }
  }

  async function createKey() {
    if (!newKeyName.trim()) {
      toast.error("Please enter a key name");
      return;
    }
    setCreating(true);
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/v1/settings/api-keys`,
        { name: newKeyName },
        { headers }
      );
      setNewKeyValue(res.data.key);
      setNewKeyName("");
      fetchKeys();
      toast.success("API key created!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create key");
    } finally {
      setCreating(false);
    }
  }

  async function revokeKey(id: string) {
    try {
      await axios.delete(`${BACKEND_URL}/api/v1/settings/api-keys/${id}`, { headers });
      setKeys(keys.filter((k) => k._id !== id));
      toast.success("API key revoked");
    } catch {
      toast.error("Failed to revoke key");
    }
  }

  function copyKey(key: string) {
    navigator.clipboard.writeText(key);
    toast.success("Copied to clipboard!");
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <SEOHead title="API Keys" path="/settings/api-keys" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
          <KeyIcon className="w-8 h-8 inline-block mr-2 text-purple-500" />
          API <span className="gradient-text">Keys</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Use API keys to access Braintox programmatically. Keys are hashed — save them when created.
        </p>

        {/* Create new key */}
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="Key name (e.g., 'My Script')"
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <button
            onClick={createKey}
            disabled={creating}
            className="px-5 py-2.5 rounded-xl text-white font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Create
          </button>
        </div>

        {/* Newly created key (show once) */}
        {newKeyValue && (
          <div className="mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30">
            <p className="text-sm font-semibold text-green-800 dark:text-green-200 mb-2 flex items-center gap-1.5">
              <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" /> Save this key now — it won't be shown again!
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm bg-white dark:bg-gray-800 p-2 rounded-lg font-mono break-all">
                {newKeyValue}
              </code>
              <button
                onClick={() => copyKey(newKeyValue)}
                className="p-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-800/30"
              >
                <ClipboardIcon className="w-5 h-5 text-green-600" />
              </button>
            </div>
            <button
              onClick={() => setNewKeyValue("")}
              className="mt-2 text-sm text-green-600 hover:underline"
            >
              I've saved it — dismiss
            </button>
          </div>
        )}

        {/* Key list */}
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 mx-auto border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
          </div>
        ) : keys.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">No API keys yet.</p>
        ) : (
          <div className="space-y-3">
            {keys.map((key) => (
              <div
                key={key._id}
                className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
              >
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{key.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Created {new Date(key.createdAt).toLocaleDateString()}
                    {key.lastUsed && ` · Last used ${new Date(key.lastUsed).toLocaleDateString()}`}
                  </p>
                </div>
                <button
                  onClick={() => revokeKey(key._id)}
                  className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  title="Revoke key"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
