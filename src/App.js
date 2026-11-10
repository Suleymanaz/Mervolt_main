import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from './supabaseClient';
import Admin from './Admin';

/* ---------- Helpers ---------- */

const NAV = [
  { id: 'home', label: 'Anasayfa' },
  { id: 'about', label: 'Hakkımızda' },
  { id: 'services', label: 'Hizmetler' },
  { id: 'references', label: 'Referanslar' },
  { id: 'partners', label: 'Ortaklar' },
  { id: 'contact', label: 'İletişim' },
];

const SERVICES = [
  { code: 'S-01', title: 'Malzemeli Taahhüt', desc: 'Elektrik altyapı projeleriniz için anahtar teslim çözümler.', img: '/taahüt.jpeg' },
  { code: 'S-02', title: 'Orta Gerilim', desc: 'Endüstriyel ve kurumsal projelerde güvenli enerji iletimi.', img: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=900&h=700&fit=crop&auto=format' },
  { code: 'S-03', title: 'Alçak Gerilim', desc: 'Bina içi ve çevresi için güvenilir düşük voltaj uygulamaları.', img: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=900&h=700&fit=crop&auto=format' },
  { code: 'S-04', title: 'Pano İmalatı', desc: 'AG-OG panoları, kompanzasyon panoları ve özel ihtiyaçlı panoların anahtar teslim hazırlanması.', img: '/pano.jpeg' },
  { code: 'S-05', title: 'Malzeme Satışı', desc: 'Kaliteli ve sertifikalı elektrik ekipmanları temini.', img: '/malzeme-satisi.jpeg' },
  { code: 'S-06', title: 'Mühendislik', desc: 'Projelendirme, teknik çizim ve uygulama danışmanlığı.', img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900&h=700&fit=crop&auto=format' },
  { code: 'S-07', title: 'Güneş Enerjisi', desc: 'ORBİT bayiliği ile lisanslı ve lisanssız güneş enerjisi çözümleri; bireysel ve ticari kullanım.', img: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=900&h=700&fit=crop&auto=format' },
  { code: 'S-08', title: 'Enerji Depolama', desc: 'Kesintisiz güç ve sürdürülebilir enerji için modern batarya teknolojileri.', img: '/enerji-depolama.jpeg' },
];

const TIMELINE = [
  { year: '1994', title: 'İlk adım', text: 'Mehmet ODABAŞI elektrik sektörüne adım atar.' },
  { year: 'TEİAŞ', title: 'Yüksek gerilim yılları', text: 'Yüksek gerilim hatlarından enerji iletim sistemlerine uzanan saha deneyimi.' },
  { year: 'MERVOLT', title: 'Tecrübe markaya dönüşür', text: 'Disiplin ve teknik birikim Mervolt Elektrik çatısı altında toplanır.' },
  { year: 'BUGÜN', title: 'Yarının enerjisi', text: 'Güneş enerjisi, enerji depolama ve anahtar teslim projeler.' },
];

function useInView(options = { threshold: 0.2 }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    if (!('IntersectionObserver' in window)) { setInView(true); return; }
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); obs.disconnect(); }
    }, options);
    obs.observe(el);
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);
  return [ref, inView];
}

function Reveal({ children, className = '', delay = 0, as: Tag = 'div' }) {
  const [ref, inView] = useInView({ threshold: 0.15 });
  return (
    <Tag ref={ref} className={`reveal ${inView ? 'is-in' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </Tag>
  );
}

function Counter({ end, duration = 1600, suffix = '', className = '' }) {
  const [ref, inView] = useInView({ threshold: 0.5 });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start;
    let frame;
    const animate = (t) => {
      if (!start) start = t;
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(end * eased));
      if (p < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [inView, end, duration]);

  return <span ref={ref} className={className}>{count}{suffix}</span>;
}

function Bolt({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" />
    </svg>
  );
}

function SectionLabel({ index, children, dark = false }) {
  return (
    <div className={`flex items-center gap-3 font-mono text-xs tracking-[0.25em] uppercase mb-6 ${dark ? 'text-amber-volt' : 'text-amber-deep'}`}>
      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full border ${dark ? 'border-amber-volt/40' : 'border-amber-deep/40'}`}>{index}</span>
      <span className={`h-px w-10 ${dark ? 'bg-amber-volt/40' : 'bg-amber-deep/40'}`} />
      {children}
    </div>
  );
}

