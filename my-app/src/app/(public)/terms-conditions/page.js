import PageBreadcrumb from "@/components/shared/PageBreadcrumb";

export const metadata = {
  title: "Terms & Conditions | SBS Groups",
  description: "The terms governing your use of the SBS Groups website and services.",
};

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    body: `By accessing or using this website, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use this site.`,
  },
  {
    title: "2. Use of Content",
    body: `All product catalogues, specifications, images, and other content on this site are provided for B2B procurement and informational purposes. You may not reproduce, resell, or redistribute this content without our prior written consent.`,
  },
  {
    title: "3. Quotations & Orders",
    body: `Prices, availability, and specifications shown on this site are indicative and subject to confirmation once you submit a Request for Quote (RFQ). Final pricing, lead times, and terms are confirmed directly with our sales team before any order is placed.`,
  },
  {
    title: "4. Accuracy of Information",
    body: `We make reasonable efforts to keep product information accurate and up to date, but we do not guarantee that all details, images, or specifications are free of error at all times. Please confirm critical specifications with us before making purchasing decisions.`,
  },
  {
    title: "5. Intellectual Property",
    body: `All trademarks, logos, and brand names referenced on this site belong to their respective owners. Content created by SBS Groups — including text, graphics, and design — is our property and protected by applicable intellectual property laws.`,
  },
  {
    title: "6. Limitation of Liability",
    body: `SBS Groups is not liable for any indirect, incidental, or consequential damages arising from the use of this website or reliance on information provided on it, to the extent permitted by law.`,
  },
  {
    title: "7. Third-Party Links",
    body: `This site may link to third-party websites for your convenience. We are not responsible for the content, accuracy, or practices of those external sites.`,
  },
  {
    title: "8. Changes to These Terms",
    body: `We may revise these Terms & Conditions from time to time. Continued use of the site after changes are posted constitutes acceptance of the updated terms.`,
  },
  {
    title: "9. Governing Law",
    body: `These terms are governed by the laws applicable in the jurisdiction where SBS Groups is registered, without regard to conflict-of-law principles.`,
  },
  {
    title: "10. Contact Us",
    body: `If you have questions about these Terms & Conditions, please reach out through our Contact page.`,
  },
];

export default function TermsConditionsPage() {
  return (
    <div className="bg-white min-h-screen">
      <PageBreadcrumb
        pageKey="terms-conditions"
        title="Terms & Conditions"
        items={[{ label: "Terms & Conditions" }]}
      />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <p className="text-sm text-slate-400 mb-8">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

        <p className="text-slate-600 mb-8">
          Welcome to Superb Bearing Store (SBS Groups). By accessing or using our website
          and services, you agree to comply with and be bound by the following terms and
          conditions.
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
