import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import Player from './Player';
import TrackModules from './TrackModules';
import ModuleContainer from '../Module/ModuleContainer';
import { videoData } from '../Data/hardcodedData';
import { moduleAssigner } from '../Data/moduleAssignment';
import { ModuleData } from '../Data/moduleData';
import { Shuffle, BookOpen, Zap, Target, Brain } from 'lucide-react';

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

export const Layout: React.FC = () => {
  const [currentTimestamp, setCurrentTimestamp] = useState<any>(null);
  const [activeModule, setActiveModule] = useState<ModuleData | null>(null);
  const [showModule, setShowModule] = useState(false);
  const [timestampModules, setTimestampModules] = useState(() =>
    moduleAssigner.assignModulesToTimestamps(videoData.timestamps)
  );

  const handleTimestampReached = (timestamp: any) => {
    setCurrentTimestamp(timestamp);
    const module = moduleAssigner.getModuleForTimestamp(timestamp.time);
    if (module) {
      setActiveModule(module);
      setShowModule(true);
    }
    console.log(`Reached timestamp: ${timestamp.title} at ${timestamp.time} seconds`);
  };

  const handleCloseModule = () => {
    setShowModule(false);
    setActiveModule(null);
  };

  const shuffleModules = () => {
    const newAssignments = moduleAssigner.assignModulesToTimestamps(videoData.timestamps);
    setTimestampModules(newAssignments);
  };

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

      <div className="container mx-auto px-6 py-12 relative z-10 max-w-7xl">
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
              Interactive Learning Experience
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-4xl lg:text-6xl font-light text-white mb-4 tracking-tight leading-[0.9]"
            >
              EduStream
            </motion.h1>
            <motion.h1
              variants={itemVariants}
              className="text-4xl lg:text-6xl font-light text-white mb-4 tracking-tight leading-[0.9]"
            >
              <span className="relative">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text font-medium">
                  Player
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
              Interactive learning platform with educational modules that appear at specific video timestamps
            </motion.p>

            <motion.p
              variants={itemVariants}
              className="text-lg text-white/40 mb-8 max-w-2xl mx-auto font-light"
            >
              Each module provides hands-on learning experiences across different subjects
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={shuffleModules}
                className="group relative px-6 py-3 bg-white text-black rounded-full font-medium text-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-white/20"
              >
                <span className="relative z-10 flex items-center gap-2 justify-center">
                  <Shuffle className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
                  Shuffle Modules
                </span>
              </motion.button>

              <div className="flex items-center gap-6 text-white/60">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-sm font-light">{timestampModules.length} modules assigned</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  <span className="text-sm font-light">Adaptive Learning</span>
                </div>
              </div>
            </motion.div>
          </motion.header>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Player Area */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <Player
                videoData={videoData}
                onTimestampReached={handleTimestampReached}
                timestampModules={timestampModules}
              />
            </motion.div>

            {/* Sidebar - Track Modules */}
            <motion.div variants={itemVariants} className="lg:col-span-1">
              <TrackModules timestampModules={timestampModules} />
            </motion.div>
          </div>

          {/* Stats Section */}
          <motion.div
            variants={itemVariants}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
          >
            {[
              { stat: `${timestampModules.length}`, label: 'Learning Modules', icon: <Brain className="w-5 h-5" /> },
              { stat: `${videoData.timestamps.length}`, label: 'Timestamps', icon: <Target className="w-5 h-5" /> },
              { stat: '85%', label: 'Engagement Rate', icon: <Zap className="w-5 h-5" /> },
              { stat: '3x', label: 'Faster Learning', icon: <BookOpen className="w-5 h-5" /> },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -2 }}
                className="text-center group cursor-default p-6 rounded-3xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500"
              >
                <div className="text-white/60 mb-2 flex justify-center group-hover:text-white/80 transition-colors duration-300">
                  {item.icon}
                </div>
                <div className="text-2xl md:text-3xl font-light text-white mb-1 group-hover:text-white transition-colors">
                  {item.stat}
                </div>
                <div className="text-sm text-white/40 font-light">{item.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Educational Module Modal */}
      <ModuleContainer
        module={activeModule}
        isVisible={showModule}
        onClose={handleCloseModule}
        timestamp={currentTimestamp?.time || 0}
      />
    </div>
  );
};

export default Layout;