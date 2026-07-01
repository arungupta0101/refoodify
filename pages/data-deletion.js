import Header from '../components/Header';
import Footer from '../components/Footer';
import { Trash2, Mail } from 'lucide-react';

export default function DataDeletion() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <p className="page-kicker justify-center mb-4">Privacy</p>
            <h1 className="section-heading">User Data Deletion</h1>
            <p className="section-copy max-w-2xl mx-auto mt-4">
              We respect your privacy. Follow these instructions to permanently delete your account and all associated data from our platform.
            </p>
          </div>

          <div className="premium-card p-8 sm:p-10">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
              <Trash2 className="w-6 h-6 text-primary" />
              Deletion via Profile
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">The easiest way to delete your data is through your user profile:</p>
            <ol className="list-decimal list-inside space-y-4 ml-4 text-slate-700 dark:text-slate-200">
              <li>Log in to your <strong>Refoodify</strong> account.</li>
              <li>Navigate to your <strong>Profile</strong> page from the main menu.</li>
              <li>Scroll to the bottom to find the <strong>"Danger Zone"</strong> section.</li>
              <li>Click the red <strong>"Delete My Account"</strong> button.</li>
              <li>A confirmation prompt will appear. Confirm the action to permanently delete your account.</li>
            </ol>
          </div>

          <div className="premium-card p-8 sm:p-10 mt-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
              <Mail className="w-6 h-6 text-primary" />
              Manual Deletion Request
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              If you are unable to access your account, you can send an email to <strong className="text-primary">admin@refoodify.com</strong> from your registered email address with the subject "Account Deletion Request". We will process your request within 7 business days.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}