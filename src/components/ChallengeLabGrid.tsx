import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { FaArrowRight, FaCheck, FaStopwatch, FaBolt } from 'react-icons/fa';
import { useTrackerStore } from '../store';
import styles from './DailyChallengeGenerator.module.css';

type Choice = {
  label: string;
  correct: boolean;
};

function Shell({
  id,
  title,
  icon,
  subtitle,
  children,
  accent = '#2563eb',
}: {
  id: string;
  title: string;
  icon: ReactNode;
  subtitle: string;
  children: ReactNode;
  accent?: string;
}) {
  return (
    <div id={id} className={styles.placeholderCard} style={{ opacity: 1, borderColor: accent }}>
      <div className={styles.placeholderContent} style={{ width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '2rem', color: accent }}>{icon}</div>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ marginBottom: 6 }}>{title}</h3>
            <p style={{ margin: 0, color: '#4b5563' }}>{subtitle}</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

function RewardPill({ text, tone = '#22c55e' }: { text: string; tone?: string }) {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 14px',
      borderRadius: 999,
      background: `${tone}15`,
      color: tone,
      fontWeight: 700,
      fontSize: '0.9rem',
    }}>
      <FaCheck />
      {text}
    </div>
  );
}

function QuizCard({
  id,
  title,
  icon,
  subtitle,
  prompt,
  choices,
  answerTone = '#22c55e',
  awardKey = 'easy',
  onComplete,
}: {
  id: string;
  title: string;
  icon: ReactNode;
  subtitle: string;
  prompt: React.ReactNode;
  choices: Choice[];
  answerTone?: string;
  awardKey?: string;
  onComplete: (key: string) => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);

  const handlePick = (choice: Choice) => {
    if (solved) return;
    setPicked(choice.label);
    if (choice.correct) {
      setSolved(true);
      onComplete(`${id}:${awardKey}`);
    }
  };

  return (
    <Shell id={id} title={title} icon={icon} subtitle={subtitle} accent={answerTone}>
      <div style={{ width: '100%', display: 'grid', gap: 12 }}>
        <div style={{ background: 'rgba(37, 99, 235, 0.06)', borderRadius: 16, padding: 14, color: '#1f2937', lineHeight: 1.5 }}>
          {prompt}
        </div>
        <div style={{ display: 'grid', gap: 10 }}>
          {choices.map((choice) => {
            const isPicked = picked === choice.label;
            const isCorrect = solved && choice.correct;
            return (
              <button
                key={choice.label}
                onClick={() => handlePick(choice)}
                style={{
                  border: `1.5px solid ${isCorrect ? '#22c55e' : isPicked ? '#2563eb' : 'rgba(37, 99, 235, 0.18)'}`,
                  background: isCorrect ? 'rgba(34, 197, 94, 0.12)' : isPicked ? 'rgba(37, 99, 235, 0.08)' : 'rgba(255,255,255,0.75)',
                  padding: '12px 14px',
                  borderRadius: 14,
                  textAlign: 'left',
                  cursor: solved ? 'default' : 'pointer',
                  fontWeight: 600,
                  color: '#1f2937',
                  transition: 'transform 0.15s ease, border-color 0.15s ease, background 0.15s ease',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <span>{choice.label}</span>
                  {isCorrect && <FaCheck color="#22c55e" />}
                </span>
              </button>
            );
          })}
        </div>
        {solved ? <RewardPill text="+1 XP unlocked" tone={answerTone} /> : picked ? <div style={{ color: '#b45309', fontWeight: 600 }}>Not quite. Try another angle.</div> : null}
      </div>
    </Shell>
  );
}

function TextChallengeCard({
  id,
  title,
  icon,
  subtitle,
  prompt,
  answers,
  awardKey = 'easy',
  accent = '#8b5cf6',
  onComplete,
}: {
  id: string;
  title: string;
  icon: ReactNode;
  subtitle: string;
  prompt: React.ReactNode;
  answers: string[];
  awardKey?: string;
  accent?: string;
  onComplete: (key: string) => void;
}) {
  const [value, setValue] = useState('');
  const [solved, setSolved] = useState(false);

  const submit = () => {
    const normalized = value.trim().toLowerCase();
    if (answers.some((answer) => normalized === answer.toLowerCase())) {
      setSolved(true);
      onComplete(`${id}:${awardKey}`);
    }
  };

  return (
    <Shell id={id} title={title} icon={icon} subtitle={subtitle} accent={accent}>
      <div style={{ width: '100%', display: 'grid', gap: 12 }}>
        <div style={{ background: 'rgba(139, 92, 246, 0.08)', borderRadius: 16, padding: 14, color: '#1f2937', lineHeight: 1.5 }}>
          {prompt}
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Type your answer"
            style={{
              flex: '1 1 220px',
              borderRadius: 14,
              border: '1.5px solid rgba(139, 92, 246, 0.22)',
              padding: '12px 14px',
              fontSize: '0.95rem',
              outline: 'none',
            }}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
          <button
            onClick={submit}
            style={{
              border: 'none',
              borderRadius: 14,
              padding: '12px 16px',
              background: '#8b5cf6',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Check
          </button>
        </div>
        {solved ? <RewardPill text="+1 XP unlocked" tone={accent} /> : null}
      </div>
    </Shell>
  );
}

function TimerChallengeCard({
  id,
  title,
  icon,
  subtitle,
  seconds,
  awardKey = 'medium',
  onComplete,
}: {
  id: string;
  title: string;
  icon: ReactNode;
  subtitle: string;
  seconds: number;
  awardKey?: string;
  onComplete: (key: string) => void;
}) {
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(seconds);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    if (!running || remaining <= 0) return;
    const timer = window.setInterval(() => {
      setRemaining((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running, remaining]);

  useEffect(() => {
    if (running && remaining === 0) {
      setRunning(false);
    }
  }, [running, remaining]);

  const restart = () => {
    setRunning(false);
    setRemaining(seconds);
    setClaimed(false);
  };

  const claim = () => {
    if (remaining === 0 && !claimed) {
      setClaimed(true);
      onComplete(`${id}:${awardKey}`);
    }
  };

  const progress = (remaining / seconds) * 100;

  return (
    <Shell id={id} title={title} icon={icon} subtitle={subtitle} accent="#0ea5e9">
      <div style={{ width: '100%', display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
            {remaining === 0 ? 'Timer finished' : `${remaining}s remaining`}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {!running ? (
              <button onClick={() => setRunning(true)} style={{ border: 'none', borderRadius: 12, padding: '10px 14px', background: '#0ea5e9', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                Start
              </button>
            ) : null}
            <button onClick={restart} style={{ border: '1px solid rgba(14,165,233,0.2)', borderRadius: 12, padding: '10px 14px', background: '#fff', color: '#0ea5e9', fontWeight: 700, cursor: 'pointer' }}>
              Reset
            </button>
          </div>
        </div>
        <div style={{ width: '100%', height: 10, borderRadius: 999, background: 'rgba(14,165,233,0.12)', overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #0ea5e9, #22c55e)', transition: 'width 0.3s ease' }} />
        </div>
        <div style={{ color: '#334155', lineHeight: 1.5 }}>
          Hold full attention for the full countdown, then claim your XP. The real win is staying locked in without checking out.
        </div>
        {remaining === 0 && !claimed ? (
          <button onClick={claim} style={{ border: 'none', borderRadius: 14, padding: '12px 16px', background: '#22c55e', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>
            Claim XP
          </button>
        ) : claimed ? <RewardPill text="+1 XP unlocked" tone="#22c55e" /> : null}
      </div>
    </Shell>
  );
}

function ReactionChallengeCard({
  id,
  title,
  icon,
  subtitle,
  onComplete,
}: {
  id: string;
  title: string;
  icon: ReactNode;
  subtitle: string;
  onComplete: (key: string) => void;
}) {
  const [armed, setArmed] = useState(false);
  const [go, setGo] = useState(false);
  const [result, setResult] = useState<string>('');
  const startAt = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const arm = () => {
    setResult('');
    setGo(false);
    setArmed(true);
    startAt.current = null;
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }
    const delay = 1200 + Math.floor(Math.random() * 2000);
    timeoutRef.current = window.setTimeout(() => {
      setGo(true);
      startAt.current = performance.now();
    }, delay);
  };

  useEffect(() => () => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }
  }, []);

  const handleClick = () => {
    if (!armed) return;
    if (!go) {
      setResult('Too soon. Wait for the flash.');
      return;
    }
    const reaction = performance.now() - (startAt.current || performance.now());
    setResult(`Reaction: ${reaction.toFixed(0)} ms`);
    setArmed(false);
    setGo(false);
    if (reaction < 450) {
      onComplete(`${id}:hard`);
    }
  };

  return (
    <Shell id={id} title={title} icon={icon} subtitle={subtitle} accent="#ef4444">
      <div style={{ width: '100%', display: 'grid', gap: 12 }}>
        <div style={{
          minHeight: 140,
          borderRadius: 18,
          border: `2px solid ${go ? '#22c55e' : 'rgba(239,68,68,0.16)'}`,
          background: go ? 'linear-gradient(135deg, #dcfce7, #bbf7d0)' : 'linear-gradient(135deg, #fff, #fff7ed)',
          display: 'grid',
          placeItems: 'center',
          transition: 'all 0.2s ease',
        }}>
          <button
            onClick={handleClick}
            style={{
              border: 'none',
              borderRadius: 999,
              padding: '16px 22px',
              background: go ? '#22c55e' : '#ef4444',
              color: '#fff',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <FaBolt /> {go ? 'Click now' : armed ? 'Wait for it' : 'Arm challenge'}
          </button>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={arm} style={{ border: 'none', borderRadius: 14, padding: '10px 14px', background: '#ef4444', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
            Arm
          </button>
          <button onClick={() => { setArmed(false); setGo(false); setResult(''); }} style={{ border: '1px solid rgba(239,68,68,0.2)', borderRadius: 14, padding: '10px 14px', background: '#fff', color: '#ef4444', fontWeight: 700, cursor: 'pointer' }}>
            Reset
          </button>
        </div>
        {result ? <div style={{ color: '#0f172a', fontWeight: 700 }}>{result}</div> : null}
      </div>
    </Shell>
  );
}

function TargetChallengeCard({
  id,
  title,
  icon,
  subtitle,
  onComplete,
}: {
  id: string;
  title: string;
  icon: ReactNode;
  subtitle: string;
  onComplete: (key: string) => void;
}) {
  const [running, setRunning] = useState(false);
  const [hits, setHits] = useState(0);
  const [position, setPosition] = useState({ top: 16, left: 16 });
  const arenaRef = useRef<HTMLDivElement | null>(null);

  const moveTarget = () => {
    const bounds = arenaRef.current?.getBoundingClientRect();
    const maxTop = Math.max(10, (bounds?.height || 180) - 56);
    const maxLeft = Math.max(10, (bounds?.width || 280) - 56);
    setPosition({
      top: Math.floor(Math.random() * maxTop),
      left: Math.floor(Math.random() * maxLeft),
    });
  };

  const start = () => {
    setHits(0);
    setRunning(true);
    moveTarget();
  };

  const hit = () => {
    if (!running) return;
    const nextHits = hits + 1;
    setHits(nextHits);
    if (nextHits >= 5) {
      setRunning(false);
      onComplete(`${id}:hard`);
      return;
    }
    moveTarget();
  };

  return (
    <Shell id={id} title={title} icon={icon} subtitle={subtitle} accent="#f59e0b">
      <div style={{ width: '100%', display: 'grid', gap: 12 }}>
        <div ref={arenaRef} style={{
          position: 'relative',
          height: 180,
          borderRadius: 18,
          border: '2px solid rgba(245, 158, 11, 0.2)',
          background: 'linear-gradient(135deg, rgba(255,251,235,0.9), rgba(254,243,199,0.8))',
          overflow: 'hidden',
        }}>
          <button
            onClick={hit}
            disabled={!running}
            style={{
              position: 'absolute',
              top: position.top,
              left: position.left,
              width: 56,
              height: 56,
              borderRadius: 999,
              border: 'none',
              background: running ? '#f59e0b' : '#cbd5e1',
              color: '#fff',
              fontWeight: 900,
              cursor: running ? 'pointer' : 'not-allowed',
              boxShadow: '0 10px 25px rgba(245,158,11,0.25)',
              transition: 'top 0.18s ease, left 0.18s ease, transform 0.15s ease',
            }}
          >
            {running ? hits + 1 : 'GO'}
          </button>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={start} style={{ border: 'none', borderRadius: 14, padding: '10px 14px', background: '#f59e0b', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>
            Start
          </button>
          <button onClick={() => { setRunning(false); setHits(0); moveTarget(); }} style={{ border: '1px solid rgba(245,158,11,0.2)', borderRadius: 14, padding: '10px 14px', background: '#fff', color: '#f59e0b', fontWeight: 800, cursor: 'pointer' }}>
            Reset
          </button>
          <div style={{ color: '#92400e', fontWeight: 700 }}>Hits: {hits}/5</div>
        </div>
      </div>
    </Shell>
  );
}

export default function ChallengeLabGrid() {
  const { currentUser, awardChallengeXP } = useTrackerStore();
  const claimedKeys = useRef<Record<string, boolean>>({});

  useEffect(() => {
    claimedKeys.current = {};
  }, [currentUser?.id]);

  const awardOnce = (token: string) => {
    const [cardKey, tier = 'easy'] = token.split(':');
    if (claimedKeys.current[cardKey]) return;
    claimedKeys.current[cardKey] = true;
    awardChallengeXP(tier);
  };

  const speedPassage = useMemo(() => (
    <>
      Read the prompt, focus on the main idea, then pick the best answer. The goal is to train sharp comprehension without rushing into the first obvious choice.
    </>
  ), []);

  if (!currentUser) {
    return null;
  }

  return (
    <>
      <QuizCard
        id="speed-reading"
        title="Speed Reading Tracker"
        icon={<FaStopwatch />}
        subtitle="Train comprehension under time pressure."
        prompt={speedPassage}
        choices={[
          { label: 'Comprehension over speed', correct: true },
          { label: 'Guess as fast as possible', correct: false },
          { label: 'Skip the passage entirely', correct: false },
        ]}
        awardKey="easy"
        onComplete={awardOnce}
      />

      <QuizCard
        id="mental-math"
        title="Mental Math Trainer"
        icon={<FaArrowRight />}
        subtitle="Fast arithmetic, calm mind."
        prompt={<>What is <strong>18 + 27</strong>?</>}
        choices={[
          { label: '44', correct: false },
          { label: '45', correct: true },
          { label: '46', correct: false },
        ]}
        answerTone="#0ea5e9"
        awardKey="easy"
        onComplete={awardOnce}
      />

      <QuizCard
        id="vocabulary-builder"
        title="Vocabulary Builder"
        icon={<FaCheck />}
        subtitle="Lock a word to a meaning."
        prompt={<>What does <strong>lucid</strong> mean?</>}
        choices={[
          { label: 'Clear and easy to understand', correct: true },
          { label: 'Very loud', correct: false },
          { label: 'Quickly moving', correct: false },
        ]}
        answerTone="#8b5cf6"
        awardKey="easy"
        onComplete={awardOnce}
      />

      <TimerChallengeCard
        id="attention-span"
        title="Attention Span Tracker"
        icon={<FaStopwatch />}
        subtitle="Hold focus without switching tabs."
        seconds={12}
        awardKey="medium"
        onComplete={awardOnce}
      />

      <TextChallengeCard
        id="dual-task"
        title="Dual Task Trainer"
        icon={<FaBolt />}
        subtitle="Two tasks, one calm brain."
        prompt={<>Tap 5 times while solving <strong>9 + 6</strong>.</>}
        answers={['15']}
        awardKey="medium"
        accent="#ef4444"
        onComplete={awardOnce}
      />

      <TextChallengeCard
        id="lateral-thinking"
        title="Lateral Thinking"
        icon={<FaArrowRight />}
        subtitle="See the obvious from a different angle."
        prompt={<>I am full of keys, but I cannot open a lock. What am I?</>}
        answers={['keyboard', 'a keyboard']}
        awardKey="medium"
        accent="#7c3aed"
        onComplete={awardOnce}
      />

      <QuizCard
        id="visual-spatial"
        title="Visual-Spatial Trainer"
        icon={<FaArrowRight />}
        subtitle="Mentally rotate the idea."
        prompt={<>Which shape best matches the mirror image of a left-pointing arrow?</>}
        choices={[
          { label: 'Right-pointing arrow', correct: true },
          { label: 'Up-pointing arrow', correct: false },
          { label: 'Down-pointing arrow', correct: false },
        ]}
        awardKey="medium"
        onComplete={awardOnce}
      />

      <QuizCard
        id="logic-gate"
        title="Logic Gate Builder"
        icon={<FaBolt />}
        subtitle="Boolean thinking in plain English."
        prompt={<>For an AND gate, when inputs are 1 and 0, what is the output?</>}
        choices={[
          { label: '0', correct: true },
          { label: '1', correct: false },
          { label: 'Unknown', correct: false },
        ]}
        answerTone="#f59e0b"
        awardKey="hard"
        onComplete={awardOnce}
      />

      <ReactionChallengeCard
        id="reaction-time"
        title="Reaction Time Tester"
        icon={<FaStopwatch />}
        subtitle="Wait, then strike the moment it turns green."
        onComplete={awardOnce}
      />

      <TargetChallengeCard
        id="hand-eye"
        title="Hand-Eye Coordination"
        icon={<FaBolt />}
        subtitle="Chase the target around the arena."
        onComplete={awardOnce}
      />

      <QuizCard
        id="language-learning"
        title="Language Learning Assistant"
        icon={<FaArrowRight />}
        subtitle="Build a fast everyday phrase bank."
        prompt={<>What is the English meaning of <strong>bonjour</strong>?</>}
        choices={[
          { label: 'Goodbye', correct: false },
          { label: 'Good morning / hello', correct: true },
          { label: 'Please', correct: false },
        ]}
        answerTone="#14b8a6"
        awardKey="easy"
        onComplete={awardOnce}
      />

      <QuizCard
        id="knowledge-quiz"
        title="Knowledge Quiz Generator"
        icon={<FaArrowRight />}
        subtitle="A little general knowledge, a little momentum."
        prompt={<>Which planet is known as the Red Planet?</>}
        choices={[
          { label: 'Mars', correct: true },
          { label: 'Venus', correct: false },
          { label: 'Jupiter', correct: false },
        ]}
        answerTone="#2563eb"
        awardKey="easy"
        onComplete={awardOnce}
      />
    </>
  );
}
