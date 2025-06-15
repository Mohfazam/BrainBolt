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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 text-transparent bg-clip-text mb-4"
          >
            EduStream Player
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 mt-3 max-w-3xl mx-auto leading-relaxed"
          >
            Interactive learning platform with educational modules that appear at specific video timestamps. 
            Each module provides hands-on learning experiences across different subjects.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 flex items-center justify-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={shuffleModules}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
            >
              <Shuffle size={16} />
              Shuffle Modules
            </motion.button>
            
            <div className="flex items-center gap-2 text-gray-400">
              <BookOpen size={16} />
              <span className="text-sm">{timestampModules.length} learning modules assigned</span>
            </div>
          </motion.div>
        </header>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Player Area */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="flex-1"
          >
            <Player 
              videoData={videoData} 
              onTimestampReached={handleTimestampReached}
              timestampModules={timestampModules}
            />
          </motion.div>
          
          {/* Sidebar - Track Modules */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="lg:w-80"
          >
            <TrackModules timestampModules={timestampModules} />
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