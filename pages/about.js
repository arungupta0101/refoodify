import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { FaInstagram, FaLinkedin, FaGithub, FaTwitter, FaLeaf, FaUsers, FaLightbulb, FaHandHoldingHeart, FaTrophy, FaMedal, FaAward } from 'react-icons/fa';

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
    },
    isFounder: true,
    tags: ['Founder', 'Tech Lead', 'Visionary']
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
    },
    roleColor: 'bg-blue-100 text-blue-700'
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
    },
    roleColor: 'bg-orange-100 text-orange-700'
  },
  {
    name: 'Harshit Dwivedi',
    role: 'Creative Strategist',
    bio: 'Harshit is the creative strategist with a smart mind who always has a plan. He plays a pivotal role in marketing and fostering creative thinking within the team.',
    image: '/team/harshit.jpeg',
    social: {
      instagram: 'https://www.instagram.com/pandit_harshit_dwivedi_1?igsh=c2h5aDBkOGZ1cTBz',
      linkedin: 'https://linkedin.com/in/harshit_dummy',
      github: 'https://github.com/harshit_dummy'
    },
    roleColor: 'bg-purple-100 text-purple-700'
  }
];

const coreValues = [
  { icon: <FaLeaf />, title: "Sustainability", desc: "Committed to a zero-waste future." },
  { icon: <FaUsers />, title: "Community", desc: "Building strong local networks." },
  { icon: <FaLightbulb />, title: "Innovation", desc: "Smart tech for social good." },
  { icon: <FaHandHoldingHeart />, title: "Empathy", desc: "Driven by compassion for all." },
];

// Animation Variants for the team grid
const gridContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // Stagger effect for each card
    },
  },
};

const gridItemVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.8 },
  show: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    }
  },
};

export default function About() {
  const [selectedImage, setSelectedImage] = useState(null);
  const founder = teamMembers.find(m => m.isFounder);
  const members = teamMembers.filter(m => !m.isFounder);

  return (
    <>
      <Header />
      <main className="min-h-screen pb-20">
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
        <section className="max-w-7xl mx-auto py-20 px-4 relative">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-800 mb-4 relative inline-block">
              Meet Our Team
              <span className="absolute -bottom-2 left-0 w-full h-2 bg-green-400/30 rounded-full"></span>
              <FaLeaf className="absolute -top-6 -right-8 text-green-500 text-3xl animate-bounce" />
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The people behind Refoodify’s mission to reduce food waste and fight hunger
            </p>
          </div>

          {/* Founder Hero */}
          {founder && (
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
              className="max-w-5xl mx-auto bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100 mb-20 relative"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl -mr-16 -mt-16"></div>
              
              <div className="flex flex-col md:flex-row items-center p-8 md:p-12 gap-10 relative z-10">
                {/* Founder Image */}
                <div className="w-full md:w-1/3 flex justify-center">
                  <div className="relative w-64 h-64 group cursor-pointer" onClick={() => setSelectedImage(founder.image)}>
                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-green-300 rounded-full blur-lg opacity-50 group-hover:opacity-70 transition-opacity"></div>
                    <img 
                      src={founder.image} 
                      alt={founder.name} 
                      className="relative w-full h-full object-cover rounded-full border-4 border-white shadow-xl transform group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute bottom-2 right-4 bg-yellow-400 text-white p-2 rounded-full shadow-lg border-2 border-white">
                      <FaTrophy />
                    </div>
                  </div>
                </div>

                {/* Founder Content */}
                <div className="w-full md:w-2/3 text-center md:text-left">
                  <div className="inline-block bg-yellow-100 text-yellow-800 px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider mb-3 shadow-sm">
                    👑 {founder.role}
                  </div>
                  <h3 className="text-4xl font-black text-gray-800 mb-4">{founder.name}</h3>
                  
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
                    {founder.tags && founder.tags.map((tag, i) => (
                      <span key={i} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                        <FaMedal className="text-primary" /> {tag}
                      </span>
                    ))}
                  </div>

                  <p className="text-gray-600 text-lg leading-relaxed mb-8">
                    {founder.bio}
                  </p>

                  <div className="flex justify-center md:justify-start gap-4">
                    <a href={founder.social.linkedin} target="_blank" className="flex items-center gap-2 bg-[#0077b5] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                      <FaLinkedin /> LinkedIn
                    </a>
                    <a href={founder.social.github} target="_blank" className="flex items-center gap-2 bg-[#333] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                      <FaGithub /> GitHub
                    </a>
                    <a href={founder.social.instagram} target="_blank" className="flex items-center gap-2 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                      <FaInstagram /> Instagram
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Team Grid */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
            variants={gridContainerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            {members.map((member, index) => (
              <motion.div
                key={index}
                variants={gridItemVariants}
                className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-32 h-32 mb-4 relative cursor-pointer" onClick={() => setSelectedImage(member.image)}>
                    <div className="absolute inset-0 bg-gray-100 rounded-full transform group-hover:scale-110 transition-transform duration-300"></div>
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="relative w-full h-full object-cover rounded-full border-4 border-white shadow-md"
                    />
                  </div>
                  
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase mb-3 ${member.roleColor || 'bg-gray-100 text-gray-600'}`}>
                    {member.role}
                  </span>
                  
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{member.name}</h3>
                  <p className="text-gray-500 text-sm mb-6 line-clamp-3">
                    {member.bio}
                  </p>

                  <div className="flex gap-4 mt-auto">
                    <a href={member.social.linkedin} target="_blank" className="text-gray-400 hover:text-[#0077b5] text-xl transition-colors"><FaLinkedin /></a>
                    <a href={member.social.github} target="_blank" className="text-gray-400 hover:text-black text-xl transition-colors"><FaGithub /></a>
                    <a href={member.social.instagram} target="_blank" className="text-gray-400 hover:text-pink-600 text-xl transition-colors"><FaInstagram /></a>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Trust Booster */}
          <div className="mt-20 max-w-4xl mx-auto bg-white/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-100 text-center">
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-6">Winner of</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="flex flex-col items-center gap-2">
                <FaTrophy className="text-4xl text-yellow-500" />
                <span className="font-bold text-gray-600 text-sm">National Conference</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <FaAward className="text-4xl text-blue-500" />
                <span className="font-bold text-gray-600 text-sm">Techyuva Award (At college level)</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <FaMedal className="text-4xl text-primary" />
                <span className="font-bold text-gray-600 text-sm">Student Innovation</span>
              </div>
            </div>
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