/** Cover Flow 轮播 — React + Framer Motion
 *  目标：交互流畅、均匀往前移（非离散切换）
 */
import React, { useRef, useEffect, useCallback } from "https://esm.run/react@18";
import ReactDOM from "https://esm.run/react-dom@18/client";
import { motion, useMotionValue, animate } from "https://esm.run/framer-motion@11";

const CARD_WIDTH = 320;
const GAP = 24;
const CARD_STEP = CARD_WIDTH + GAP;
const TOTAL_CARDS = 8;
const CYCLE_WIDTH = CARD_STEP * TOTAL_CARDS;
const SPEED_PX_PER_SEC = CARD_STEP / 4.5; // 每 4.5s 移一张卡，匀速

const CARDS = [
  { time: "7:00 AM - Morning ops briefing", agent: "Scanned overnight metrics. Flagged 2 anomalies. Drafted exec brief with actions.", you: "Still having coffee. The brief is already in your inbox.", accent: "#B8E6D5" },
  { time: "9:30 AM - Product launch prep", agent: "Built pricing page, wrote email sequences, generated social assets, compiled press kit.", you: "Review and approve. One round of feedback, done.", accent: "#FFE5B4" },
  { time: "11:00 AM - New client onboarding", agent: "Deal closed → auto-triggered: onboarding checklist, welcome deck, project tracker, kick-off agenda.", you: "Client gets a polished Day 1 experience. You didn't touch it.", accent: "#E8D5F2" },
  { time: "2:00 PM - Growth diagnosis", agent: "MRR flat → run funnel analysis, pulled competitor intel, built retention dashboard, drafted 3 experiments.", you: "Walk into the growth meeting with a full plan ready.", accent: "#FFD4D4" },
  { time: "5:00 PM - Board deck assembly", agent: "Pulled live data from finance, product, sales. Assembled board deck + CEO talking points.", you: "Board prep: 2 hours of review instead of 2 weeks.", accent: "#FFF4B8" },
  { time: "12:00 PM - Customer sync", agent: "Prepped meeting notes, pulled usage data, flagged churn risks, drafted follow-up emails.", you: "Walk in knowing exactly what to say.", accent: "#D4E8F7" },
  { time: "3:30 PM - Research sprint", agent: "Synthesized 20 sources, built comparison matrix, wrote exec summary with citations.", you: "Strategic decision in 15 minutes, not 15 hours.", accent: "#E5F0E5" },
  { time: "6:00 PM - End-of-day wrap", agent: "Compiled daily digest, updated project status, queued tomorrow's priorities.", you: "Sign off knowing nothing slipped through.", accent: "#F5E6F0" },
];

function CoverFlowCard({ card, index }) {
  return (
    <article className="coverflow-card" data-cf-index={index}>
      <div className="coverflow-card__inner">
        <div className="coverflow-card__illus" style={{ background: card.accent }} />
        <div className="coverflow-card__body">
          <p className="coverflow-card__time">
            <span className="coverflow-card__dot" />
            {card.time}
          </p>
          <p className="coverflow-card__agent"><strong>AGENT:</strong> {card.agent}</p>
          <p className="coverflow-card__you"><strong>YOU:</strong> {card.you}</p>
        </div>
      </div>
    </article>
  );
}

function CoverFlowCarousel() {
  const x = useMotionValue(0);
  const controlsRef = useRef(null);
  const isDraggingRef = useRef(false);
  const resumeTimerRef = useRef(null);

  const runAutoPlay = useCallback(() => {
    if (isDraggingRef.current) return;
    controlsRef.current?.stop();
    const current = x.get();
    const target = current - CYCLE_WIDTH;
    const duration = Math.abs(target - current) / SPEED_PX_PER_SEC;
    controlsRef.current = animate(x, target, {
      duration,
      ease: "linear",
      onComplete: () => {
        x.set(0);
        runAutoPlay();
      },
    });
  }, []);

  const stopAutoPlay = useCallback(() => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
  }, []);

  const handleDragStart = useCallback(() => {
    isDraggingRef.current = true;
    stopAutoPlay();
  }, [stopAutoPlay]);

  const handleDragEnd = useCallback(() => {
    isDraggingRef.current = false;
    const current = x.get();
    if (current <= -CYCLE_WIDTH) x.set(0);
    else if (current > 0) x.set(current - CYCLE_WIDTH);
    resumeTimerRef.current = setTimeout(runAutoPlay, 800);
  }, [runAutoPlay, stopAutoPlay]);

  useEffect(() => {
    runAutoPlay();
    return () => {
      stopAutoPlay();
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, [runAutoPlay, stopAutoPlay]);

  return (
    <div className="coverflow coverflow--drag">
      <div
        className="coverflow__stage"
        onMouseEnter={stopAutoPlay}
        onMouseLeave={() => {
          if (!isDraggingRef.current) resumeTimerRef.current = setTimeout(runAutoPlay, 1200);
        }}
      >
        <motion.div
          className="coverflow__track"
          style={{ x, cursor: "grab" }}
          drag="x"
          dragConstraints={{ left: -CYCLE_WIDTH, right: 0 }}
          dragElastic={0.05}
          dragMomentum={false}
          whileDrag={{ cursor: "grabbing" }}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {[...CARDS, ...CARDS].map((card, i) => (
            <CoverFlowCard key={i} card={card} index={i} />
          ))}
        </motion.div>
      </div>
      <div className="coverflow__nav">
        {CARDS.map((_, i) => (
          <button key={i} type="button" className="coverflow__nav-btn" aria-label={`Slide ${i + 1}`} />
        ))}
      </div>
    </div>
  );
}

function CoverFlowRoot() {
  return <CoverFlowCarousel />;
}

const root = document.getElementById("coverflow-root");
if (root) {
  ReactDOM.createRoot(root).render(React.createElement(CoverFlowRoot));
}
