import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

export default function Blog() {
  const [stories, setStories] = useState([]);

  useEffect(() => {
    fetch('/api/stories').then(res => res.json()).then(data => {
      if(Array.isArray(data) && data.length > 0) setStories(data);
      else setStories([
        { _id: 1, title: 'How We Saved 1000kg of Food in Gorakhpur', content: 'Our journey in Gorakhpur started with a single restaurant partner. Within a month, we scaled to over 50 partners, redirecting thousands of meals from landfills to hungry mouths. This is the story of community power.', author: 'Refoodify Team', date: new Date().toISOString(), category: 'Impact' },
        { _id: 2, title: '5 Simple Tips to Reduce Your Kitchen Waste Today', content: 'Simple habits can make a huge difference in your daily life. From smart shopping to creative leftover recipes, discover how you can contribute to a zero-waste world right from your home.', author: 'Green Earth Initiative', date: new Date(Date.now() - 86400000 * 5).toISOString(), category: 'Lifestyle' }
      ]);
    });
  }, []);

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <p className="page-kicker justify-center mb-4">Our Blog</p>
            <h1 className="section-heading">Stories of Change</h1>
            <p className="section-copy max-w-2xl mx-auto mt-4">Insights, impact stories, and news from the front lines of food rescue.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {stories.map((story, i) => (
              <motion.div 
                key={story._id} 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="premium-card p-0 overflow-hidden group"
              >
                <div className="h-56 bg-gray-200 overflow-hidden">
                  <img src={`https://source.unsplash.com/random/800x600/?community,food&sig=${story._id}`} alt="Blog" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-8 flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full uppercase dark:bg-emerald-900/50 dark:text-emerald-300">{story.category || 'Impact'}</span>
                    <span className="text-xs text-slate-400">{new Date(story.date || story.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 flex-grow">{story.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-6 line-clamp-3">{story.content}</p>
                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 mt-auto">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                      <p className="text-sm font-bold text-slate-600 dark:text-slate-300">{story.author}</p>
                    </div>
                    <button className="text-primary font-bold text-sm hover:underline">Read More →</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}