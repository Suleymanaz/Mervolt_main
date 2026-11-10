import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from './supabaseClient';
import Admin from './Admin';

/* =========================================================
   DATA
   ========================================================= */

const NAV = [
  { id: 'home', label: 'Anasayfa' },
  { id: 'about', label: 'Hakkımızda' },
  { id: 'services', label: 'Hizmetler' },
  { id: 'process', label: 'Süreç' },
  { id: 'references', label: 'Referanslar' },
  { id: 'partners', label: 'Ortaklar' },
  { id: 'contact', label: 'İletişim' },
];

const SERVICES = [
  { code: 'H-01', title: 'Malzemeli Taahhüt', desc: 'Elektrik altyapı projeleriniz için malzemeden işçiliğe anahtar teslim çözümler.', img: '/hizmet/taahhut.jpg' },
  { code: 'H-02', title: 'Orta Gerilim', desc: 'Endüstriyel ve kurumsal projelerde güvenli enerji iletimi, OG tesis ve trafo uygulamaları.', img: '/hizmet/orta-gerilim.jpg' },
  { code: 'H-03', title: 'Alçak Gerilim', desc: 'Bina içi ve çevresi için güvenilir alçak gerilim tesisatı ve uygulamaları.', img: '/hizmet/alcak-gerilim.jpg' },
  { code: 'H-04', title: 'Pano İmalatı', desc: 'AG-OG panoları, kompanzasyon panoları ve özel ihtiyaçlı panoların anahtar teslim imalatı.', img: '/hizmet/pano.jpg' },
  { code: 'H-05', title: 'Malzeme Satışı', desc: 'Kaliteli ve sertifikalı elektrik ekipmanlarının hızlı temini.', img: '/hizmet/malzeme.jpg' },
  { code: 'H-06', title: 'Mühendislik', desc: 'Projelendirme, teknik çizim ve uygulama danışmanlığı.', img: '/hizmet/muhendislik.jpg' },
  { code: 'H-07', title: 'Güneş Enerjisi', desc: 'ORBİT bayiliği ile bireysel ve ticari, lisanslı ve lisanssız güneş enerjisi sistemleri.', img: '/hizmet/gunes.jpg' },
  { code: 'H-08', title: 'Enerji Depolama & Şarj', desc: 'Kesintisiz güç için batarya sistemleri ve elektrikli araç şarj çözümleri.', img: '/hizmet/depolama.jpg' },
];

const STEPS = [
  { k: '01', title: 'Keşif & Analiz', desc: 'Sahayı yerinde inceler, ihtiyacınızı ve yük hesabını çıkarırız.' },
  { k: '02', title: 'Projelendirme', desc: 'Teknik çizim, malzeme listesi ve onay süreçlerini hazırlarız.' },
  { k: '03', title: 'Uygulama', desc: 'Sertifikalı malzeme ve deneyimli ekiple montajı yaparız.' },
  { k: '04', title: 'Test & Devreye Alma', desc: 'Ölçüm ve testlerle güvenle enerjilendirir, teslim ederiz.' },
];

const TIMELINE = [
  { year: '1994', title: 'İlk adım', text: 'Mehmet ODABAŞI elektrik sektörüne adım atar.' },
  { year: 'TEİAŞ', title: 'Yüksek gerilim yılları', text: 'Yüksek gerilim hatlarından enerji iletim sistemlerine uzanan saha deneyimi.' },
  { year: 'MERVOLT', title: 'Tecrübe markaya dönüşür', text: 'Disiplin ve teknik birikim Mervolt Elektrik çatısı altında toplanır.' },
  { year: 'BUGÜN', title: 'Yarının enerjisi', text: 'Güneş enerjisi, enerji depolama ve anahtar teslim projeler.' },
];

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* =========================================================
   HOOKS & SMALL PIECES
   ========================================================= */

function useInView(threshold = 0.2) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return undefined;
    if (!('IntersectionObserver' in window)) { setInView(true); return undefined; }
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [inView, threshold]);
  return [ref, inView];
}

