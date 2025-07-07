import { create } from 'zustand';
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export type BlockStatus = 'pending' | 'done' | 'skipped';

export interface Block {
  time: string;
  label: string;
  status: BlockStatus;
  note?: string;
}

export interface DayData {
  date: string; // YYYY-MM-DD
  blocks: Block[];
  journal?: string;
}

export interface TrackerState {
  currentDate: string;
  days: Record<string, DayData>;
  streak: number;
  eliteScore: number;
  lastStreakDate?: string;
  setDate: (date: string) => void;
  markBlock: (blockIdx: number, status: BlockStatus) => void;
  addNote: (blockIdx: number, note: string) => void;
  setJournal: (journal: string) => void;
  resetDay: () => void;
  loadFromFirestore: () => void;
}

const defaultBlocks: Block[] = [
  { time: '5:00–5:15 AM', label: 'Hydrate + Stretch', status: 'pending' },
  { time: '5:15–5:30 AM', label: 'Breath Meditation', status: 'pending' },
  { time: '5:30–6:00 AM', label: 'Workout', status: 'pending' },
  { time: '6:00–6:30 AM', label: 'Shower and Get Ready', status: 'pending' },
  { time: '6:30–7:30 AM', label: 'Book Reading (1 Chapter)', status: 'pending' },
  { time: '7:30–8:20 AM', label: 'AI/ML Study, Micro Blog, Tech Trends, Podcast Walk, Voice Practice', status: 'pending' },
  { time: '8:20–8:40 AM', label: 'Healthy Breakfast', status: 'pending' },
  { time: '8:40 AM–4:10 PM', label: 'College Hours', status: 'pending' },
  { time: '4:10–5:00 PM', label: 'Tea Break and Relaxation', status: 'pending' },
  { time: '5:00–8:00 PM', label: 'Build Projects (Frontend/Backend) / AI/ML Project Integration', status: 'pending' },
  { time: '8:00–8:30 PM', label: 'Dinner & Music (Recharge)', status: 'pending' },
  { time: '8:30–9:00 PM', label: 'Speech/Presentation Practice (TED-style, Record)', status: 'pending' },
  { time: '9:00–10:00 PM', label: 'Academics (Assignments, Revision, OS topics, etc.)', status: 'pending' },
  { time: '10:00–10:30 PM', label: 'Reflection & Daily Log', status: 'pending' },
  { time: '10:30–11:30 PM', label: 'Work / Movies / Personal Projects / Free Time', status: 'pending' },
  { time: '11:30 PM', label: 'Sleep', status: 'pending' },
];

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

const FIRESTORE_DOC = doc(db, 'trackers', 'main');

function getSerializableState(state: TrackerState) {
  const { currentDate, days, streak, eliteScore, lastStreakDate } = state;
  return { currentDate, days, streak, eliteScore, lastStreakDate };
}

