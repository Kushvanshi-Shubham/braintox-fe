import { Link, useNavigate } from "react-router-dom";
import { usePlan } from "../hooks/usePlan";

// Where upgrade requests go while billing is handled manually (pre-Stripe).
// Set VITE_UPGRADE_CONTACT_EMAIL in your env; falls back to a neutral address.
const UPGRADE_CONTACT_EMAIL =
  import.meta.env.VITE_UPGRADE_CONTACT_EMAIL || "braintox.app@gmail.com";

const FEATURES: { label: string; free: string; pro: string }[] = [
  { label: "Saved items", free: "100", pro: "Unlimited" },
  { label: "Collections", free: "3", pro: "Unlimited" },
  { label: "AI tags & summaries", free: "20 / month", pro: "Unlimited*" },
  { label: "Knowledge graph", free: "Preview", pro: "Full" },
  { label: "Analytics history", free: "7 days", pro: "Full" },
  { label: "API access", free: "—", pro: "✓" },
  { label: "Collaborators on collections", free: "—", pro: "✓" },
  { label: "Bookmark import", free: "—", pro: "✓" },
];

function Meter({ label, used, limit }: { label: string; used: number; limit: number | null }) {
  const unlimited = limit === null;
  const pct = unlimited || limit === 0 ? 0 : Math.min(100, Math.round((used / limit) * 100));
  const near = !unlimited && pct >= 80;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600 dark:text-gray-300">{label}</span>
        <span className="text-gray-500 dark:text-gray-400">
          {used}
          {unlimited ? "" : ` / ${limit}`}
        </span>
      </div>
      <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <div
          className={`h-full rounded-full ${near ? "bg-red-500" : "bg-purple-600"}`}
          style={{ width: `${unlimited ? 4 : pct}%` }}
        />
      </div>
    </div>
  );
}

export default function Pricing() {
  const navigate = useNavigate();
  const { plan, loading } = usePlan();
  const loggedIn = !!localStorage.getItem("token");
  const isPro = plan?.plan === "pro";

  const upgradeHref = `mailto:${UPGRADE_CONTACT_EMAIL}?subject=${encodeURIComponent(
    "Upgrade to Braintox Pro"
  )}&body=${encodeURIComponent(
    "Hi, I'd like to upgrade my Braintox account to Pro."
  )}`;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <Link to="/" className="text-2xl font-bold gradient-text">
            Braintox
          </Link>
          <h1 className="text-4xl font-bold mt-6 mb-2 text-gray-900 dark:text-white">
            Simple, honest pricing
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Start free. Upgrade when your brain outgrows it.
          </p>
        </div>

        {/* Current usage (logged-in users) */}
        {loggedIn && !loading && plan && (
          <div className="mb-10 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 dark:text-white">Your usage</h2>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isPro
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                {isPro ? "PRO" : "FREE"}
              </span>
            </div>
            <div className="grid sm:grid-cols-3 gap-5">
              <Meter label="Saves" used={plan.usage.saves} limit={plan.limits.maxSaves} />
              <Meter
                label="Collections"
                used={plan.usage.collections}
                limit={plan.limits.maxCollections}
              />
              <Meter label="AI this month" used={plan.usage.ai} limit={plan.limits.aiPerMonth} />
            </div>
          </div>
        )}

        {/* Plan cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Free */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-7">
            <div className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Free
            </div>
            <div className="text-4xl font-bold my-2 text-gray-900 dark:text-white">$0</div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Everything to get started.</p>
            {!loggedIn ? (
              <button
                onClick={() => navigate("/signup")}
                className="w-full py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Get started
              </button>
            ) : (
              <div className="w-full py-2.5 text-center text-sm text-gray-500 dark:text-gray-400">
                {isPro ? "Included in your plan" : "Your current plan"}
              </div>
            )}
          </div>

          {/* Pro */}
          <div className="rounded-2xl border-2 border-purple-500 bg-white dark:bg-gray-800 p-7 relative shadow-lg shadow-purple-500/10">
            <div className="absolute -top-3 left-7 bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
              MOST POPULAR
            </div>
            <div className="text-sm font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400">
              Pro
            </div>
            <div className="text-4xl font-bold my-2 text-gray-900 dark:text-white">
              $7<span className="text-base font-medium text-gray-500">/mo</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              Unlimited everything. For serious curators.
            </p>
            {isPro ? (
              <div className="w-full py-2.5 text-center font-medium text-amber-600 dark:text-amber-400">
                🎉 You're on Pro
              </div>
            ) : (
              <a
                href={upgradeHref}
                className="block w-full py-2.5 rounded-xl bg-purple-600 text-white font-medium text-center hover:bg-purple-700 transition-colors"
              >
                Upgrade to Pro
              </a>
            )}
          </div>
        </div>

        {/* Comparison */}
        <div className="mt-10 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/60">
              <tr>
                <th className="text-left font-medium px-5 py-3 text-gray-500 dark:text-gray-400">
                  Feature
                </th>
                <th className="px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">Free</th>
                <th className="px-5 py-3 text-purple-600 dark:text-purple-400 font-medium">Pro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {FEATURES.map((f) => (
                <tr key={f.label} className="bg-white dark:bg-gray-900/40">
                  <td className="px-5 py-3 text-gray-700 dark:text-gray-200">{f.label}</td>
                  <td className="px-5 py-3 text-center text-gray-500 dark:text-gray-400">{f.free}</td>
                  <td className="px-5 py-3 text-center font-medium text-gray-900 dark:text-white">
                    {f.pro}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 text-center">
          *Pro AI usage is subject to a generous fair-use limit.
        </p>
      </div>
    </div>
  );
}
