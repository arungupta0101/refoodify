import Header from '../components/Header';
import Footer from '../components/Footer';
import { ShieldCheck } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <p className="page-kicker justify-center mb-4">Legal</p>
            <h1 className="section-heading">Privacy Policy</h1>
            <p className="section-copy max-w-2xl mx-auto mt-4">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none bg-white dark:bg-slate-900/50 p-8 rounded-3xl border border-slate-200 dark:border-slate-800">
            <h2>1. Introduction</h2>
            <p>Welcome to Refoodify. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.</p>

            <h2>2. Data We Collect</h2>
            <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
            <ul>
              <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
              <li><strong>Contact Data</strong> includes email address and telephone numbers.</li>
              <li><strong>Location Data</strong> includes your address, city, and pincode to facilitate food pickups and deliveries.</li>
              <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website.</li>
            </ul>

            <h2>3. How We Use Your Data</h2>
            <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
            <ul>
              <li>To register you as a new user.</li>
              <li>To connect you with NGOs or donors for food rescue operations.</li>
              <li>To manage our relationship with you which will include notifying you about changes to our terms or privacy policy.</li>
            </ul>

            <h2>4. Data Deletion</h2>
            <p>You have the right to request the deletion of your personal data. You can delete your account directly from your <strong>Profile page</strong> by using the "Delete My Account" button. Alternatively, you can contact us at <a href="mailto:admin@refoodify.com">admin@refoodify.com</a> to request data deletion. We will process your request within 7 business days.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}