import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VideoData, Timestamp } from '../Data/hardcodedData';
import { TimestampModule } from '../Data/moduleAssignment';
import { Play, Pause, Clock, BookOpen, Target, SkipForward, Volume2 } from 'lucide-react';

interface PlayerProps {
  videoData: VideoData;
  onTimestampReached: (timestamp: Timestamp) => void;
  timestampModules: TimestampModule[];
}

const Player: React.FC<PlayerProps> = ({ videoData, onTimestampReached, timestampModules }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [pausedAtTimestamp, setPausedAtTimestamp] = useState<number | null>(null);
  const [nextTimestampIndex, setNextTimestampIndex] = useState<number>(0);
  
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize YouTube player
  useEffect(() => {
    const loadPlayer = () => {
      // @ts-ignore
      playerRef.current = new window.YT.Player('youtube-player', {
        height: '360',
        width: '640',
        videoId: videoData.id,
        playerVars: {
          playsinline: 1,
          enablejsapi: 1,
          origin: window.location.origin
        },
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        }
      });
    };

    // @ts-ignore
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }

      // @ts-ignore
      window.onYouTubeIframeAPIReady = loadPlayer;
    } else {
      loadPlayer();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (playerRef.current) playerRef.current.destroy();
    };
  }, [videoData.id]);

  const onPlayerReady = () => {
    // Player is ready
  };

  const onPlayerStateChange = (event: any) => {
    if (event.data === 0) {
      setIsPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    } else if (event.data === 1) {
      setIsPlaying(true);
      startProgressTracking();
    } else if (event.data === 2) {
      setIsPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  };

  const startProgressTracking = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    intervalRef.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const time = playerRef.current.getCurrentTime();
        setCurrentTime(time);
        
        if (nextTimestampIndex < videoData.timestamps.length && time >= videoData.timestamps[nextTimestampIndex].time) {
          playerRef.current.pauseVideo();
          setPausedAtTimestamp(videoData.timestamps[nextTimestampIndex].time);
          onTimestampReached(videoData.timestamps[nextTimestampIndex]);
          setNextTimestampIndex(nextTimestampIndex + 1);
        }
      }
    }, 500);
  };

  const togglePlayPause = () => {
    if (!playerRef.current) return;
    
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      if (pausedAtTimestamp !== null) {
        playerRef.current.seekTo(pausedAtTimestamp, true);
        setPausedAtTimestamp(null);
      }
      playerRef.current.playVideo();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    
    if (playerRef.current) {
      playerRef.current.seekTo(newTime, true);
      
      let newIndex = 0;
      for (let i = 0; i < videoData.timestamps.length; i++) {
        if (newTime < videoData.timestamps[i].time) {
          newIndex = i;
          break;
        }
      }
      setNextTimestampIndex(newIndex);
      setPausedAtTimestamp(null);
    }
  };

  const jumpToTimestamp = (time: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(time, true);
      setCurrentTime(time);
      setPausedAtTimestamp(time);
      playerRef.current.pauseVideo();
      
      const index = videoData.timestamps.findIndex((ts:any) => ts.time === time);
      if (index !== -1) {
        setNextTimestampIndex(index + 1);
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getModuleForTimestamp = (time: number) => {
    return timestampModules.find(tm => tm.timestamp.time === time)?.module;
  };

  return (
    <div className="w-full space-y-8">
      {/* Video Player */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
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
              <linearGradient id="hex-gradient-player" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#A78BFA', stopOpacity: 0.3 }} />
                <stop offset="50%" style={{ stopColor: '#3B82F6', stopOpacity: 0.3 }} />
                <stop offset="100%" style={{ stopColor: '#FFFFFF', stopOpacity: 0.3 }} />
              </linearGradient>
            </defs>
            <polygon
              points="30,5 50,17.5 50,42.5 30,55 10,42.5 10,17.5"
              fill="none"
              stroke="url(#hex-gradient-player)"
              strokeWidth="0.4"
            />
          </svg>
        </motion.div>

        <div className="relative z-10">
          <div className="bg-black rounded-2xl overflow-hidden shadow-2xl mb-6">
            <div id="youtube-player" className="w-full aspect-video" />
          </div>
          
          {/* Video Info */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
            <div className="flex-1">
              <h2 className="text-2xl font-light text-white mb-2">{videoData.title}</h2>
              <p className="text-white/60 font-light">{videoData.artist}</p>
            </div>
            
            <div className="flex items-center gap-4 text-white/60">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="font-light">{formatTime(currentTime)} / {formatTime(videoData.duration)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                <span className="text-sm font-light">HD</span>
              </div>
            </div>
          </div>

          {/* Player Controls */}
          <div className="space-y-4">
            <input
              type="range"
              min="0"
              max={videoData.duration}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-white"
              style={{
                background: `linear-gradient(to right, white 0%, white ${(currentTime / videoData.duration) * 100}%, rgba(255,255,255,0.1) ${(currentTime / videoData.duration) * 100}%, rgba(255,255,255,0.1) 100%)`
              }}
            />
            
            <div className="flex items-center justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={togglePlayPause}
                className="p-4 bg-white text-black rounded-full shadow-2xl hover:shadow-white/20 transition-all duration-300"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (nextTimestampIndex < videoData.timestamps.length) {
                    jumpToTimestamp(videoData.timestamps[nextTimestampIndex].time);
                  }
                }}
                disabled={nextTimestampIndex >= videoData.timestamps.length}
                className="p-3 bg-white/10 text-white rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SkipForward className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Pause Notification */}
          <AnimatePresence>
            {pausedAtTimestamp !== null && (
              <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="mt-6 p-6 rounded-2xl bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 border border-white/20 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Learning Module Activated!</p>
                      <p className="text-white/60 text-sm font-light">Paused at {formatTime(pausedAtTimestamp)}</p>
                    </div>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={togglePlayPause}
                    className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full font-medium hover:shadow-lg transition-all duration-300"
                  >
                    <Play className="w-4 h-4" />
                    Continue
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
      
      {/* Enhanced Timestamps Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative p-8 rounded-3xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] overflow-hidden"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg">
              <Target className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-light text-white">Learning Timestamps</h2>
          </div>
          <p className="text-white/60 font-light">Each timestamp triggers a different educational module</p>
        </div>
        
        {/* Timestamps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {videoData.timestamps.map((ts:any, index:any) => {
            const module = getModuleForTimestamp(ts.time);
            
            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`group relative p-6 rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden ${
                  index === nextTimestampIndex
                    ? 'bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 border-2 border-white/20'
                    : index < nextTimestampIndex
                      ? 'bg-green-400/5 border border-green-400/20'
                      : 'bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/10'
                }`}
                onClick={() => jumpToTimestamp(ts.time)}
              >
                {/* Status indicator */}
                <div className="absolute top-4 right-4">
                  {index === nextTimestampIndex ? (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
                    />
                  ) : index < nextTimestampIndex ? (
                    <div className="w-3 h-3 bg-green-400 rounded-full" />
                  ) : (
                    <div className="w-3 h-3 bg-white/20 rounded-full" />
                  )}
                </div>

                <div className="mb-4">
                  <h3 className={`font-medium mb-2 ${
                    index === nextTimestampIndex 
                      ? 'text-white' 
                      : index < nextTimestampIndex 
                        ? 'text-green-300' 
                        : 'text-white/80'
                  }`}>
                    {ts.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <Clock className="w-4 h-4" />
                    <span className="font-light">{formatTime(ts.time)}</span>
                    {index === nextTimestampIndex && (
                      <span className="px-2 py-1 bg-white/10 rounded-full text-xs">Next</span>
                    )}
                    {index < nextTimestampIndex && (
                      <span className="px-2 py-1 bg-green-400/20 text-green-300 rounded-full text-xs">Completed</span>
                    )}
                  </div>
                </div>
                
                {module && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 bg-white/5 rounded-xl border border-white/10"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">{module.icon}</span>
                      <div>
                        <p className="text-white font-medium text-sm">{module.title}</p>
                        <p className="text-white/60 text-xs font-light">{module.type}</p>
                      </div>
                    </div>
                    <p className="text-white/70 text-xs font-light line-clamp-2">{module.description}</p>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default Player;