/* Animated oscilloscope sine wave */
function Waveform() {
  const make = (amp, freq, phase) => {
    let d = '';
    for (let x = 0; x <= 2400; x += 10) {
      const y = 100 + amp * Math.sin((x / 2400) * Math.PI * 2 * freq + phase);
      d += `${x === 0 ? 'M' : 'L'}${x},${y.toFixed(1)} `;
    }
    return d;
  };
  return (
    <svg className="wave absolute left-0 w-[200%] h-24 md:h-28 pointer-events-none" viewBox="0 0 2400 200" preserveAspectRatio="none" aria-hidden="true">
      <path d={make(55, 8, 0)} fill="none" stroke="#F39200" strokeWidth="2" opacity="0.9" />
      <path d={make(35, 8, Math.PI / 1.5)} fill="none" stroke="#FFDE00" strokeWidth="1.5" opacity="0.55" />
      <path d={make(20, 8, (Math.PI * 4) / 3)} fill="none" stroke="#ECEAE4" strokeWidth="1" opacity="0.3" />
    </svg>
  );
}

/* ---------- App ---------- */

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeService, setActiveService] = useState(0);
  const heroRef = useRef(null);

  const [formData, setFormData] = useState({ name: '', phone: '', message: '' });
  const [formStatus, setFormStatus] = useState({ loading: false, success: false, error: null });

  const [showAdmin, setShowAdmin] = useState(false);
  const [references, setReferences] = useState([]);
  const [refIndex, setRefIndex] = useState(0);
  const [refCardImageIndices, setRefCardImageIndices] = useState({});
  const [partners, setPartners] = useState([]);
  const [visibleCards, setVisibleCards] = useState(3);

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
    const onScroll = () => setScrolled(window.scrollY > 40);
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

  const scrollToSection = (id) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

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
      setTimeout(() => setFormStatus((prev) => ({ ...prev, success: false })), 4000);
    } catch (error) {
      setFormStatus({ loading: false, success: false, error: error.message });
    }
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-ink text-paper font-sans selection:bg-amber-volt selection:text-ink">
      {/* ================= HEADER ================= */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? 'bg-ink/85 backdrop-blur-xl border-b border-white/5 py-3' : 'py-6'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <button onClick={() => scrollToSection('home')} aria-label="Anasayfa" className="shrink-0">
            <img src="/logo-light.svg" alt="MERVOLT ELEKTRİK" className={`w-auto transition-all duration-500 ${scrolled ? 'h-9' : 'h-11'}`} />
          </button>

          <nav className="hidden lg:flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2 py-1.5">
            {NAV.map((n) => (
              <button key={n.id} onClick={() => scrollToSection(n.id)} className="px-4 py-2 rounded-full text-sm text-paper/70 hover:text-ink hover:bg-amber-volt transition-colors duration-300">
                {n.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a href="tel:+905326997633" className="hidden md:inline-flex items-center gap-2 rounded-full bg-amber-volt text-ink font-semibold text-sm px-5 py-2.5 hover:bg-yellow-volt transition-colors">
              <Bolt className="w-4 h-4" /> Hemen Ara
            </a>
            <button onClick={() => setMenuOpen((o) => !o)} className="lg:hidden w-11 h-11 rounded-full border border-white/15 flex items-center justify-center" aria-label="Menü" aria-expanded={menuOpen}>
              <span className="relative block w-5 h-3">
                <span className={`absolute left-0 w-5 h-0.5 bg-paper transition-all duration-300 ${menuOpen ? 'top-1.5 rotate-45' : 'top-0'}`} />
                <span className={`absolute left-0 w-5 h-0.5 bg-paper transition-all duration-300 ${menuOpen ? 'top-1.5 -rotate-45' : 'top-3'}`} />
              </span>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`lg:hidden overflow-hidden transition-[max-height] duration-500 ${menuOpen ? 'max-h-[480px]' : 'max-h-0'}`}>
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-6 flex flex-col">
            {NAV.map((n, i) => (
              <button key={n.id} onClick={() => scrollToSection(n.id)} className="flex items-baseline gap-4 py-3 border-b border-white/5 text-left text-2xl font-display font-bold text-paper hover:text-amber-volt transition-colors">
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
        <section id="home" ref={heroRef} onMouseMove={onHeroMove} className="hero relative min-h-screen flex flex-col justify-center overflow-hidden pt-28 pb-60">
          <div className="absolute inset-0 grid-bg" aria-hidden="true" />
          <div className="absolute inset-0 hero-glow" aria-hidden="true" />
          <div className="absolute -top-40 -right-40 w-[560px] h-[560px] rounded-full bg-amber-volt/20 blur-[120px]" aria-hidden="true" />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="hero-in inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] pl-2 pr-4 py-1.5 font-mono text-[11px] sm:text-xs tracking-widest uppercase text-paper/70" style={{ animationDelay: '0.1s' }}>
              <span className="relative flex w-2.5 h-2.5">
                <span className="absolute inline-flex w-full h-full rounded-full bg-amber-volt opacity-75 animate-ping" />
                <span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-amber-volt" />
              </span>
              Hat aktif · 1994'ten beri<span className="hidden sm:inline"> · Mezitli / Mersin</span>
            </div>

            <h1 className="mt-8 font-display font-black uppercase leading-[0.88] tracking-tight text-[10.5vw] sm:text-[10vw] lg:text-[8.5rem]">
              <span className="hero-in block" style={{ animationDelay: '0.2s' }}>Elektrikte</span>
              <span className="hero-in block" style={{ animationDelay: '0.35s' }}>
                <span className="text-stroke">30 yıllık</span>
              </span>
              <span className="hero-in block" style={{ animationDelay: '0.5s' }}>
                <span className="voltage-text">güven</span><span className="text-amber-volt">.</span>
              </span>
            </h1>

            <div className="mt-10 grid md:grid-cols-[1fr_auto] gap-8 items-end">
              <p className="hero-in max-w-xl text-lg md:text-xl text-paper/70 leading-relaxed" style={{ animationDelay: '0.7s' }}>
                Bugünün teknolojisi, dünün tecrübesiyle. Orta gerilimden güneş enerjisine, pano imalatından anahtar teslim taahhüte kadar güvenilir elektrik çözümleri.
              </p>
              <div className="hero-in flex flex-wrap gap-3" style={{ animationDelay: '0.85s' }}>
                <button onClick={() => scrollToSection('contact')} className="group inline-flex items-center gap-3 rounded-full bg-amber-volt text-ink font-semibold px-7 py-4 hover:bg-yellow-volt transition-colors">
                  Teklif Alın
                  <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                </button>
                <button onClick={() => scrollToSection('services')} className="inline-flex items-center gap-3 rounded-full border border-white/20 px-7 py-4 font-semibold hover:border-amber-volt hover:text-amber-volt transition-colors">
                  Hizmetlerimiz
                </button>
              </div>
            </div>
          </div>

          <Waveform />

          {/* Stats strip */}
          <div className="absolute bottom-0 inset-x-0 border-t border-white/10 bg-ink/60 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-3 divide-x divide-white/10">
              {[
                { end: 30, suffix: '+', label: 'Yıllık deneyim' },
                { end: 500, suffix: '+', label: 'Tamamlanan proje' },
                { end: 100, suffix: '%', label: 'Müşteri memnuniyeti' },
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal><SectionLabel index="01">Hakkımızda</SectionLabel></Reveal>

            <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
              <div className="lg:col-span-7">
                <Reveal>
                  <h2 className="font-display font-black text-4xl md:text-6xl leading-[0.95] tracking-tight">
                    Kökleri <span className="marker">1994'e</span> uzanan bir ustalık.
                  </h2>
                </Reveal>
                <Reveal delay={100}>
                  <p className="mt-8 text-lg md:text-xl text-ink/70 leading-relaxed max-w-2xl">
                    MERVOLT ELEKTRİK, kökleri 1994 yılına uzanan bir deneyimin ve uzmanlığın üzerine kurulmuştur. Endüstriyel projelerden konut tesisatlarına kadar geniş bir yelpazede hizmet veren firmamız, kalite ve güvenilirlik ilkelerinden asla ödün vermez.
                  </p>
                </Reveal>

                <div className="mt-12 grid sm:grid-cols-2 gap-4">
                  <Reveal delay={150} className="rounded-3xl bg-ink text-paper p-8 relative overflow-hidden group">
                    <Bolt className="absolute -right-6 -bottom-6 w-36 h-36 text-amber-volt/10 group-hover:text-amber-volt/25 group-hover:rotate-12 transition-all duration-700" />
                    <span className="font-mono text-xs tracking-widest uppercase text-amber-volt">Değerlerimiz</span>
                    <p className="mt-4 text-paper/80 leading-relaxed relative">Güvenilirlik, şeffaflık ve müşteri memnuniyeti. Her projede en yüksek kalite standartlarını hedefliyoruz.</p>
                  </Reveal>
                  <Reveal delay={250} className="rounded-3xl bg-amber-volt text-ink p-8 relative overflow-hidden group">
                    <svg className="absolute -right-8 -bottom-8 w-40 h-40 text-ink/10 group-hover:rotate-90 transition-transform duration-1000" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20" /></svg>
                    <span className="font-mono text-xs tracking-widest uppercase">Vizyonumuz</span>
                    <p className="mt-4 text-ink/80 leading-relaxed relative">Elektrik sektöründe yenilikçi çözümlerle öncü olmak ve sürdürülebilir enerji geleceğine katkıda bulunmak.</p>
                  </Reveal>
                </div>
              </div>

              {/* Founder card */}
              <div className="lg:col-span-5">
                <Reveal delay={100} className="relative">
                  <div className="relative rounded-[2rem] overflow-hidden aspect-[4/5] bg-ink">
                    <img src="/kurucu.jpeg" alt="Mehmet ODABAŞI - Kurucu" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
                    <div className="absolute bottom-0 inset-x-0 p-8 text-paper">
                      <span className="font-mono text-xs tracking-widest uppercase text-amber-volt">Kurucumuz</span>
                      <h3 className="mt-2 font-display font-black text-3xl md:text-4xl">Mehmet ODABAŞI</h3>
                    </div>
                  </div>
                  <div className="absolute -top-5 -left-5 md:-left-8 rotate-[-6deg] rounded-2xl bg-yellow-volt text-ink px-5 py-3 shadow-xl">
                    <span className="block font-display font-black text-3xl leading-none">25+</span>
                    <span className="font-mono text-[10px] uppercase tracking-widest">yıl saha</span>
                  </div>
                  <div className="absolute -top-4 -right-3 md:-right-6 rotate-[5deg] rounded-2xl bg-ink text-paper px-5 py-3 shadow-xl border border-white/10">
                    <span className="block font-display font-black text-2xl leading-none text-amber-volt">TEİAŞ</span>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-paper/60">kamu tecrübesi</span>
                  </div>
                </Reveal>
                <Reveal delay={200}>
                  <div className="mt-12 space-y-4 text-ink/70 leading-relaxed">
                    <p>Uzun yıllarını Türkiye Elektrik İletim A.Ş. (TEİAŞ)'ta geçiren kurucumuz, yüksek gerilim hatlarından enerji iletim sistemlerine kadar birçok alanda saha deneyimi kazanmış, iş disiplini ve teknik birikimiyle saygı gören bir usta olmuştur.</p>
                    <p>Bu tecrübe; işe bağlılık, detaylara özen ve güvenilirlik anlayışını da beraberinde getirdi. Mervolt'un temelini oluşturan bu değerler bugün sunduğumuz her hizmette kendini gösteriyor.</p>
                  </div>
                </Reveal>
              </div>
            </div>

            {/* Timeline */}
            <div className="mt-24 md:mt-32">
              <div className="relative grid md:grid-cols-4 gap-10 md:gap-6">
                <div className="hidden md:block absolute top-[11px] left-0 right-0 h-px bg-ink/15">
                  <div className="current-line h-px" />
                </div>
                {TIMELINE.map((t, i) => (
                  <Reveal key={t.year} delay={i * 120} className="relative pl-8 md:pl-0">
                    <div className="md:hidden absolute left-[11px] top-6 -bottom-10 w-px bg-ink/15" />
                    <span className="absolute md:relative left-0 top-0 flex w-6 h-6 items-center justify-center rounded-full bg-paper border-2 border-amber-volt">
                      <span className="w-2 h-2 rounded-full bg-amber-volt" />
                    </span>
                    <div className="md:mt-6">
                      <span className="font-display font-black text-3xl md:text-4xl text-ink">{t.year}</span>
                      <h4 className="mt-2 font-semibold">{t.title}</h4>
                      <p className="mt-1 text-sm text-ink/60 leading-relaxed">{t.text}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ================= SERVICES ================= */}
        <section id="services" className="relative py-24 md:py-36 overflow-hidden">
          <div className="absolute inset-0 grid-bg opacity-60" aria-hidden="true" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal><SectionLabel index="02" dark>Hizmetlerimiz</SectionLabel></Reveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
              <Reveal>
                <h2 className="font-display font-black text-4xl md:text-6xl leading-[0.95] tracking-tight max-w-3xl">
                  Tek panoda, <span className="voltage-text">uçtan uca</span> elektrik çözümleri.
                </h2>
              </Reveal>
              <Reveal delay={100}>
                <p className="text-paper/60 max-w-sm">Projelendirmeden devreye almaya, sekiz farklı alanda 30 yıllık tecrübe.</p>
              </Reveal>
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
              {/* Switchboard list */}
              <ul className="lg:col-span-7 border-t border-white/10">
                {SERVICES.map((s, i) => {
                  const active = activeService === i;
                  return (
                    <li key={s.code}>
                      <button
                        onMouseEnter={() => setActiveService(i)}
                        onFocus={() => setActiveService(i)}
                        onClick={() => setActiveService(i)}
                        className={`w-full text-left grid grid-cols-[auto_1fr_auto] items-center gap-4 md:gap-6 py-5 md:py-6 border-b border-white/10 transition-colors duration-300 ${active ? 'text-paper' : 'text-paper/45 hover:text-paper/80'}`}
                      >
                        <span className={`font-mono text-xs transition-colors ${active ? 'text-amber-volt' : ''}`}>{s.code}</span>
                        <span>
                          <span className="block font-display font-bold text-2xl md:text-4xl tracking-tight">{s.title}</span>
                          <span className={`block overflow-hidden transition-all duration-500 text-sm md:text-base text-paper/60 ${active ? 'max-h-24 mt-2 opacity-100' : 'max-h-0 opacity-0'}`}>{s.desc}</span>
                        </span>
                        {/* breaker switch */}
                        <span className={`relative w-12 h-7 rounded-full border transition-colors duration-300 ${active ? 'bg-amber-volt border-amber-volt' : 'border-white/25'}`}>
                          <span className={`absolute top-1 w-5 h-5 rounded-full transition-all duration-300 ${active ? 'left-6 bg-ink' : 'left-1 bg-paper/40'}`} />
                        </span>
                      </button>
                      {/* Mobile image */}
                      <div className={`lg:hidden overflow-hidden transition-all duration-500 ${active ? 'max-h-64 mb-4' : 'max-h-0'}`}>
                        <img src={s.img} alt={s.title} loading="lazy" className="w-full h-56 object-cover rounded-2xl" />
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* Preview */}
              <div className="hidden lg:block lg:col-span-5">
                <div className="sticky top-28 rounded-[2rem] overflow-hidden aspect-[4/5] bg-white/5 border border-white/10">
                  {SERVICES.map((s, i) => (
                    <img key={s.code} src={s.img} alt={s.title} loading="lazy" className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${activeService === i ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`} />
                  ))}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-transparent to-transparent" />
                  <div className="absolute top-5 left-5 right-5 flex justify-between font-mono text-[11px] uppercase tracking-widest text-paper/80">
                    <span>{SERVICES[activeService].code}</span>
                    <span>{String(activeService + 1).padStart(2, '0')} / {String(SERVICES.length).padStart(2, '0')}</span>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 p-8">
                    <h3 className="font-display font-black text-3xl">{SERVICES[activeService].title}</h3>
                    <p className="mt-2 text-paper/70">{SERVICES[activeService].desc}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= REFERENCES ================= */}
        <section id="references" className="bg-paper text-ink py-24 md:py-36">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal><SectionLabel index="03">Referanslarımız</SectionLabel></Reveal>
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
                              <span className="absolute top-4 left-4 rounded-full bg-paper/90 backdrop-blur px-3 py-1 font-mono text-[11px] tracking-widest">
                                #{String(i + 1).padStart(2, '0')}
                              </span>
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal><SectionLabel index="04">Çalışma Ortaklarımız</SectionLabel></Reveal>
            <Reveal>
              <h2 className="font-display font-black text-3xl md:text-5xl leading-[0.95] tracking-tight mb-12">Güvendiğimiz markalar.</h2>
            </Reveal>
          </div>
          {partners.length > 0 ? (
            <div className="border-y border-ink/10 py-10 bg-white/50">
              <div className="marquee-container">
                <div className="marquee-track">
                  {[...partners, ...partners, ...partners].map((p, i) => (
                    <div key={`${p.id}-${i}`} className="marquee-item">
                      <img src={p.logo_url} alt={p.name} title={p.name} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="rounded-3xl border border-dashed border-ink/20 py-16 text-center text-ink/40">Henüz çalışma ortağı eklenmemiş.</div>
            </div>
          )}
        </section>

        {/* ================= CTA BAND ================= */}
        <section className="bg-amber-volt text-ink overflow-hidden">
          <div className="ticker py-6 font-display font-black text-3xl md:text-5xl uppercase whitespace-nowrap">
            {Array.from({ length: 2 }).map((_, k) => (
              <span key={k} className="ticker-track inline-flex items-center gap-8 pr-8" aria-hidden={k === 1}>
                {['Orta Gerilim', 'Alçak Gerilim', 'Pano İmalatı', 'Güneş Enerjisi', 'Enerji Depolama', 'Mühendislik', 'Malzemeli Taahhüt'].map((w) => (
                  <span key={w} className="inline-flex items-center gap-8">{w}<Bolt className="w-8 h-8 md:w-10 md:h-10" /></span>
                ))}
              </span>
            ))}
          </div>
        </section>

        {/* ================= CONTACT ================= */}
        <section id="contact" className="relative py-24 md:py-36 overflow-hidden">
          <div className="absolute -bottom-40 -left-40 w-[520px] h-[520px] rounded-full bg-amber-volt/15 blur-[120px]" aria-hidden="true" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal><SectionLabel index="05" dark>İletişim</SectionLabel></Reveal>
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
                  <div className="sm:col-span-2 rounded-3xl border border-white/10 bg-white/[0.03] p-6 flex items-center justify-between gap-4">
                    <div>
                      <span className="font-mono text-[11px] uppercase tracking-widest text-paper/50">Yetkili</span>
                      <span className="mt-2 block font-display font-bold text-xl">Mehmet ODABAŞI <span className="text-paper/50 font-sans font-normal text-base">· Kurucu</span></span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-[11px] uppercase tracking-widest text-paper/50">Adres</span>
                      <span className="mt-2 block font-semibold">Merkez Mah. Mezitli / MERSİN</span>
                    </div>
                  </div>
                </Reveal>

                <Reveal delay={100} className="rounded-3xl bg-paper text-ink p-6 md:p-10">
                  <h3 className="font-display font-black text-2xl md:text-3xl">Hızlı iletişim</h3>
                  <p className="mt-1 text-ink/60 text-sm">Formu doldurun, en kısa sürede size dönelim.</p>
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
      <footer className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex flex-col md:flex-row justify-between gap-10">
            <div>
              <img src="/logo-light.svg" alt="MERVOLT ELEKTRİK" className="h-12 w-auto" />
              <p className="mt-4 text-paper/50 max-w-sm">1994'ten beri elektrik sektöründe güvenilir çözümler.</p>
            </div>
            <div className="grid grid-cols-2 gap-10 text-sm">
              <div className="space-y-2">
                <span className="block font-mono text-[11px] uppercase tracking-widest text-amber-volt mb-3">Menü</span>
                {NAV.map((n) => (
                  <button key={n.id} onClick={() => scrollToSection(n.id)} className="block text-paper/60 hover:text-paper transition-colors">{n.label}</button>
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
            <span>230V · 50Hz · Mersin</span>
          </div>
        </div>
      </footer>

      {/* Floating call button (mobile) */}
      <a href="tel:+905326997633" aria-label="Ara" className="md:hidden fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full bg-amber-volt text-ink flex items-center justify-center shadow-2xl shadow-amber-volt/40 pulse-ring">
        <Bolt className="w-6 h-6" />
      </a>

      {showAdmin && <Admin onClose={() => { setShowAdmin(false); fetchReferences(); fetchPartners(); }} />}
    </div>
  );
}

document.documentElement.style.scrollBehavior = 'smooth';

export default App;
