import { create } from 'zustand';
import { db, auth } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

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

export interface User {
  id: string;
  email: string;
  name: string;
  startDate: string;
}

export interface TrackerState {
  currentDate: string;
  days: Record<string, DayData>;
  scheduleTemplate: Block[];
  streak: number;
  eliteScore: number;
  lastStreakDate?: string;
  challengeStreak: number;
  lastChallengeDate?: string;
  currentUser: User | null;
  startDate: string | null;
  scheduleChoicePending: boolean;
  scheduleCustomizationActive: boolean;
  scheduleCustomizationSnapshot: {
    currentDate: string;
    days: Record<string, DayData>;
  } | null;
  templateEditorOpen: boolean;
  authError: string | null;
  authSuccess: string | null;
  setDate: (date: string) => void;
  markBlock: (blockIdx: number, status: BlockStatus) => void;
  addNote: (blockIdx: number, note: string) => void;
  updateBlock: (blockIdx: number, updates: Partial<Pick<Block, 'time' | 'label' | 'status' | 'note'>>) => void;
  addBlock: (block?: Partial<Block>) => void;
  removeBlock: (blockIdx: number) => void;
  restoreDefaultSchedule: () => void;
  setScheduleTemplate: (blocks: Block[]) => void;
  restoreMasterSchedule: () => void;
  openTemplateEditor: () => void;
  closeTemplateEditor: () => void;
  setScheduleChoicePending: (value: boolean) => void;
  setScheduleCustomizationActive: (value: boolean) => void;
  beginScheduleCustomization: () => void;
  saveScheduleCustomization: () => void;
  cancelScheduleCustomization: () => void;
  setJournal: (journal: string) => void;
  resetDay: () => void;
  loadFromFirestore: () => void;
  awardChallengeXP: (difficulty: string) => void;
  setCurrentUser: (user: User, isSignUp?: boolean) => Promise<void>;
  setStartDate: (date: string) => void;
  setAuthError: (val: string | null) => void;
  setAuthSuccess: (val: string | null) => void;
  logout: () => void;
}