// Level system
const levelList = [
  // [icon, title, xpToNextLevel]
  ['🥚', 'Noob', 50], ['🌱', 'Rookie', 51], ['🦄', 'Beginner', 52], ['🐣', 'Novice', 53], ['👶', 'Trainee', 54],
  ['🧑‍🎓', 'Apprentice', 55], ['📚', 'Learner', 56], ['🔰', 'Initiate', 57], ['🎒', 'Cadet', 58], ['🕵️‍♂️', 'Scout', 59],
  ['🧗‍♂️', 'Adventurer', 60], ['🧭', 'Explorer', 61], ['🎯', 'Amateur', 62], ['🛡️', 'Squire', 63], ['🔎', 'Seeker', 64],
  ['🧳', 'Wanderer', 65], ['🗺️', 'Pathfinder', 66], ['🛠️', 'Journeyman', 67], ['⚡', 'Adept', 68], ['🕵️', 'Agent', 69],
  ['🧠', 'Skilled', 70], ['🛡️', 'Proficient', 71], ['⚔️', 'Warrior', 72], ['🥊', 'Fighter', 73], ['🔬', 'Specialist', 74],
  ['🕹️', 'Operative', 75], ['🥷', 'Striker', 76], ['🏆', 'Challenger', 77], ['🛩️', 'Ace', 78], ['🎖️', 'Veteran', 79],
  ['💎', 'Elite', 80], ['🧙‍♂️', 'Expert', 81], ['🤺', 'Knight', 82], ['🛡️', 'Guardian', 83], ['🛡️', 'Sentinel', 84],
  ['🛡️', 'Defender', 85], ['🛡️', 'Crusader', 86], ['🗡️', 'Slayer', 87], ['🏅', 'Champion', 88], ['🦸‍♂️', 'Hero', 89],
  ['🧙', 'Master', 90], ['👑', 'Grandmaster', 91], ['🦄', 'Legend', 92], ['🐉', 'Mythic', 93], ['🎻', 'Virtuoso', 94],
  ['🧙‍♂️', 'Sage', 95], ['🛡️', 'Warden', 96], ['🛡️', 'Paladin', 97], ['🛡️', 'Commander', 98], ['🛡️', 'Conqueror', 99],
  ['🦸', 'Epic', 100], ['🛡️', 'Guardian II', 101], ['🦅', 'Ascendant', 102], ['🦉', 'Immortal', 103], ['🦋', 'Paragon', 104],
  ['🌟', 'Luminary', 105], ['🛡️', 'Vanguard', 106], ['🧙‍♂️', 'Invoker', 107], ['🧙‍♂️', 'Invoker II', 108], ['🧙‍♂️', 'Invoker III', 109],
  ['👑', 'Supreme', 110], ['🦄', 'Archon', 111], ['🧠', 'Prodigy', 112], ['🔮', 'Oracle', 113], ['🎼', 'Maestro', 114], ['🎼', 'Maestro II', 115],
  ['🎼', 'Maestro III', 116], ['🎼', 'Maestro IV', 117], ['🎼', 'Maestro V', 118], ['🎻', 'Virtuoso II', 119], ['🌌', 'Celestial', 120],
  ['🌌', 'Celestial II', 121], ['🌌', 'Celestial III', 122], ['🌈', 'Divine', 123], ['🌈', 'Divine II', 124], ['🌈', 'Divine III', 125],
  ['🌟', 'Ultimate', 126], ['🌟', 'Ultimate II', 127], ['🌟', 'Ultimate III', 128], ['🌟', 'Ultimate IV', 129], ['⚡', 'Godlike', 130],
  ['⚡', 'Godlike II', 131], ['⚡', 'Godlike III', 132], ['🌠', 'Transcendent', 133], ['🌠', 'Transcendent II', 134], ['🌠', 'Transcendent III', 135],
  ['♾️', 'Eternal', 136], ['♾️', 'Eternal II', 137], ['♾️', 'Eternal III', 138], ['♾️', 'Eternal IV', 139], ['∞', 'Infinity', 140],
  ['∞', 'Infinity II', 141], ['∞', 'Infinity III', 142], ['∞', 'Infinity IV', 143], ['∞', 'Infinity V', 144], ['∞', 'Infinity VI', 145],
  ['∞', 'Infinity VII', 146], ['∞', 'Infinity VIII', 147], ['∞', 'Infinity IX', 148], ['🏅', 'Legendary', 149],
];

// Cumulative XP thresholds for each level
export const cumulativeXP = [0];
for (let i = 0; i < levelList.length; i++) {
  cumulativeXP[i + 1] = cumulativeXP[i] + levelList[i][2];
}

export function getLevel(eliteScore: number) {
  let level = 1;
  for (let i = 1; i < cumulativeXP.length; i++) {
    if (eliteScore < cumulativeXP[i]) {
      level = i;
      const xpToNext = cumulativeXP[i] - eliteScore;
      return { level, title: levelList[i - 1][1], icon: levelList[i - 1][0], xpToNext, prevLevelXP: cumulativeXP[i - 1], nextLevelXP: cumulativeXP[i] };
    }
  }
  // Max level
  return { level: levelList.length, title: levelList[levelList.length - 1][1], icon: levelList[levelList.length - 1][0], xpToNext: 0, prevLevelXP: cumulativeXP[cumulativeXP.length - 2], nextLevelXP: cumulativeXP[cumulativeXP.length - 1] };
}

function calculateGamifiedStats(days: Record<string, DayData>, currentDate: string, prevStreak: number, prevLastStreakDate?: string): { streak: number, eliteScore: number, lastStreakDate: string } {
  let eliteScore = 0;
  let lastStreakDate = '';
  let streakBonusDays = 0;
  // Sort dates ascending
  const sortedDates = Object.keys(days).sort();
  // Calculate eliteScore for all days
  for (const date of sortedDates) {
    const day = days[date];
    const doneCount = day.blocks.filter(b => b.status === 'done').length;
    const hasJournal = !!day.journal && day.journal.trim().length > 0;
    eliteScore += doneCount;
    if (hasJournal) eliteScore += 2;
    // Streak day bonus (for all days that would have counted as a streak day)
    const dayIdx = sortedDates.indexOf(date);
    let threshold = 10;
    if (dayIdx >= 31 && dayIdx < 61) threshold = 12;
    if (dayIdx >= 61) threshold = 14;
    if (doneCount >= threshold) {
      eliteScore += 5;
    }
  }
  // Calculate current streak (consecutive days up to currentDate)
  let streak = 0;
  let streaking = true;
  for (let i = sortedDates.length - 1; i >= 0; i--) {
    const date = sortedDates[i];
    if (date > currentDate) continue;
    const day = days[date];
    const doneCount = day.blocks.filter(b => b.status === 'done').length;
    let threshold = 10;
    if (i >= 31 && i < 61) threshold = 12;
    if (i >= 61) threshold = 14;
    if (doneCount >= threshold && streaking) {
      streak++;
      lastStreakDate = date;
      if (streak > 0 && streak % 7 === 0) {
        eliteScore += 10; // 7-day streak bonus
        streakBonusDays++;
      }
    } else {
      streaking = false;
    }
  }
  return { streak, eliteScore, lastStreakDate };
}

