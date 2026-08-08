import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabaseClient';
import Admin from './Admin';

function Counter({ end, duration = 1000, suffix = '' }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    let animationFrame;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = (currentTime - startTime) / duration;

      if (progress < 1) {
        setCount(Math.floor(end * progress));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration]);

  return (
    <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-pantone-137 to-yellow-500 bg-clip-text text-transparent">
      {count}{suffix}
    </div>
  );
}

function App() {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState({
    loading: false,
    success: false,
    error: null
  });

  // Admin panel state
  const [showAdmin, setShowAdmin] = useState(false);

  // References state
  const [references, setReferences] = useState([]);
  const [refIndex, setRefIndex] = useState(0);
  const [refCardImageIndices, setRefCardImageIndices] = useState({});

  // Partners state
  const [partners, setPartners] = useState([]);

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
    // Check URL for admin mode
    if (window.location.search.includes('admin=true')) {
      setShowAdmin(true);
    }
  }, [fetchReferences, fetchPartners]);

  // Carousel helpers
  const getVisibleCards = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 768) return 1;
      if (window.innerWidth < 1024) return 2;
    }
    return 3;
  };

  const maxRefIndex = Math.max(0, references.length - getVisibleCards());

  const toggleRefCardImage = (refId) => {
    setRefCardImageIndices(prev => ({
      ...prev,
      [refId]: (prev[refId] || 0) === 0 ? 1 : 0
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus({ loading: true, success: false, error: null });

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setFormStatus({ loading: false, success: true, error: null });
      setFormData({ name: '', phone: '', message: '' });

      // Show success message for 3 seconds
      setTimeout(() => {
        setFormStatus(prev => ({ ...prev, success: false }));
      }, 3000);
    } catch (error) {
      setFormStatus({ loading: false, success: false, error: error.message });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cool-gray-1 to-white">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl shadow-2xl border-b border-white/20 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center space-x-3 transform hover:scale-105 transition-transform duration-300">
              <img src="/logo.svg" alt="MERVOLT ELEKTRİK" className="h-12 w-auto logo-transparent" />
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex space-x-1">
              <button onClick={() => scrollToSection('home')} className="px-4 py-3 text-cool-gray-11 hover:text-pantone-137 hover:bg-gradient-to-r hover:from-pantone-137/10 hover:to-yellow-500/10 rounded-2xl font-semibold transition-all duration-300 transform hover:-translate-y-0.5 text-sm">ANASAYFA</button>
              <button onClick={() => scrollToSection('about')} className="px-4 py-3 text-cool-gray-11 hover:text-pantone-137 hover:bg-gradient-to-r hover:from-pantone-137/10 hover:to-yellow-500/10 rounded-2xl font-semibold transition-all duration-300 transform hover:-translate-y-0.5 text-sm">HAKKIMIZDA</button>
              <button onClick={() => scrollToSection('services')} className="px-4 py-3 text-cool-gray-11 hover:text-pantone-137 hover:bg-gradient-to-r hover:from-pantone-137/10 hover:to-yellow-500/10 rounded-2xl font-semibold transition-all duration-300 transform hover:-translate-y-0.5 text-sm">HİZMETLER</button>
              <button onClick={() => scrollToSection('references')} className="px-4 py-3 text-cool-gray-11 hover:text-pantone-137 hover:bg-gradient-to-r hover:from-pantone-137/10 hover:to-yellow-500/10 rounded-2xl font-semibold transition-all duration-300 transform hover:-translate-y-0.5 text-sm">REFERANSLARIMIZ</button>
              <button onClick={() => scrollToSection('partners')} className="px-4 py-3 text-cool-gray-11 hover:text-pantone-137 hover:bg-gradient-to-r hover:from-pantone-137/10 hover:to-yellow-500/10 rounded-2xl font-semibold transition-all duration-300 transform hover:-translate-y-0.5 text-sm">ORTAKLARIMIZ</button>
              <button onClick={() => scrollToSection('contact')} className="px-4 py-3 text-cool-gray-11 hover:text-pantone-137 hover:bg-gradient-to-r hover:from-pantone-137/10 hover:to-yellow-500/10 rounded-2xl font-semibold transition-all duration-300 transform hover:-translate-y-0.5 text-sm">İLETİŞİM</button>
            </nav>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-3 rounded-2xl hover:bg-gradient-to-r hover:from-pantone-137/10 hover:to-yellow-500/10 transition-all duration-300">
              <svg className="w-6 h-6 text-cool-gray-11" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Hero Section */}
        <div id="home" className="text-center mb-24 relative min-h-[80vh] flex items-center justify-center">
          {/* Modern Background Elements */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-pantone-137/20 to-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-cool-gray-11/10 to-pantone-137/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-pantone-137/5 to-transparent rounded-full blur-3xl"></div>
          </div>
          
          <div className="max-w-5xl mx-auto">
            {/* Large Logo */}
            <div className="mb-12 transform hover:scale-105 transition-transform duration-500 animate-fadeIn">
              <img src="/logo.svg" alt="MERVOLT ELEKTRİK" className="h-32 md:h-40 lg:h-48 w-auto mx-auto logo-transparent" />
            </div>
            
            {/* Modern Typography */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-cool-gray-11 via-pantone-137 to-cool-gray-11 bg-clip-text text-transparent leading-tight animate-slideUp opacity-0" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
                  Elektrikte 30 Yıllık Güven
                </h1>
                <p className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-cool-gray-11 to-pantone-137 bg-clip-text text-transparent animate-slideUp opacity-0" style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}>
                  Bugünün Teknolojisi, Dünün Tecrübesiyle
                </p>
              </div>
              
              <p className="text-xl md:text-2xl text-cool-gray-11/70 max-w-3xl mx-auto leading-relaxed font-light animate-slideUp opacity-0" style={{ animationDelay: '1.1s', animationFillMode: 'forwards' }}>
                1994'ten beri güvenilir elektrik çözümleri ile yanınızdayız
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto my-12">
                <div className="text-center">
                  <Counter end={30} suffix="+" />
                  <div className="text-sm md:text-base text-cool-gray-11/60 font-medium">Yıllık Deneyim</div>
                </div>
                <div className="text-center">
                  <Counter end={500} suffix="+" />
                  <div className="text-sm md:text-base text-cool-gray-11/60 font-medium">Tamamlanan Proje</div>
                </div>
                <div className="text-center">
                  <Counter end={100} suffix="%" />
                  <div className="text-sm md:text-base text-cool-gray-11/60 font-medium">Müşteri Memnuniyeti</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* About Us Sections - Company & Founder Side by Side */}
        <div id="about" className="mb-24">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Company Section */}
            <div className="bg-white/70 backdrop-blur-sm p-8 lg:p-12 rounded-3xl shadow-xl border border-white/20 h-full flex flex-col">
              <div className="max-w-xl mx-auto text-center flex-1">
                <div className="w-20 h-20 bg-gradient-to-br from-pantone-137 to-yellow-500 rounded-3xl flex items-center justify-center mb-8 mx-auto transform hover:scale-110 transition-all duration-500 shadow-lg shadow-pantone-137/30">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6" />
                  </svg>
                </div>
                <h2 className="text-4xl font-bold text-cool-gray-11 mb-8">ŞİRKETİMİZ</h2>
                <div className="relative mb-12">
                  <p className="text-xl text-cool-gray-11/80 leading-relaxed relative z-10">
                    MERVOLT ELEKTRİK, kökleri 1994 yılına uzanan bir deneyimin ve uzmanlığın üzerine kurulmuştur. 
                    30 yıllık deneyimimizle elektrik sektöründe güvenilir çözümler sunuyoruz. Endüstriyel projelerden 
                    konut tesisatlarına kadar geniş bir yelpazede hizmet veren firmamız, kalite ve güvenilirlik ilkelerinden 
                    asla ödün vermez.
                  </p>
                  <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-pantone-137/10 to-transparent rounded-full blur-2xl"></div>
                  <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-cool-gray-11/10 to-transparent rounded-full blur-2xl"></div>
                </div>

                {/* Company Stats with Enhanced Design */}
                <div className="grid grid-cols-3 gap-6 mb-12">
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-pantone-137/20 to-yellow-500/10 rounded-2xl blur transform group-hover:scale-110 transition-transform duration-500"></div>
                    <div className="relative bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-white/30 transform hover:-translate-y-1 transition-all duration-500">
                      <Counter end={30} suffix="+" />
                      <div className="text-sm font-medium text-cool-gray-11/70">Yıllık Deneyim</div>
                    </div>
                  </div>
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-pantone-137/20 to-yellow-500/10 rounded-2xl blur transform group-hover:scale-110 transition-transform duration-500"></div>
                    <div className="relative bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-white/30 transform hover:-translate-y-1 transition-all duration-500">
                      <Counter end={500} suffix="+" />
                      <div className="text-sm font-medium text-cool-gray-11/70">Proje</div>
                    </div>
                  </div>
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-pantone-137/20 to-yellow-500/10 rounded-2xl blur transform group-hover:scale-110 transition-transform duration-500"></div>
                    <div className="relative bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-white/30 transform hover:-translate-y-1 transition-all duration-500">
                      <Counter end={100} suffix="%" />
                      <div className="text-sm font-medium text-cool-gray-11/70">Müşteri Memnuniyeti</div>
                    </div>
                  </div>
                </div>

                {/* Values and Vision Section */}
                <div className="mt-12 space-y-12">
                  {/* Values */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white/40 backdrop-blur-sm p-6 rounded-2xl border border-white/30 transform hover:-translate-y-1 transition-all duration-500 group">
                      <div className="w-12 h-12 bg-gradient-to-br from-pantone-137 to-yellow-500 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-cool-gray-11 mb-2">Değerlerimiz</h3>
                      <p className="text-cool-gray-11/70">
                        Güvenilirlik, şeffaflık ve müşteri memnuniyeti temel değerlerimizdir. Her projede en yüksek kalite standartlarını hedefliyoruz.
                      </p>
                    </div>
                    <div className="bg-white/40 backdrop-blur-sm p-6 rounded-2xl border border-white/30 transform hover:-translate-y-1 transition-all duration-500 group">
                      <div className="w-12 h-12 bg-gradient-to-br from-pantone-137 to-yellow-500 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-cool-gray-11 mb-2">Vizyonumuz</h3>
                      <p className="text-cool-gray-11/70">
                        Elektrik sektöründe yenilikçi çözümlerle öncü olmak ve sürdürülebilir enerji geleceğine katkıda bulunmak.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 w-48 h-24 bg-gradient-to-t from-white/50 to-transparent blur-2xl -z-10"></div>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-pantone-137/30 to-transparent"></div>
              </div>
            </div>

            {/* Founder Section */}
            <div className="bg-gradient-to-br from-pantone-137/10 to-cool-gray-11/5 p-8 lg:p-12 rounded-3xl h-full">
              <div className="max-w-xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-4xl font-bold text-cool-gray-11 mb-4">KURUCUMUZ</h2>
                </div>
                
                <div className="space-y-8">
                  {/* Founder Photo */}
                  <div className="relative">
                    <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                      <img 
                        src="/kurucu.jpeg" 
                        alt="Mehmet Odabaşı - Kurucu & Elektrik Mühendisi" 
                        className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-500 filter brightness-110 contrast-110 saturate-110"
                        style={{
                          imageRendering: '-webkit-optimize-contrast',
                          backfaceVisibility: 'hidden',
                          transform: 'translateZ(0)'
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-pantone-137/20 to-transparent opacity-60"></div>
                    </div>
                    {/* Decorative Elements */}
                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-pantone-137/30 to-yellow-500/20 rounded-full blur-xl"></div>
                    <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-cool-gray-11/20 to-pantone-137/10 rounded-full blur-xl"></div>
                  </div>

                  {/* Founder Info */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-3xl font-bold text-cool-gray-11 mb-2">Mehmet ODABAŞI</h3>
                      <p className="text-xl text-pantone-137 font-semibold mb-4">Kurucu</p>
                    </div>
                    
                    <div className="space-y-4 text-cool-gray-11/80 leading-relaxed">
                      <p>
                        Mervolt Elektrik'in kurucusu Mehmet ODABAŞI, elektrik sektörüne 1994 yılında adım atmıştır. 
                        Uzun yıllarını Türkiye Elektrik İletim A.Ş. (TEİAŞ)'ta geçiren kurucumuz, yüksek gerilim hatlarından 
                        enerji iletim sistemlerine kadar birçok alanda saha deneyimi kazanmış, iş disiplini ve teknik birikimiyle 
                        saygı gören bir usta olmuştur.
                      </p>
                      <p>
                        25 yılı aşkın bu tecrübe, yalnızca bilgi değil, aynı zamanda işine olan bağlılık, detaylara gösterilen 
                        özen ve güvenilirlik anlayışını da beraberinde getirmiştir. Mervolt'un temelini oluşturan bu değerler, 
                        bugün sunduğumuz her hizmette kendini göstermektedir.
                      </p>
                    </div>

                    {/* Professional Highlights */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-white/50 rounded-2xl">
                        <div className="text-2xl font-bold text-pantone-137">25+</div>
                        <div className="text-sm text-cool-gray-11/70">Yıllık Deneyim</div>
                      </div>
                      <div className="text-center p-4 bg-white/50 rounded-2xl">
                        <div className="text-2xl font-bold text-pantone-137">TEİAŞ</div>
                        <div className="text-sm text-cool-gray-11/70">Kamu Tecrübesi</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Services Overview */}
        <div id="services" className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-cool-gray-11 to-pantone-137 bg-clip-text text-transparent mb-4">HİZMETLERİMİZ</h2>
            <p className="text-xl text-cool-gray-11/70 max-w-3xl mx-auto">Elektrik sektöründe kapsamlı çözümler sunuyoruz</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="group bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/30 hover:bg-white/80 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-cool-gray-11 mb-3">Orta Gerilim</h3>
              <p className="text-cool-gray-11/70 text-sm leading-relaxed">Endüstriyel projeler için güvenli enerji iletimi</p>
            </div>

            <div className="group bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/30 hover:bg-white/80 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-cool-gray-11 mb-3">Alçak Gerilim</h3>
              <p className="text-cool-gray-11/70 text-sm leading-relaxed">Bina içi güvenilir düşük voltaj uygulamaları</p>
            </div>

            <div className="group bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/30 hover:bg-white/80 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-cool-gray-11 mb-3">Güneş Enerjisi</h3>
              <p className="text-cool-gray-11/70 text-sm leading-relaxed">Bireysel veya Ticari amaçlı kullanımlarınız içim çözümler.</p>
            </div>

            <div className="group bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/30 hover:bg-white/80 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-cool-gray-11 mb-3">Pano İmalatı</h3>
              <p className="text-cool-gray-11/70 text-sm leading-relaxed">AG-OG Panolarının, Kompanzasyon Panolarının ve özel ihtiyaçlı Panoların anahatar teslim hazırlanması.</p>
            </div>
          </div>
        </div>

        {/* Detailed Services Section */}
        <div className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-cool-gray-11 to-pantone-137 bg-clip-text text-transparent mb-4">TÜM HİZMETLERİMİZ</h2>
            <p className="text-xl text-cool-gray-11/70 max-w-3xl mx-auto">30 yıllık deneyimimizle sunduğumuz kapsamlı elektrik çözümleri</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Service 1 */}
            <div className="group bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/30 hover:bg-white/80 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
              <div className="w-full h-32 rounded-xl overflow-hidden mb-4 group-hover:scale-105 transition-transform duration-300">
                <img src="/taahüt.jpeg" alt="Malzemeli Taahhüt" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-lg font-bold text-cool-gray-11 mb-3">Malzemeli Taahhüt</h3>
              <p className="text-cool-gray-11/70 text-sm leading-relaxed">Elektrik altyapı projeleriniz için anahtar teslim çözümler.</p>
            </div>

            {/* Service 2 */}
            <div className="group bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/30 hover:bg-white/80 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
              <div className="w-full h-32 rounded-xl overflow-hidden mb-4 group-hover:scale-105 transition-transform duration-300">
                <img src="https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=300&fit=crop&auto=format" alt="Orta Gerilim" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-lg font-bold text-cool-gray-11 mb-3">Orta Gerilim</h3>
              <p className="text-cool-gray-11/70 text-sm leading-relaxed">Endüstriyel ve kurumsal projelerde güvenli enerji iletimi.</p>
            </div>

            {/* Service 3 */}
            <div className="group bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/30 hover:bg-white/80 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
              <div className="w-full h-32 rounded-xl overflow-hidden mb-4 group-hover:scale-105 transition-transform duration-300">
                <img src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop&auto=format" alt="Alçak Gerilim" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-lg font-bold text-cool-gray-11 mb-3">Alçak Gerilim</h3>
              <p className="text-cool-gray-11/70 text-sm leading-relaxed">Bina içi ve çevresi için güvenilir düşük voltaj uygulamaları.</p>
            </div>

            {/* Service 4 */}
            <div className="group bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/30 hover:bg-white/80 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
              <div className="w-full h-32 rounded-xl overflow-hidden mb-4 group-hover:scale-105 transition-transform duration-300">
                <img src="/pano.jpeg" alt="Pano İmalatı" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-lg font-bold text-cool-gray-11 mb-3">Pano İmalatı</h3>
              <p className="text-cool-gray-11/70 text-sm leading-relaxed">AG-OG Panolarının, Kompanzasyon Panolarının ve özel ihtiyaçlı Panoların anahatar teslim hazırlanması.</p>
            </div>

            {/* Service 5 */}
            <div className="group bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/30 hover:bg-white/80 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
              <div className="w-full h-32 rounded-xl overflow-hidden mb-4 group-hover:scale-105 transition-transform duration-300">
                <img src="/malzeme-satisi.jpeg" alt="Malzeme Satışı" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-lg font-bold text-cool-gray-11 mb-3">Malzeme Satışı</h3>
              <p className="text-cool-gray-11/70 text-sm leading-relaxed">Kaliteli ve sertifikalı elektrik ekipmanları temini.</p>
            </div>

            {/* Service 6 */}
            <div className="group bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/30 hover:bg-white/80 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
              <div className="w-full h-32 rounded-xl overflow-hidden mb-4 group-hover:scale-105 transition-transform duration-300">
                <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop&auto=format" alt="Mühendislik" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-lg font-bold text-cool-gray-11 mb-3">Mühendislik</h3>
              <p className="text-cool-gray-11/70 text-sm leading-relaxed">Projelendirme, teknik çizim ve uygulama danışmanlığı.</p>
            </div>

            {/* Service 7 */}
            <div className="group bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/30 hover:bg-white/80 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
              <div className="w-full h-32 rounded-xl overflow-hidden mb-4 group-hover:scale-105 transition-transform duration-300">
                <img src="https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop&auto=format" alt="Güneş Enerjisi" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-lg font-bold text-cool-gray-11 mb-3">Güneş Enerjisi</h3>
              <p className="text-cool-gray-11/70 text-sm leading-relaxed">ORBİT bayiliği ile lisanssız ve lisanslı güneş enerjisi çözümleri.</p>
            </div>

            {/* Service 8 */}
            <div className="group bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/30 hover:bg-white/80 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
              <div className="w-full h-32 rounded-xl overflow-hidden mb-4 group-hover:scale-105 transition-transform duration-300">
                <img src="/enerji-depolama.jpeg" alt="Enerji Depolama" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-lg font-bold text-cool-gray-11 mb-3">Enerji Depolama</h3>
              <p className="text-cool-gray-11/70 text-sm leading-relaxed">Kesintisiz güç, sürdürülebilir enerji için modern batarya teknolojileri.</p>
            </div>
          </div>
        </div>

        {/* References Section */}
        <div id="references" className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-cool-gray-11 to-pantone-137 bg-clip-text text-transparent mb-4">REFERANSLARIMIZ</h2>
            <p className="text-xl text-cool-gray-11/70 max-w-3xl mx-auto">Başarıyla tamamladığımız projelerden örnekler</p>
          </div>

          {references.length > 0 ? (
            <div className="relative">
              {/* Left Arrow */}
              {refIndex > 0 && (
                <button onClick={() => setRefIndex(Math.max(0, refIndex - 1))} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-pantone-137 hover:text-white transition-all duration-300 text-cool-gray-11">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
              )}

              {/* Carousel */}
              <div className="ref-carousel">
                <div className="ref-carousel-track" style={{ transform: `translateX(-${refIndex * (100 / getVisibleCards())}%)` }}>
                  {references.map((ref) => (
                    <div key={ref.id} className="ref-card" style={{ width: `${100 / getVisibleCards()}%` }}>
                      <div className="group bg-white/70 backdrop-blur-sm rounded-2xl border border-white/30 overflow-hidden hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 h-full">
                        {/* Image */}
                        <div className="relative h-56 overflow-hidden cursor-pointer" onClick={() => ref.image2_url && toggleRefCardImage(ref.id)}>
                          <img
                            src={(refCardImageIndices[ref.id] || 0) === 0 ? ref.image1_url : ref.image2_url}
                            alt={ref.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {ref.image2_url && (
                            <div className="absolute bottom-3 right-3 flex gap-1.5">
                              <span className={`w-2.5 h-2.5 rounded-full transition-all ${(refCardImageIndices[ref.id] || 0) === 0 ? 'bg-pantone-137 scale-110' : 'bg-white/60'}`}></span>
                              <span className={`w-2.5 h-2.5 rounded-full transition-all ${(refCardImageIndices[ref.id] || 0) === 1 ? 'bg-pantone-137 scale-110' : 'bg-white/60'}`}></span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        </div>
                        {/* Content */}
                        <div className="p-6">
                          <h3 className="text-lg font-bold text-cool-gray-11 mb-2">{ref.title}</h3>
                          <p className="text-cool-gray-11/70 text-sm leading-relaxed">{ref.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Arrow */}
              {refIndex < maxRefIndex && (
                <button onClick={() => setRefIndex(Math.min(maxRefIndex, refIndex + 1))} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-pantone-137 hover:text-white transition-all duration-300 text-cool-gray-11">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              )}

              {/* Dots */}
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: maxRefIndex + 1 }).map((_, i) => (
                  <button key={i} onClick={() => setRefIndex(i)} className={`w-3 h-3 rounded-full transition-all duration-300 ${i === refIndex ? 'bg-pantone-137 scale-110' : 'bg-cool-gray-1 hover:bg-pantone-137/50'}`} />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-cool-gray-11/40">
              <p className="text-lg">Henüz referans eklenmemiş.</p>
            </div>
          )}
        </div>

        {/* Partners Section */}
        <div id="partners" className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-cool-gray-11 to-pantone-137 bg-clip-text text-transparent mb-4">ÇALIŞMA ORTAKLARIMIZ</h2>
            <p className="text-xl text-cool-gray-11/70 max-w-3xl mx-auto">Güvenilir markalarla çalışıyoruz</p>
          </div>

          {partners.length > 0 ? (
            <div className="bg-white/50 backdrop-blur-sm rounded-3xl border border-white/30 py-12">
              <div className="marquee-container">
                <div className="marquee-track">
                  {/* Duplicate logos for seamless loop */}
                  {[...partners, ...partners, ...partners].map((p, i) => (
                    <div key={`${p.id}-${i}`} className="marquee-item">
                      <img src={p.logo_url} alt={p.name} title={p.name} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-cool-gray-11/40">
              <p className="text-lg">Henüz çalışma ortağı eklenmemiş.</p>
            </div>
          )}
        </div>

        {/* Contact Section */}
        <div id="contact" className="mb-24">
          <div className="bg-gradient-to-br from-pantone-137/10 to-cool-gray-11/5 p-12 rounded-3xl">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-cool-gray-11 to-pantone-137 bg-clip-text text-transparent mb-4">İLETİŞİME GEÇİN</h2>
                <p className="text-xl text-cool-gray-11/70">Projeleriniz için profesyonel elektrik çözümleri</p>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-12">
                {/* Left Column - Contact Info & Form */}
                <div className="space-y-8">
                  {/* Contact Info Cards */}
                  <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-pantone-137 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-cool-gray-11 mb-1">Mehmet ODABAŞI</h3>
                        <p className="text-cool-gray-11/70">Kurucu</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-pantone-137 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-cool-gray-11 mb-1">İletişim</h3>
                        <p className="text-cool-gray-11/70">Tel: 0324 357 26 36<br/>Gsm: +90 532 699 76 33</p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Form */}
                  <div className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl">
                    <h3 className="text-2xl font-bold text-cool-gray-11 mb-6">Hızlı İletişim</h3>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                      <div>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Adınız Soyadınız"
                          className="w-full px-4 py-3 rounded-xl border border-cool-gray-1 focus:border-pantone-137 focus:outline-none transition-colors"
                          required
                        />
                      </div>
                      <div>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Telefon Numaranız"
                          className="w-full px-4 py-3 rounded-xl border border-cool-gray-1 focus:border-pantone-137 focus:outline-none transition-colors"
                          required
                        />
                      </div>
                      <div>
                        <textarea
                          rows="4"
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          placeholder="Mesajınız"
                          className="w-full px-4 py-3 rounded-xl border border-cool-gray-1 focus:border-pantone-137 focus:outline-none transition-colors resize-none"
                          required
                        ></textarea>
                      </div>
                      <button
                        type="submit"
                        disabled={formStatus.loading}
                        className={`w-full bg-gradient-to-r from-pantone-137 to-yellow-500 text-white font-semibold py-4 rounded-xl shadow-lg shadow-pantone-137/30 hover:shadow-xl hover:shadow-pantone-137/40 transform hover:-translate-y-1 transition-all duration-300 ${formStatus.loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        {formStatus.loading ? 'Gönderiliyor...' : 'Mesaj Gönder'}
                      </button>
                      
                      {formStatus.success && (
                        <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-xl">
                          Mesajınız başarıyla gönderildi!
                        </div>
                      )}
                      
                      {formStatus.error && (
                        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-xl">
                          {formStatus.error}
                        </div>
                      )}
                    </form>
                  </div>
                </div>

                {/* Right Column - Map */}
                <div className="bg-white/70 backdrop-blur-sm p-4 rounded-2xl shadow-xl h-full min-h-[600px] overflow-hidden">
                  <iframe 
                    title="Mervolt Elektrik Konum Haritası"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3197.9046033738517!2d34.49176937619167!3d36.74581847124135!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x15278b001b1e7fad%3A0x43a27c3b3f3d3124!2sMervolt%20Elektrik!5e0!3m2!1str!2str!4v1710799849633!5m2!1str!2str"
                    className="w-full h-full rounded-xl"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-cool-gray-11 to-pantone-137 mt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Company Info */}
            <div>
              <div className="mb-4">
                <img src="/logo.svg" alt="MERVOLT ELEKTRİK" className="h-12 w-auto logo-invert" />
              </div>
              <p className="text-white/80 leading-relaxed">
                1994'ten beri elektrik sektöründe güvenilir çözümler sunuyoruz.
              </p>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-white font-semibold mb-4">İletişim</h3>
              <div className="space-y-2 text-white/80">
                <p>Merkez Mah. Mezitli / MERSİN</p>
                <p>Tel: 0324 357 26 36</p>
                <p>Gsm: +90 532 699 76 33</p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/20 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-white/80 text-sm">
                © 2025 MERVOLT ELEKTRİK. Tüm hakları saklıdır.
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Admin Panel */}
      {showAdmin && <Admin onClose={() => { setShowAdmin(false); fetchReferences(); fetchPartners(); }} />}
    </div>
  );
}

// Add smooth scroll behavior to the whole document
document.documentElement.style.scrollBehavior = 'smooth';

export default App;
