import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { FaInstagram, FaLinkedin, FaGithub, FaTwitter, FaLeaf, FaUsers, FaLightbulb, FaHandHoldingHeart, FaTrophy, FaMedal, FaAward } from 'react-icons/fa';

const teamMembers = [
  {
    name: 'Arun Gupta',
    role: 'Founder & Team Leader',
    bio: 'The visionary behind Refoodify. Arun conceived the idea to bridge the gap between food waste and hunger. He leads the technical development and strategy of the platform.',
    image: '/team/arun.jpg',
    socials: {
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
    socials: {
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
    socials: {
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
    socials: {
      instagram: 'https://www.instagram.com/pandit_harshit_dwivedi_1?igsh=c2h5aDBkOGZ1cTBz',
      linkedin: 'https://linkedin.com/in/harshit_dummy',
      github: 'https://github.com/harshit_dummy'
    },
    roleColor: 'bg-purple-100 text-purple-700'
  }
];

const coreValues = [
  { icon: FaLeaf, title: "Sustainability", desc: "Committed to a zero-waste future." },
  { icon: FaUsers, title: "Community", desc: "Building strong local networks." },
  { icon: FaLightbulb, title: "Innovation", desc: "Smart tech for social good." },
  { icon: FaHandHoldingHeart, title: "Empathy", desc: "Driven by compassion for all." },
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
      <main className="min-h-screen pb-20 pt-24">
        <div className="max-w-7xl mx-auto px-4">
          <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary via-emerald-600 to-emerald-700 px-6 py-16 text-white shadow-[0_24px_80px_rgba(16,185,129,0.28)] md:px-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.12),transparent_30%)]" />
            <div className="relative mx-auto max-w-3xl text-center">
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-black tracking-tight md:text-5xl"
              >
                About Refoodify
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mx-auto mt-5 max-w-2xl text-lg text-white/90 md:text-xl"
              >
                Smart Food Donation & Expiry Tracking System. We are on a mission to ensure that no good meal goes to waste while people are hungry.
              </motion.p>
            </div>
          </section>

          <section className="grid items-center gap-12 py-16 md:grid-cols-2 md:py-20">
            <div>
              <p className="page-kicker mb-4">Our mission</p>
              <h2 className="section-heading mb-6">Building a zero-waste food network</h2>
              <p className="section-copy mb-8 text-lg">
                Refoodify was born out of a simple observation: millions of tons of food are wasted daily while millions go hungry. Our system uses smart tracking to notify donors before food expires and connects them with nearby NGOs in real-time.
              </p>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="premium-card p-6 text-center">
                  <h4 className="text-3xl font-black text-primary">0%</h4>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Food Waste Goal</p>
                </div>
                <div className="premium-card p-6 text-center">
                  <h4 className="text-3xl font-black text-primary">24/7</h4>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Active Support</p>
                </div>
              </div>
            </div>
            <div className="premium-card border-2 border-dashed border-primary/20 p-8 dark:border-primary/30">
              <p className="page-kicker mb-4">Why we do it</p>
              <h3 className="section-heading mb-4 text-2xl">The principle behind the product</h3>
              <ul className="space-y-4 text-lg text-slate-700 dark:text-slate-200">
                <li className="flex items-start gap-3"><span className="mt-1 text-primary">✅</span><span className="italic">Feeding people, not landfills.</span></li>
                <li className="flex items-start gap-3"><span className="mt-1 text-primary">✅</span><span className="italic">Connecting technology with humanity.</span></li>
              </ul>
            </div>
          </section>

          <section className="py-16">
            <div className="mb-12 text-center">
              <p className="page-kicker justify-center mb-4">Core values</p>
              <h2 className="section-heading">Our Core Values</h2>
            </div>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
              {coreValues.map((val, i) => {
                const Icon = val.icon;
                return (
                <motion.div 
                  key={i}
                  className="premium-card p-8 text-center transition-all hover:-translate-y-2 hover:shadow-xl"
                >
                  <div className="mb-4 flex justify-center text-4xl text-primary"><Icon /></div>
                  <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">{val.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400">{val.desc}</p>
                </motion.div>
              )})}
            </div>
          </section>

          <section className="relative py-20">
            <div className="text-center mb-16">
              <p className="page-kicker justify-center">Team</p>
              <h2 className="section-heading text-4xl md:text-5xl">Meet Our Team</h2>
              <p className="section-copy mx-auto mt-4 max-w-2xl">
                The people behind Refoodify’s mission to reduce food waste and fight hunger
              </p>
            </div>

            {founder && (
              <motion.div 
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="premium-card mb-16 overflow-hidden p-0"
              >
                <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-3xl -mr-16 -mt-16" />
                <div className="relative z-10 flex flex-col items-center gap-10 p-8 md:flex-row md:p-12">
                  <div className="flex w-full justify-center md:w-1/3">
                    <div className="group relative h-64 w-64 cursor-pointer" onClick={() => setSelectedImage(founder.image)}>
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-emerald-300 blur-lg opacity-50 transition-opacity group-hover:opacity-70"></div>
                      <img 
                        src={founder.image} 
                        alt={founder.name} 
                        className="relative h-full w-full rounded-full border-4 border-white object-cover shadow-xl transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute bottom-2 right-4 rounded-full border-2 border-white bg-amber-400 p-2 text-white shadow-lg">
                        <FaTrophy />
                      </div>
                    </div>
                  </div>

                  <div className="w-full text-center md:w-2/3 md:text-left">
                    <div className="mb-3 inline-flex rounded-full bg-amber-100 px-4 py-1 text-sm font-bold uppercase tracking-wider text-amber-800 shadow-sm dark:bg-amber-500/15 dark:text-amber-300">
                      👑 {founder.role}
                    </div>
                    <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-4">{founder.name}</h3>
                    <div className="mb-6 flex flex-wrap justify-center gap-2 md:justify-start">
                      {founder.tags && founder.tags.map((tag, i) => (
                        <span key={i} className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                          <FaMedal className="text-primary" /> {tag}
                        </span>
                      ))}
                    </div>
                    <p className="mb-8 text-lg leading-relaxed text-slate-600 dark:text-slate-300">
                      {founder.bio}
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 md:justify-start">
                      <a href={founder.socials.linkedin} target="_blank" rel="noopener noreferrer" className="premium-button inline-flex items-center gap-2 rounded-xl bg-[#0077b5] px-6 py-3 font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl">
                        <FaLinkedin /> LinkedIn
                      </a>
                      <a href={founder.socials.github} target="_blank" rel="noopener noreferrer" className="premium-button inline-flex items-center gap-2 rounded-xl bg-[#333] px-6 py-3 font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl">
                        <FaGithub /> GitHub
                      </a>
                      <a href={founder.socials.instagram} target="_blank" rel="noopener noreferrer" className="premium-button inline-flex items-center gap-2 rounded-xl bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 px-6 py-3 font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl">
                        <FaInstagram /> Instagram
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <motion.div 
              className="grid grid-cols-1 gap-6 md:grid-cols-3"
              variants={gridContainerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
            >
              {members.map((member, index) => (
                <motion.div
                  key={index}
                  variants={gridItemVariants}
                  className="premium-card p-8 transition-all duration-300 group hover:-translate-y-2"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-4 h-32 w-32 cursor-pointer" onClick={() => setSelectedImage(member.image)}>
                      <div className="absolute inset-0 rounded-full bg-slate-100 transition-transform duration-300 group-hover:scale-110 dark:bg-slate-800" />
                      <img
                        src={member.image} 
                        alt={member.name} 
                        className="relative h-full w-full rounded-full border-4 border-white object-cover shadow-md"
                      />
                    </div>
                    
                    <span className={`mb-3 rounded-full px-3 py-1 text-xs font-bold uppercase ${member.roleColor || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                      {member.role}
                    </span>
                    
                    <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">{member.name}</h3>
                    <p className="mb-6 text-sm text-slate-500 dark:text-slate-400 line-clamp-3">
                      {member.bio}
                    </p>

                    <div className="mt-auto flex gap-4">
                      <a href={member.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-xl text-slate-400 transition-colors hover:text-[#0077b5]"><FaLinkedin /></a>
                      <a href={member.socials.github} target="_blank" rel="noopener noreferrer" className="text-xl text-slate-400 transition-colors hover:text-black dark:hover:text-white"><FaGithub /></a>
                      <a href={member.socials.instagram} target="_blank" rel="noopener noreferrer" className="text-xl text-slate-400 transition-colors hover:text-pink-600"><FaInstagram /></a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <div className="mt-20 rounded-[2rem] border border-white/70 bg-white/70 p-8 text-center shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/50">
              <p className="mb-8 text-xs font-bold uppercase tracking-[0.35em] text-slate-400">Winner of</p>
              <div className="flex flex-wrap justify-center gap-8 opacity-75 grayscale transition-all duration-500 hover:grayscale-0 md:gap-16">
                <div className="flex flex-col items-center gap-2">
                  <FaTrophy className="text-4xl text-yellow-500" />
                  <span className="font-bold text-sm text-slate-600 dark:text-slate-300">National Conference</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <FaAward className="text-4xl text-blue-500" />
                  <span className="font-bold text-sm text-slate-600 dark:text-slate-300">Techyuva Award (At college level)</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <FaMedal className="text-4xl text-primary" />
                  <span className="font-bold text-sm text-slate-600 dark:text-slate-300">Student Innovation</span>
                </div>
              </div>
            </div>
          </section>

          <section className="my-20 rounded-[2rem] bg-gradient-to-r from-primary to-emerald-600 px-4 py-20 text-center text-white shadow-[0_24px_80px_rgba(16,185,129,0.28)]">
            <div className="mx-auto max-w-3xl">
              <h2 className="mb-6 text-4xl font-bold">Join Our Mission</h2>
              <p className="mb-8 text-xl opacity-90">We are always looking for passionate individuals to help us fight hunger and food waste. Are you ready to make an impact?</p>
              <a href="mailto:careers@refoodify.com" className="inline-block rounded-2xl bg-white px-8 py-4 text-lg font-bold text-primary shadow-lg transition-transform hover:scale-105 hover:bg-gray-100">
                Become a Volunteer
              </a>
            </div>
          </section>

          <AnimatePresence>
            {selectedImage && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setSelectedImage(null)}>
              <motion.img 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                src={selectedImage} 
                className="max-h-[90vh] max-w-full rounded-xl shadow-2xl" 
                alt="Full View"
              />
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </>
  );
}