import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { FaInstagram, FaLinkedin, FaGithub, FaTwitter, FaLeaf, FaUsers, FaLightbulb, FaHandHoldingHeart } from 'react-icons/fa';

const teamMembers = [
  {
    name: 'Arun Gupta',
    role: 'Founder & Team Leader',
    bio: 'The visionary behind Refoodify. Arun conceived the idea to bridge the gap between food waste and hunger. He leads the technical development and strategy of the platform.',
    image: '/team/arun.jpg',
    social: {
      instagram: 'https://instagram.com/call_me_a.j.0',
      linkedin: 'https://www.linkedin.com/in/arun-gupta-35048220b',
      github: 'https://github.com/arungupta0101'
    }
  },
  {
    name: 'Shaily Gupta',
    role: 'Head of Research',
    bio: 'Shaily is the backbone of our data-driven approach. She conducted extensive research on food logistics and NGO requirements to ensure Refoodify solves real-world problems.',
    image: '/team/shaily.jpg',
    social: {
      instagram: 'https://instagram.com/shaily_dummy',
      linkedin: 'https://linkedin.com/in/shaily_dummy',
      github: 'https://github.com/shaily_dummy'
    }
  },
  {
    name: 'Shreya Patel',
    role: 'Marketing & Sustainability Expert',
    bio: 'Shreya focuses on growth and financial sustainability. She manages NGO partnerships and explores innovative earning models to keep the mission running.',
    image: '/team/shreya.jpg',
    social: {
      instagram: 'https://instagram.com/shreya_dummy',
      linkedin: 'https://linkedin.com/in/shreya_dummy',
      github: 'https://github.com/shreya_dummy'
    }
  },
  {
    name: 'Harshit Dwivedi',
    role: 'Creative Strategist',
    bio: 'Harshit is the creative strategist with a smart mind who always has a plan. He plays a pivotal role in marketing and fostering creative thinking within the team.',
    image: '/team/harshit.jpeg',
    social: {
      instagram: 'https://instagram.com/harshit_dummy',
      linkedin: 'https://linkedin.com/in/harshit_dummy',
      github: 'https://github.com/harshit_dummy'
    }
  }
];

const coreValues = [
  { icon: <FaLeaf />, title: "Sustainability", desc: "Committed to a zero-waste future." },
  { icon: <FaUsers />, title: "Community", desc: "Building strong local networks." },
  { icon: <FaLightbulb />, title: "Innovation", desc: "Smart tech for social good." },
  { icon: <FaHandHoldingHeart />, title: "Empathy", desc: "Driven by compassion for all." },
];

export default function About() {
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen pb-20">
        {/* Hero Section */}
        <section className="py-20 bg-primary text-white text-center px-4">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-extrabold mb-6"
          >
            About Refoodify
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="max-w-2xl mx-auto text-xl opacity-90"
          >
            Smart Food Donation & Expiry Tracking System. We are on a mission to ensure that no good meal goes to waste while people are hungry.
          </motion.p>
        </section>

        {/* Mission Section */}
        <section className="max-w-7xl mx-auto py-16 px-4 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed mb-4 text-lg">
              Refoodify was born out of a simple observation: millions of tons of food are wasted daily while millions go hungry. Our system uses smart tracking to notify donors before food expires and connects them with nearby NGOs in real-time.
            </p>
            <div className="flex gap-4 mt-8">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex-1 text-center">
                <h4 className="text-primary font-bold text-2xl">0%</h4>
                <p className="text-xs text-gray-500 uppercase">Food Waste Goal</p>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex-1 text-center">
                <h4 className="text-primary font-bold text-2xl">24/7</h4>
                <p className="text-xs text-gray-500 uppercase">Active Support</p>
              </div>
            </div>
          </div>
          <div className="bg-primary/5 rounded-3xl p-8 border-2 border-dashed border-primary/20">
            <h3 className="text-xl font-bold mb-4 text-primary">Why We Do It?</h3>
            <ul className="space-y-4">
              <li className="flex items-start">✅ <span className="ml-2 text-gray-700 font-medium text-lg italic">"Feeding people, not landfills."</span></li>
              <li className="flex items-start">✅ <span className="ml-2 text-gray-700 font-medium text-lg italic">"Connecting technology with humanity."</span></li>
            </ul>
          </div>
        </section>

        {/* Core Values Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Our Core Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {coreValues.map((val, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -10 }}
                  className="p-6 bg-gray-50 rounded-2xl text-center border border-gray-100 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="text-4xl text-primary mb-4 flex justify-center">{val.icon}</div>
                  <h3 className="font-bold text-xl mb-2">{val.title}</h3>
                  <p className="text-gray-600 text-sm">{val.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section with Scroll Animations */}
        <section className="max-w-4xl mx-auto py-16 px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-800 underline decoration-primary underline-offset-8">Meet Our Team</h2>
          
          <div className="space-y-24">
            {teamMembers.map((member, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={`flex flex-col md:flex-row items-center gap-10 ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
              >
                {/* Profile Image */}
                <div className="w-64 h-64 flex-shrink-0 relative group cursor-pointer" onClick={() => setSelectedImage(member.image)}>
                  <div className="absolute inset-0 bg-primary rounded-3xl rotate-6 group-hover:rotate-0 transition-transform duration-300"></div>
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="absolute inset-0 w-64 h-64 object-cover rounded-3xl border-4 border-white shadow-xl"
                    onError={(e) => { e.target.src = "https://via.placeholder.com/300?text=Team+Member" }}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-3xl font-bold text-gray-800 mb-1">{member.name}</h3>
                  <p className="text-primary font-bold mb-4 uppercase tracking-widest text-sm">{member.role}</p>
                  <p className="text-gray-600 text-lg leading-relaxed mb-6 italic">
                    {member.bio}
                  </p>
                  
                  {/* Social Links */}
                  <div className="flex justify-center md:justify-start gap-5">
                    <a href={member.social.instagram} target="_blank" className="text-pink-600 text-2xl hover:scale-125 transition-transform"><FaInstagram /></a>
                    <a href={member.social.linkedin} target="_blank" className="text-blue-700 text-2xl hover:scale-125 transition-transform"><FaLinkedin /></a>
                    <a href={member.social.github} target="_blank" className="text-gray-800 text-2xl hover:scale-125 transition-transform"><FaGithub /></a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Join Team Section */}
        <section className="py-20 bg-gradient-to-r from-primary to-green-600 text-white text-center px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">Join Our Mission</h2>
            <p className="text-xl mb-8 opacity-90">We are always looking for passionate individuals to help us fight hunger and food waste. Are you ready to make an impact?</p>
            <a href="mailto:careers@refoodify.com" className="inline-block bg-white text-primary px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:bg-gray-100 transition-transform transform hover:scale-105">
              Become a Volunteer
            </a>
          </div>
        </section>

        {/* Image Modal */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
            <motion.img 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={selectedImage} 
              className="max-w-full max-h-[90vh] rounded-xl shadow-2xl" 
              alt="Full View"
            />
            <button className="absolute top-8 right-8 text-white text-4xl font-bold">&times;</button>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}