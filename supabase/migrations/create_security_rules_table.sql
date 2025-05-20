/*
      # security_rules tablosu oluştur

      1. Yeni Tablolar
        - `security_rules`
          - `id` (uuid, birincil anahtar)
          - `name` (metin, kural adı)
          - `type` (metin, 'block' veya 'allow')
          - `protocol` (metin, 'tcp', 'udp', 'icmp', 'any')
          - `source_ip` (metin, kaynak IP adresi veya CIDR)
          - `destination_ip` (metin, hedef IP adresi veya CIDR)
          - `port` (tam sayı, port numarası, boş bırakılabilir)
          - `priority` (tam sayı, kural önceliği, düşük sayı daha yüksek öncelik)
          - `status` (boolean, aktif/pasif)
          - `created_at` (zaman damgası)
      2. Güvenlik
        - `security_rules` tablosunda Satır Seviyesi Güvenliği (RLS) etkinleştir
        - Kimliği doğrulanmış kullanıcıların kendi kurallarını yönetmeleri (CRUD) için politikalar ekle.
    */

    CREATE TABLE IF NOT EXISTS security_rules (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      type text NOT NULL DEFAULT 'block',
      protocol text NOT NULL DEFAULT 'any',
      source_ip text DEFAULT '',
      destination_ip text DEFAULT '',
      port integer,
      priority integer NOT NULL DEFAULT 100,
      status boolean NOT NULL DEFAULT true,
      created_at timestamptz DEFAULT now()
    );

    ALTER TABLE security_rules ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Kimliği doğrulanmış kullanıcılar güvenlik kurallarını görüntüleyebilir"
      ON security_rules
      FOR SELECT
      TO authenticated
      USING (true); -- Tüm kimliği doğrulanmış kullanıcıların kuralları görüntülemesine izin ver

    CREATE POLICY "Kimliği doğrulanmış kullanıcılar güvenlik kuralları ekleyebilir"
      ON security_rules
      FOR INSERT
      TO authenticated
      WITH CHECK (true); -- Tüm kimliği doğrulanmış kullanıcıların kural eklemesine izin ver

    CREATE POLICY "Kimliği doğrulanmış kullanıcılar güvenlik kurallarını güncelleyebilir"
      ON security_rules
      FOR UPDATE
      TO authenticated
      USING (true); -- Tüm kimliği doğrulanmış kullanıcıların kuralları güncellemesine izin ver

    CREATE POLICY "Kimliği doğrulanmış kullanıcılar güvenlik kurallarını silebilir"
      ON security_rules
      FOR DELETE
      TO authenticated
      USING (true); -- Tüm kimliği doğrulanmış kullanıcıların kuralları silmesine izin ver
