import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipForward, Clock, Volume2, Info, Target } from 'lucide-react';

interface YouTubePlayerProps {
  timestamps: number[];
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ timestamps }) => {
  const [videoId, setVideoId] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [pausedAtTimestamp, setPausedAtTimestamp] = useState<number | null>(null);
  const [nextTimestampIndex, setNextTimestampIndex] = useState<number>(0);
  
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const savedVideoId = localStorage.getItem('youtubeVideoId');
    if (savedVideoId) {
      setVideoId(savedVideoId);
    } else {
      setVideoId('dQw4w9WgXcQ');
      localStorage.setItem('youtubeVideoId', 'dQw4w9WgXcQ');
    }
  }, []);

  useEffect(() => {
    if (!videoId) return;

    const loadPlayer = () => {
      // @ts-ignore
      playerRef.current = new window.YT.Player('youtube-player', {
        height: '360',
        width: '640',
        videoId: videoId,
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
  }, [videoId]);

  const onPlayerReady = (event: any) => {
    setDuration(event.target.getDuration());
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
        
        if (nextTimestampIndex < timestamps.length && time >= timestamps[nextTimestampIndex]) {
          playerRef.current.pauseVideo();
          setPausedAtTimestamp(timestamps[nextTimestampIndex]);
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
      for (let i = 0; i < timestamps.length; i++) {
        if (newTime < timestamps[i]) {
          newIndex = i;
          break;
        }
      }
      setNextTimestampIndex(newIndex);
      setPausedAtTimestamp(null);
    }
  };

  const skipToNextTimestamp = () => {
    if (nextTimestampIndex < timestamps.length) {
      playerRef.current.seekTo(timestamps[nextTimestampIndex], true);
      setCurrentTime(timestamps[nextTimestampIndex]);
      setNextTimestampIndex(nextTimestampIndex + 1);
      setPausedAtTimestamp(timestamps[nextTimestampIndex]);
      playerRef.current.pauseVideo();
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Player */}
      <div className="lg:col-span-2">
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
            
            {/* Status Display */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-light text-white">
                {pausedAtTimestamp !== null ? (
                  <span className="flex items-center gap-2 text-yellow-400">
                    <Target className="w-4 h-4" />
                    Paused at {formatTime(pausedAtTimestamp)}
                  </span>
                ) : isPlaying ? (
                  <span className="flex items-center gap-2 text-green-400">
                    <Play className="w-4 h-4" />
                    Playing
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-red-400">
                    <Pause className="w-4 h-4" />
                    Paused
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-white/60">
                <Clock className="w-4 h-4" />
                <span className="font-light">{formatTime(currentTime)} / {formatTime(duration)}</span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-white mb-6"
              style={{
                background: `linear-gradient(to right, white 0%, white ${(currentTime / duration) * 100}%, rgba(255,255,255,0.1) ${(currentTime / duration) * 100}%, rgba(255,255,255,0.1) 100%)`
              }}
            />
            
            {/* Controls */}
            <div className="flex justify-center gap-4">
              <motion.button
                onClick={togglePlayPause}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-4 bg-white text-black rounded-full shadow-2xl hover:shadow-white/20 transition-all duration-300"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </motion.button>
              
              <motion.button
                onClick={skipToNextTimestamp}
                disabled={nextTimestampIndex >= timestamps.length}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-4 bg-white/10 text-white rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SkipForward className="w-6 h-6" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Timestamps Sidebar */}
      <div className="lg:col-span-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative p-6 rounded-3xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] overflow-hidden"
        >
          <div className="relative z-10">
            <h3 className="text-xl font-light text-white mb-6 flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg">
                <Clock className="w-4 h-4 text-white" />
              </div>
              Pause Timestamps
            </h3>
            
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {timestamps.map((ts, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className={`group p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                    index === nextTimestampIndex
                      ? 'bg-gradient-to-r from-yellow-400/10 via-orange-400/10 to-red-400/10 border-2 border-yellow-400/30'
                      : index < nextTimestampIndex
                      ? 'bg-green-400/5 border border-green-400/20'
                      : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20'
                  }`}
                  onClick={() => {
                    playerRef.current.seekTo(ts, true);
                    setCurrentTime(ts);
                    setNextTimestampIndex(index);
                    setPausedAtTimestamp(ts);
                    playerRef.current.pauseVideo();
                  }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className={`font-medium ${
                      index === nextTimestampIndex 
                        ? 'text-yellow-300' 
                        : index < nextTimestampIndex 
                          ? 'text-green-300' 
                          : 'text-white/80'
                    }`}>
                      Timestamp {index + 1}
                    </span>
                    <span className="text-white/60 font-mono text-sm">{formatTime(ts)}</span>
                  </div>
                  
                  {index === nextTimestampIndex && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-yellow-300 text-sm"
                    >
                      <Target className="w-3 h-3" />
                      Next pause point
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
            
            {/* Controls Guide */}
            <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
              <h4 className="text-white/80 font-medium mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-400" />
                Controls Guide
              </h4>
              <ul className="text-sm text-white/60 space-y-2 font-light">
                <li className="flex items-center gap-2">
                  <Play className="w-3 h-3 text-green-400" />
                  Play/Pause video
                </li>
                <li className="flex items-center gap-2">
                  <SkipForward className="w-3 h-3 text-blue-400" />
                  Skip to next timestamp
                </li>
                <li className="flex items-center gap-2">
                  <Target className="w-3 h-3 text-yellow-400" />
                  Click timestamps to jump
                </li>
                <li className="flex items-center gap-2">
                  <Volume2 className="w-3 h-3 text-gray-400" />
                  Drag progress bar to seek
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
        
        {/* Video Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 p-4 rounded-2xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.05]"
        >
          <div className="text-center text-white/60 text-sm font-light">
            <p className="mb-2">Video ID: <span className="font-mono text-white/80">{videoId}</span></p>
            <p>Stored in localStorage</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default YouTubePlayer;