export const useTrackerStore = create<TrackerState>((set, get) => ({
  currentDate: getToday(),
  days: {
    [getToday()]: { date: getToday(), blocks: defaultBlocks },
  },
  streak: 0,
  eliteScore: 0,
  lastStreakDate: '',
  setDate: (date) => {
    const { days, streak, lastStreakDate } = get();
    if (!days[date]) {
      days[date] = { date, blocks: defaultBlocks.map(b => ({ ...b })) };
    }
    const stats = calculateGamifiedStats(days, date, streak, lastStreakDate);
    set({ currentDate: date, days: { ...days }, ...stats });
    setDoc(FIRESTORE_DOC, getSerializableState({ ...get(), ...stats }));
  },
  markBlock: (blockIdx, status) => {
    const { currentDate, days, streak, lastStreakDate } = get();
    const blocks = days[currentDate].blocks.map((b, i) =>
      i === blockIdx ? { ...b, status } : b
    );
    days[currentDate].blocks = blocks;
    const stats = calculateGamifiedStats(days, currentDate, streak, lastStreakDate);
    set({ days: { ...days }, ...stats });
    setDoc(FIRESTORE_DOC, getSerializableState({ ...get(), ...stats }));
  },
  addNote: (blockIdx, note) => {
    const { currentDate, days, streak, lastStreakDate } = get();
    const blocks = days[currentDate].blocks.map((b, i) =>
      i === blockIdx ? { ...b, note } : b
    );
    days[currentDate].blocks = blocks;
    const stats = calculateGamifiedStats(days, currentDate, streak, lastStreakDate);
    set({ days: { ...days }, ...stats });
    setDoc(FIRESTORE_DOC, getSerializableState({ ...get(), ...stats }));
  },
  setJournal: (journal) => {
    const { currentDate, days, streak, lastStreakDate } = get();
    days[currentDate].journal = journal;
    const stats = calculateGamifiedStats(days, currentDate, streak, lastStreakDate);
    set({ days: { ...days }, ...stats });
    setDoc(FIRESTORE_DOC, getSerializableState({ ...get(), ...stats }));
  },
  resetDay: () => {
    const { currentDate, days, streak, lastStreakDate } = get();
    days[currentDate].blocks = defaultBlocks.map(b => ({ ...b }));
    const stats = calculateGamifiedStats(days, currentDate, streak, lastStreakDate);
    set({ days: { ...days }, ...stats });
    setDoc(FIRESTORE_DOC, getSerializableState({ ...get(), ...stats }));
  },
  loadFromFirestore: async () => {
    const snap = await getDoc(FIRESTORE_DOC);
    if (snap.exists()) {
      set(snap.data() as any);
    }
  },
}));

// On app load, fetch Firestore data
useTrackerStore.getState().loadFromFirestore();

// Returns the streak as of a given date (consecutive days up to and including that date that meet the threshold)
export function getStreakAsOfDate(days: Record<string, DayData>, date: string): number {
  const sortedDates = Object.keys(days).filter(d => d <= date).sort();
  let streak = 0;
  let streaking = true;
  for (let i = sortedDates.length - 1; i >= 0; i--) {
    const d = sortedDates[i];
    const day = days[d];
    const doneCount = day.blocks.filter(b => b.status === 'done').length;
    let threshold = 10;
    if (i >= 31 && i < 61) threshold = 12;
    if (i >= 61) threshold = 14;
    if (doneCount >= threshold && streaking) {
      streak++;
    } else {
      streaking = false;
    }
  }
  return streak;
}

// Returns the streak as of the most recent completed day (yesterday if today exists, or the last day before today)
export function getStreakAsOfYesterday(days: Record<string, DayData>): number {
  const today = new Date().toISOString().slice(0, 10);
  const sortedDates = Object.keys(days).filter(d => d < today).sort();
  if (sortedDates.length === 0) return 0;
  const lastCompletedDate = sortedDates[sortedDates.length - 1];
  return getStreakAsOfDate(days, lastCompletedDate);
} 