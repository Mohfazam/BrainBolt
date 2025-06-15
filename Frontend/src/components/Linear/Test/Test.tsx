import React from 'react';
import { motion, Variants } from 'framer-motion';
import YouTubePlayer from './YouTubePlayer';
import { Play, Target, Zap, BookOpen, Info } from 'lucide-react';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number], // Explicitly type as tuple
    },
  },
};

export const Test: React.FC = () => {
  const timestamps = [10, 25, 45, 70, 100, 130];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Hexagonal Background Pattern */}
      <motion.div
        animate={{
          opacity: [0.04, 0.06, 0.04],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute inset-0 opacity-[0.05] z-0"
      >
        <svg
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="hex-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#A78BFA', stopOpacity: 0.3 }} />
              <stop offset="50%" style={{ stopColor: '#3B82F6', stopOpacity: 0.3 }} />
              <stop offset="100%" style={{ stopColor: '#FFFFFF', stopOpacity: 0.3 }} />
            </linearGradient>
            <pattern
              id="hexagons"
              x="0"
              y="0"
              width="20"
              height="17.32"
              patternUnits="userSpaceOnUse"
            >
              <polygon
                points="10,1 18.66,6 18.66,16 10,21 1.34,16 1.34,6"
                fill="none"
                stroke="url(#hex-gradient)"
                strokeWidth="0.6"
              />
              <polygon
                points="20,9.5 28.66,14.5 28.66,24.5 20,29.5 11.34,24.5 11.34,14.5"
                fill="none"
                stroke="url(#hex-gradient)"
                strokeWidth="0.4"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hexagons)" />
        </svg>
      </motion.div>

      {/* Animated hexagonal elements */}
      <motion.div
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1],
          opacity: [0.02, 0.03, 0.02],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute top-20 right-20 opacity-[0.02]"
      >
        <svg width="120" height="120" viewBox="0 0 120 120">
          <polygon
            points="60,10 95,32.5 95,77.5 60,100 25,77.5 25,32.5"
            fill="none"
            stroke="url(#hex-gradient)"
            strokeWidth="1"
          />
        </svg>
      </motion.div>

      {/* Floating elements */}
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.02, 0.04, 0.02],
          rotate: [0, 60, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute w-[600px] h-[600px] -top-80 -right-80"
      >
        <div className="w-full h-full bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl transform rotate-45" />
      </motion.div>

      <div className="container mx-auto px-6 py-12 relative z-10 max-w-6xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.header variants={itemVariants} className="text-center mb-12">
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-white/70 text-sm font-medium mb-8 backdrop-blur-sm"
            >
              <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse-slow" />
              YouTube Player Demo
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-4xl lg:text-6xl font-light text-white mb-4 tracking-tight leading-[0.9]"
            >
              YouTube Player
            </motion.h1>
            <motion.h1
              variants={itemVariants}
              className="text-4xl lg:text-6xl font-light text-white mb-4 tracking-tight leading-[0.9]"
            >
              with
              <span className="relative ml-4">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text font-medium">
                  Timestamp Pauses
                </span>
                <motion.div
                  animate={{
                    scale: [1, 1.02, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute -inset-2 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 rounded-lg blur-xl -z-10"
                />
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-xl text-white/60 mb-4 max-w-3xl mx-auto font-light leading-relaxed"
            >
              Play, pause, and automatically stop at specific timestamps
            </motion.p>

            <motion.p
              variants={itemVariants}
              className="text-lg text-white/40 mb-8 max-w-2xl mx-auto font-light"
            >
              Video ID is stored in localStorage for persistence
            </motion.p>
          </motion.header>

          {/* Player */}
          <motion.div variants={itemVariants} className="mb-16">
            <YouTubePlayer timestamps={timestamps} />
          </motion.div>

          {/* How It Works Section */}
          <motion.div
            variants={itemVariants}
            className="relative p-8 rounded-3xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] overflow-hidden"
          >
            {/* Subtle hexagonal pattern overlay */}
            <motion.div
              animate={{
                opacity: [0.03, 0.05, 0.03],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute inset-0 opacity-[0.03]"
            >
              <svg
                className="absolute inset-0 w-full h-full"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 60 60"
              >
                <defs>
                  <linearGradient id="hex-gradient-info" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#A78BFA', stopOpacity: 0.3 }} />
                    <stop offset="50%" style={{ stopColor: '#3B82F6', stopOpacity: 0.3 }} />
                    <stop offset="100%" style={{ stopColor: '#FFFFFF', stopOpacity: 0.3 }} />
                  </linearGradient>
                </defs>
                <polygon
                  points="30,5 50,17.5 50,42.5 30,55 10,42.5 10,17.5"
                  fill="none"
                  stroke="url(#hex-gradient-info)"
                  strokeWidth="0.4"
                />
              </svg>
            </motion.div>

            <div className="relative z-10">
              <h2 className="text-2xl font-light text-white mb-6 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg">
                  <Info className="w-5 h-5 text-white" />
                </div>
                How It Works
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    icon: <Target className="w-5 h-5" />,
                    title: 'Automatic Pauses',
                    description: 'The player will automatically pause at each specified timestamp',
                    color: 'from-green-400 to-green-600',
                  },
                  {
                    icon: <Play className="w-5 h-5" />,
                    title: 'Resume Playback',
                    description: 'Click the play button to continue from where it paused',
                    color: 'from-yellow-400 to-yellow-600',
                  },
                  {
                    icon: <Zap className="w-5 h-5" />,
                    title: 'Skip Ahead',
                    description: 'Use the "Skip to next timestamp" button to jump to the next pause point',
                    color: 'from-blue-400 to-blue-600',
                  },
                  {
                    icon: <BookOpen className="w-5 h-5" />,
                    title: 'Persistent Video',
                    description: 'The YouTube video ID is stored in localStorage for your convenience',
                    color: 'from-purple-400 to-purple-600',
                  },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${item.color} flex-shrink-0`}>
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="text-white font-medium mb-2 group-hover:text-white transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-white/60 text-sm font-light leading-relaxed group-hover:text-white/80 transition-colors">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};