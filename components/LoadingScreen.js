import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const foodEmojis = ['🥗', '🥘', '🥪', '🍎', '🥕', '🍱', '🍛', '🍜'];

export default function LoadingScreen() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % foodEmojis.length);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.12),transparent_28%),linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] transition-opacity duration-300 dark:bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.16),transparent_24%),linear-gradient(180deg,#020617_0%,#0f172a_100%)]">
      <motion.div 
        className="absolute top-[-10%] left-[-10%] h-[50vw] w-[50vw] rounded-full bg-emerald-200/40 blur-[100px] dark:bg-emerald-900/20"
        animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-[-10%] right-[-10%] h-[50vw] w-[50vw] rounded-full bg-orange-200/40 blur-[100px] dark:bg-orange-900/20"
        animate={{ scale: [1, 1.2, 1], x: [0, -50, 0], y: [0, -30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      <div className="relative z-10 flex flex-col items-center">
        <div className="relative w-32 h-32">
          <motion.div 
            className="absolute inset-0 border-[6px] border-transparent border-t-green-500 border-r-orange-400 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          
          <div className="absolute inset-3 flex items-center justify-center rounded-full border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.12)] dark:border-slate-700 dark:bg-slate-900">
             <AnimatePresence mode='wait'>
                <motion.div
                  key={index}
                  initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={{ scale: 0.5, opacity: 0, rotate: 20 }}
                  transition={{ duration: 0.3 }}
                  className="text-5xl"
                >
                  {foodEmojis[index]}
                </motion.div>
             </AnimatePresence>
          </div>
        </div>

        <div className="mt-10 text-center">
          <h2 className="mb-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Refoodify
          </h2>
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Serving Kindness</span>
            <motion.span 
              className="inline-block h-1.5 w-1.5 rounded-full bg-orange-400"
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}