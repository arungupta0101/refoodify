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
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#fdfbf7] dark:bg-gray-900 transition-opacity duration-300 overflow-hidden">
      {/* Abstract Background Shapes */}
      <motion.div 
        className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-green-200/40 dark:bg-green-900/20 rounded-full blur-[100px]"
        animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-orange-200/40 dark:bg-orange-900/20 rounded-full blur-[100px]"
        animate={{ scale: [1, 1.2, 1], x: [0, -50, 0], y: [0, -30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      <div className="relative z-10 flex flex-col items-center">
        {/* Central Loader */}
        <div className="relative w-32 h-32">
          {/* Spinning Ring */}
          <motion.div 
            className="absolute inset-0 border-[6px] border-transparent border-t-green-500 border-r-orange-400 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Inner Content */}
          <div className="absolute inset-3 bg-white dark:bg-gray-800 rounded-full shadow-sm flex items-center justify-center">
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
          <h2 className="text-3xl font-black text-gray-800 dark:text-white tracking-tight mb-2">
            Refoodify
          </h2>
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Serving Kindness</span>
            <motion.span 
              className="inline-block w-1.5 h-1.5 bg-orange-400 rounded-full"
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}