import { CONTACT_EMAIL } from "@/config/branding";
import { ContactLinkInline } from "./contact-link-inline";

export function LegalContactSection() {
  return (
    <>
      <h2>Contact Us</h2>
      <p>
        For questions about these policies, billing, or your account, reach us at{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> or on WhatsApp.
      </p>
      <ContactLinkInline
        linkClassName="text-neutral-700 hover:text-neutral-900"
      />
    </>
  );
}
