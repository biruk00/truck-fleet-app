import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../lib/supabase';
import { 
  Truck, MapPin, Shield, ArrowRight, Package, Sparkles, Navigation, 
  CheckCircle, Globe, Zap, Eye, ChevronDown, Radio, ShieldCheck, 
  LayoutList, MessageSquare, Play, Pause, VolumeX, Volume2, Award, Menu, X
} from 'lucide-react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import LoginModal from '../components/LoginModal';

/* ── 37 Cinematic Corporate Slide Assets (with division categorization) ── */
const slidesData = [
  // VISION & FLEET (other/ directory)
  { img: "/other/photo_2026-05-13_13-00-28.jpg", cat: "Vision", title: "GS TRADING", sub: "Reliable • Global • Ahead", div: "Other" },
  { img: "/other/photo_3_2026-05-13_13-00-59.jpg", cat: "Fleet", title: "PREMIUM POWER", sub: "The Backbone of Logistics", div: "Other" },
  { img: "/other/photo_4_2026-05-13_13-01-00.jpg", cat: "Fleet", title: "DIVERSE CAPACITY", sub: "Multimodal Logistics Solutions", div: "Other" },
  { img: "/other/photo_1_2026-05-13_13-00-59.jpg", cat: "Haulage", title: "HEAVY DUTY", sub: "ISUZU Precision Performance", div: "Other" },
  { img: "/other/photo_25_2026-05-13_13-02-27.jpg", cat: "Logistics", title: "GLOBAL REACH", sub: "Cross-Border Excellence", div: "Other" },
  { img: "/other/photo_29_2026-05-13_13-02-28.jpg", cat: "Power", title: "CARGO MIGHT", sub: "Managing Large-Scale Shipments", div: "Other" },
  
  // LEGACY & INFRASTRUCTURE (other/ directory)
  { img: "/other/photo_60_2026-05-13_13-02-35.jpg", cat: "Legacy", title: "GLOBAL HQ", sub: "Strategic Base in Ethiopia", div: "Other" },
  { img: "/other/photo_57_2026-05-13_13-02-34.jpg", cat: "Structure", title: "SOLID FOUNDATION", sub: "23 Years of Infrastructure", div: "Other" },
  
  // SERVICE & MAINTENANCE (other/ directory)
  { img: "/other/photo_15_2026-05-13_13-02-27.jpg", cat: "Engineering", title: "ELITE GARAGE", sub: "Zero-Downtime Maintenance", div: "Other" },
  { img: "/other/photo_18_2026-05-13_13-02-27.jpg", cat: "Garage Ops", title: "SERVICE OFFICE", sub: "Technical Support Management", div: "Other" },
  { img: "/other/photo_17_2026-05-13_13-02-27.jpg", cat: "Service", title: "TECHNICAL MASTERY", sub: "Expert Mechanical Support", div: "Other" },
  { img: "/other/photo_21_2026-05-13_13-02-27.jpg", cat: "Support", title: "RECOVERY FLEET", sub: "24/7 Roadside Assistance", div: "Other" },
  { img: "/other/photo_51_2026-05-13_13-02-31.jpg", cat: "Store", title: "GENUINE PARTS", sub: "Fully Integrated Supply Chain", div: "Other" },
  { img: "/other/photo_59_2026-05-13_13-02-34.jpg", cat: "Inventory", title: "PRECISION STOCK", sub: "Smart Inventory Management", div: "Other" },
  
  // MANAGEMENT (mangement/ directory)
  { img: "/mangement/photo_46_2026-05-13_13-02-31.jpg", cat: "Management", title: "MISSION CONTROL", sub: "HD Command & Intelligence", div: "Management" },
  { img: "/mangement/photo_40_2026-05-13_13-02-30.jpg", cat: "Oversight", title: "EXECUTIVE HUB", sub: "Strategic Decision Making", div: "Management" },
  { img: "/mangement/photo_41_2026-05-13_13-02-30.jpg", cat: "Tech", title: "NETWORK POWER", sub: "Integrated Data Analytics", div: "Management" },
  { img: "/mangement/photo_47_2026-05-13_13-02-31.jpg", cat: "Quality", title: "STANDARDS", sub: "Excellence in Management", div: "Management" },
  
  // OPERATIONS & TRACKING (operation/ directory)
  { img: "/operation/photo_36_2026-05-13_13-02-30.jpg", cat: "Operation", title: "PRECISION LOGISTICS", sub: "Dynamic Fleet Coordination", div: "Operations" },
  { img: "/operation/photo_34_2026-05-13_13-02-29.jpg", cat: "GPS Control", title: "SAFETY OVERSIGHT", sub: "24/7 Monitoring via MaYeT & Mella Systems", div: "Operations" },
  { img: "/operation/photo_2_2026-05-13_13-26-55.jpg", cat: "Systems", title: "INTEGRATED FLOW", sub: "Dynamic Route Optimization", div: "Operations" },
  { img: "/operation/photo_1_2026-05-13_13-26-55.jpg", cat: "Systems", title: "MONITORING", sub: "End-to-End Operational Control", div: "Operations" },
  
  // FINANCE (financh/ directory)
  { img: "/financh/photo_12_2026-05-13_13-02-26.jpg", cat: "Finance", title: "FISCAL EXPERTS", sub: "Budget & Asset Management", div: "Finance" },
  { img: "/financh/photo_61_2026-05-13_13-02-35.jpg", cat: "Audit", title: "TRANSPARENCY", sub: "Ensuring Fiscal Integrity", div: "Finance" },
  { img: "/financh/photo_68_2026-05-13_13-02-35.jpg", cat: "Compliance", title: "STRATEGIC AUDIT", sub: "Global Standard Reporting", div: "Finance" },
  { img: "/financh/photo_72_2026-05-13_13-02-35.jpg", cat: "Control", title: "DATA ACCURACY", sub: "Precision Financial Flow", div: "Finance" },
  { img: "/financh/photo_3_2026-05-13_13-02-26.jpg", cat: "Clarity", title: "PROFITABILITY", sub: "Revenue Optimization", div: "Finance" },
  
  // HR (hr/ directory)
  { img: "/hr/photo_48_2026-05-13_13-02-31.jpg", cat: "HR", title: "OUR PEOPLE", sub: "The Strength of GS Trading", div: "HR" },
  { img: "/hr/photo_50_2026-05-13_13-02-31.jpg", cat: "Talent", title: "GROWTH", sub: "Empowering Careers", div: "HR" },
  
  // CULTURE & ROAD UNITY (other/ directory)
  { img: "/other/photo_79_2026-05-13_13-02-35.jpg", cat: "Team", title: "EXPERT DRIVERS", sub: "Professional Road Safety", div: "Other" },
  { img: "/other/photo_80_2026-05-13_13-02-35.jpg", cat: "Rewards", title: "GS EXCELLENCE", sub: "Recognizing Achievement", div: "Other" },
  { img: "/other/photo_81_2026-05-13_13-02-35.jpg", cat: "Community", title: "WORKFORCE", sub: "United Towards Success", div: "Other" },
  { img: "/other/photo_82_2026-05-13_13-02-35.jpg", cat: "Training", title: "EDUCATION", sub: "Continuous Skill Mastery", div: "Other" },
  { img: "/other/photo_83_2026-05-13_13-02-35.jpg", cat: "Unity", title: "TEAM SPIRIT", sub: "Stronger Together", div: "Other" },
  { img: "/other/photo_84_2026-05-13_13-02-36.jpg", cat: "Vision", title: "DRIVING AHEAD", sub: "Leading the Road", div: "Other" },
  { img: "/other/photo_86_2026-05-13_13-02-36.jpg", cat: "Conclusion", title: "PARTNER WITH US", sub: "GS Trading PLC", div: "Other" }
];

