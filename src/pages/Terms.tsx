import { Link } from "react-router-dom";
import { SEOHead } from "../components/SEOHead";

const CONTACT_EMAIL = "support@braintox.com";

export default function Terms() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-200 px-4 py-12">
      <SEOHead title="Terms of Service" description="The terms for using Braintox." path="/terms" />
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="text-2xl font-bold gradient-text">Braintox</Link>
        <h1 className="text-3xl font-bold mt-6 mb-2 text-gray-900 dark:text-white">Terms of Service</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Last updated: June 2026</p>

        <div className="space-y-6 leading-relaxed text-[15px]">
          <p>By using Braintox (the "Service"), you agree to these Terms. If you do not agree, please do not use the Service.</p>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Your account</h2>
            <p>You are responsible for keeping your login credentials and API keys secure, and for all activity under your account. You must provide accurate information and be at least 13 years old.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Acceptable use</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Don't use the Service for illegal activity, spam, or to infringe others' rights.</li>
              <li>Don't attempt to disrupt, abuse, or reverse-engineer the Service.</li>
              <li>Don't save or share content that is unlawful or violates others' privacy or IP.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Your content</h2>
            <p>You retain ownership of the content you save. You grant us the limited right to store and display it back to you (and to others only where you choose to make it public, e.g., shared collections or your public profile).</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Plans &amp; payment</h2>
            <p>Braintox offers a free tier and a paid Pro plan. Paid features, limits, and pricing may change; we'll give reasonable notice of material changes. Fees are non-refundable except where required by law.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Service availability</h2>
            <p>The Service is provided "as is" and may change or have downtime. We don't guarantee uninterrupted availability.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Termination</h2>
            <p>You may stop using the Service at any time. We may suspend or terminate accounts that violate these Terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Disclaimer &amp; liability</h2>
            <p>To the maximum extent permitted by law, Braintox is not liable for indirect or consequential damages arising from your use of the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Changes</h2>
            <p>We may update these Terms; continued use after changes means you accept them.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Contact</h2>
            <p>Questions? Email <a className="text-purple-600 dark:text-purple-400" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
          </section>
        </div>

        <p className="mt-10 text-xs text-gray-400 dark:text-gray-500">
          This is a general template provided for convenience and is not legal advice. Review and adapt it with a professional before relying on it.
        </p>
      </div>
    </div>
  );
}
