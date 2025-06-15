// Video and timestamp data
export interface Timestamp {
  time: number;
  title: string;
}

export interface VideoData {
  id: string;
  title: string;
  artist: string;
  duration: number;
  timestamps: Timestamp[];
}

export interface PCMTrack {
  id: string;
  title: string;
  duration: string;
  bpm: number;
  key: string;
  mood: string;
  tags: string[];
}

// Sample video data with timestamps

const videoId = localStorage.getItem("videoId") as string;
export const videoData: VideoData = {
  id: videoId, // Rick Astley - Never Gonna Give You Up (sample)
  title: 'Educational Physics Lecture - Mechanics and Thermodynamics',
  artist: 'Dr. Physics Professor',
  duration: 300, // 5 minutes
  timestamps: [
    { time: 30, title: 'Introduction to Kinematics' },
    { time: 75, title: 'Newton\'s Laws of Motion' },
    { time: 120, title: 'Energy and Work' },
    { time: 165, title: 'Thermodynamic Processes' },
    { time: 210, title: 'Heat Transfer Mechanisms' },
    { time: 255, title: 'Electromagnetic Fields' },
    { time: 285, title: 'Quantum Mechanics Basics' }
  ]
};

// PCM audio tracks data
export const pcmTracks: PCMTrack[] = [
  {
    id: 'track-1',
    title: 'Ambient Study Focus',
    duration: '4:32',
    bpm: 72,
    key: 'C Major',
    mood: 'Calm',
    tags: ['ambient', 'study', 'focus', 'peaceful']
  },
  {
    id: 'track-2',
    title: 'Classical Piano Meditation',
    duration: '6:15',
    bpm: 60,
    key: 'D Minor',
    mood: 'Relaxing',
    tags: ['classical', 'piano', 'meditation', 'soft']
  },
  {
    id: 'track-3',
    title: 'Nature Sounds - Forest',
    duration: '8:00',
    bpm: 0,
    key: 'Natural',
    mood: 'Peaceful',
    tags: ['nature', 'forest', 'birds', 'ambient']
  },
  {
    id: 'track-4',
    title: 'Lo-Fi Study Beats',
    duration: '3:45',
    bpm: 85,
    key: 'G Major',
    mood: 'Chill',
    tags: ['lo-fi', 'beats', 'study', 'hip-hop']
  },
  {
    id: 'track-5',
    title: 'White Noise - Rain',
    duration: '10:00',
    bpm: 0,
    key: 'Natural',
    mood: 'Soothing',
    tags: ['white-noise', 'rain', 'sleep', 'focus']
  }
];