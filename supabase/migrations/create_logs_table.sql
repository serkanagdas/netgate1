/*
      # logs tablosu oluştur

      1. Yeni Tablolar
        - `logs`
          - `id` (uuid, birincil anahtar)
          - `timestamp` (timestamptz, günlük giriş zamanı)
          - `severity` (metin, BİLGİ, UYARI, HATA)
          - `message` (metin, günlük mesajı)
          - `source_ip` (metin, kaynak IP adresi)
          - `destination_ip` (metin, hedef IP adresi)
          - `protocol` (metin, kullanılan protokol)
          - `port` (tam sayı, port numarası, boş bırakılabilir)
          - `rule_id` (uuid, security_rules'a yabancı anahtar, boş bırakılabilir)
      2. Güvenlik
        - `logs` tablosunda Satır Seviyesi Güvenliği (RLS) etkinleştir
        - Kimliği doğrulanmış kullanıcıların günlükleri okuması için politikalar ekle.
    */

    CREATE TABLE IF NOT EXISTS logs (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      timestamp timestamptz DEFAULT now(),
      severity text NOT NULL DEFAULT 'INFO',
      message text NOT NULL,
      source_ip text DEFAULT '',
      destination_ip text DEFAULT '',
      protocol text DEFAULT '',
      port integer,
      rule_id uuid REFERENCES security_rules(id) ON DELETE SET NULL
    );

    ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Kimliği doğrulanmış kullanıcılar günlükleri görüntüleyebilir"
      ON logs
      FOR SELECT
      TO authenticated
      USING (true); -- Tüm kimliği doğrulanmış kullanıcıların günlükleri görüntülemesine izin ver

    -- Arka ucun günlük eklemesine izin veren politika (örn: hizmet rolü veya belirli fonksiyonlar için RLS bypass)
    -- Bu demoda basitlik için, günlüklerin güvenilir bir süreç veya yönetici tarafından eklendiği varsayılacaktır.
    -- Gerçek bir senaryoda, günlük ekleme için bir Supabase Fonksiyonu veya bir hizmet rolü anahtarı kullanabilirsiniz.
    CREATE POLICY "Kimliği doğrulanmış kullanıcıların günlük eklemesine izin ver"
      ON logs
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
