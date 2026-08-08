import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabaseClient';

const ADMIN_PASSWORD = 'mervoltsuleyman2025';

function Admin({ onClose }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('references');

  // References state
  const [references, setReferences] = useState([]);
  const [refForm, setRefForm] = useState({ title: '', description: '' });
  const [refImage1, setRefImage1] = useState(null);
  const [refImage2, setRefImage2] = useState(null);
  const [refLoading, setRefLoading] = useState(false);

  // Partners state
  const [partners, setPartners] = useState([]);
  const [partnerName, setPartnerName] = useState('');
  const [partnerLogo, setPartnerLogo] = useState(null);
  const [partnerLoading, setPartnerLoading] = useState(false);

  const [message, setMessage] = useState({ text: '', type: '' });

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const fetchReferences = useCallback(async () => {
    const { data } = await supabase.from('project_references').select('*').order('sort_order', { ascending: true });
    if (data) setReferences(data);
  }, []);

  const fetchPartners = useCallback(async () => {
    const { data } = await supabase.from('partners').select('*').order('sort_order', { ascending: true });
    if (data) setPartners(data);
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetchReferences();
      fetchPartners();
    }
  }, [authenticated, fetchReferences, fetchPartners]);

  const uploadFile = async (file, bucket) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const { error } = await supabase.storage.from(bucket).upload(fileName, file);
    if (error) throw error;
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return urlData.publicUrl;
  };

  const handleAddReference = async (e) => {
    e.preventDefault();
    if (!refImage1) { showMessage('En az 1 fotoğraf yükleyin', 'error'); return; }
    setRefLoading(true);
    try {
      const image1_url = await uploadFile(refImage1, 'reference-images');
      let image2_url = null;
      if (refImage2) image2_url = await uploadFile(refImage2, 'reference-images');
      const { error } = await supabase.from('project_references').insert([{
        title: refForm.title,
        description: refForm.description,
        image1_url,
        image2_url,
        sort_order: references.length
      }]);
      if (error) throw error;
      showMessage('Referans eklendi!');
      setRefForm({ title: '', description: '' });
      setRefImage1(null);
      setRefImage2(null);
      // Reset file inputs
      const inputs = document.querySelectorAll('input[type="file"]');
      inputs.forEach(input => { input.value = ''; });
      fetchReferences();
    } catch (err) {
      showMessage('Hata: ' + err.message, 'error');
    }
    setRefLoading(false);
  };

  const handleDeleteReference = async (ref) => {
    if (!window.confirm('Bu referansı silmek istediğinize emin misiniz?')) return;
    try {
      // Delete images from storage
      if (ref.image1_url) {
        const path1 = ref.image1_url.split('/reference-images/')[1];
        if (path1) await supabase.storage.from('reference-images').remove([path1]);
      }
      if (ref.image2_url) {
        const path2 = ref.image2_url.split('/reference-images/')[1];
        if (path2) await supabase.storage.from('reference-images').remove([path2]);
      }
      await supabase.from('project_references').delete().eq('id', ref.id);
      showMessage('Referans silindi!');
      fetchReferences();
    } catch (err) {
      showMessage('Hata: ' + err.message, 'error');
    }
  };

  const handleAddPartner = async (e) => {
    e.preventDefault();
    if (!partnerLogo) { showMessage('Logo dosyası seçin', 'error'); return; }
    setPartnerLoading(true);
    try {
      const logo_url = await uploadFile(partnerLogo, 'partner-logos');
      const { error } = await supabase.from('partners').insert([{
        name: partnerName,
        logo_url,
        sort_order: partners.length
      }]);
      if (error) throw error;
      showMessage('Marka eklendi!');
      setPartnerName('');
      setPartnerLogo(null);
      const inputs = document.querySelectorAll('input[type="file"]');
      inputs.forEach(input => { input.value = ''; });
      fetchPartners();
    } catch (err) {
      showMessage('Hata: ' + err.message, 'error');
    }
    setPartnerLoading(false);
  };

  const handleDeletePartner = async (partner) => {
    if (!window.confirm('Bu markayı silmek istediğinize emin misiniz?')) return;
    try {
      if (partner.logo_url) {
        const path = partner.logo_url.split('/partner-logos/')[1];
        if (path) await supabase.storage.from('partner-logos').remove([path]);
      }
      await supabase.from('partners').delete().eq('id', partner.id);
      showMessage('Marka silindi!');
      fetchPartners();
    } catch (err) {
      showMessage('Hata: ' + err.message, 'error');
    }
  };

  // Login screen
  if (!authenticated) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
          <h2 className="text-2xl font-bold text-cool-gray-11 mb-6 text-center">🔒 Admin Girişi</h2>
          <form onSubmit={(e) => { e.preventDefault(); if (password === ADMIN_PASSWORD) setAuthenticated(true); else showMessage('Yanlış şifre!', 'error'); }}>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Şifre" className="w-full px-4 py-3 rounded-xl border border-cool-gray-1 focus:border-pantone-137 focus:outline-none mb-4" />
            <button type="submit" className="w-full bg-gradient-to-r from-pantone-137 to-yellow-500 text-white font-semibold py-3 rounded-xl">Giriş Yap</button>
          </form>
          <button onClick={onClose} className="w-full mt-3 py-3 text-cool-gray-11/60 hover:text-cool-gray-11 transition-colors">İptal</button>
          {message.text && <div className={`mt-4 p-3 rounded-xl text-center ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{message.text}</div>}
        </div>
      </div>
    );
  }

  // Admin panel
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-3xl border-b border-gray-100 p-6 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cool-gray-11 to-pantone-137 bg-clip-text text-transparent">⚙️ Admin Paneli</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <svg className="w-6 h-6 text-cool-gray-11" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6">
          <button onClick={() => setActiveTab('references')} className={`py-4 px-6 font-semibold transition-all ${activeTab === 'references' ? 'text-pantone-137 border-b-2 border-pantone-137' : 'text-cool-gray-11/50 hover:text-cool-gray-11'}`}>📋 Referanslar</button>
          <button onClick={() => setActiveTab('partners')} className={`py-4 px-6 font-semibold transition-all ${activeTab === 'partners' ? 'text-pantone-137 border-b-2 border-pantone-137' : 'text-cool-gray-11/50 hover:text-cool-gray-11'}`}>🤝 Çalışma Ortakları</button>
        </div>

        {message.text && <div className={`mx-6 mt-4 p-3 rounded-xl text-center ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{message.text}</div>}

        <div className="p-6">
          {/* References Tab */}
          {activeTab === 'references' && (
            <div>
              <form onSubmit={handleAddReference} className="bg-gray-50 rounded-2xl p-6 mb-8 space-y-4">
                <h3 className="text-lg font-bold text-cool-gray-11 mb-2">Yeni Referans Ekle</h3>
                <input type="text" placeholder="Başlık" value={refForm.title} onChange={(e) => setRefForm({ ...refForm, title: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-cool-gray-1 focus:border-pantone-137 focus:outline-none" required />
                <textarea placeholder="Kısa Açıklama" value={refForm.description} onChange={(e) => setRefForm({ ...refForm, description: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-cool-gray-1 focus:border-pantone-137 focus:outline-none resize-none" rows="3" required />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-cool-gray-11/70 mb-1">Fotoğraf 1 *</label>
                    <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={(e) => setRefImage1(e.target.files[0])} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-pantone-137/10 file:text-pantone-137 file:font-semibold hover:file:bg-pantone-137/20" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-cool-gray-11/70 mb-1">Fotoğraf 2 (Opsiyonel)</label>
                    <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={(e) => setRefImage2(e.target.files[0])} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-pantone-137/10 file:text-pantone-137 file:font-semibold hover:file:bg-pantone-137/20" />
                  </div>
                </div>
                <button type="submit" disabled={refLoading} className="bg-gradient-to-r from-pantone-137 to-yellow-500 text-white font-semibold py-3 px-8 rounded-xl disabled:opacity-50">
                  {refLoading ? 'Yükleniyor...' : '+ Referans Ekle'}
                </button>
              </form>

              {/* Existing References */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-cool-gray-11">Mevcut Referanslar ({references.length})</h3>
                {references.length === 0 && <p className="text-cool-gray-11/50 text-center py-8">Henüz referans eklenmemiş.</p>}
                {references.map((ref) => (
                  <div key={ref.id} className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-md transition-shadow">
                    <img src={ref.image1_url} alt={ref.title} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-cool-gray-11 truncate">{ref.title}</h4>
                      <p className="text-sm text-cool-gray-11/60 truncate">{ref.description}</p>
                    </div>
                    <button onClick={() => handleDeleteReference(ref)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Partners Tab */}
          {activeTab === 'partners' && (
            <div>
              <form onSubmit={handleAddPartner} className="bg-gray-50 rounded-2xl p-6 mb-8 space-y-4">
                <h3 className="text-lg font-bold text-cool-gray-11 mb-2">Yeni Marka Ekle</h3>
                <input type="text" placeholder="Marka Adı" value={partnerName} onChange={(e) => setPartnerName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-cool-gray-1 focus:border-pantone-137 focus:outline-none" required />
                <div>
                  <label className="block text-sm font-medium text-cool-gray-11/70 mb-1">Logo (PNG/JPG)</label>
                  <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml" onChange={(e) => setPartnerLogo(e.target.files[0])} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-pantone-137/10 file:text-pantone-137 file:font-semibold hover:file:bg-pantone-137/20" required />
                </div>
                <button type="submit" disabled={partnerLoading} className="bg-gradient-to-r from-pantone-137 to-yellow-500 text-white font-semibold py-3 px-8 rounded-xl disabled:opacity-50">
                  {partnerLoading ? 'Yükleniyor...' : '+ Marka Ekle'}
                </button>
              </form>

              {/* Existing Partners */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-cool-gray-11">Mevcut Markalar ({partners.length})</h3>
                {partners.length === 0 && <p className="text-cool-gray-11/50 text-center py-8">Henüz marka eklenmemiş.</p>}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {partners.map((p) => (
                    <div key={p.id} className="relative group bg-white border border-gray-100 rounded-2xl p-4 text-center hover:shadow-md transition-shadow">
                      <img src={p.logo_url} alt={p.name} className="h-16 w-auto mx-auto object-contain mb-2" />
                      <p className="text-sm font-medium text-cool-gray-11 truncate">{p.name}</p>
                      <button onClick={() => handleDeletePartner(p)} className="absolute top-2 right-2 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Admin;
