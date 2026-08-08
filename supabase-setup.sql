-- =============================================
-- MERVOLT ELEKTRİK - Supabase Kurulum Script'i
-- Bu SQL'i Supabase Dashboard > SQL Editor'de çalıştırın
-- =============================================

-- 1. Referanslar tablosu
CREATE TABLE IF NOT EXISTS project_references (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image1_url TEXT NOT NULL,
  image2_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Çalışma Ortakları (Partners) tablosu
CREATE TABLE IF NOT EXISTS partners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RLS (Row Level Security) politikaları
ALTER TABLE project_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkes referanslari okuyabilir" ON project_references
  FOR SELECT USING (true);

CREATE POLICY "Herkes ortaklari okuyabilir" ON partners
  FOR SELECT USING (true);

CREATE POLICY "Anon insert project_references" ON project_references
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anon update project_references" ON project_references
  FOR UPDATE USING (true);

CREATE POLICY "Anon delete project_references" ON project_references
  FOR DELETE USING (true);

CREATE POLICY "Anon insert partners" ON partners
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anon update partners" ON partners
  FOR UPDATE USING (true);

CREATE POLICY "Anon delete partners" ON partners
  FOR DELETE USING (true);

-- 4. Storage bucket'ları
INSERT INTO storage.buckets (id, name, public)
VALUES ('reference-images', 'reference-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('partner-logos', 'partner-logos', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Storage politikaları
CREATE POLICY "Public read reference images" ON storage.objects
  FOR SELECT USING (bucket_id = 'reference-images');

CREATE POLICY "Public upload reference images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'reference-images');

CREATE POLICY "Public delete reference images" ON storage.objects
  FOR DELETE USING (bucket_id = 'reference-images');

CREATE POLICY "Public read partner logos" ON storage.objects
  FOR SELECT USING (bucket_id = 'partner-logos');

CREATE POLICY "Public upload partner logos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'partner-logos');

CREATE POLICY "Public delete partner logos" ON storage.objects
  FOR DELETE USING (bucket_id = 'partner-logos');
