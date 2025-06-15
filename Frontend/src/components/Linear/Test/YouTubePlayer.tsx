import React, { useState, useEffect, useRef } from 'react';

interface YouTubePlayerProps {
  timestamps: number[];
}

interface PCMTrack {
  id: string;
  title: string;
  duration: string;
  bpm: number;
  key: string;
  mood: string;
  tags: string[];
}

// YouTubePlayer component
const YouTubePlayer: React.FC = () => {
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [pcmTracks, setPcmTracks] = useState<PCMTrack[]>([]);
  const [player, setPlayer] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [activeChapter, setActiveChapter] = useState(0);
  const [backgroundTrack, setBackgroundTrack] = useState<PCMTrack | null>(null);
  const [bgAudioPlaying, setBgAudioPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get video ID from localStorage on mount
  useEffect(() => {
    const savedVideoId = localStorage.getItem('youtubeVideoId');
    if (savedVideoId) {
      setVideoId(savedVideoId);
    } else {
      // Default video if none is set
      setVideoId(savedVideoId!);
    //   localStorage.setItem('youtubeVideoId', 'dQw4w9WgXcQ');
    }
  }, []);

  useEffect(() => {
    if (!videoData || !videoData.id) return;

    const loadPlayer = () => {
      // @ts-ignore
      playerRef.current = new window.YT.Player('youtube-player', {
        height: '100%',
        width: '100%',
        videoId: videoData.id,
        playerVars: {
          playsinline: 1,
          enablejsapi: 1,
          origin: window.location.origin,
          controls: 0
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
  }, [videoData]);

  const onPlayerReady = (event: any) => {
    setPlayer(event.target);
    setDuration(event.target.getDuration());
    event.target.setVolume(volume);
    if (isMuted) event.target.mute();
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
      if (player && player.getCurrentTime) {
        const time = player.getCurrentTime();
        setCurrentTime(time);
        
        // Check if we've reached the next timestamp
        if (nextTimestampIndex < timestamps.length && time >= timestamps[nextTimestampIndex]) {
          playerRef.current.pauseVideo();
          setPausedAtTimestamp(timestamps[nextTimestampIndex]);
          setNextTimestampIndex(nextTimestampIndex + 1);
        }
      }
    }, 500);
  };

  const togglePlayPause = () => {
    if (!player) return;
    
    if (isPlaying) {
      player.pauseVideo();
    } else {
      if (pausedAtTimestamp !== null) {
        // Resume from where we paused at timestamp
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
      
      // Update next timestamp index based on new position
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

  const skipToNextChapter = () => {
    if (!videoData) return;
    
    const nextChapter = activeChapter + 1;
    if (nextChapter < videoData.timestamps.length) {
      const nextTime = videoData.timestamps[nextChapter].time;
      player.seekTo(nextTime, true);
      setCurrentTime(nextTime);
      setActiveChapter(nextChapter);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleTrackSelect = (track: PCMTrack) => {
    setBackgroundTrack(track);
    setBgAudioPlaying(true);
    console.log(`Now playing background track: ${track.title}`);
  };

  const toggleBackgroundAudio = () => {
    setBgAudioPlaying(!bgAudioPlaying);
    console.log(`Background audio ${bgAudioPlaying ? 'paused' : 'playing'}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        <p className="ml-4 text-purple-500">Loading player...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 p-6">
        <div className="bg-red-500/20 p-6 rounded-xl max-w-md text-center">
          <h3 className="text-red-200 font-bold text-2xl mb-3">Error</h3>
          <p className="text-red-100 mb-5">{error}</p>
          <button 
            className="px-6 py-3 bg-red-600 rounded-lg hover:bg-red-700 transition font-medium"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!videoData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 p-6">
        <div className="bg-yellow-500/20 p-6 rounded-xl max-w-md text-center">
          <h3 className="text-yellow-200 font-bold text-2xl mb-3">No Video Data</h3>
          <p className="text-yellow-100 mb-5">Could not load video information</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-2xl">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <div className="bg-black rounded-xl overflow-hidden shadow-lg">
            <div id="youtube-player" className="w-full aspect-video" />
          </div>
          
          <div className="mt-6 bg-gray-800/50 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-lg font-semibold text-white">
                {pausedAtTimestamp !== null ? (
                  <span className="text-yellow-400">Paused at {formatTime(pausedAtTimestamp)}</span>
                ) : isPlaying ? (
                  <span className="text-green-400">Playing</span>
                ) : (
                  <span className="text-red-400">Paused</span>
                )}
              </div>
              
              <div className="text-gray-300">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
            
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
            
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={togglePlayPause}
                className={`p-4 rounded-full ${
                  isPlaying 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-green-600 hover:bg-green-700'
                } transition-colors`}
              >
                {isPlaying ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              
              <button
                onClick={skipToNextTimestamp}
                disabled={nextTimestampIndex >= timestamps.length}
                className={`p-4 rounded-full ${
                  nextTimestampIndex >= timestamps.length
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                } transition-colors`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798L4.555 5.168z" />
                  <path d="M15 6a1 1 0 10-2 0v8a1 1 0 102 0V6z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <div className="md:w-80 bg-gray-800/50 backdrop-blur-sm rounded-xl p-4">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            Pause Timestamps
          </h3>
          
          <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
            {timestamps.map((ts, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  index === nextTimestampIndex
                    ? 'bg-yellow-500/20 border border-yellow-500'
                    : index < nextTimestampIndex
                    ? 'bg-green-500/10 border border-green-500/30'
                    : 'bg-gray-700/50 hover:bg-gray-700'
                }`}
                onClick={() => {
                  playerRef.current.seekTo(ts, true);
                  setCurrentTime(ts);
                  setNextTimestampIndex(index);
                  setPausedAtTimestamp(ts);
                  playerRef.current.pauseVideo();
                }}
              >
                <div className="flex justify-between items-center">
                  <span className={`font-medium ${
                    index === nextTimestampIndex 
                      ? 'text-yellow-300' 
                      : index < nextTimestampIndex 
                        ? 'text-green-300' 
                        : 'text-gray-300'
                  }`}>
                    Timestamp {index + 1}
                  </span>
                  <span className="text-gray-400 font-mono">{formatTime(ts)}</span>
                </div>
                
                {index === nextTimestampIndex && (
                  <div className="mt-2 text-yellow-300 text-sm flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Next pause point
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-3 bg-gray-900/50 rounded-lg">
            <h4 className="text-gray-300 font-medium mb-2 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
              </svg>
              Controls Guide
            </h4>
            <ul className="text-sm text-gray-400 space-y-1">
              <li className="flex items-start gap-2">
                <span className="text-green-400">▶️</span> Play/Pause video
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">⏭️</span> Skip to next timestamp
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400">⏱️</span> Click timestamps to jump
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-300">📊</span> Drag progress bar to seek
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>Video ID: {videoId} (stored in localStorage)</p>
        <p className="mt-2">To change the video, update the "youtubeVideoId" in localStorage</p>
      </div>
    </div>
  );
};

export default YouTubePlayer;