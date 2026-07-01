import Header from '../components/Header';
import Footer from '../components/Footer';
import { FileText } from 'lucide-react';

export default function Terms() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <p className="page-kicker justify-center mb-4">Legal</p>
            <h1 className="section-heading">Terms & Conditions</h1>
            <p className="section-copy max-w-2xl mx-auto mt-4">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none bg-white dark:bg-slate-900/50 p-8 rounded-3xl border border-slate-200 dark:border-slate-800">
            <h2>1. Acceptance of Terms</h2>
            <p>By accessing or using the Refoodify platform, you agree to be bound by these Terms and Conditions. If you disagree with any part of the terms, you may not access the service.</p>

            <h2>2. Food Safety Disclaimer</h2>
            <p>Refoodify acts as a facilitator to connect food donors with recipients (NGOs). We do not handle, inspect, or transport the food ourselves. Therefore:</p>
            <ul>
              <li><strong>Donors</strong> are solely responsible for ensuring that the food they donate is fresh, hygienic, and safe for consumption. All food must comply with local food safety regulations.</li>
              <li><strong>Recipients (NGOs)</strong> are responsible for inspecting the food upon pickup and determining its suitability for distribution.</li>
            </ul>
            <p>Refoodify is not liable for any illness, injury, or other issues arising from the consumption of donated food.</p>

            <h2>3. User Conduct</h2>
            <p>You agree not to use the platform for any unlawful purpose or to solicit others to perform or participate in any unlawful acts. We reserve the right to terminate your use of the service for violating any of the prohibited uses.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}