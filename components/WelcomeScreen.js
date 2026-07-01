import { motion } from 'framer-motion';

export default function WelcomeScreen({ onComplete }) {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-slate-950">
      <motion.div 
        className="absolute inset-0 z-0"
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.18),transparent_28%),linear-gradient(180deg,rgba(2,6,23,0.55),rgba(2,6,23,0.88))]" />
        <img 
          src="https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=2070&auto=format&fit=crop" 
          alt="Community Food" 
          className="h-full w-full object-cover opacity-50"
        />
      </motion.div>
      
      <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
        >
          <p className="mb-4 text-xl font-semibold uppercase tracking-[0.25em] text-emerald-300 md:text-2xl">
            Welcome to
          </p>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1, delay: 0.8, ease: "circOut" }}
          className="mb-6 text-6xl font-black tracking-tighter text-white md:text-8xl"
        >
          Refoodify
        </motion.h1>
        
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100px" }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mx-auto mb-10 h-1.5 rounded-full bg-emerald-400"
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="mb-16 text-2xl font-light italic leading-relaxed text-slate-200 md:text-4xl"
        >
          "Save Food, <span className="font-semibold text-emerald-300">Save Lives</span>"
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2, type: "spring", stiffness: 100 }}
          whileHover={{ scale: 1.05, backgroundColor: "#22c55e" }}
          whileTap={{ scale: 0.95 }}
          onClick={onComplete}
          className="group relative overflow-hidden rounded-2xl border border-white/15 bg-white/10 px-8 py-4 text-lg font-semibold text-white backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-emerald-400/50 hover:bg-white/15"
        >
          <span className="relative z-10 flex items-center gap-3">
            Get Started <span className="group-hover:translate-x-1 transition-transform">→</span>
          </span>
          <div className="absolute inset-0 bg-emerald-500 opacity-0 transition-opacity duration-300 group-hover:opacity-20"></div>
        </motion.button>
      </div>
    </div>
  );
}