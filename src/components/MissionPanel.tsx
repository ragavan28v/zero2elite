import { FaBrain, FaHammer, FaGlobe, FaCalendarAlt, FaStar, FaBook, FaMicrophone, FaProjectDiagram, FaChartLine, FaBed, FaUtensils, FaDumbbell, FaRegSmile, FaRegEdit, FaMusic, FaTasks, FaRegSun, FaRegListAlt, FaRegPlayCircle } from "react-icons/fa";
import styles from "./MissionPanel.module.css";

const dailyBlocks = [
  { icon: <FaRegSun />, title: "Hydrate + Stretch", time: "5:00–5:15 AM" },
  { icon: <FaRegSmile />, title: "Breath Meditation", time: "5:15–5:30 AM" },
  { icon: <FaDumbbell />, title: "Workout", time: "5:30–6:00 AM" },
  { icon: <FaRegEdit />, title: "Shower and Get Ready", time: "6:00–6:30 AM" },
  { icon: <FaBook />, title: "Book Reading (1 Chapter)", time: "6:30–7:30 AM" },
  { icon: <FaBrain />, title: "AI/ML Study, Micro Blog, Tech Trends, Podcast Walk, Voice Practice", time: "7:30–8:20 AM" },
  { icon: <FaUtensils />, title: "Healthy Breakfast", time: "8:20–8:40 AM" },
  { icon: <FaCalendarAlt />, title: "College Hours", time: "8:40 AM–4:10 PM" },
  { icon: <FaRegSmile />, title: "Tea Break and Relaxation", time: "4:10–5:00 PM" },
  { icon: <FaHammer />, title: "Build Projects (Frontend/Backend) / AI/ML Project Integration", time: "5:00–8:00 PM" },
  { icon: <FaMusic />, title: "Dinner & Music (Recharge)", time: "8:00–8:30 PM" },
  { icon: <FaMicrophone />, title: "Speech/Presentation Practice (TED-style, Record)", time: "8:30–9:00 PM" },
  { icon: <FaTasks />, title: "Academics (Assignments, Revision, OS topics, etc.)", time: "9:00–10:00 PM" },
  { icon: <FaRegListAlt />, title: "Reflection & Daily Log", time: "10:00–10:30 PM" },
  { icon: <FaRegPlayCircle />, title: "Work / Movies / Personal Projects / Free Time", time: "10:30–11:30 PM" },
  { icon: <FaBed />, title: "Sleep", time: "11:30 PM" },
];

const weekendBlocks = [
  { icon: <FaBook />, title: "Masterclass Deep Dive & Journaling", time: "6:00–9:00 AM" },
  { icon: <FaProjectDiagram />, title: "Project Sprint (Personal/OSS)", time: "10:00 AM–2:00 PM" },
  { icon: <FaMicrophone />, title: "Content Creation (Blog/Video)", time: "4:00–6:00 PM" },
  { icon: <FaStar />, title: "Social, Recharge, Fun", time: "6:00–8:00 PM" },
  { icon: <FaChartLine />, title: "Weekly Review & Next Week's Plan", time: "8:00–9:00 PM" }
];

const missionMap = [
  { month: 1, title: "Foundations", details: "Python, ML basics, journaling, 1 mini-project, 1 blog, 5+ video logs" },
  { month: 2, title: "Core Skills", details: "Deep learning, CRUD app, deploy, 1 full-stack app, 1 Kaggle entry, 8+ video logs" },
  { month: 3, title: "Advanced Integration", details: "NLP, RL, advanced features, 1 AI-powered app, 1 workshop, 12+ video logs" },
  { month: 4, title: "Specialization", details: "Open source, focus area, mentor, 1 PR, 1 case study, 15+ video logs" },
  { month: 5, title: "Portfolio", details: "Projects, interviews, hackathons, 1 brand site, 1 webinar, 20+ video logs" },
  { month: 6, title: "Elite Execution", details: "Hackathons, publish, elite roles, 1 competition, 1 published project, 30+ video logs" }
];

const outcomes = [
  "6+ AI & Web full projects",
  "30+ recorded speeches/videos",
  "3+ written blogs, 1 GitHub portfolio",
  "Elite full-stack AI + App Dev fluency",
  "Daily trend input, podcasts, books",
  "Physical & mental discipline",
  "Powerful communication and leadership"
];

export default function MissionPanel() {
  return (
    <div className={styles.missionPanel}>
      <section className={styles.missionBlock}>
        <h2>🚀 Mission</h2>
        <p>From Zero to Elite: AI & App Dev Mastery, Life & Leadership—All in One.</p>
      </section>
      <section className={styles.engineBlock}>
        <h3>🧬 The 3C Growth Engine</h3>
        <div className={styles.engineRow}>
          <div className={styles.engineCard}><FaBrain /> <b>Core</b><span>Absorb high-leverage knowledge, master thinking.</span></div>
          <div className={styles.engineCard}><FaHammer /> <b>Create</b><span>Build, ship, and iterate real projects.</span></div>
          <div className={styles.engineCard}><FaGlobe /> <b>Connect</b><span>Speak, write, and influence—online and offline.</span></div>
        </div>
      </section>
      <section className={styles.timelineBlock}>
        <h3>⏰ Hyper-Effective Daily Structure</h3>
        <div className={styles.timeline}>
          {dailyBlocks.map((block) => (
            <div key={block.title + block.time} className={styles.timelineCard}>
              <div className={styles.timelineIcon}>{block.icon}</div>
              <div>
                <b>{block.title}</b> <span className={styles.time}>{block.time}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className={styles.weekendBlock}>
        <h3>🧩 Futuristic Weekend Structure</h3>
        <div className={styles.weekendTimeline}>
          {weekendBlocks.map((block, i) => (
            <div key={i} className={styles.weekendCard}>
              <span className={styles.weekendIcon}>{block.icon}</span>
              <b>{block.title}</b> <span className={styles.time}>{block.time}</span>
            </div>
          ))}
        </div>
      </section>
      <section className={styles.mapBlock}>
        <h3>🗺️ 6-Month Mission Map</h3>
        <div className={styles.mapGrid}>
          {missionMap.map((m) => (
            <div key={m.month} className={styles.mapCard}>
              <b>Month {m.month}: {m.title}</b>
              <span>{m.details}</span>
            </div>
          ))}
        </div>
      </section>
      <section className={styles.outcomesBlock}>
        <h3>🌟 By Day 180, You Will Have:</h3>
        <ul className={styles.outcomesList}>
          {outcomes.map((o, i) => <li key={i}>{o}</li>)}
        </ul>
        <div className={styles.execute}>This is not just a plan. It's your personal growth startup.<br/> <b>Execute. Iterate. Dominate.</b></div>
      </section>
    </div>
  );
} 