/* ── Corporate Division Filters ── */
const divisionsData = [
  { id: 'All', name: 'Show All' },
  { id: 'Other', name: 'Corporate & Fleet' },
  { id: 'Management', name: 'Management' },
  { id: 'Operations', name: 'Operations' },
  { id: 'Finance', name: 'Finance' },
  { id: 'HR', name: 'HR & Talent' }
];

/* ── Animated Counter ── */
function AnimatedCounter({ value, suffix = '', duration = 2 }) {
  const [count, setCount] = useState(0);
  const nodeRef = useRef(null);
  const isInView = useInView(nodeRef, { once: true, margin: '-50px' });

  useEffect(() => {
    if (isInView && value > 0) {
      let startTimestamp = null;
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
        setCount(Math.floor(progress * value));
        if (progress < 1) window.requestAnimationFrame(step);
      };
      window.requestAnimationFrame(step);
    }
  }, [value, duration, isInView]);

  return <span ref={nodeRef}>{count}{suffix}</span>;
}

/* ── Section Reveal ── */
function Reveal({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 45 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Language Toggle ── */
function LangToggle() {
  const { lang, switchLanguage } = useLanguage();
  return (
    <div className="flex items-center bg-white/5 border border-white/10 rounded-full p-0.5 text-xs font-bold shadow-inner">
      <button
        onClick={() => switchLanguage('en')}
        className={`px-3.5 py-1.5 rounded-full transition-all duration-300 ${lang === 'en' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25' : 'text-slate-400 hover:text-white'}`}
      >
        EN
      </button>
      <button
        onClick={() => switchLanguage('am')}
        className={`px-3.5 py-1.5 rounded-full transition-all duration-300 ${lang === 'am' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25' : 'text-slate-400 hover:text-white'}`}
      >
        አማ
      </button>
    </div>
  );
}

/* ── Dynamic Particle Canvas ── */
function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles = [];
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 0.5,
        speedX: Math.random() * 0.3 - 0.15,
        speedY: Math.random() * 0.3 - 0.15,
        opacity: Math.random() * 0.4 + 0.1,
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap around boundaries
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.fill();
      });
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />;
}

