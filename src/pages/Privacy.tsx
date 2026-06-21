import { Link } from "react-router-dom";
import { SEOHead } from "../components/SEOHead";

const CONTACT_EMAIL = "support@braintox.com";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-200 px-4 py-12">
      <SEOHead title="Privacy Policy" description="How Braintox collects, uses, and protects your data." path="/privacy" />
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="text-2xl font-bold gradient-text">Braintox</Link>
        <h1 className="text-3xl font-bold mt-6 mb-2 text-gray-900 dark:text-white">Privacy Policy</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Last updated: June 2026</p>

        <div className="space-y-6 leading-relaxed text-[15px]">
          <p>This Privacy Policy explains how Braintox ("we", "us") collects, uses, and protects your information when you use our website, app, and browser extension (the "Service").</p>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Information we collect</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Account information:</strong> your username, email address, and password (stored hashed). If you sign in with Google, we receive your name, email, and profile picture.</li>
              <li><strong>Content you save:</strong> the URLs, titles, tags, and notes you add to your account.</li>
              <li><strong>Usage data:</strong> basic activity needed to operate the Service (e.g., counts of saved items).</li>
              <li><strong>Browser extension:</strong> when you save a page, the extension reads the active tab's URL and title and stores an API key locally in your browser to talk to your account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">How we use your information</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>To provide and operate the Service (saving, organizing, and displaying your content).</li>
              <li>To generate tag and summary suggestions for links you save.</li>
              <li>To send account-related and (if you opt in) digest emails.</li>
              <li>To maintain security and prevent abuse.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Third-party services</h2>
            <p>We rely on trusted providers to run the Service: cloud database hosting (MongoDB Atlas), application hosting (Render, Vercel), Google (for optional sign-in and AI suggestions), and an email provider for transactional emails. These providers process data only to deliver their function.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Data storage &amp; security</h2>
            <p>Passwords are hashed, and access to your data is restricted to your account. We use industry-standard measures to protect your information, though no method of transmission or storage is 100% secure.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Your choices</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>You can edit your profile and saved content at any time.</li>
              <li>You can opt out of digest emails in your settings.</li>
              <li>To request deletion of your account and associated data, contact us at the address below.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Children</h2>
            <p>Braintox is not directed to children under 13, and we do not knowingly collect their data.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Changes to this policy</h2>
            <p>We may update this policy from time to time. Material changes will be reflected by the "Last updated" date above.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Contact</h2>
            <p>Questions about this policy? Email <a className="text-purple-600 dark:text-purple-400" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
          </section>
        </div>

        <p className="mt-10 text-xs text-gray-400 dark:text-gray-500">
          This is a general template provided for convenience and is not legal advice. Review and adapt it with a professional before relying on it.
        </p>
      </div>
    </div>
  );
}