export const defaultBlocks: Block[] = [
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

function getUserDoc(userId: string) {
  return doc(db, 'users', userId);
}

function createDefaultBlocks(): Block[] {
  return defaultBlocks.map((block) => ({ ...block }));
}

function getRequiredTasks(taskCount: number, dayIndex: number): number {
  const ratio = dayIndex < 31 ? 0.7 : dayIndex < 61 ? 0.8 : 0.85;

  if (taskCount >= 14) {
    if (dayIndex < 31) return 10;
    if (dayIndex < 61) return 12;
    return 14;
  }

  return Math.max(1, Math.ceil(taskCount * ratio));
}

function getSerializableState(state: TrackerState) {
  const {
    currentDate,
    days,
    scheduleTemplate,
    streak,
    eliteScore,
    lastStreakDate,
    challengeStreak,
    lastChallengeDate,
    scheduleChoicePending,
    scheduleCustomizationActive,
  } = state;
  return {
    currentDate,
    days,
    scheduleTemplate,
    streak,
    eliteScore,
    lastStreakDate,
    challengeStreak,
    lastChallengeDate,
    scheduleChoicePending,
    scheduleCustomizationActive,
  };
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
  cumulativeXP[i + 1] = cumulativeXP[i] + Number(levelList[i][2]);
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

function calculateGamifiedStats(days: Record<string, DayData>, currentDate: string): { streak: number, eliteScore: number, lastStreakDate: string } {
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
    const threshold = getRequiredTasks(day.blocks.length, dayIdx);
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
    const threshold = getRequiredTasks(day.blocks.length, i);
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
    [getToday()]: { date: getToday(), blocks: createDefaultBlocks() },
  },
  scheduleTemplate: createDefaultBlocks(),
  streak: 0,
  eliteScore: 0,
  lastStreakDate: '',
  challengeStreak: 0,
  lastChallengeDate: '',
  currentUser: null,
  startDate: null,
  scheduleChoicePending: false,
  scheduleCustomizationActive: false,
  scheduleCustomizationSnapshot: null,
  templateEditorOpen: false,
  authError: null,
  authSuccess: null,
  setAuthError: (val) => set({ authError: val }),
  setAuthSuccess: (val) => set({ authSuccess: val }),
  setDate: (date) => {
    const { days, currentUser, scheduleTemplate } = get();
    if (!currentUser) return;
    
    if (!days[date]) {
      days[date] = { date, blocks: scheduleTemplate.map((block) => ({ ...block })) };
    }
    const stats = calculateGamifiedStats(days, date);
    set({ currentDate: date, days: { ...days }, ...stats });
    setDoc(getUserDoc(currentUser.id), getSerializableState({ ...get(), ...stats }));
  },
  markBlock: (blockIdx, status) => {
    const { currentDate, days, currentUser } = get();
    if (!currentUser) return;
    
    const blocks = days[currentDate].blocks.map((b, i) =>
      i === blockIdx ? { ...b, status } : b
    );
    days[currentDate].blocks = blocks;
    const stats = calculateGamifiedStats(days, currentDate);
    set({ days: { ...days }, ...stats });
    setDoc(getUserDoc(currentUser.id), getSerializableState({ ...get(), ...stats }));
  },
  addNote: (blockIdx, note) => {
    const { currentDate, days, currentUser } = get();
    if (!currentUser) return;
    
    const blocks = days[currentDate].blocks.map((b, i) =>
      i === blockIdx ? { ...b, note } : b
    );
    days[currentDate].blocks = blocks;
    const stats = calculateGamifiedStats(days, currentDate);
    set({ days: { ...days }, ...stats });
    setDoc(getUserDoc(currentUser.id), getSerializableState({ ...get(), ...stats }));
  },
  setScheduleTemplate: (blocks) => {
    const { currentDate, days, currentUser } = get();
    if (!currentUser) return;

    const nextTemplate = blocks.map((block) => ({ ...block }));
    set({ scheduleTemplate: nextTemplate });

    if (days[currentDate]) {
      days[currentDate].blocks = nextTemplate.map((block) => ({ ...block }));
      const stats = calculateGamifiedStats(days, currentDate);
      set({ days: { ...days }, ...stats });
      setDoc(getUserDoc(currentUser.id), getSerializableState({ ...get(), scheduleTemplate: nextTemplate, ...stats }));
      return;
    }

    setDoc(getUserDoc(currentUser.id), getSerializableState({ ...get(), scheduleTemplate: nextTemplate }));
  },
  restoreMasterSchedule: () => {
    const { currentDate, days, currentUser } = get();
    if (!currentUser) return;

    const masterTemplate = createDefaultBlocks();
    set({ scheduleTemplate: masterTemplate });
    if (days[currentDate]) {
      days[currentDate].blocks = masterTemplate.map((block) => ({ ...block }));
      const stats = calculateGamifiedStats(days, currentDate);
      set({ days: { ...days }, ...stats });
      setDoc(getUserDoc(currentUser.id), getSerializableState({ ...get(), scheduleTemplate: masterTemplate, ...stats }));
      return;
    }

    setDoc(getUserDoc(currentUser.id), getSerializableState({ ...get(), scheduleTemplate: masterTemplate }));
  },
  openTemplateEditor: () => set({ templateEditorOpen: true }),
  closeTemplateEditor: () => set({ templateEditorOpen: false }),
  setScheduleChoicePending: (value) => {
    set({ scheduleChoicePending: value });
    const { currentUser } = get();
    if (currentUser) {
      setDoc(getUserDoc(currentUser.id), getSerializableState(get()));
    }
  },
  setScheduleCustomizationActive: (value) => {
    set({ scheduleCustomizationActive: value });
    const { currentUser } = get();
    if (currentUser) {
      setDoc(getUserDoc(currentUser.id), getSerializableState(get()));
    }
  },
  beginScheduleCustomization: () => {
    const { currentDate, days } = get();
    set({
      scheduleCustomizationActive: true,
      scheduleCustomizationSnapshot: {
        currentDate,
        days: JSON.parse(JSON.stringify(days)),
      },
    });
  },
  saveScheduleCustomization: () => {
    const { currentUser } = get();
    set({ scheduleCustomizationActive: false, scheduleCustomizationSnapshot: null });
    if (currentUser) {
      setDoc(getUserDoc(currentUser.id), getSerializableState(get()));
    }
  },
  cancelScheduleCustomization: () => {
    const { currentUser, scheduleCustomizationSnapshot } = get();
    if (scheduleCustomizationSnapshot) {
      set({
        currentDate: scheduleCustomizationSnapshot.currentDate,
        days: JSON.parse(JSON.stringify(scheduleCustomizationSnapshot.days)),
        scheduleCustomizationActive: false,
        scheduleCustomizationSnapshot: null,
      });
      if (currentUser) {
        setDoc(
          getUserDoc(currentUser.id),
          getSerializableState({
            ...get(),
            currentDate: scheduleCustomizationSnapshot.currentDate,
            days: JSON.parse(JSON.stringify(scheduleCustomizationSnapshot.days)),
          } as TrackerState),
        );
      }
      return;
    }

    set({ scheduleCustomizationActive: false, scheduleCustomizationSnapshot: null });
  },
  updateBlock: (blockIdx, updates) => {
    const { currentDate, days, currentUser } = get();
    if (!currentUser) return;

    const blocks = days[currentDate].blocks.map((block, index) =>
      index === blockIdx ? { ...block, ...updates } : block
    );
    days[currentDate].blocks = blocks;
    const stats = calculateGamifiedStats(days, currentDate);
    set({ days: { ...days }, ...stats });
    setDoc(getUserDoc(currentUser.id), getSerializableState({ ...get(), ...stats }));
  },
  addBlock: (block = {}) => {
    const { currentDate, days, currentUser } = get();
    if (!currentUser) return;

    const nextBlock: Block = {
      time: block.time ?? '12:00 PM',
      label: block.label ?? 'New custom block',
      status: block.status ?? 'pending',
      note: block.note,
    };

    days[currentDate].blocks = [...days[currentDate].blocks, nextBlock];
    const stats = calculateGamifiedStats(days, currentDate);
    set({ days: { ...days }, ...stats });
    setDoc(getUserDoc(currentUser.id), getSerializableState({ ...get(), ...stats }));
  },
  removeBlock: (blockIdx) => {
    const { currentDate, days, currentUser } = get();
    if (!currentUser) return;

    const nextBlocks = days[currentDate].blocks.filter((_, index) => index !== blockIdx);
    days[currentDate].blocks = nextBlocks.length > 0 ? nextBlocks : createDefaultBlocks();
    const stats = calculateGamifiedStats(days, currentDate);
    set({ days: { ...days }, ...stats });
    setDoc(getUserDoc(currentUser.id), getSerializableState({ ...get(), ...stats }));
  },
  restoreDefaultSchedule: () => {
    const { currentDate, days, currentUser } = get();
    if (!currentUser) return;

    days[currentDate].blocks = get().scheduleTemplate.map((block) => ({ ...block }));
    const stats = calculateGamifiedStats(days, currentDate);
    set({ days: { ...days }, ...stats });
    setDoc(getUserDoc(currentUser.id), getSerializableState({ ...get(), ...stats }));
  },
  setJournal: (journal) => {
    const { currentDate, days, currentUser } = get();
    if (!currentUser) return;
    
    days[currentDate].journal = journal;
    const stats = calculateGamifiedStats(days, currentDate);
    set({ days: { ...days }, ...stats });
    setDoc(getUserDoc(currentUser.id), getSerializableState({ ...get(), ...stats }));
  },
  resetDay: () => {
    const { currentDate, days, currentUser, scheduleTemplate } = get();
    if (!currentUser) return;
    
    days[currentDate].blocks = scheduleTemplate.map((block) => ({ ...block }));
    const stats = calculateGamifiedStats(days, currentDate);
    set({ days: { ...days }, ...stats });
    setDoc(getUserDoc(currentUser.id), getSerializableState({ ...get(), ...stats }));
  },
  loadFromFirestore: async () => {
    const { currentUser } = get();
    if (!currentUser) return;
    
    const snap = await getDoc(getUserDoc(currentUser.id));
    if (snap.exists()) {
      const data = snap.data() as any;
      const today = getToday();
      const scheduleTemplate = Array.isArray(data.scheduleTemplate) && data.scheduleTemplate.length
        ? data.scheduleTemplate
        : createDefaultBlocks();
      
      // Ensure current date has blocks
      if (!data.days || !data.days[today]) {
        data.days = {
          ...data.days,
          [today]: { 
            date: today, 
            blocks: scheduleTemplate.map((block: Block) => ({ ...block }))
          }
        };
      }
      
      set({
        ...data,
        scheduleTemplate: scheduleTemplate.map((block: Block) => ({ ...block })),
        scheduleChoicePending: data.scheduleChoicePending ?? false,
        scheduleCustomizationActive: data.scheduleCustomizationActive ?? false
      });
    }
  },
  awardChallengeXP: (difficulty: string) => {
    const { eliteScore, currentUser } = get();
    if (!currentUser) return;
    
    let xpAward = 1; // easy
    if (difficulty === 'medium') xpAward = 2;
    if (difficulty === 'hard') xpAward = 3;
    if (difficulty === 'expert') xpAward = 3;
    if (difficulty === 'schulte') xpAward = 1;
    if (difficulty === 'memoryPalace') xpAward = 1;
    if (difficulty === 'patternMatrix') xpAward = 1;
    
    const newEliteScore = eliteScore + xpAward;
    set({ eliteScore: newEliteScore });
    setDoc(getUserDoc(currentUser.id), getSerializableState({ 
      ...get(), 
      eliteScore: newEliteScore
    }));
  },
  setCurrentUser: async (user: User, isSignUp?: boolean) => {
    set({ currentUser: user, templateEditorOpen: false });
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    // Load or create user-specific data when user is set
    setTimeout(async () => {
      const state = useTrackerStore.getState();
      
      let exists = false;
      try {
        const snap = await getDoc(getUserDoc(user.id));
        exists = snap.exists();
        if (exists) {
          state.loadFromFirestore();
        }
      } catch (err: any) {
        console.warn('Store init: Firestore read check failed (possible rules denial on non-existent doc):', err);
        if (err.code === 'permission-denied' || err.message?.includes('permission')) {
          exists = false;
        } else {
          console.error('Firestore critical read error:', err);
        }
      }
      
      if (!exists) {
        // New user, create initial data
        const today = getToday();
        const initialState = {
          currentDate: today,
          days: {
            [today]: { 
              date: today, 
              blocks: createDefaultBlocks()
            }
          },
          scheduleTemplate: createDefaultBlocks(),
          streak: 0,
          eliteScore: 0,
          lastStreakDate: '',
          challengeStreak: 0,
          lastChallengeDate: '',
          currentUser: user,
          startDate: user.startDate,
          scheduleChoicePending: !!isSignUp,
          scheduleCustomizationActive: false
        };
        set(initialState);
        setDoc(getUserDoc(user.id), getSerializableState({ ...get(), ...initialState }));
        console.log('Created initial data for new user:', user.id);
      }
    }, 100);
  },
  setStartDate: (date: string) => {
    set({ startDate: date });
    localStorage.setItem('startDate', date);
  },
  logout: async () => {
    try {
      await signOut(auth);
      set({ 
        currentUser: null, 
        startDate: null,
        scheduleChoicePending: false,
        scheduleCustomizationActive: false,
        templateEditorOpen: false,
        days: {},
        scheduleTemplate: createDefaultBlocks(),
        streak: 0,
        eliteScore: 0,
        lastStreakDate: '',
        challengeStreak: 0,
        lastChallengeDate: '',
        authError: null,
        authSuccess: null
      });
      localStorage.removeItem('currentUser');
      localStorage.removeItem('startDate');
    } catch (error) {
      console.error('Logout error:', error);
    }
  },
}));

// Don't load data on app start - wait for user authentication

// Returns the streak as of a given date (consecutive days up to and including that date that meet the threshold)
export function getStreakAsOfDate(days: Record<string, DayData>, date: string): number {
  const sortedDates = Object.keys(days).filter(d => d <= date).sort();
  let streak = 0;
  let streaking = true;
  for (let i = sortedDates.length - 1; i >= 0; i--) {
    const d = sortedDates[i];
    const day = days[d];
    const doneCount = day.blocks.filter(b => b.status === 'done').length;
    const threshold = getRequiredTasks(day.blocks.length, i);
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
