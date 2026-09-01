import PageBreadcrumb from "@/components/shared/PageBreadcrumb";

export const metadata = {
  title: "Privacy Policy | SBS Groups",
  description: "How SBS Groups collects, uses, and protects your information.",
};

const SECTIONS = [
  {
    title: "1. Information We Collect",
    body: `We collect information you provide directly to us — for example, when you request a quote (RFQ), fill out our contact form, subscribe to our newsletter, or create an account. This can include your name, company name, email address, phone number, and any details you include in a message or product enquiry.

We also automatically collect limited technical information when you browse our site, such as your browser type, device type, and pages visited, to help us understand how the site is used and to keep it running reliably.`,
  },
  {
    title: "2. How We Use Your Information",
    body: `We use the information we collect to:
• Respond to enquiries, quote requests, and support questions
• Process and fulfil RFQs and orders
• Send you updates, brochures, or newsletters you've opted in to
• Improve our products, catalogue, and website
• Meet legal and regulatory obligations

We do not sell your personal information to third parties.`,
  },
  {
    title: "3. Sharing of Information",
    body: `We may share information with trusted service providers who help us operate our business — for example, email delivery, hosting, or analytics providers — under obligations to keep it confidential. We may also disclose information where required by law, or to protect the rights, property, or safety of SBS Groups, our customers, or others.`,
  },
  {
    title: "4. Cookies",
    body: `Our website may use cookies or similar technologies to remember preferences and understand how visitors use the site. You can control cookies through your browser settings; disabling them may affect some site functionality.`,
  },
  {
    title: "5. Data Retention & Security",
    body: `We retain personal information only for as long as needed for the purposes described above, or as required by law. We use reasonable technical and organizational measures to protect your information, though no method of transmission or storage is completely secure.`,
  },
  {
    title: "6. Your Rights",
    body: `You may request access to, correction of, or deletion of your personal information, or ask us to stop sending you marketing communications at any time by contacting us using the details below.`,
  },
  {
    title: "7. Changes to This Policy",
    body: `We may update this Privacy Policy from time to time. Changes take effect once posted on this page, so we encourage you to review it periodically.`,
  },
  {
    title: "8. Contact Us",
    body: `If you have questions about this Privacy Policy or how your information is handled, please reach out through our Contact page.`,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-white min-h-screen">
      <PageBreadcrumb
        pageKey="privacy-policy"
        title="Privacy Policy"
        items={[{ label: "Privacy Policy" }]}
      />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <p className="text-sm text-slate-400 mb-8">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

        <p className="text-slate-600 mb-8">
          At Superb Bearing Store (SBS Groups), we value your privacy and are committed to
          protecting your personal information. This Privacy Policy explains what
          information we collect, how we use it, and the choices you have.
        </p>

        <div className="space-y-8">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-bold text-slate-900 mb-2">{section.title}</h2>
              <p className="text-slate-600 whitespace-pre-line leading-relaxed">{section.body}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
