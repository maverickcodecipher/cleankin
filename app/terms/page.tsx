import Link from "next/link";

export const metadata = {
  title: "Terms of Service — CleanKin Chennai",
  description: "Terms of service for CleanKin Chennai Civic Cleanup Network.",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-6">Terms of Service</h1>
      <p className="text-slate-600 mb-4">
        Last updated: 2026. CleanKin is a civic cleanup network dedicated to community action across Chennai.
      </p>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-2">1. Acceptance of Terms</h2>
        <p className="text-slate-600">
          By using CleanKin, you agree to these terms. If you do not agree, please do not use our platform.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-2">2. Use of the Platform</h2>
        <p className="text-slate-600">
          CleanKin is intended for reporting dump spots, organizing cleanup drives, and tracking civic cleanup
          progress across Chennai. Users must use the platform responsibly and not for any unlawful purposes.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-2">3. User Responsibilities</h2>
        <p className="text-slate-600">
          Users are responsible for maintaining the accuracy of their information and for any actions taken
          under their account. CleanKin does not provide medical or nursing services.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-2">4. Disclaimer</h2>
        <p className="text-slate-600">
          CleanKin provides this platform on an "as is" basis without warranties of any kind. We are not
          responsible for the accuracy or reliability of user-submitted content.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-2">5. Limitation of Liability</h2>
        <p className="text-slate-600">
          In no event shall CleanKin be liable for any indirect, incidental, or consequential damages
          arising from the use of this platform.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-2">6. Changes to Terms</h2>
        <p className="text-slate-600">
          We reserve the right to modify these terms at any time. Changes will be posted on this page.
        </p>
      </section>

      <div className="mt-10">
        <Link href="/" className="text-lg font-bold underline" style={{ color: '#0D5C75' }}>
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
}
