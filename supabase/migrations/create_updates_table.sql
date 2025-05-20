/*
  # updates tablosu oluştur

  1. Yeni Tablolar
    - `updates`
      - `id` (uuid, birincil anahtar)
      - `version` (metin, yazılım sürümü)
      - `release_date` (timestamptz, yayın tarihi)
      - `description` (metin, güncellemenin açıklaması)
      - `status` (metin, 'available', 'applied', 'failed')
      - `created_at` (zaman damgası)
  2. Güvenlik
    - `updates` tablosunda Satır Seviyesi Güvenliği (RLS) etkinleştir
    - Kimliği doğrulanmış kullanıcıların güncellemeleri okuması ve durumunu güncellemesi için politikalar ekle.
*/

CREATE TABLE IF NOT EXISTS updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version text NOT NULL UNIQUE,
  release_date timestamptz DEFAULT now(),
  description text NOT NULL,
  status text NOT NULL DEFAULT 'available', -- 'available', 'applied', 'failed'
  created_at timestamptz DEFAULT now()
);

ALTER TABLE updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kimliği doğrulanmış kullanıcılar güncellemeleri görüntüleyebilir"
  ON updates
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Kimliği doğrulanmış kullanıcılar güncelleme durumunu güncelleyebilir"
  ON updates
  FOR UPDATE
  TO authenticated
  USING (true); -- Kimliği doğrulanmış kullanıcıların durumu güncellemesine izin ver (örn: uygulandı olarak işaretle)

CREATE POLICY "Kimliği doğrulanmış kullanıcıların güncelleme eklemesine izin ver"
  ON updates
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
