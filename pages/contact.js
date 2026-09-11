import Header from '../components/Header';
import Footer from '../components/Footer';
import { Mail, Phone, Clock } from 'lucide-react';

export default function Contact() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <p className="page-kicker justify-center mb-4">Get in touch</p>
            <h1 className="section-heading">Contact Us</h1>
            <p className="section-copy max-w-2xl mx-auto mt-4">Have a question, partnership idea, or just want to say hello? We’d love to hear from you.</p>
          </div>

          <div className="grid gap-10 lg:grid-cols-2">
            <section className="premium-card p-8 sm:p-10">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Send us a message</h2>
              <form className="space-y-6">
                <div>
                  <label className="field-label">Name</label>
                  <input type="text" placeholder="Your name" className="premium-input px-4 py-3" />
                </div>
                <div>
                  <label className="field-label">Email</label>
                  <input type="email" placeholder="you@example.com" className="premium-input px-4 py-3" />
                </div>
                <div>
                  <label className="field-label">Message</label>
                  <textarea placeholder="How can we help?" className="premium-textarea px-4 py-3" rows="5"></textarea>
                </div>
                <button type="submit" className="premium-button w-full">
                  Send Message
                </button>
              </form>
            </section>

            <aside className="space-y-8">
              <div className="premium-card p-8 sm:p-10">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Direct Contact</h2>
                <div className="space-y-5 text-slate-600 dark:text-slate-300">
                  <p className="flex items-center gap-3"><Mail className="w-5 h-5 text-primary" /> support@refoodify.com</p>
                  <p className="flex items-center gap-3"><Phone className="w-5 h-5 text-primary" /> +918303255423</p>
                  <p className="flex items-center gap-3"><Clock className="w-5 h-5 text-primary" /> Response within 24 hours</p>
                </div>
              </div>
              <div className="premium-card p-8 sm:p-10">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Our Office</h2>
                <p className="text-slate-600 dark:text-slate-300">
                  Buddha Institute of Technology, Gorakhpur, Uttar Pradesh, India - 273209
                </p>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}