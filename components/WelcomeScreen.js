import { motion } from 'framer-motion';

export default function WelcomeScreen({ onComplete }) {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-black">
      {/* Background Image with Zoom Effect */}
      <motion.div 
        className="absolute inset-0 z-0"
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=2070&auto=format&fit=crop" 
          alt="Community Food" 
          className="w-full h-full object-cover opacity-60"
        />
      </motion.div>
      
      <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
        >
          <p className="text-xl md:text-2xl text-green-400 font-medium tracking-widest uppercase mb-4">
            Welcome to
          </p>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1, delay: 0.8, ease: "circOut" }}
          className="text-7xl md:text-9xl font-black text-white mb-6 tracking-tighter"
        >
          Refoodify
        </motion.h1>
        
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100px" }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="h-1.5 bg-green-500 mx-auto mb-10 rounded-full"
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="text-2xl md:text-4xl text-gray-200 font-light italic mb-16 leading-relaxed"
        >
          "Save Food, <span className="text-green-400 font-semibold">Save Lives</span>"
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2, type: "spring", stiffness: 100 }}
          whileHover={{ scale: 1.05, backgroundColor: "#22c55e" }}
          whileTap={{ scale: 0.95 }}
          onClick={onComplete}
          className="group relative px-12 py-5 bg-white/10 backdrop-blur-md border border-white/20 text-white text-xl font-bold rounded-full overflow-hidden transition-all hover:border-green-500 hover:shadow-[0_0_30px_rgba(34,197,94,0.5)]"
        >
          <span className="relative z-10 flex items-center gap-3">
            Get Started <span className="group-hover:translate-x-1 transition-transform">→</span>
          </span>
          <div className="absolute inset-0 bg-green-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        </motion.button>
      </div>
    </div>
  );
}