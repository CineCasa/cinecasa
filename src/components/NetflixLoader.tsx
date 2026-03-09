import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NetflixLoader = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 5000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
      className="fixed inset-0 z-[999999] bg-black flex items-center justify-center overflow-hidden"
    >
      <div className="relative flex flex-col items-center justify-center w-full h-full">
        {/* Cinematic Backdrop Glow */}
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-[500px] h-[500px] bg-[#00A8E1] blur-[150px] rounded-full opacity-20"
        />

        {/* Logo Animation */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0, filter: "blur(10px)" }}
          animate={{ 
            scale: [0.5, 1.05, 1],
            opacity: 1,
            filter: "blur(0px)",
          }}
          transition={{ 
            duration: 2, 
            ease: [0.22, 1, 0.36, 1],
          }}
          className="flex flex-col items-center z-10"
        >
          <motion.span 
            animate={{ 
              color: ["#00A8E1", "#ffffff", "#00A8E1"],
              textShadow: [
                "0 0 20px rgba(0,168,225,0.5)", 
                "0 0 40px rgba(0,168,225,0.8)", 
                "0 0 20px rgba(0,168,225,0.5)"
              ]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="text-7xl md:text-9xl font-[900] tracking-tighter leading-none select-none italic"
          >
            CINECASA
          </motion.span>
          
          <motion.div
            initial={{ opacity: 0, letterSpacing: "0.1em" }}
            animate={{ opacity: 1, letterSpacing: "0.4em" }}
            transition={{ delay: 1.2, duration: 1.5, ease: "easeOut" }}
            className="mt-4 overflow-hidden"
          >
            <span className="text-sm md:text-lg font-bold text-white/40 uppercase tracking-[0.4em] whitespace-nowrap">
              Entretenimento e lazer
            </span>
          </motion.div>
        </motion.div>

        {/* Final Zoom Blast Effect */}
        <motion.div
          initial={{ scale: 1, opacity: 0 }}
          animate={{ 
            scale: [1, 15],
            opacity: [0, 0, 1, 0],
          }}
          transition={{ 
            delay: 3.8, 
            duration: 1.2,
            ease: "circIn"
          }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
           <div className="w-full h-full bg-gradient-to-r from-transparent via-[#00A8E1]/30 to-transparent blur-3xl" />
        </motion.div>
      </div>

      {/* Speed Lines / Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden origin-center">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: "50%", y: "50%", 
              width: 2, height: 100, 
              opacity: 0,
              rotate: (i * 18)
            }}
            animate={{ 
              y: ["50%", "-100%"],
              opacity: [0, 1, 0],
              scaleY: [1, 2]
            }}
            transition={{ 
              delay: 3.5 + Math.random() * 0.5, 
              duration: 0.8,
              ease: "easeIn"
            }}
            className="absolute bg-[#00A8E1]/40"
            style={{ left: "calc(50% - 1px)" }}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default NetflixLoader;