/* ── Cinematic Introduction Curtain ── */
function CinematicIntro({ onComplete }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(() => {
        onComplete();
      }, 1200); // Wait for sliding swipe transition to finish
    }, 3800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: "0%" }}
          exit={{ y: "-100%" }}
          transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[2000] bg-radial from-[#1e293b] to-[#020617] flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Interlocking Double-Arc Vectors */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Orange Arc */}
            <motion.svg
              initial={{ opacity: 0, rotate: 0 }}
              animate={{ opacity: 1, rotate: 360 }}
              transition={{ duration: 1.6, ease: "easeOut" }}
              className="absolute w-48 h-48 filter drop-shadow-[0_0_20px_rgba(244,115,33,0.3)]"
              viewBox="0 0 100 100"
            >
              <path d="M50 50 L20 10 A45 45 0 0 0 50 90 Z" fill="#F47321" />
            </motion.svg>
            
            {/* Blue Arc */}
            <motion.svg
              initial={{ opacity: 0, rotate: 0 }}
              animate={{ opacity: 1, rotate: -360 }}
              transition={{ duration: 1.6, ease: "easeOut" }}
              className="absolute w-48 h-48 filter drop-shadow-[0_0_20px_rgba(43,80,154,0.3)]"
              viewBox="0 0 100 100"
            >
              <path d="M50 50 L80 90 A45 45 0 0 0 50 10 Z" fill="#2B509A" />
            </motion.svg>

            {/* Beams */}
            <motion.div
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 0.5, scaleY: 1.5 }}
              transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
              className="line-beam rotate-0 -translate-y-[80px]"
            />
            <motion.div
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 0.5, scaleY: 1.5 }}
              transition={{ delay: 0.9, duration: 0.8, ease: "easeOut" }}
              className="line-beam rotate-[30deg] -translate-y-[80px]"
            />
            <motion.div
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 0.5, scaleY: 1.5 }}
              transition={{ delay: 1.0, duration: 0.8, ease: "easeOut" }}
              className="line-beam -rotate-[30deg] -translate-y-[80px]"
            />
          </div>

          {/* Intro Text */}
          <div className="text-center relative mt-8">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 1.0, ease: "easeOut" }}
              className="text-4xl md:text-6xl font-black tracking-tighter text-white"
            >
              GS <span className="text-[#2B509A]">Trading</span> PLC
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ delay: 1.6, duration: 1.0 }}
              className="text-xs uppercase tracking-[0.5em] text-slate-400 mt-3 font-bold"
            >
              Reliable. <span className="text-[#F47321]">Global.</span> Ahead.
            </motion.p>
          </div>

          {/* Dynamic Laser Reflection */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.25 }}
            transition={{ delay: 1.2, duration: 1.5 }}
            className="absolute bottom-[20%] w-full h-[80px] bg-gradient-to-t from-[#2B509A] to-transparent blur-[25px]"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Landing() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [stats, setStats] = useState({ total: 0, loading: 0, ongoing: 0, parked: 0 });

  /* ── Slideshow Engine States ── */
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [activeDivision, setActiveDivision] = useState('All');

  /* ── Interactive Transition States ── */
  const [showFlash, setShowFlash] = useState(false);
  const [showGlitch, setShowGlitch] = useState(false);

  /* ── Video Player States ── */
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    fetchPublicStats();
  }, []);

  /* ── Filter slides based on active division ── */
  const filteredSlides = activeDivision === 'All' 
    ? slidesData 
    : slidesData.filter(slide => slide.div === activeDivision);

  /* ── Autoplay Progression Logic ── */
  useEffect(() => {
    if (!isAutoplay || showIntro || filteredSlides.length === 0) {
      setProgress(0);
      return;
    }

    const duration = 6000; // 6 seconds per slide
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(interval);
        triggerNextSlide();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [currentSlide, isAutoplay, showIntro, activeDivision]);

  const triggerNextSlide = () => {
    if (filteredSlides.length === 0) return;
    const nextIdx = (currentSlide + 1) % filteredSlides.length;
    goToSlide(nextIdx);
  };

  const triggerPrevSlide = () => {
    if (filteredSlides.length === 0) return;
    const prevIdx = (currentSlide - 1 + filteredSlides.length) % filteredSlides.length;
    goToSlide(prevIdx);
  };

  const goToSlide = (index) => {
    const effectType = index % 3;

    if (effectType === 1) {
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 300);
    } else if (effectType === 2) {
      setShowGlitch(true);
      setTimeout(() => setShowGlitch(false), 400);
    }

    setCurrentSlide(index);
  };

  const selectDivision = (divId) => {
    setActiveDivision(divId);
    setCurrentSlide(0);
    setProgress(0);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const fetchPublicStats = async () => {
    try {
      const { data, error } = await supabase.from('trucks').select('status');
      if (error) throw error;
      if (data) {
        const counts = { total: data.length, loading: 0, ongoing: 0, parked: 0 };
        data.forEach(tr => {
          const s = tr.status?.toLowerCase() || '';
          if (s === 'loading') counts.loading++;
          if (s === 'ongoing') counts.ongoing++;
          if (s === 'parked' || s === 'garage') counts.parked++;
        });
        setStats(counts);
      }
    } catch (err) {
      console.error('Error fetching public stats:', err);
    }
  };

  const CTA = ({ className = '' }) =>
    user ? (
      <Link to="/dashboard" className={`group inline-flex items-center justify-center px-8 py-4 text-base font-bold rounded-full transition-all ${className}`}>
        {t('hero.cta_dashboard')} <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
      </Link>
    ) : (
      <button onClick={() => setIsLoginOpen(true)} className={`group inline-flex items-center justify-center px-8 py-4 text-base font-bold rounded-full transition-all ${className}`}>
        {t('hero.cta_signin')} <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
      </button>
    );

  const transitionType = ['wipe', 'zoom-flash', 'glitch'][currentSlide % 3];

  const getSlideTransition = () => {
    switch (transitionType) {
      case 'wipe':
        return {
          initial: { x: "100%", filter: "brightness(0.65)" },
          animate: { x: "0%", filter: "brightness(0.65)" },
          exit: { x: "-100%", filter: "brightness(0.65)" },
          transition: { duration: 1.2, ease: [0.76, 0, 0.24, 1] }
        };
      case 'zoom-flash':
        return {
          initial: { scale: 0.8, opacity: 0, filter: "brightness(0.65)" },
          animate: { scale: 1, opacity: 1, filter: "brightness(0.65)" },
          exit: { scale: 1.4, opacity: 0, filter: "brightness(0.65)" },
          transition: { duration: 0.9, ease: "easeOut" }
        };
      case 'glitch':
      default:
        return {
          initial: { opacity: 0, filter: "brightness(0.65)" },
          animate: { opacity: 1, filter: "brightness(0.65)" },
          exit: { opacity: 0, filter: "brightness(0.65)" },
          transition: { duration: 0.6, ease: "easeInOut" }
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white font-sans selection:bg-orange-500/30 overflow-x-hidden">
      
      {/* Cinematic Intro Curtain */}
      <CinematicIntro onComplete={() => setShowIntro(false)} />

      {/* ═══════════ NAVBAR ═══════════ */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed w-full z-50 top-0 backdrop-blur-2xl bg-[#030712]/75 border-b border-white/5 shadow-2xl"
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo vector double-arcs with hover rotate effects */}
            <motion.div 
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="relative w-9 h-9 flex items-center justify-center bg-white/5 rounded-xl border border-white/10 overflow-hidden cursor-pointer"
            >
              <svg className="w-7 h-7 rotate-45" viewBox="0 0 100 100">
                <path d="M50 50 L20 10 A45 45 0 0 0 50 90 Z" fill="#F47321" />
                <path d="M50 50 L80 90 A45 45 0 0 0 50 10 Z" fill="#2B509A" />
              </svg>
            </motion.div>
            <span className="text-lg font-black tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              GS Trading
            </span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-400">
            {['about', 'services', 'fleet', 'contact'].map((sect) => (
              <a 
                key={sect}
                href={`#${sect}`} 
                className="relative group py-1.5 hover:text-white transition-colors"
              >
                {t(`nav.${sect}`)}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>

          {/* Desktop Right: Lang + CTA */}
          <div className="hidden md:flex items-center gap-3">
            <LangToggle />
            <CTA className="text-sm !px-5 !py-2 text-slate-950 bg-white hover:bg-slate-100 shadow-[0_0_25px_-5px_rgba(255,255,255,0.2)]" />
          </div>

          {/* Mobile Right: Lang + Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <LangToggle />
            <button
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all"
              aria-label="Toggle menu"
            >
              {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {isMobileNavOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="md:hidden overflow-hidden border-t border-white/5 bg-[#030712]/95 backdrop-blur-2xl"
            >
              <div className="px-6 py-4 flex flex-col gap-1">
                {['about', 'services', 'fleet', 'contact'].map((sect) => (
                  <a
                    key={sect}
                    href={`#${sect}`}
                    onClick={() => setIsMobileNavOpen(false)}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                    {t(`nav.${sect}`)}
                  </a>
                ))}
                <div className="h-px w-full bg-white/10 my-3" />
                <CTA className="w-full justify-center text-slate-950 bg-white hover:bg-slate-100 !py-3.5 text-base" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ═══════════ IMMERSIVE HERO SLIDESHOW ═══════════ */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-black">
        <ParticleCanvas />

        {/* Sliding Background Frame */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="popLayout">
            {filteredSlides.length > 0 && (
              <motion.div
                key={`${activeDivision}-${currentSlide}`}
                className="absolute inset-0 w-full h-full bg-cover bg-center animate-ken-burns"
                style={{ backgroundImage: `url(${filteredSlides[currentSlide].img})` }}
                {...getSlideTransition()}
              />
            )}
          </AnimatePresence>

          {/* Darkness Overlay Gradients */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/90 via-transparent to-[#030712] z-[5]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#030712]/90 via-transparent to-[#030712]/90 z-[5]" />
        </div>

        {/* ── Floating Division Selector Tabs (Separated by Division) ── */}
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 flex flex-wrap items-center justify-center gap-1.5 p-1.5 bg-slate-950/40 border border-white/5 rounded-full backdrop-blur-md max-w-[90vw] md:max-w-4xl shadow-2xl">
          {divisionsData.map((div) => (
            <button
              key={div.id}
              onClick={() => selectDivision(div.id)}
              className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[10px] md:text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                activeDivision === div.id 
                  ? "bg-[#F47321] text-slate-950 shadow-md shadow-orange-500/25 scale-105" 
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              {div.name}
            </button>
          ))}
        </div>

        {/* Cinematic Watermark Breathing Logo in Top-Right */}
        <div className="absolute top-24 right-8 w-16 h-16 z-20 pointer-events-none opacity-80 animate-breathe hidden md:block">
          <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_0_15px_rgba(244,115,33,0.4)]">
            <path d="M50 50 L20 10 A45 45 0 0 0 50 90 Z" fill="#F47321" />
            <path d="M50 50 L80 90 A45 45 0 0 0 50 10 Z" fill="#2B509A" />
          </svg>
        </div>

        {/* Transition Visual Overlays */}
        {/* Camera Flash Screen */}
        <AnimatePresence>
          {showFlash && (
            <motion.div
              initial={{ opacity: 0.35 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-white z-[15] pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* Cyber Glitch Lines */}
        {showGlitch && (
          <div className="absolute inset-0 z-[15] pointer-events-none bg-[#2B509A]/5 opacity-60">
            <div className="glitch-slice" style={{ top: "20%", left: `${Math.random() * 20 - 10}%` }} />
            <div className="glitch-slice" style={{ top: "50%", left: `${Math.random() * 20 - 10}%` }} />
            <div className="glitch-slice" style={{ top: "80%", left: `${Math.random() * 20 - 10}%` }} />
          </div>
        )}

        {/* Slide Counter Overlay */}
        <div className="absolute top-24 left-8 md:left-20 z-20 select-none hidden md:block">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 block mb-1">Active Frame</span>
          {filteredSlides.length > 0 && (
            <>
              <span className="text-4xl font-black text-white/25 tracking-tighter">
                {(currentSlide + 1).toString().padStart(2, '0')}
              </span>
              <span className="text-sm font-bold text-white/10 mx-1">/</span>
              <span className="text-xs font-semibold text-white/10">
                {filteredSlides.length.toString().padStart(2, '0')}
              </span>
            </>
          )}
        </div>

        {/* Dynamic Cinematic Text Reveal Overlay */}
        <div className="absolute inset-0 flex items-center max-w-7xl mx-auto px-6 md:px-20 z-10 select-none">
          <AnimatePresence mode="wait">
            {filteredSlides.length > 0 && (
              <motion.div
                key={`${activeDivision}-${currentSlide}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-3xl text-left pointer-events-none mt-20 md:mt-16"
              >
                {/* Category */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 0.5, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="text-xs md:text-sm font-black uppercase tracking-[0.3em] text-orange-400 mb-3"
                >
                  {filteredSlides[currentSlide].cat}
                </motion.div>
                
                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 55, skewY: 4 }}
                  animate={{ opacity: 1, y: 0, skewY: 0 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="text-4xl md:text-7xl lg:text-8xl font-black tracking-tight text-white mb-5 leading-none uppercase filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]"
                >
                  {filteredSlides[currentSlide].title}
                </motion.h2>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, x: -30, letterSpacing: "0.6em" }}
                  animate={{ opacity: 0.9, x: 0, letterSpacing: "0.3em" }}
                  transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
                  className="text-sm md:text-xl text-slate-300 font-medium tracking-[0.3em] uppercase leading-relaxed max-w-xl"
                >
                  {filteredSlides[currentSlide].sub}
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Glassmorphic Overlay Controls Panel ── */}
        <div className="absolute bottom-20 right-6 md:right-20 z-30 flex flex-col md:flex-row items-center gap-6">
          {/* Slide dots selector (compact container) */}
          <div className="hidden lg:flex items-center gap-1.5 p-2 bg-slate-950/40 border border-white/5 rounded-full backdrop-blur-md max-w-[250px] overflow-x-auto">
            {filteredSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all border border-transparent shrink-0 ${
                  currentSlide === i 
                    ? "bg-orange-500 scale-125 border-orange-500 shadow-md shadow-orange-500/50" 
                    : "bg-white/20 hover:bg-white/40"
                }`}
                title={`Slide ${i + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Play/Pause Autoplay Toggle */}
            <button
              onClick={() => setIsAutoplay(!isAutoplay)}
              className={`p-3.5 bg-slate-950/40 border border-white/10 hover:border-white/20 rounded-full backdrop-blur-md transition-all text-white flex items-center justify-center hover:scale-105 active:scale-95`}
              title={isAutoplay ? "Pause Autoplay" : "Resume Autoplay"}
            >
              {isAutoplay ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white translate-x-0.5" />}
            </button>

            {/* Quick Portal CTA Launcher */}
            <CTA className="text-slate-950 bg-white hover:bg-slate-100 shadow-[0_0_30px_-5px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95 text-sm py-3.5 px-6 shrink-0" />
          </div>
        </div>

        {/* Animated bottom slide progress bar */}
        <div className="absolute bottom-0 left-0 h-1 bg-[#F47321] transition-all duration-75 z-40 shadow-[0_0_10px_#F47321]" style={{ width: `${progress}%` }} />

        {/* Floating Downward Scrolling Hint */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
          <a href="#about" className="flex flex-col items-center gap-1.5 text-white/30 hover:text-white/60 transition-colors text-[9px] font-black uppercase tracking-[0.4em] select-none">
            <span>Scroll past showcase</span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </a>
        </div>
      </section>

      {/* ═══════════ ABOUT US ═══════════ */}
      <section id="about" className="py-32 relative z-10 border-t border-white/5 bg-radial from-[#090d16] to-[#030712]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Headquarters Image with Hover Glass overlays */}
            <Reveal>
              <div className="relative group">
                {/* Glow ring */}
                <div className="absolute -inset-1 bg-gradient-to-tr from-orange-500/20 to-blue-500/20 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-slate-900 group-hover:scale-[1.01] transition-transform duration-500">
                  <img src="/other/photo_60_2026-05-13_13-02-35.jpg" alt="GS Trading Global Headquarters" className="w-full aspect-[4/3] object-cover filter brightness-[0.85] contrast-[1.1]" />
                  {/* Subtle dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#030712]/90 via-[#030712]/20 to-transparent" />
                </div>
                
                {/* Float Badge */}
                <div className="absolute -bottom-6 -right-6 lg:-right-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-6 shadow-2xl shadow-orange-500/25 border border-white/10 select-none">
                  <div className="text-4xl md:text-5xl font-black text-white leading-none">23+</div>
                  <div className="text-[10px] font-black text-white/95 uppercase tracking-widest mt-1.5">{t('fleet.badge')}</div>
                </div>
              </div>
            </Reveal>

            {/* Content & Check Items redesigned */}
            <Reveal delay={0.15}>
              <div>
                <span className="text-orange-400 font-bold text-xs uppercase tracking-[0.3em] mb-4 block">{t('nav.about')}</span>
                <h2 className="text-4xl lg:text-5xl font-black tracking-tight mb-6 leading-none">
                  {t('hero.title_1')}{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">
                    {t('hero.title_2')}
                  </span>
                </h2>
                <p className="text-slate-400 text-base md:text-lg leading-relaxed mb-10 font-medium">
                  {t('hero.subtitle')}
                </p>

                {/* Features list in High-Contrast Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { icon: Globe, text: 'Cross-border Shipments', glow: 'group-hover:text-orange-400' },
                    { icon: Shield, text: 'Health & Safety Standards', glow: 'group-hover:text-emerald-400' },
                    { icon: Zap, text: 'Fast & Reliable Delivery', glow: 'group-hover:text-amber-400' },
                    { icon: Eye, text: 'GPS & VMS Tracking', glow: 'group-hover:text-blue-400' },
                  ].map((item, i) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ y: -4 }}
                      className="group flex items-center gap-4 p-4 rounded-2xl bg-slate-950/40 border border-white/5 hover:border-white/10 backdrop-blur-md transition-all duration-300 shadow-lg"
                    >
                      <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        <item.icon className={`w-5 h-5 text-slate-400 transition-colors ${item.glow}`} />
                      </div>
                      <span className="text-sm font-bold text-slate-300">{item.text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Reveal>

          </div>
        </div>
      </section>

      {/* ═══════════ SERVICES ═══════════ */}
      <section id="services" className="py-32 relative z-10 bg-[#030712]">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-24">
              <span className="text-orange-400 font-bold text-xs uppercase tracking-[0.3em] mb-4 block">{t('services.label')}</span>
              <h2 className="text-4xl lg:text-5xl font-black tracking-tight mb-6">
                {t('services.title_1')}<br className="hidden md:block" /> {t('services.title_2')}
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-base md:text-lg leading-relaxed font-medium">
                {t('services.subtitle')}
              </p>
            </div>
          </Reveal>

          {/* Top Row — 2 Large Cards with HSL glows on hover */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Card 1: Fleet Management (Orange Glow) */}
            <Reveal>
              <motion.div 
                whileHover={{ y: -6 }}
                className="group relative overflow-hidden rounded-3xl bg-slate-950/40 border border-white/5 p-8 lg:p-10 hover:border-orange-500/30 backdrop-blur-2xl transition-all duration-500 h-full hover:shadow-[0_0_50px_-10px_rgba(244,115,33,0.15)]"
              >
                {/* Cinematic Photo Background */}
                <div className="absolute inset-0 bg-cover bg-center opacity-10 group-hover:opacity-30 transition-opacity duration-700" style={{ backgroundImage: 'url("/mangement/photo_46_2026-05-13_13-02-31.jpg")' }} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent pointer-events-none" />
                
                <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/5 rounded-full blur-[80px] group-hover:bg-orange-500/10 transition-colors" />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-6">
                    <motion.div
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Radio className="w-7 h-7 text-orange-400" />
                    </motion.div>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 tracking-tight text-white group-hover:text-orange-400 transition-colors">
                    {t('services.fleet_mgmt_title')}
                  </h3>
                  <p className="text-slate-400 text-sm md:text-base leading-relaxed font-medium">
                    {t('services.fleet_mgmt_desc')}
                  </p>
                </div>
              </motion.div>
            </Reveal>

            {/* Card 2: Cargo Tracking (Blue Glow) */}
            <Reveal delay={0.1}>
              <motion.div 
                whileHover={{ y: -6 }}
                className="group relative overflow-hidden rounded-3xl bg-slate-950/40 border border-white/5 p-8 lg:p-10 hover:border-blue-500/30 backdrop-blur-2xl transition-all duration-500 h-full hover:shadow-[0_0_50px_-10px_rgba(43,80,154,0.15)]"
              >
                {/* Cinematic Photo Background */}
                <div className="absolute inset-0 bg-cover bg-center opacity-10 group-hover:opacity-30 transition-opacity duration-700" style={{ backgroundImage: 'url("/operation/photo_36_2026-05-13_13-02-30.jpg")' }} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent pointer-events-none" />
                
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-[80px] group-hover:bg-blue-500/10 transition-colors" />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
                    <motion.div
                      whileHover={{ scale: 1.25, rotate: 10 }}
                    >
                      <Eye className="w-7 h-7 text-blue-400" />
                    </motion.div>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 tracking-tight text-white group-hover:text-blue-400 transition-colors">
                    {t('services.cargo_title')}
                  </h3>
                  <p className="text-slate-400 text-sm md:text-base leading-relaxed font-medium">
                    {t('services.cargo_desc')}
                  </p>
                </div>
              </motion.div>
            </Reveal>
          </div>

          {/* Bottom Row — 3 Cards with dynamic accents */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 3: Vetted Drivers (Emerald Glow) */}
            <Reveal>
              <motion.div 
                whileHover={{ y: -6 }}
                className="group relative overflow-hidden rounded-3xl bg-slate-950/40 border border-white/5 p-8 hover:border-emerald-500/30 backdrop-blur-2xl transition-all duration-500 h-full hover:shadow-[0_0_50px_-10px_rgba(16,185,129,0.12)]"
              >
                {/* Cinematic Photo Background */}
                <div className="absolute inset-0 bg-cover bg-center opacity-10 group-hover:opacity-30 transition-opacity duration-700" style={{ backgroundImage: 'url("/hr/photo_48_2026-05-13_13-02-31.jpg")' }} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/50 to-transparent pointer-events-none" />
                
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5">
                    <motion.div whileHover={{ y: -3 }}>
                      <ShieldCheck className="w-6 h-6 text-emerald-400" />
                    </motion.div>
                  </div>
                  <h3 className="text-xl font-bold mb-3 tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                    {t('services.vetted_title')}
                  </h3>
                  <p className="text-slate-400 text-xs md:text-sm leading-relaxed font-medium">
                    {t('services.vetted_desc')}
                  </p>
                </div>
              </motion.div>
            </Reveal>

            {/* Card 4: Heavy Cargo (Amber Glow) */}
            <Reveal delay={0.1}>
              <motion.div 
                whileHover={{ y: -6 }}
                className="group relative overflow-hidden rounded-3xl bg-slate-950/40 border border-white/5 p-8 hover:border-amber-500/30 backdrop-blur-2xl transition-all duration-500 h-full hover:shadow-[0_0_50px_-10px_rgba(245,158,11,0.12)]"
              >
                {/* Cinematic Photo Background */}
                <div className="absolute inset-0 bg-cover bg-center opacity-10 group-hover:opacity-30 transition-opacity duration-700" style={{ backgroundImage: 'url("/other/photo_1_2026-05-13_13-00-59.jpg")' }} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/50 to-transparent pointer-events-none" />
                
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5">
                    <motion.div whileHover={{ x: [0, 4, 0] }} transition={{ duration: 0.5 }}>
                      <LayoutList className="w-6 h-6 text-amber-400" />
                    </motion.div>
                  </div>
                  <h3 className="text-xl font-bold mb-3 tracking-tight text-white group-hover:text-amber-400 transition-colors">
                    {t('services.loads_title')}
                  </h3>
                  <p className="text-slate-400 text-xs md:text-sm leading-relaxed font-medium">
                    {t('services.loads_desc')}
                  </p>
                </div>
              </motion.div>
            </Reveal>

            {/* Card 5: Comms (Purple Glow) */}
            <Reveal delay={0.2}>
              <motion.div 
                whileHover={{ y: -6 }}
                className="group relative overflow-hidden rounded-3xl bg-slate-950/40 border border-white/5 p-8 hover:border-purple-500/30 backdrop-blur-2xl transition-all duration-500 h-full hover:shadow-[0_0_50px_-10px_rgba(168,85,247,0.12)]"
              >
                {/* Cinematic Photo Background */}
                <div className="absolute inset-0 bg-cover bg-center opacity-10 group-hover:opacity-30 transition-opacity duration-700" style={{ backgroundImage: 'url("/other/photo_21_2026-05-13_13-02-27.jpg")' }} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/50 to-transparent pointer-events-none" />
                
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-5">
                    <motion.div whileHover={{ rotate: [0, -5, 5, -5, 0] }} transition={{ duration: 0.4 }}>
                      <MessageSquare className="w-6 h-6 text-purple-400" />
                    </motion.div>
                  </div>
                  <h3 className="text-xl font-bold mb-3 tracking-tight text-white group-hover:text-purple-400 transition-colors">
                    {t('services.comms_title')}
                  </h3>
                  <p className="text-slate-400 text-xs md:text-sm leading-relaxed font-medium">
                    {t('services.comms_desc')}
                  </p>
                </div>
              </motion.div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════ FLEET LIVE VIDEO SHOWCASE ═══════════ */}
      <section id="fleet" className="py-32 relative z-10 overflow-hidden bg-radial from-[#090d16] to-[#030712]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Left side info block */}
            <Reveal>
              <div>
                <span className="text-orange-400 font-bold text-xs uppercase tracking-[0.3em] mb-4 block">{t('fleet.label')}</span>
                <h2 className="text-4xl lg:text-5xl font-black tracking-tight mb-6 leading-none">
                  {t('fleet.title_1')}<br className="mt-2" />{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">
                    {t('fleet.title_2')}
                  </span>
                </h2>
                <p className="text-slate-400 text-base md:text-lg leading-relaxed mb-8 font-medium">
                  {t('fleet.desc')}
                </p>

                <div className="flex flex-wrap gap-4 mb-10">
                  {[
                    { text: t('fleet.gps'), color: 'bg-orange-400' },
                    { text: t('fleet.safety'), color: 'bg-emerald-400' },
                    { text: t('fleet.monitoring'), color: 'bg-blue-400' },
                  ].map((fItem, index) => (
                    <div key={index} className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 border border-white/5 shadow-inner">
                      <div className={`w-2 h-2 rounded-full ${fItem.color} animate-pulse`} />
                      <span className="text-sm font-bold text-white">{fItem.text}</span>
                    </div>
                  ))}
                </div>

                <CTA className="text-slate-950 bg-white hover:bg-slate-100 shadow-[0_0_35px_-5px_rgba(255,255,255,0.3)] hover:scale-[1.02] active:scale-[0.98]" />
              </div>
            </Reveal>

            {/* Right side custom live HTML5 video player */}
            <Reveal delay={0.15}>
              <div className="relative group">
                <div className="absolute -inset-3 bg-gradient-to-tr from-orange-500/20 to-amber-500/10 rounded-[2.5rem] blur-2xl opacity-40 group-hover:opacity-80 transition-opacity duration-700 pointer-events-none" />
                
                {/* Glowing borders container */}
                <div className="relative rounded-[2rem] overflow-hidden border border-white/10 group-hover:border-orange-500/30 transition-colors duration-500 shadow-2xl bg-slate-950">
                  <video 
                    ref={videoRef}
                    className="w-full aspect-[4/3] object-cover filter brightness-[0.8] contrast-[1.05]"
                    src="/video_2026-05-13_12-44-33.mp4"
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#030712]/50 via-transparent to-transparent pointer-events-none" />

                  {/* Interactive audio button controller */}
                  <button 
                    onClick={toggleMute}
                    className="absolute bottom-5 right-5 p-3 bg-slate-950/60 hover:bg-slate-950/80 border border-white/10 hover:border-white/20 rounded-full backdrop-blur-md text-white transition-all hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center z-20"
                    title={isMuted ? "Unmute Operations Audio" : "Mute Operations Audio"}
                  >
                    {isMuted ? <VolumeX className="w-5 h-5 text-orange-400" /> : <Volume2 className="w-5 h-5 text-white animate-pulse" />}
                  </button>
                </div>

                {/* Floating counters badge */}
                <div className="absolute -bottom-5 -left-5 bg-slate-950 border border-white/10 rounded-2xl p-5 shadow-2xl backdrop-blur-md select-none">
                  <div className="text-3xl font-black text-orange-400 leading-none">
                    <AnimatedCounter value={23} suffix="+" duration={1.5} />
                  </div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">{t('fleet.badge')}</div>
                </div>
              </div>
            </Reveal>

          </div>
        </div>
      </section>

      {/* ═══════════ TRUST & CERTIFICATE (AWARD) ═══════════ */}
      <section className="py-28 relative z-10 bg-[#030712] border-t border-b border-white/5 overflow-hidden">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <Reveal>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/20 mb-8 filter drop-shadow-[0_0_15px_rgba(244,115,33,0.15)] select-none">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              >
                <Award className="w-10 h-10 text-orange-400" />
              </motion.div>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-6">
              {t('award.title')}
            </h2>
            
            <p className="text-slate-400 text-lg md:text-xl leading-relaxed max-w-3xl mx-auto font-medium">
              {t('award.desc_1')}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300 font-extrabold">
                {t('award.award_name')}
              </span>{' '}
              {t('award.desc_2')}{' '}
              <span className="text-white font-extrabold bg-white/5 px-2 py-0.5 rounded border border-white/5">
                {t('award.desc_3')}
              </span>.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══════════ CTA SECTION Redesigned into Neon Card ═══════════ */}
      <section className="py-32 relative z-10 bg-[#030712]">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <div className="relative group rounded-3xl overflow-hidden bg-slate-950 border border-orange-500/20 p-12 lg:p-20 text-center shadow-[0_0_50px_-20px_rgba(244,115,33,0.25)] hover:border-orange-500/35 transition-colors duration-500">
              {/* Cinematic Wide Shot Background */}
              <div className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:opacity-50 transition-all duration-1000 scale-100 group-hover:scale-105" style={{ backgroundImage: 'url("/other/photo_84_2026-05-13_13-02-36.jpg")' }} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/80 to-transparent pointer-events-none" />
              
              {/* Internal abstract grid overlay */}
              <div className="absolute inset-0 opacity-25 pointer-events-none bg-[linear-gradient(rgba(244,115,33,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(244,115,33,0.05)_1px,transparent_1px)] bg-[size:40px_40px] mix-blend-overlay" />
              
              <div className="relative z-10">
                <h2 className="text-3xl md:text-6xl font-black tracking-tight text-white mb-6 uppercase leading-none">
                  {t('cta.title')}
                </h2>
                <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-semibold">
                  {t('cta.desc')}
                </p>
                <CTA className="text-slate-950 bg-white hover:bg-slate-50 shadow-2xl shadow-orange-950/20 hover:scale-105 active:scale-95 duration-300" />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer id="contact" className="border-t border-white/5 py-20 relative z-10 bg-radial from-[#090d16] to-[#030712]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-16">
            
            {/* Col 1: Branding info */}
            <div>
              <div className="flex items-center gap-3 mb-6 select-none">
                <div className="relative w-8 h-8 flex items-center justify-center bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                  <svg className="w-5 h-5 rotate-45 animate-pulse" viewBox="0 0 100 100">
                    <path d="M50 50 L20 10 A45 45 0 0 0 50 90 Z" fill="#F47321" />
                    <path d="M50 50 L80 90 A45 45 0 0 0 50 10 Z" fill="#2B509A" />
                  </svg>
                </div>
                <span className="font-black text-lg bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                  GS Trading
                </span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed font-medium">
                {t('footer.tagline')}
              </p>
            </div>

            {/* Col 2: High-contrast Contact Links */}
            <div>
              <h4 className="font-black text-xs uppercase tracking-[0.3em] text-orange-400 mb-6">{t('footer.contact')}</h4>
              <div className="space-y-4 text-sm font-semibold text-slate-400">
                <p className="hover:text-white transition-colors duration-300">info@gstrading.com</p>
                <p className="hover:text-white transition-colors duration-300">GS trading.PLC.et@gmail.com</p>
                <p className="hover:text-white transition-colors duration-300">+251-911 20 22 39</p>
                
                {/* Map coord coordinates container */}
                <a 
                  href="https://www.google.com/maps?q=8.9009722,38.7614167" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all text-xs font-bold shadow-lg"
                >
                  <MapPin className="w-3.5 h-3.5 text-orange-400 animate-bounce" /> {t('footer.location')}
                </a>
              </div>
            </div>

            {/* Col 3: Elegant Quicklinks */}
            <div>
              <h4 className="font-black text-xs uppercase tracking-[0.3em] text-orange-400 mb-6">{t('footer.quicklinks')}</h4>
              <div className="space-y-4 text-sm font-semibold text-slate-400">
                {[
                  { section: 'about', label: t('footer.about_us') },
                  { section: 'services', label: t('footer.services') },
                  { section: 'fleet', label: t('footer.our_fleet') }
                ].map((qLink) => (
                  <a 
                    key={qLink.section}
                    href={`#${qLink.section}`} 
                    className="block hover:translate-x-2 hover:text-white transition-all duration-300"
                  >
                    {qLink.label}
                  </a>
                ))}
              </div>
            </div>

          </div>

          {/* Bottom Copyright segment */}
          <div className="border-t border-white/5 pt-10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-xs font-medium">
              &copy; {new Date().getFullYear()} GS Trading. {t('footer.copyright')}
            </p>
            <p className="text-slate-600 text-[10px] font-bold tracking-wider uppercase">
              {t('footer.designer')}
            </p>
          </div>
        </div>
      </footer>

      {/* LOGIN MODAL */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
}
