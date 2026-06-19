import type { Metadata } from "next";
import { BRAND } from "@/config/branding";
import { BILLING_CONFIG } from "@/lib/billing/config";
import { LegalContactSection } from "@/components/contact/legal-contact-section";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function TermsOfServicePage() {
  const lastUpdated = "June 2026";

  return (
    <article className="prose prose-neutral max-w-none">
      <h1>Terms of Service</h1>
      <p className="lead">
        Last updated: {lastUpdated}
      </p>

      <p>
        Please read these Terms of Service (&ldquo;Terms&rdquo;) carefully before using the {BRAND.name} platform
        (the &ldquo;Service&rdquo;) operated by {BRAND.name} (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;).
      </p>

      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any
        part of the Terms, you may not access the Service.
      </p>

      <h2>2. Description of Service</h2>
      <p>
        {BRAND.name} is a restaurant management platform that provides:
      </p>
      <ul>
        <li>Customer feedback collection and management</li>
        <li>Google review generation tools</li>
        <li>Customer database management</li>
        <li>Loyalty program management</li>
        <li>Event management and RSVPs</li>
        <li>QR code analytics</li>
        <li>Guest recovery workflows</li>
      </ul>

      <h2>3. Account Registration</h2>
      <h3>3.1 Eligibility</h3>
      <p>
        You must be at least 18 years old and have the legal authority to bind the restaurant or business
        entity you represent to use our Service.
      </p>

      <h3>3.2 Account Security</h3>
      <p>
        You are responsible for safeguarding your account credentials and for all activities that occur
        under your account. You must notify us immediately of any unauthorized access.
      </p>

      <h3>3.3 Accurate Information</h3>
      <p>
        You agree to provide accurate, current, and complete information during registration and to update
        such information to keep it accurate.
      </p>

      <h2>4. Free Trial</h2>
      <h3>4.1 Trial Period</h3>
      <p>
        New accounts receive a {BILLING_CONFIG.trialDays}-day free trial with full access to all features.
        No credit card is required to start the trial.
      </p>

      <h3>4.2 Trial Limitations</h3>
      <p>
        During the trial period, you may use all features of the Service. At the end of the trial,
        you must subscribe to continue using the Service.
      </p>

      <h3>4.3 Trial Expiration</h3>
      <p>
        If you do not subscribe before your trial ends, your access to the dashboard and features will
        be restricted. Your data will be retained for 30 days after trial expiration, after which it
        may be deleted.
      </p>

      <h2>5. Subscription and Billing</h2>
      <h3>5.1 Subscription Plans</h3>
      <p>
        We offer subscription plans with monthly billing. Current pricing is available on our billing page.
        We reserve the right to change pricing with 30 days&apos; notice.
      </p>

      <h3>5.2 Payment Methods</h3>
      <p>We accept the following payment methods:</p>
      <ul>
        <li>Credit and debit cards (via Stripe)</li>
        <li>UPI payments (India, via Razorpay)</li>
        <li>Net banking (India, via Razorpay)</li>
        <li>PayPal (international)</li>
      </ul>

      <h3>5.3 Billing Cycle</h3>
      <p>
        Subscriptions are billed monthly on the anniversary of your subscription start date.
        You authorize us to charge your payment method on each billing date.
      </p>

      <h3>5.4 Failed Payments</h3>
      <p>
        If a payment fails, we will attempt to charge your payment method again. After multiple failed
        attempts, your subscription may be suspended. You will have a {BILLING_CONFIG.gracePeriodDays}-day
        grace period to update your payment method.
      </p>

      <h2>6. Cancellation and Refunds</h2>
      <h3>6.1 Cancellation</h3>
      <p>
        You may cancel your subscription at any time through the billing page.
        Cancellation takes effect at the end of your current billing period.
      </p>

      <h3>6.2 Refund Policy</h3>
      <p>
        Subscription fees are non-refundable except as required by applicable law. If you cancel during
        a billing period, you will retain access until the end of that period but will not receive a
        prorated refund.
      </p>

      <h3>6.3 Exceptions</h3>
      <p>
        Refunds may be considered on a case-by-case basis for:
      </p>
      <ul>
        <li>Service outages exceeding 24 hours</li>
        <li>Billing errors on our part</li>
        <li>Duplicate charges</li>
      </ul>

      <h2>7. Data Ownership</h2>
      <h3>7.1 Your Data</h3>
      <p>
        You retain all rights to your data, including customer information, feedback, and business data.
        We do not claim ownership of your content.
      </p>

      <h3>7.2 License to Us</h3>
      <p>
        By using the Service, you grant us a limited license to use, store, and process your data solely
        to provide and improve the Service.
      </p>

      <h3>7.3 Data Export</h3>
      <p>
        You may export your data at any time through the settings page. We provide exports in standard
        formats (CSV, JSON).
      </p>

      <h2>8. Acceptable Use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the Service for any illegal purpose</li>
        <li>Upload malicious code or attempt to breach security</li>
        <li>Collect customer data without proper consent</li>
        <li>Send spam or unsolicited communications through our platform</li>
        <li>Impersonate another person or entity</li>
        <li>Interfere with the proper functioning of the Service</li>
        <li>Resell or redistribute the Service without authorization</li>
        <li>Use automated systems to access the Service without permission</li>
      </ul>

      <h2>9. Customer Data Responsibilities</h2>
      <h3>9.1 Your Obligations</h3>
      <p>When collecting customer data through our Service, you agree to:</p>
      <ul>
        <li>Obtain proper consent from your customers</li>
        <li>Comply with applicable data protection laws (GDPR, DPDP Act, etc.)</li>
        <li>Use customer data only for legitimate business purposes</li>
        <li>Maintain the confidentiality of customer information</li>
        <li>Honor customer requests for data access or deletion</li>
      </ul>

      <h3>9.2 Our Role</h3>
      <p>
        We act as a data processor for the customer data you collect. You are the data controller
        and are responsible for compliance with data protection regulations.
      </p>

      <h2>10. Intellectual Property</h2>
      <p>
        The Service, including its original content, features, and functionality, is owned by {BRAND.name}
        and is protected by intellectual property laws. Our trademarks may not be used without prior
        written consent.
      </p>

      <h2>11. Account Termination</h2>
      <h3>11.1 Termination by You</h3>
      <p>
        You may close your account at any time through the settings page. Upon closure, your subscription
        will be cancelled and your data will be deleted within 30 days.
      </p>

      <h3>11.2 Termination by Us</h3>
      <p>We may suspend or terminate your account if you:</p>
      <ul>
        <li>Violate these Terms</li>
        <li>Fail to pay subscription fees</li>
        <li>Engage in fraudulent activity</li>
        <li>Use the Service in a way that could harm us or other users</li>
      </ul>

      <h3>11.3 Effect of Termination</h3>
      <p>
        Upon termination, your right to use the Service immediately ceases. We may delete your data
        within 30 days of termination, unless retention is required by law.
      </p>

      <h2>12. Limitation of Liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, {BRAND.name.toUpperCase()} SHALL NOT BE LIABLE FOR ANY
        INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR
        REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY.
      </p>
      <p>
        OUR TOTAL LIABILITY FOR ANY CLAIMS ARISING FROM YOUR USE OF THE SERVICE SHALL NOT EXCEED THE
        AMOUNT YOU PAID US IN THE 12 MONTHS PRECEDING THE CLAIM.
      </p>

      <h2>13. Disclaimer of Warranties</h2>
      <p>
        THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY KIND,
        EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE,
        OR SECURE.
      </p>

      <h2>14. Indemnification</h2>
      <p>
        You agree to indemnify and hold harmless {BRAND.name} and its officers, directors, employees,
        and agents from any claims, damages, or expenses arising from your use of the Service or
        violation of these Terms.
      </p>

      <h2>15. Governing Law</h2>
      <p>
        These Terms shall be governed by and construed in accordance with the laws of India, without
        regard to its conflict of law provisions.
      </p>

      <h2>16. Dispute Resolution</h2>
      <p>
        Any disputes arising from these Terms or your use of the Service shall be resolved through
        arbitration in accordance with the Arbitration and Conciliation Act, 1996. The place of
        arbitration shall be [Your City], India.
      </p>

      <h2>17. Changes to Terms</h2>
      <p>
        We reserve the right to modify these Terms at any time. We will provide notice of significant
        changes by posting the new Terms on this page and updating the &ldquo;Last updated&rdquo; date.
        Your continued use of the Service after changes constitutes acceptance of the new Terms.
      </p>

      <h2>18. Severability</h2>
      <p>
        If any provision of these Terms is found to be unenforceable, the remaining provisions will
        continue in full force and effect.
      </p>

      <LegalContactSection />
    </article>
  );
}