function Reveal({ children, className = '', delay = 0 }) {
  const [ref, inView] = useInView(0.15);
  return (
    <div ref={ref} className={`reveal ${inView ? 'is-in' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

function Counter({ end, duration = 1600, suffix = '', className = '' }) {
  const [ref, inView] = useInView(0.5);
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return undefined;
    let start;
    let frame;
    const animate = (t) => {
      if (!start) start = t;
      const p = Math.min((t - start) / duration, 1);
      setCount(Math.round(end * (1 - Math.pow(1 - p, 3))));
      if (p < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [inView, end, duration]);
  return <span ref={ref} className={className}>{count}{suffix}</span>;
}

/* Click → electric spark burst */
function useSparks(enabled) {
  useEffect(() => {
    if (!enabled || prefersReducedMotion()) return undefined;
    const onDown = (e) => {
      if (e.target.closest('input, textarea, select, iframe, .no-spark')) return;
      const burst = document.createElement('div');
      burst.className = 'spark-burst';
      burst.style.left = `${e.clientX}px`;
      burst.style.top = `${e.clientY}px`;
      for (let i = 0; i < 9; i++) {
        const ray = document.createElement('i');
        ray.style.setProperty('--a', `${i * 40 + Math.random() * 25}deg`);
        ray.style.setProperty('--d', `${18 + Math.random() * 18}px`);
        burst.appendChild(ray);
      }
      document.body.appendChild(burst);
      setTimeout(() => burst.remove(), 650);
    };
    window.addEventListener('pointerdown', onDown);
    return () => window.removeEventListener('pointerdown', onDown);
  }, [enabled]);
}

function Bolt({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" />
    </svg>
  );
}

function Lamp({ on, size = 32, className = '' }) {
  return (
    <svg viewBox="0 0 40 52" width={size} height={size * 1.3} className={`lamp ${on ? 'lamp-on' : ''} ${className}`} aria-hidden="true">
      <path className="glass" d="M20 3a15 15 0 0 0-9 27v6h18v-6A15 15 0 0 0 20 3z" />
      <path className="fil" d="M14 22l3 3 3-7 3 7 3-3" />
      <path className="fil" d="M17 25v11M23 25v11" />
      <rect className="base" x="12" y="37" width="16" height="4" rx="1.5" />
      <rect className="base" x="13" y="42" width="14" height="4" rx="1.5" />
      <rect className="base" x="16" y="47" width="8" height="3" rx="1.5" />
    </svg>
  );
}

/* Miniature-circuit-breaker (sigorta) */
function Breaker({ on, onClick, label }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on} aria-label={label} title={on ? 'Sigortayı indir' : 'Sigortayı kaldır'} className={`breaker no-spark ${on ? 'on' : ''}`}>
      <span className="lever" />
      <span className="b-mark b-top">I</span>
      <span className="b-mark b-bot">O</span>
    </button>
  );
}

function KnifeSwitch({ closed, inLive }) {
  return (
    <svg viewBox="0 0 84 30" className={`knife ${closed ? 'closed' : ''} ${inLive ? 'in-live' : ''} ${inLive && closed ? 'out-live' : ''}`} aria-hidden="true">
      <line className="k-in" x1="0" y1="21" x2="13" y2="21" />
      <line className="k-out" x1="71" y1="21" x2="84" y2="21" />
      <line className="k-blade" x1="16" y1="21" x2="68" y2="21" />
      <circle className="k-term" cx="16" cy="21" r="4" />
      <circle className="k-term" cx="68" cy="21" r="4" />
    </svg>
  );
}

function MainSwitch({ on, onToggle, variant = 'panel' }) {
  if (variant === 'pill') {
    return (
      <button type="button" onClick={onToggle} aria-pressed={on} className={`no-spark w-full sm:w-auto flex items-center gap-4 rounded-2xl border px-4 py-3 transition-colors ${on ? 'border-amber-volt/40 bg-amber-volt/10' : 'border-white/15 bg-white/[0.04] attention-pill'}`}>
        <span className={`led ${on ? 'led-on' : ''}`} />
        <span className="text-left">
          <span className="block font-mono text-[10px] tracking-widest uppercase text-paper/50">Ana şalter</span>
          <span className="block font-semibold">{on ? 'Enerji verildi' : 'Şalteri kaldırın'}</span>
        </span>
        <span className={`ml-auto relative w-16 h-9 rounded-full transition-colors duration-300 ${on ? 'bg-amber-volt' : 'bg-white/10'}`}>
          <span className={`absolute top-1 w-7 h-7 rounded-full bg-paper shadow-lg transition-all duration-300 ${on ? 'left-8' : 'left-1'}`} />
        </span>
      </button>
    );
  }
  return (
    <button type="button" onClick={onToggle} aria-pressed={on} aria-label="Ana şalter" className={`main-switch no-spark ${on ? 'on' : 'attention'}`}>
      <span className="ms-head">
        <span>ANA ŞALTER</span>
        <span className={`led ${on ? 'led-on' : ''}`} />
      </span>
      <span className="ms-slot">
        <span className="ms-mark ms-top">I</span>
        <span className="ms-mark ms-bot">O</span>
        <span className="ms-lever"><span className="ms-grip" /></span>
      </span>
      <span className="ms-foot">{on ? 'ON · 230V' : 'OFF · 0V'}</span>
    </button>
  );
}

function SectionLabel({ index, children, dark = false }) {
  return (
    <div className={`flex items-center gap-3 font-mono text-xs tracking-[0.25em] uppercase mb-6 ${dark ? 'text-amber-volt' : 'text-amber-deep'}`}>
      <span className={`node-dot ${dark ? 'border-amber-volt/50' : 'border-amber-deep/50'}`}>{index}</span>
      <span className={`h-px w-10 ${dark ? 'bg-amber-volt/40' : 'bg-amber-deep/40'}`} />
      {children}
    </div>
  );
}

function Waveform() {
  const make = (amp, phase) => {
    let d = '';
    for (let x = 0; x <= 2400; x += 10) {
      const y = 60 + amp * Math.sin((x / 2400) * Math.PI * 16 + phase);
      d += `${x === 0 ? 'M' : 'L'}${x},${y.toFixed(1)} `;
    }
    return d;
  };
  return (
    <svg className="wave absolute left-0 w-[200%] h-24 md:h-28 pointer-events-none" viewBox="0 0 2400 120" preserveAspectRatio="none" aria-hidden="true">
      <path d={make(42, 0)} fill="none" stroke="#F39200" strokeWidth="2" />
      <path d={make(28, Math.PI / 1.5)} fill="none" stroke="#FFDE00" strokeWidth="1.5" opacity="0.6" />
      <path d={make(16, (Math.PI * 4) / 3)} fill="none" stroke="#ECEAE4" strokeWidth="1" opacity="0.3" />
    </svg>
  );
}

/* =========================================================
   CIRCUIT RAIL — the whole page is one circuit
   ========================================================= */

function CircuitRail({ sections, onJump }) {
  const fillRef = useRef(null);
  const sparkRef = useRef(null);
  const mFillRef = useRef(null);
  const mSparkRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [lit, setLit] = useState(-1);

  useEffect(() => {
    let raf = 0;
    let measured = [];
    const maxScroll = () => Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const measure = () => {
      const max = maxScroll();
      measured = sections
        .map((s) => {
          const el = document.getElementById(s.id);
          if (!el) return null;
          const top = el.getBoundingClientRect().top + window.scrollY;
          return { ...s, p: Math.min(1, Math.max(0, (top - window.innerHeight * 0.45) / max)) };
        })
        .filter(Boolean);
      setNodes(measured);
    };
    const update = () => {
      raf = 0;
      const p = Math.min(1, Math.max(0, window.scrollY / maxScroll()));
      if (fillRef.current) fillRef.current.style.transform = `scaleY(${p})`;
      if (sparkRef.current) sparkRef.current.style.top = `${p * 100}%`;
      if (mFillRef.current) mFillRef.current.style.transform = `scaleX(${p})`;
      if (mSparkRef.current) mSparkRef.current.style.left = `${p * 100}%`;
      let l = -1;
      measured.forEach((n, i) => { if (p >= n.p - 0.002) l = i; });
      setLit(l);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    const onResize = () => { measure(); update(); };
    onResize();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    let ro;
    if ('ResizeObserver' in window) { ro = new ResizeObserver(onResize); ro.observe(document.body); }
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (ro) ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [sections]);

  return (
    <>
      {/* Desktop: vertical rail */}
      <div className="circuit-rail hidden lg:block fixed left-3 xl:left-5 top-28 bottom-10 w-5 z-40" aria-label="Sayfa devresi">
        <span className="rail-track" />
        <span ref={fillRef} className="rail-fill" />
        <span ref={sparkRef} className="rail-spark" />
        {nodes.map((n, i) => (
          <button key={n.id} type="button" onClick={() => onJump(n.id)} className={`rail-node no-spark ${i <= lit ? 'on' : ''}`} style={{ top: `${n.p * 100}%` }} aria-label={n.label}>
            <span className="rail-label">{n.label}</span>
          </button>
        ))}
      </div>
      {/* Mobile: horizontal wire under header */}
      <div className="lg:hidden fixed top-0 inset-x-0 h-[3px] z-[60] pointer-events-none">
        <span className="absolute inset-0 bg-white/10" />
        <span ref={mFillRef} className="rail-fill-h" />
        <span ref={mSparkRef} className="rail-spark-h" />
      </div>
    </>
  );
}

/* =========================================================
   SERIES CIRCUIT — our process
   ========================================================= */

function StepCard({ step, i, closed, inLive, onToggle, onSeen }) {
  const [ref, inView] = useInView(0.6);
  useEffect(() => {
    if (!inView) return undefined;
    const t = setTimeout(() => onSeen(i), 350 + i * 500);
    return () => clearTimeout(t);
  }, [inView, i, onSeen]);

  return (
    <button ref={ref} type="button" onClick={() => onToggle(i)} aria-pressed={closed} className={`step-card no-spark ${closed ? 'is-closed' : ''}`}>
      <KnifeSwitch closed={closed} inLive={inLive} />
      <span className="mt-4 flex items-center justify-between font-mono text-[11px] tracking-widest uppercase">
        <span className="text-amber-volt">Adım {step.k}</span>
        <span className={closed ? 'text-green-400' : 'text-paper/40'}>{closed ? '● Tamam' : '○ Bekliyor'}</span>
      </span>
      <span className="mt-2 block font-display font-bold text-xl text-paper">{step.title}</span>
      <span className="mt-1 block text-sm text-paper/60 leading-relaxed">{step.desc}</span>
    </button>
  );
}

function SeriesCircuit() {
  const [closed, setClosed] = useState(() => STEPS.map(() => false));
  const touched = useRef(STEPS.map(() => false));

  // Seeing step i means the visitor has passed steps 0..i — close all of them
  // (except any the visitor opened by hand).
  const onSeen = useCallback((i) => {
    const toClose = [];
    for (let j = 0; j <= i; j++) {
      if (!touched.current[j]) { touched.current[j] = true; toClose.push(j); }
    }
    if (toClose.length) setClosed((c) => c.map((v, j) => (toClose.includes(j) ? true : v)));
  }, []);
  const onToggle = useCallback((i) => {
    touched.current[i] = true;
    setClosed((c) => c.map((v, j) => (j === i ? !v : v)));
  }, []);

  const segLive = (k) => closed.slice(0, k).every(Boolean);
  const allClosed = closed.every(Boolean);
  const firstOpen = closed.findIndex((v) => !v);

  return (
    <div>
      <div className="series-row">
        <span className="ac-source" title="Kaynak">~</span>
        {STEPS.map((s, i) => (
          <React.Fragment key={s.k}>
            <span className={`wire wire-s ${segLive(i) ? 'live' : ''}`} />
            <StepCard step={s} i={i} closed={closed[i]} inLive={segLive(i)} onToggle={onToggle} onSeen={onSeen} />
          </React.Fragment>
        ))}
        <span className={`wire wire-s ${allClosed ? 'live' : ''}`} />
        <div className="flex lg:flex-col items-center gap-4 lg:gap-2 lg:w-28 shrink-0">
          <Lamp on={allClosed} size={56} className="big-lamp" />
          <span className="font-mono text-[11px] tracking-widest uppercase text-paper/60 lg:text-center">Proje<br className="hidden lg:block" /> teslim</span>
        </div>
      </div>

      <div className={`mt-10 rounded-2xl border px-5 py-4 flex items-center gap-3 transition-colors duration-500 ${allClosed ? 'border-amber-volt/40 bg-amber-volt/10' : 'border-white/10 bg-white/[0.03]'}`}>
        <Bolt className={`w-5 h-5 shrink-0 ${allClosed ? 'text-amber-volt' : 'text-paper/30'}`} />
        <p className="text-sm md:text-base text-paper/80">
          {allClosed
            ? 'Devre tamamlandı: akım bütün adımlardan geçti, lamba yanıyor. Projeniz teslime hazır.'
            : `Akım ${firstOpen + 1}. adımda kesiliyor. Seri devrede tek bir adım eksikse lamba yanmaz; biz de hiçbir adımı atlamayız.`}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   APP
   ========================================================= */

function App() {
  const [powered, setPowered] = useState(prefersReducedMotion);
  const [flicker, setFlicker] = useState(false);
  const userTouched = useRef(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const heroRef = useRef(null);

  const [active, setActive] = useState(0);
  const [lamps, setLamps] = useState(() => SERVICES.map(() => false));
  const [svcRef, svcInView] = useInView(0.25);

  const [formData, setFormData] = useState({ name: '', phone: '', message: '' });
  const [formStatus, setFormStatus] = useState({ loading: false, success: false, error: null });

  const [showAdmin, setShowAdmin] = useState(false);
  const [references, setReferences] = useState([]);
  const [refIndex, setRefIndex] = useState(0);
  const [refCardImageIndices, setRefCardImageIndices] = useState({});
  const [partners, setPartners] = useState([]);
  const [visibleCards, setVisibleCards] = useState(3);

  useSparks(powered);

  /* ---- power ---- */
  const setPower = useCallback((value, byUser = true) => {
    if (byUser) userTouched.current = true;
    setPowered(value);
    if (value) {
      setFlicker(true);
      setTimeout(() => setFlicker(false), 1100);
    }
  }, []);

  useEffect(() => {
    if (powered || userTouched.current) return undefined;
    const t = setTimeout(() => { if (!userTouched.current) setPower(true, false); }, 4000);
    const onScroll = () => { if (window.scrollY > 80 && !userTouched.current) setPower(true, false); };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { clearTimeout(t); window.removeEventListener('scroll', onScroll); };
  }, [powered, setPower]);

  /* ---- services: lamps switch on one by one ---- */
  useEffect(() => {
    if (!svcInView || !powered) return undefined;
    const timers = SERVICES.map((_, i) => setTimeout(() => {
      setLamps((l) => (l[i] ? l : l.map((v, j) => (j === i ? true : v))));
    }, 200 + i * 140));
    return () => timers.forEach(clearTimeout);
  }, [svcInView, powered]);

  const toggleLamp = (i) => {
    setActive(i);
    setLamps((l) => l.map((v, j) => (j === i ? !v : v)));
  };
  const allLamps = (v) => setLamps(SERVICES.map(() => v));
  const litCount = lamps.filter(Boolean).length;

  /* ---- data ---- */
  const fetchReferences = useCallback(async () => {
    const { data } = await supabase.from('project_references').select('*').order('sort_order', { ascending: true });
    if (data) setReferences(data);
  }, []);

  const fetchPartners = useCallback(async () => {
    const { data } = await supabase.from('partners').select('*').order('sort_order', { ascending: true });
    if (data) setPartners(data);
  }, []);

  useEffect(() => {
    fetchReferences();
    fetchPartners();
    if (window.location.search.includes('admin=true')) setShowAdmin(true);
  }, [fetchReferences, fetchPartners]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      setPastHero(window.scrollY > window.innerHeight * 0.7);
    };
    const onResize = () => setVisibleCards(window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3);
    onScroll();
    onResize();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const maxRefIndex = Math.max(0, references.length - visibleCards);
  useEffect(() => { setRefIndex((i) => Math.min(i, maxRefIndex)); }, [maxRefIndex]);

  const scrollToSection = useCallback((id) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const onHeroMove = (e) => {
    const el = heroRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  const toggleRefCardImage = (refId) => {
    setRefCardImageIndices((prev) => ({ ...prev, [refId]: (prev[refId] || 0) === 0 ? 1 : 0 }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus({ loading: true, success: false, error: null });
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Mesaj gönderilemedi, lütfen telefonla ulaşın.');
      setFormStatus({ loading: false, success: true, error: null });
      setFormData({ name: '', phone: '', message: '' });
      setTimeout(() => setFormStatus((prev) => ({ ...prev, success: false })), 5000);
    } catch (error) {
      setFormStatus({ loading: false, success: false, error: error.message });
    }
  };

  const activeOn = lamps[active];

  return (
    <div className={`min-h-screen overflow-x-clip bg-ink text-paper font-sans selection:bg-amber-volt selection:text-ink ${powered ? 'is-powered' : 'power-off'} ${flicker ? 'flicker' : ''}`}>
      <CircuitRail sections={NAV} onJump={scrollToSection} />

      {/* ================= HEADER ================= */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled || menuOpen ? 'bg-ink/90 backdrop-blur-xl border-b border-white/5 py-3' : 'py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-4">
          <button onClick={() => scrollToSection('home')} aria-label="Anasayfa" className="shrink-0 no-spark">
            <img src="/logo-light.svg" alt="MERVOLT ELEKTRİK" className={`w-auto transition-all duration-500 ${scrolled ? 'h-9' : 'h-10 md:h-11'}`} />
          </button>

          <nav className="hidden xl:flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2 py-1.5">
            {NAV.map((n) => (
              <button key={n.id} onClick={() => scrollToSection(n.id)} className="no-spark px-4 py-2 rounded-full text-sm text-paper/70 hover:text-ink hover:bg-amber-volt transition-colors duration-300">
                {n.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setPower(!powered)} className="no-spark hidden md:inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 font-mono text-[10px] tracking-widest uppercase text-paper/60 hover:text-paper transition-colors" title="Ana şalter">
              <span className={`led ${powered ? 'led-on' : ''}`} />{powered ? 'Enerji var' : 'Enerji yok'}
            </button>
            <a href="tel:+905326997633" className="hidden md:inline-flex items-center gap-2 rounded-full bg-amber-volt text-ink font-semibold text-sm px-5 py-2.5 hover:bg-yellow-volt transition-colors">
              <Bolt className="w-4 h-4" /> Hemen Ara
            </a>
            <button onClick={() => setMenuOpen((o) => !o)} className="no-spark xl:hidden w-11 h-11 rounded-full border border-white/15 flex items-center justify-center" aria-label="Menü" aria-expanded={menuOpen}>
              <span className="relative block w-5 h-3">
                <span className={`absolute left-0 w-5 h-0.5 bg-paper transition-all duration-300 ${menuOpen ? 'top-1.5 rotate-45' : 'top-0'}`} />
                <span className={`absolute left-0 w-5 h-0.5 bg-paper transition-all duration-300 ${menuOpen ? 'top-1.5 -rotate-45' : 'top-3'}`} />
              </span>
            </button>
          </div>
        </div>

        <div className={`xl:hidden overflow-hidden transition-[max-height] duration-500 ${menuOpen ? 'max-h-[620px]' : 'max-h-0'}`}>
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-6 flex flex-col">
            {NAV.map((n, i) => (
              <button key={n.id} onClick={() => scrollToSection(n.id)} className="no-spark flex items-baseline gap-4 py-3 border-b border-white/5 text-left text-2xl font-display font-bold text-paper hover:text-amber-volt transition-colors">
                <span className="font-mono text-xs text-amber-volt">0{i + 1}</span>{n.label}
              </button>
            ))}
            <a href="tel:+905326997633" className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-amber-volt text-ink font-semibold px-5 py-3">
              <Bolt className="w-4 h-4" /> +90 532 699 76 33
            </a>
          </nav>
        </div>
      </header>

      <main>
        {/* ================= HERO ================= */}
        <section id="home" ref={heroRef} onMouseMove={onHeroMove} className="hero relative min-h-[100svh] flex flex-col justify-center overflow-hidden pt-28 pb-56 md:pb-60">
          <div className="absolute inset-0 grid-bg" aria-hidden="true" />
          <div className="absolute inset-0 hero-glow" aria-hidden="true" />
          <div className="hero-blob absolute -top-40 -right-40 w-[560px] h-[560px] rounded-full bg-amber-volt/20 blur-[120px]" aria-hidden="true" />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 w-full grid lg:grid-cols-[1fr_auto] gap-10 items-center">
            <div>
              <div className="hero-in inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] pl-2 pr-4 py-1.5 font-mono text-[11px] sm:text-xs tracking-widest uppercase text-paper/70" style={{ animationDelay: '0.1s' }}>
                <span className={`led ${powered ? 'led-on' : ''}`} />
                {powered ? 'Hat aktif' : 'Hat beklemede'} · 1994'ten beri<span className="hidden sm:inline"> · Mezitli / Mersin</span>
              </div>

              <h1 className="hero-title mt-8 font-display font-black uppercase leading-[0.88] tracking-tight text-[10.5vw] sm:text-[10vw] lg:text-[7.2rem] xl:text-[8rem]">
                <span className="hero-in block" style={{ animationDelay: '0.2s' }}>Elektrikte</span>
                <span className="hero-in block" style={{ animationDelay: '0.35s' }}><span className="text-stroke">30 yıllık</span></span>
                <span className="hero-in block" style={{ animationDelay: '0.5s' }}>
                  <span className="voltage-text">güven</span><span className="dot-volt">.</span>
                </span>
              </h1>

              <p className="hero-in mt-8 max-w-xl text-lg md:text-xl text-paper/70 leading-relaxed" style={{ animationDelay: '0.7s' }}>
                Bugünün teknolojisi, dünün tecrübesiyle. Orta gerilimden güneş enerjisine, pano imalatından anahtar teslim taahhüte kadar güvenilir elektrik çözümleri.
              </p>

              <div className="hero-in mt-8 flex flex-wrap gap-3" style={{ animationDelay: '0.85s' }}>
                <button onClick={() => scrollToSection('contact')} className="group inline-flex items-center gap-3 rounded-full bg-amber-volt text-ink font-semibold px-7 py-4 hover:bg-yellow-volt transition-colors">
                  Teklif Alın <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                </button>
                <button onClick={() => scrollToSection('services')} className="inline-flex items-center gap-3 rounded-full border border-white/20 px-7 py-4 font-semibold hover:border-amber-volt hover:text-amber-volt transition-colors">
                  Hizmetlerimiz
                </button>
              </div>

              <div className="hero-in mt-6 lg:hidden" style={{ animationDelay: '1s' }}>
                <MainSwitch variant="pill" on={powered} onToggle={() => setPower(!powered)} />
              </div>
            </div>

            <div className="hero-in hidden lg:flex flex-col items-center gap-4" style={{ animationDelay: '0.9s' }}>
              <span className={`font-mono text-[11px] tracking-widest uppercase transition-opacity ${powered ? 'opacity-0' : 'opacity-100 text-amber-volt animate-pulse'}`}>Siteye enerji verin ↓</span>
              <MainSwitch on={powered} onToggle={() => setPower(!powered)} />
            </div>
          </div>

          <Waveform />

          <div className="absolute bottom-0 inset-x-0 border-t border-white/10 bg-ink/70 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 grid grid-cols-3 divide-x divide-white/10">
              {[
                { end: 30, suffix: '+', label: 'Yıllık deneyim' },
                { end: 500, suffix: '+', label: 'Tamamlanan proje' },
                { end: 100, suffix: '%', label: 'Memnuniyet' },
              ].map((s) => (
                <div key={s.label} className="py-5 md:py-7 px-3 md:px-8">
                  <Counter end={s.end} suffix={s.suffix} className="block font-display font-black text-3xl md:text-5xl text-paper" />
                  <span className="block mt-1 font-mono text-[10px] md:text-xs uppercase tracking-widest text-paper/50">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= ABOUT ================= */}
        <section id="about" className="bg-paper text-ink py-24 md:py-36 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
            <Reveal><SectionLabel index="01">Hakkımızda</SectionLabel></Reveal>

            <div className="grid lg:grid-cols-12 gap-12 lg:gap-14">
              <div className="lg:col-span-6">
                <Reveal>
                  <h2 className="font-display font-black text-4xl md:text-6xl leading-[0.95] tracking-tight">
                    Kökleri <span className="marker">1994'e</span> uzanan bir ustalık.
                  </h2>
                </Reveal>
                <Reveal delay={100}>
                  <p className="mt-8 text-lg md:text-xl text-ink/70 leading-relaxed">
                    MERVOLT ELEKTRİK, kökleri 1994 yılına uzanan bir deneyimin ve uzmanlığın üzerine kurulmuştur. Endüstriyel projelerden konut tesisatlarına kadar geniş bir yelpazede hizmet veren firmamız, kalite ve güvenilirlik ilkelerinden asla ödün vermez.
                  </p>
                </Reveal>

                <div className="mt-10 grid sm:grid-cols-2 gap-4">
                  <Reveal delay={150} className="rounded-3xl bg-ink text-paper p-7 relative overflow-hidden group">
                    <Bolt className="absolute -right-6 -bottom-6 w-36 h-36 text-amber-volt/10 group-hover:text-amber-volt/25 group-hover:rotate-12 transition-all duration-700" />
                    <span className="font-mono text-xs tracking-widest uppercase text-amber-volt">Değerlerimiz</span>
                    <p className="mt-4 text-paper/80 leading-relaxed relative">Güvenilirlik, şeffaflık ve müşteri memnuniyeti. Her projede en yüksek kalite standartlarını hedefliyoruz.</p>
                  </Reveal>
                  <Reveal delay={250} className="rounded-3xl bg-amber-volt text-ink p-7 relative overflow-hidden group">
                    <svg className="absolute -right-8 -bottom-8 w-40 h-40 text-ink/10 group-hover:rotate-90 transition-transform duration-1000" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20" /></svg>
                    <span className="font-mono text-xs tracking-widest uppercase">Vizyonumuz</span>
                    <p className="mt-4 text-ink/80 leading-relaxed relative">Elektrik sektöründe yenilikçi çözümlerle öncü olmak ve sürdürülebilir enerji geleceğine katkıda bulunmak.</p>
                  </Reveal>
                </div>
              </div>

              {/* Founder */}
              <div className="lg:col-span-6">
                <Reveal delay={100} className="relative">
                  <figure className="relative rounded-[2rem] overflow-hidden aspect-[4/3] bg-ink shadow-2xl">
                    <img src="/kurucu.jpeg" alt="Mehmet ODABAŞI, TEİAŞ'taki görevi sırasında bir güç trafosunun yanında" className="w-full h-full object-cover object-[82%_50%] hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
                    <figcaption className="absolute bottom-0 inset-x-0 p-6 md:p-8 text-paper">
                      <span className="font-mono text-xs tracking-widest uppercase text-amber-volt">Kurucumuz</span>
                      <span className="mt-1 block font-display font-black text-3xl md:text-4xl">Mehmet ODABAŞI</span>
                      <span className="mt-1 block font-mono text-[11px] tracking-widest uppercase text-paper/60">TEİAŞ · güç trafosu sahası</span>
                    </figcaption>
                  </figure>
                  <div className="absolute -top-5 -left-3 md:-left-6 rotate-[-6deg] rounded-2xl bg-yellow-volt text-ink px-5 py-3 shadow-xl">
                    <span className="block font-display font-black text-3xl leading-none">25+</span>
                    <span className="font-mono text-[10px] uppercase tracking-widest">yıl saha</span>
                  </div>
                  <div className="absolute -top-4 -right-2 md:-right-5 rotate-[5deg] rounded-2xl bg-ink text-paper px-5 py-3 shadow-xl border border-white/10">
                    <span className="block font-display font-black text-2xl leading-none text-amber-volt">TEİAŞ</span>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-paper/60">kamu tecrübesi</span>
                  </div>
                </Reveal>
                <Reveal delay={200}>
                  <div className="mt-8 space-y-4 text-ink/70 leading-relaxed">
                    <p>Uzun yıllarını Türkiye Elektrik İletim A.Ş. (TEİAŞ)'ta geçiren kurucumuz, yüksek gerilim hatlarından enerji iletim sistemlerine kadar birçok alanda saha deneyimi kazanmış, iş disiplini ve teknik birikimiyle saygı gören bir usta olmuştur.</p>
                    <p>Bu tecrübe; işe bağlılık, detaylara özen ve güvenilirlik anlayışını da beraberinde getirdi. Mervolt'un temelini oluşturan bu değerler bugün sunduğumuz her hizmette kendini gösteriyor.</p>
                  </div>
                </Reveal>
              </div>
            </div>

            {/* Timeline */}
            <div className="mt-24 md:mt-32">
              <div className="relative grid md:grid-cols-4 gap-10 md:gap-6">
                <div className="hidden md:block absolute top-[11px] left-0 right-0 h-px bg-ink/15"><div className="current-line h-px" /></div>
                {TIMELINE.map((t, i) => (
                  <Reveal key={t.year} delay={i * 120} className="relative pl-9 md:pl-0">
                    {i < TIMELINE.length - 1 && <div className="md:hidden absolute left-[11px] top-6 -bottom-10 w-px bg-ink/15" />}
                    <span className="absolute md:relative left-0 top-0 flex w-6 h-6 items-center justify-center rounded-full bg-paper border-2 border-amber-volt">
                      <span className="w-2 h-2 rounded-full bg-amber-volt" />
                    </span>
                    <div className="md:mt-6">
                      <span className="font-display font-black text-3xl md:text-4xl text-ink">{t.year}</span>
                      <h3 className="mt-2 font-semibold">{t.title}</h3>
                      <p className="mt-1 text-sm text-ink/60 leading-relaxed">{t.text}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ================= SERVICES — parallel circuit ================= */}
        <section id="services" className="relative py-24 md:py-36 overflow-hidden">
          <div className="absolute inset-0 grid-bg opacity-60" aria-hidden="true" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
            <Reveal><SectionLabel index="02" dark>Hizmetlerimiz</SectionLabel></Reveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <Reveal>
                <h2 className="font-display font-black text-4xl md:text-6xl leading-[0.95] tracking-tight max-w-3xl">
                  Sekiz hat, <span className="voltage-text">tek pano.</span>
                </h2>
              </Reveal>
              <Reveal delay={100}>
                <p className="text-paper/60 max-w-sm">Hizmetlerimiz paralel bağlı: her biri kendi sigortasıyla bağımsız çalışır. Bir sigortayı indirin, diğer lambalar yanmaya devam eder.</p>
              </Reveal>
            </div>

            <div ref={svcRef} className="grid lg:grid-cols-12 gap-10">
              <div className="lg:col-span-7">
                <div className="flex items-center justify-between gap-3 mb-4 font-mono text-[11px] tracking-widest uppercase">
                  <span className="text-paper/50">Bara · 400V · <span className="text-amber-volt">{powered ? litCount : 0}/{SERVICES.length}</span> hat aktif</span>
                  <span className="flex gap-2">
                    <button type="button" onClick={() => allLamps(true)} className="no-spark rounded-full border border-white/15 px-3 py-1.5 hover:border-amber-volt hover:text-amber-volt transition-colors">Tümü I</button>
                    <button type="button" onClick={() => allLamps(false)} className="no-spark rounded-full border border-white/15 px-3 py-1.5 hover:border-amber-volt hover:text-amber-volt transition-colors">Tümü O</button>
                  </span>
                </div>

                <ul className="relative">
                  <span className="wire wire-v live absolute left-[14px] top-0 bottom-6 w-[3px]" aria-hidden="true" />
                  <span className="ground absolute left-[6px] bottom-0" aria-hidden="true" />
                  {SERVICES.map((s, i) => {
                    const isActive = active === i;
                    return (
                      <li key={s.code} className="relative pl-12">
                        <span className="wire wire-h live absolute left-[16px] top-[37px] w-[32px] h-[3px]" aria-hidden="true" />
                        <div className={`flex items-start gap-3 md:gap-4 py-4 border-b transition-colors ${isActive ? 'border-amber-volt/30' : 'border-white/10'}`}>
                          <Breaker on={lamps[i]} onClick={() => toggleLamp(i)} label={`${s.title} sigortası`} />
                          <span className={`wire wire-h ${lamps[i] ? 'live' : ''} mt-[21px] w-3 md:w-6 h-[3px] shrink-0`} aria-hidden="true" />
                          <Lamp on={lamps[i]} size={30} className="shrink-0 mt-[2px]" />
                          <button
                            type="button"
                            onMouseEnter={() => setActive(i)}
                            onFocus={() => setActive(i)}
                            onClick={() => setActive(i)}
                            className={`no-spark flex-1 min-w-0 text-left pt-1 transition-colors ${isActive ? 'text-paper' : 'text-paper/50 hover:text-paper/80'}`}
                          >
                            <span className="flex items-baseline gap-3">
                              <span className={`font-mono text-[10px] md:text-xs shrink-0 ${isActive ? 'text-amber-volt' : ''}`}>{s.code}</span>
                              <span className="font-display font-bold text-xl sm:text-2xl md:text-3xl tracking-tight leading-tight">{s.title}</span>
                            </span>
                            <span className={`block overflow-hidden transition-all duration-500 text-sm md:text-base text-paper/60 ${isActive ? 'max-h-28 mt-2 opacity-100' : 'max-h-0 opacity-0'}`}>{s.desc}</span>
                          </button>
                        </div>
                        <div className={`lg:hidden overflow-hidden transition-all duration-500 ${isActive ? 'max-h-72 mt-3 mb-2' : 'max-h-0'}`}>
                          <div className={`svc-photo relative rounded-2xl overflow-hidden ${lamps[i] ? 'lit' : ''}`}>
                            <img src={s.img} alt={s.title} loading="lazy" className="w-full h-56 object-cover" />
                            <span className="svc-off-note">Sigorta inik · hat kapalı</span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="hidden lg:block lg:col-span-5">
                <div className={`svc-photo sticky top-28 rounded-[2rem] overflow-hidden aspect-[4/5] bg-white/5 border border-white/10 ${activeOn ? 'lit' : ''}`}>
                  {SERVICES.map((s, i) => (
                    <img key={s.code} src={s.img} alt={s.title} loading="lazy" className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${active === i ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`} />
                  ))}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-transparent to-ink/30" />
                  <div className="absolute top-5 left-5 right-5 flex justify-between items-center font-mono text-[11px] uppercase tracking-widest text-paper/80">
                    <span className="flex items-center gap-2"><span className={`led ${activeOn && powered ? 'led-on' : ''}`} />{SERVICES[active].code}</span>
                    <span>{String(active + 1).padStart(2, '0')} / {String(SERVICES.length).padStart(2, '0')}</span>
                  </div>
                  <span className="svc-off-note">Sigorta inik · hat kapalı</span>
                  <div className="absolute bottom-0 inset-x-0 p-8">
                    <h3 className="font-display font-black text-3xl">{SERVICES[active].title}</h3>
                    <p className="mt-2 text-paper/70">{SERVICES[active].desc}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= PROCESS — series circuit ================= */}
        <section id="process" className="relative py-24 md:py-32 bg-ink2 border-y border-white/5 overflow-hidden">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
            <Reveal><SectionLabel index="03" dark>Nasıl Çalışıyoruz</SectionLabel></Reveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
              <Reveal>
                <h2 className="font-display font-black text-4xl md:text-6xl leading-[0.95] tracking-tight max-w-3xl">
                  Seri bağlı <span className="voltage-text">dört adım.</span>
                </h2>
              </Reveal>
              <Reveal delay={100}>
                <p className="text-paper/60 max-w-sm">Seri devrede akım ancak bütün anahtarlar kapalıysa lambaya ulaşır. Anahtarlara tıklayıp kendiniz deneyebilirsiniz.</p>
              </Reveal>
            </div>
            <SeriesCircuit />
          </div>
        </section>

        {/* ================= REFERENCES ================= */}
        <section id="references" className="bg-paper text-ink py-24 md:py-36">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
            <Reveal><SectionLabel index="04">Referanslarımız</SectionLabel></Reveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
              <Reveal>
                <h2 className="font-display font-black text-4xl md:text-6xl leading-[0.95] tracking-tight max-w-3xl">
                  Sahada <span className="marker">kanıtlanmış</span> işler.
                </h2>
              </Reveal>
              {references.length > visibleCards && (
                <div className="flex gap-3">
                  <button onClick={() => setRefIndex(Math.max(0, refIndex - 1))} disabled={refIndex === 0} aria-label="Önceki" className="w-14 h-14 rounded-full border border-ink/20 flex items-center justify-center hover:bg-ink hover:text-paper disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink transition-colors">←</button>
                  <button onClick={() => setRefIndex(Math.min(maxRefIndex, refIndex + 1))} disabled={refIndex >= maxRefIndex} aria-label="Sonraki" className="w-14 h-14 rounded-full bg-ink text-paper flex items-center justify-center hover:bg-amber-volt hover:text-ink disabled:opacity-30 transition-colors">→</button>
                </div>
              )}
            </div>

            {references.length > 0 ? (
              <>
                <div className="ref-carousel -mx-3">
                  <div className="ref-carousel-track" style={{ transform: `translateX(-${refIndex * (100 / visibleCards)}%)` }}>
                    {references.map((ref, i) => {
                      const showSecond = (refCardImageIndices[ref.id] || 0) === 1;
                      return (
                        <div key={ref.id} className="ref-card" style={{ width: `${100 / visibleCards}%` }}>
                          <article className="group h-full">
                            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-ink cursor-pointer" onClick={() => ref.image2_url && toggleRefCardImage(ref.id)}>
                              <img src={showSecond ? ref.image2_url : ref.image1_url} alt={ref.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                              <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                              <span className="absolute top-4 left-4 rounded-full bg-paper/90 backdrop-blur px-3 py-1 font-mono text-[11px] tracking-widest">#{String(i + 1).padStart(2, '0')}</span>
                              {ref.image2_url && (
                                <span className="absolute bottom-4 right-4 flex gap-1.5">
                                  <span className={`h-2 rounded-full transition-all ${!showSecond ? 'w-6 bg-amber-volt' : 'w-2 bg-paper/70'}`} />
                                  <span className={`h-2 rounded-full transition-all ${showSecond ? 'w-6 bg-amber-volt' : 'w-2 bg-paper/70'}`} />
                                </span>
                              )}
                            </div>
                            <div className="pt-5 px-1">
                              <h3 className="font-display font-bold text-xl">{ref.title}</h3>
                              <p className="mt-1 text-ink/60 text-sm leading-relaxed">{ref.description}</p>
                            </div>
                          </article>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {maxRefIndex > 0 && (
                  <div className="mt-10 h-1 bg-ink/10 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-volt rounded-full transition-all duration-500" style={{ width: `${((refIndex + 1) / (maxRefIndex + 1)) * 100}%` }} />
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-3xl border border-dashed border-ink/20 py-16 text-center text-ink/40">Henüz referans eklenmemiş.</div>
            )}
          </div>
        </section>

        {/* ================= PARTNERS ================= */}
        <section id="partners" className="bg-paper text-ink pb-24 md:pb-36">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
            <Reveal><SectionLabel index="05">Çalışma Ortaklarımız</SectionLabel></Reveal>
            <Reveal><h2 className="font-display font-black text-3xl md:text-5xl leading-[0.95] tracking-tight mb-12">Güvendiğimiz markalar.</h2></Reveal>
          </div>
          {partners.length > 0 ? (
            <div className="border-y border-ink/10 py-10 bg-white/50">
              <div className="marquee-container">
                <div className="marquee-track">
                  {[...partners, ...partners, ...partners].map((p, i) => (
                    <div key={`${p.id}-${i}`} className="marquee-item"><img src={p.logo_url} alt={p.name} title={p.name} /></div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
              <div className="rounded-3xl border border-dashed border-ink/20 py-16 text-center text-ink/40">Henüz çalışma ortağı eklenmemiş.</div>
            </div>
          )}
        </section>

        {/* ================= TICKER ================= */}
        <section className="bg-amber-volt text-ink overflow-hidden" aria-hidden="true">
          <div className="ticker py-5 md:py-6 font-display font-black text-3xl md:text-5xl uppercase whitespace-nowrap">
            {[0, 1].map((k) => (
              <span key={k} className="ticker-track inline-flex items-center gap-8 pr-8">
                {SERVICES.map((s) => (
                  <span key={s.code} className="inline-flex items-center gap-8">{s.title}<Bolt className="w-8 h-8 md:w-10 md:h-10" /></span>
                ))}
              </span>
            ))}
          </div>
        </section>

        {/* ================= CONTACT ================= */}
        <section id="contact" className="relative py-24 md:py-36 overflow-hidden">
          <div className="absolute -bottom-40 -left-40 w-[520px] h-[520px] rounded-full bg-amber-volt/15 blur-[120px]" aria-hidden="true" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
            <Reveal><SectionLabel index="06" dark>İletişim</SectionLabel></Reveal>
            <Reveal>
              <h2 className="font-display font-black text-5xl md:text-8xl leading-[0.9] tracking-tight">
                Projenize<br /><span className="voltage-text">enerji</span> verelim.
              </h2>
            </Reveal>

            <div className="mt-16 grid lg:grid-cols-2 gap-8">
              <div className="space-y-8">
                <Reveal className="grid sm:grid-cols-2 gap-4">
                  <a href="tel:+905326997633" className="group rounded-3xl border border-white/10 bg-white/[0.03] p-6 hover:border-amber-volt transition-colors">
                    <span className="font-mono text-[11px] uppercase tracking-widest text-paper/50">GSM</span>
                    <span className="mt-2 block font-display font-bold text-xl group-hover:text-amber-volt transition-colors">+90 532 699 76 33</span>
                  </a>
                  <a href="tel:+903243572636" className="group rounded-3xl border border-white/10 bg-white/[0.03] p-6 hover:border-amber-volt transition-colors">
                    <span className="font-mono text-[11px] uppercase tracking-widest text-paper/50">Telefon</span>
                    <span className="mt-2 block font-display font-bold text-xl group-hover:text-amber-volt transition-colors">0324 357 26 36</span>
                  </a>
                  <div className="sm:col-span-2 rounded-3xl border border-white/10 bg-white/[0.03] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="font-mono text-[11px] uppercase tracking-widest text-paper/50">Yetkili</span>
                      <span className="mt-2 block font-display font-bold text-xl">Mehmet ODABAŞI <span className="text-paper/50 font-sans font-normal text-base">· Kurucu</span></span>
                    </div>
                    <div className="sm:text-right">
                      <span className="font-mono text-[11px] uppercase tracking-widest text-paper/50">Adres</span>
                      <span className="mt-2 block font-semibold">Merkez Mah. Mezitli / MERSİN</span>
                    </div>
                  </div>
                </Reveal>

                <Reveal delay={100} className="rounded-3xl bg-paper text-ink p-6 md:p-10">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display font-black text-2xl md:text-3xl">Hızlı iletişim</h3>
                      <p className="mt-1 text-ink/60 text-sm">Formu doldurun, en kısa sürede size dönelim.</p>
                    </div>
                    <Lamp on={formStatus.success} size={34} className="lamp-light-bg shrink-0" />
                  </div>
                  <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="field">
                      <input id="f-name" type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder=" " required />
                      <label htmlFor="f-name">Adınız Soyadınız</label>
                    </div>
                    <div className="field">
                      <input id="f-phone" type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder=" " required />
                      <label htmlFor="f-phone">Telefon Numaranız</label>
                    </div>
                    <div className="field">
                      <textarea id="f-msg" rows="4" name="message" value={formData.message} onChange={handleInputChange} placeholder=" " required />
                      <label htmlFor="f-msg">Mesajınız</label>
                    </div>
                    <button type="submit" disabled={formStatus.loading} className="group w-full inline-flex items-center justify-center gap-3 rounded-full bg-ink text-paper font-semibold py-4 hover:bg-amber-volt hover:text-ink transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                      <Bolt className={`w-5 h-5 ${formStatus.loading ? 'animate-pulse' : ''}`} />
                      {formStatus.loading ? 'Gönderiliyor...' : 'Mesaj Gönder'}
                    </button>
                    {formStatus.success && <div className="p-4 rounded-2xl bg-green-100 text-green-800 text-sm">Mesajınız başarıyla gönderildi! En kısa sürede dönüş yapacağız.</div>}
                    {formStatus.error && <div className="p-4 rounded-2xl bg-red-100 text-red-800 text-sm">{formStatus.error}</div>}
                  </form>
                </Reveal>
              </div>

              <Reveal delay={150} className="rounded-3xl overflow-hidden border border-white/10 min-h-[420px] lg:min-h-0">
                <iframe
                  title="Mervolt Elektrik Konum Haritası"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3197.9046033738517!2d34.49176937619167!3d36.74581847124135!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x15278b001b1e7fad%3A0x43a27c3b3f3d3124!2sMervolt%20Elektrik!5e0!3m2!1str!2str!4v1710799849633!5m2!1str!2str"
                  className="map-dark w-full h-full min-h-[420px]"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </Reveal>
            </div>
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-white/10 pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-14">
          <div className="flex flex-col md:flex-row justify-between gap-10">
            <div>
              <img src="/logo-light.svg" alt="MERVOLT ELEKTRİK" className="h-12 w-auto" />
              <p className="mt-4 text-paper/50 max-w-sm">1994'ten beri elektrik sektöründe güvenilir çözümler.</p>
            </div>
            <div className="grid grid-cols-2 gap-10 text-sm">
              <div className="space-y-2">
                <span className="block font-mono text-[11px] uppercase tracking-widest text-amber-volt mb-3">Menü</span>
                {NAV.map((n) => (
                  <button key={n.id} onClick={() => scrollToSection(n.id)} className="no-spark block text-paper/60 hover:text-paper transition-colors">{n.label}</button>
                ))}
              </div>
              <div className="space-y-2 text-paper/60">
                <span className="block font-mono text-[11px] uppercase tracking-widest text-amber-volt mb-3">İletişim</span>
                <p>Merkez Mah. Mezitli / MERSİN</p>
                <a href="tel:+903243572636" className="block hover:text-paper">Tel: 0324 357 26 36</a>
                <a href="tel:+905326997633" className="block hover:text-paper">Gsm: +90 532 699 76 33</a>
              </div>
            </div>
          </div>
          <div className="mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between gap-2 text-xs text-paper/40 font-mono">
            <span>© {new Date().getFullYear()} MERVOLT ELEKTRİK. Tüm hakları saklıdır.</span>
            <span>Devre sonu · topraklama ⏚</span>
          </div>
        </div>
      </footer>

      {/* Power-off toast */}
      <div className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${!powered && pastHero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'}`}>
        <div className="flex items-center gap-3 rounded-full bg-ink border border-white/15 shadow-2xl pl-4 pr-2 py-2 text-sm whitespace-nowrap">
          <span className="led" /> Şalter indirildi
          <button type="button" onClick={() => setPower(true)} className="no-spark rounded-full bg-amber-volt text-ink font-semibold px-4 py-1.5">Enerji ver</button>
        </div>
      </div>

      {/* Floating call button (mobile) */}
      <a href="tel:+905326997633" aria-label="Ara" className={`md:hidden fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full bg-amber-volt text-ink flex items-center justify-center shadow-2xl shadow-amber-volt/40 pulse-ring transition-all duration-300 ${pastHero && powered ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'}`}>
        <Bolt className="w-6 h-6" />
      </a>

      {showAdmin && (
        <div className="text-ink font-sans">
          <Admin onClose={() => { setShowAdmin(false); fetchReferences(); fetchPartners(); }} />
        </div>
      )}
    </div>
  );
}

document.documentElement.style.scrollBehavior = 'smooth';

export default App;
