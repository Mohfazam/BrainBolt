import React, { JSX, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PCMTrack } from '../Data/hardcodedData';
import { pcmTracks } from '../Data/hardcodedData';
import { TimestampModule } from '../Data/moduleAssignment';
import { Play, BarChart3, Clock, BookOpen, Target, Volume2, Pause, Music, TrendingUp } from 'lucide-react';

interface TrackModulesProps {
  timestampModules: TimestampModule[];
}

const TrackModules: React.FC<TrackModulesProps> = ({ timestampModules }) => {
  const [selectedTrack, setSelectedTrack] = useState<PCMTrack | null>(null);
  const [activeTab, setActiveTab] = useState<'modules' | 'tracks'>('modules');
  const [isPlaying, setIsPlaying] = useState(false);

  const moduleTypeStats = timestampModules.reduce((acc, tm) => {
    acc[tm.module.type] = (acc[tm.module.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getModuleTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'JEE Accelerator': 'from-blue-400 to-blue-600',
      'Formula Fusion': 'from-purple-400 to-purple-600',
      '3D Explorer': 'from-green-400 to-green-600',
      'Proof Builder': 'from-orange-400 to-orange-600',
      'Numerical Navigator': 'from-cyan-400 to-cyan-600'
    };
    return colors[type] || 'from-gray-400 to-gray-600';
  };

  const getModuleIcon = (type: string) => {
    const icons: Record<string, JSX.Element> = {
      'JEE Accelerator': <Target className="w-4 h-4" />,
      'Formula Fusion': <BookOpen className="w-4 h-4" />,
      '3D Explorer': <TrendingUp className="w-4 h-4" />,
      'Proof Builder': <BarChart3 className="w-4 h-4" />,
      'Numerical Navigator': <Clock className="w-4 h-4" />
    };
    return icons[type] || <BookOpen className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="relative p-8 rounded-3xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] overflow-hidden">
        {/* Subtle hexagonal pattern overlay */}
        <motion.div
          animate={{
            opacity: [0.03, 0.05, 0.03],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 opacity-[0.03]"
        >
          <svg
            className="absolute inset-0 w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 60 60"
          >
            <defs>
              <linearGradient id="hex-gradient-sidebar" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#A78BFA', stopOpacity: 0.3 }} />
                <stop offset="50%" style={{ stopColor: '#3B82F6', stopOpacity: 0.3 }} />
                <stop offset="100%" style={{ stopColor: '#FFFFFF', stopOpacity: 0.3 }} />
              </linearGradient>
            </defs>
            <polygon
              points="30,5 50,17.5 50,42.5 30,55 10,42.5 10,17.5"
              fill="none"
              stroke="url(#hex-gradient-sidebar)"
              strokeWidth="0.4"
            />
          </svg>
        </motion.div>

        <div className="relative z-10">
          {/* Tab Headers */}
          <div className="flex mb-6 bg-white/5 rounded-2xl p-1">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('modules')}
              className={`flex-1 p-3 text-center font-medium rounded-xl transition-all duration-300 ${
                activeTab === 'modules'
                  ? 'bg-white text-black shadow-lg'
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              <BookOpen className="w-4 h-4 inline mr-2" />
              Learning Modules
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('tracks')}
              className={`flex-1 p-3 text-center font-medium rounded-xl transition-all duration-300 ${
                activeTab === 'tracks'
                  ? 'bg-white text-black shadow-lg'
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              <Music className="w-4 h-4 inline mr-2" />
              Audio Tracks
            </motion.button>
          </div>

          <div className="max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
            <AnimatePresence mode="wait">
              {activeTab === 'modules' ? (
                <motion.div
                  key="modules"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Module Statistics */}
                  <div>
                    <h3 className="text-lg font-light text-white mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-400" />
                      Module Distribution
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(moduleTypeStats).map(([type, count]) => (
                        <div key={type} className="p-4 bg-white/5 rounded-xl border border-white/10">
                          <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-2">
                              <div className={`p-1.5 rounded-lg bg-gradient-to-r ${getModuleTypeColor(type)}`}>
                                {getModuleIcon(type)}
                              </div>
                              <span className="text-white text-sm font-medium">{type}</span>
                            </div>
                            <span className="text-white/60 text-sm font-light">{count} modules</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-2">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(count / timestampModules.length) * 100}%` }}
                              transition={{ duration: 1, delay: 0.5 }}
                              className={`h-2 rounded-full bg-gradient-to-r ${getModuleTypeColor(type)}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Assigned Modules */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-light text-white flex items-center gap-2">
                      <Target className="w-5 h-5 text-green-400" />
                      Assigned Modules
                    </h3>
                    {timestampModules.map((tm, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        className="group p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${getModuleTypeColor(tm.module.type)} flex items-center justify-center text-xl flex-shrink-0`}>
                            {tm.module.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-white text-sm group-hover:text-white transition-colors">
                                {tm.module.title}
                              </h4>
                              <div className="flex items-center gap-1 text-xs text-white/60">
                                <Clock className="w-3 h-3" />
                                <span>{Math.floor(tm.timestamp.time / 60)}:{String(Math.floor(tm.timestamp.time % 60)).padStart(2, '0')}</span>
                              </div>
                            </div>
                            <p className="text-white/60 text-xs mb-3 line-clamp-2 font-light">
                              {tm.module.description}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="bg-gradient-to-r from-blue-400/20 to-purple-400/20 text-blue-300 px-2 py-1 rounded-full text-xs font-light">
                                {tm.module.type}
                              </span>
                              <span className="bg-white/10 text-white/60 px-2 py-1 rounded-full text-xs font-light">
                                {tm.timestamp.title}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="tracks"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* PCM Tracks */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-light text-white flex items-center gap-2">
                      <Music className="w-5 h-5 text-blue-400" />
                      Background Audio
                    </h3>
                    {pcmTracks.map(track => (
                      <motion.div 
                        key={track.id}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className={`group p-4 rounded-xl transition-all duration-300 cursor-pointer ${
                          selectedTrack?.id === track.id
                            ? 'bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 border-2 border-white/20'
                            : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20'
                        }`}
                        onClick={() => setSelectedTrack(track)}
                      >
                        <div className="flex items-start gap-4">
                          <div className="bg-gradient-to-br from-blue-400 to-purple-400 w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Music className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-white mb-1 group-hover:text-white transition-colors">
                              {track.title}
                            </h4>
                            <p className="text-white/60 text-sm mb-3 font-light">
                              {track.duration} • {track.bpm} BPM
                            </p>
                            <div className="flex flex-wrap gap-1">
                              <span className="bg-white/10 text-white/70 px-2 py-1 rounded-full text-xs font-light">
                                {track.key}
                              </span>
                              <span className="bg-white/10 text-white/70 px-2 py-1 rounded-full text-xs font-light">
                                {track.mood}
                              </span>
                              {track.tags.slice(0, 2).map((tag, idx) => (
                                <span key={idx} className="bg-white/10 text-white/70 px-2 py-1 rounded-full text-xs font-light">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Selected Track Preview */}
                  <AnimatePresence>
                    {selectedTrack && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="p-6 border-t border-white/10 bg-white/5 rounded-xl"
                      >
                        <h4 className="font-medium text-white mb-4 flex items-center gap-2">
                          <Volume2 className="w-4 h-4 text-green-400" />
                          Now Playing: {selectedTrack.title}
                        </h4>
                        <div className="flex items-center gap-4">
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="p-3 bg-white text-black rounded-full shadow-lg hover:shadow-white/20 transition-all duration-300"
                          >
                            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                          </motion.button>
                          <div className="flex-1">
                            <div className="w-full h-2 bg-white/10 rounded-full mb-2">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: isPlaying ? '33%' : '0%' }}
                                transition={{ duration: 2 }}
                                className="h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
                              />
                            </div>
                            <div className="flex justify-between text-sm text-white/60 font-light">
                              <span>0:15</span>
                              <span>{selectedTrack.duration}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      {/* Session Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="relative p-6 rounded-3xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] overflow-hidden"
      >
        <div className="relative z-10">
          <h3 className="font-light text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-yellow-400" />
            Session Stats
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/60 font-light">Modules Assigned</span>
              <span className="text-white font-medium">{timestampModules.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60 font-light">Module Types</span>
              <span className="text-white font-medium">{Object.keys(moduleTypeStats).length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60 font-light">Audio Tracks</span>
              <span className="text-white font-medium">{pcmTracks.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60 font-light">Selected Track</span>
              <span className="text-white font-medium text-xs">
                {selectedTrack ? selectedTrack.title : 'None'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TrackModules;