import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Blog() {
  const [stories, setStories] = useState([]);

  useEffect(() => {
    fetch('/api/stories').then(res => res.json()).then(data => {
      if(Array.isArray(data) && data.length > 0) setStories(data);
      else setStories([
        { _id: 1, title: 'How We Saved 1000kg Food', content: 'Our journey in Gorakhpur started with a single restaurant...', author: 'Refoodify Team', date: new Date().toISOString() },
        { _id: 2, title: '5 Tips to Reduce Kitchen Waste', content: 'Simple habits can make a huge difference in your daily life...', author: 'Green Earth', date: new Date().toISOString() }
      ]);
    });
  }, []);

  return (
    <>
      <Header />
      <main className="min-h-screen py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-black text-center text-gray-800 mb-12">Stories of Change</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {stories.map(story => (
              <div key={story._id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all">
                <div className="h-56 bg-gray-200">
                  <img src={`https://source.unsplash.com/random/800x600/?nature,food&sig=${story._id}`} alt="Blog" className="w-full h-full object-cover" />
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase">Impact</span>
                    <span className="text-xs text-gray-400">{new Date(story.date || story.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">{story.title}</h3>
                  <p className="text-gray-600 mb-6 line-clamp-3">{story.content}</p>
                  <div className="flex items-center justify-between border-t pt-4">
                    <p className="text-sm font-bold text-gray-500">By {story.author}</p>
                    <button className="text-primary font-bold text-sm hover:underline">Read Full Story →</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}