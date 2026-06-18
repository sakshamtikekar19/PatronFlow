import type { Metadata } from "next";
import { BRAND } from "@/config/branding";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "June 2026";

  return (
    <article className="prose prose-neutral max-w-none">
      <h1>Privacy Policy</h1>
      <p className="lead">
        Last updated: {lastUpdated}
      </p>

      <p>
        {BRAND.name} (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates the {BRAND.name} platform
        (the &ldquo;Service&rdquo;). This Privacy Policy explains how we collect, use, disclose, and safeguard
        your information when you use our Service.
      </p>

      <h2>1. Information We Collect</h2>

      <h3>1.1 Information You Provide</h3>
      <p>We collect information you provide directly to us, including:</p>
      <ul>
        <li><strong>Account Information:</strong> Email address, password, restaurant name</li>
        <li><strong>Restaurant Information:</strong> Business name, logo, cuisine type, Google review URL</li>
        <li><strong>Customer Data:</strong> Names, phone numbers, email addresses, and birthdays of your restaurant&apos;s customers</li>
        <li><strong>Feedback Data:</strong> Customer ratings, comments, and feedback categories</li>
        <li><strong>Event Data:</strong> Event details and RSVP information</li>
        <li><strong>Payment Information:</strong> Billing details processed through our payment providers (Stripe, Razorpay, PayPal)</li>
      </ul>

      <h3>1.2 Information Collected Automatically</h3>
      <p>When you use our Service, we automatically collect:</p>
      <ul>
        <li>Log data (IP address, browser type, access times)</li>
        <li>Device information</li>
        <li>Usage data and analytics</li>
        <li>QR code scan analytics</li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <p>We use the information we collect to:</p>
      <ul>
        <li>Provide, maintain, and improve our Service</li>
        <li>Process transactions and send related information</li>
        <li>Send technical notices, updates, and support messages</li>
        <li>Respond to your comments and questions</li>
        <li>Monitor and analyze usage patterns</li>
        <li>Detect, prevent, and address technical issues</li>
        <li>Protect against fraudulent or illegal activity</li>
      </ul>

      <h2>3. Data Sharing and Disclosure</h2>
      <p>We may share your information in the following circumstances:</p>
      <ul>
        <li><strong>Service Providers:</strong> With third-party vendors who perform services on our behalf (hosting, payment processing, analytics)</li>
        <li><strong>Legal Requirements:</strong> When required by law or to respond to legal process</li>
        <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
        <li><strong>With Your Consent:</strong> When you have given us permission to share</li>
      </ul>

      <h3>3.1 Third-Party Services</h3>
      <p>Our Service integrates with:</p>
      <ul>
        <li><strong>Supabase:</strong> Database and authentication services</li>
        <li><strong>Stripe:</strong> International payment processing</li>
        <li><strong>Razorpay:</strong> Indian payment processing (UPI, cards)</li>
        <li><strong>PayPal:</strong> Alternative international payments</li>
        <li><strong>Vercel:</strong> Hosting and deployment</li>
      </ul>

      <h2>4. Data Retention</h2>
      <p>
        We retain your information for as long as your account is active or as needed to provide you services.
        We will retain and use your information as necessary to comply with legal obligations, resolve disputes,
        and enforce our agreements.
      </p>
      <ul>
        <li><strong>Account Data:</strong> Retained until account deletion</li>
        <li><strong>Customer Data:</strong> Retained until you delete it or close your account</li>
        <li><strong>Payment Records:</strong> Retained for 7 years for tax and legal compliance</li>
        <li><strong>Log Data:</strong> Retained for 90 days</li>
      </ul>

      <h2>5. Data Security</h2>
      <p>
        We implement appropriate technical and organizational measures to protect your personal information,
        including:
      </p>
      <ul>
        <li>Encryption in transit (TLS/HTTPS) and at rest</li>
        <li>Row-level security in our database</li>
        <li>Regular security assessments</li>
        <li>Access controls and authentication</li>
        <li>Secure payment processing through PCI-compliant providers</li>
      </ul>

      <h2>6. Your Rights</h2>

      <h3>6.1 General Rights</h3>
      <p>You have the right to:</p>
      <ul>
        <li>Access the personal information we hold about you</li>
        <li>Correct inaccurate or incomplete information</li>
        <li>Delete your account and associated data</li>
        <li>Export your data in a portable format</li>
        <li>Object to or restrict certain processing</li>
        <li>Withdraw consent where applicable</li>
      </ul>

      <h3>6.2 India Digital Personal Data Protection (DPDP) Act</h3>
      <p>For users in India, in accordance with the DPDP Act 2023:</p>
      <ul>
        <li>You have the right to access and correct your personal data</li>
        <li>You can request deletion of your personal data (subject to legal retention requirements)</li>
        <li>You can nominate another person to exercise your rights in case of death or incapacity</li>
        <li>We will notify you of any data breaches that may cause you significant harm</li>
      </ul>

      <h3>6.3 GDPR Rights (EU/EEA Users)</h3>
      <p>If you are located in the European Union or European Economic Area:</p>
      <ul>
        <li>You have the right to data portability</li>
        <li>You can object to automated decision-making</li>
        <li>You can lodge a complaint with a supervisory authority</li>
      </ul>

      <h2>7. Children&apos;s Privacy</h2>
      <p>
        Our Service is not intended for individuals under 18 years of age. We do not knowingly collect
        personal information from children. If we become aware that a child has provided us with
        personal information, we will take steps to delete such information.
      </p>

      <h2>8. International Data Transfers</h2>
      <p>
        Your information may be transferred to and processed in countries other than your country of residence.
        These countries may have different data protection laws. We ensure appropriate safeguards are in place
        for such transfers.
      </p>

      <h2>9. Cookies and Tracking</h2>
      <p>
        We use essential cookies for authentication and session management. We do not use third-party
        advertising cookies. You can configure your browser to refuse cookies, but this may limit
        your ability to use our Service.
      </p>

      <h2>10. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will notify you of any changes by posting
        the new Privacy Policy on this page and updating the &ldquo;Last updated&rdquo; date. You are advised
        to review this Privacy Policy periodically.
      </p>
    </article>
  );
}
