require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Supabase İstemcisi
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL veya Anon Anahtarı eksik. Lütfen .env dosyanızı kontrol edin.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Ara Katman Yazılımları (Middleware)
app.use(cors());
app.use(express.json());

// Basit kimlik doğrulama ara katman yazılımı (gösterim amaçlı, uygun JWT doğrulamasıyla değiştirin)
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401); // Token yok

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.sendStatus(403); // Geçersiz token
  }
  req.user = user;
  next();
};

// Rotalar
app.get('/', (req, res) => {
  res.send('NetGate Backend çalışıyor!');
});

// Kontrol Paneli Rotaları (Simüle Edilmiş Veri)
app.get('/dashboard/status', authenticateToken, (req, res) => {
  res.json({
    uptime: '2 gün, 5 saat, 30 dakika',
    cpu: '25%',
    ram: '45%',
    activeConnections: 120,
  });
});

app.get('/dashboard/threats', authenticateToken, (req, res) => {
  res.json([
    { id: 1, timestamp: new Date().toISOString(), type: 'DDoS Saldırısı', source_ip: '1.2.3.4', description: 'Şüpheli IP\'den yüksek hacimli trafik' },
    { id: 2, timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'Port Tarama', source_ip: '5.6.7.8', description: 'Birden fazla portta tarama girişimi' },
  ]);
});

// Güvenlik Kuralları Rotaları
app.get('/rules', authenticateToken, async (req, res) => {
  console.log('/rules için istek alındı');
  const { data, error } = await supabase.from('security_rules').select('*');
  if (error) {
    console.error('Kurallar getirilirken Supabase hatası:', error);
    return res.status(500).json({ error: error.message });
  }
  console.log('Kurallar başarıyla getirildi. Sayı:', data ? data.length : 0);
  res.json(data);
});

app.post('/rules', authenticateToken, async (req, res) => {
  const { name, type, protocol, source_ip, destination_ip, port, priority, status } = req.body;
  const { data, error } = await supabase.from('security_rules').insert([{
    name, type, protocol, source_ip, destination_ip, port, priority, status
  }]).select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data[0]);
});

app.put('/rules/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, type, protocol, source_ip, destination_ip, port, priority, status } = req.body;
  const { data, error } = await supabase.from('security_rules').update({
    name, type, protocol, source_ip, destination_ip, port, priority, status
  }).eq('id', id).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

app.delete('/rules/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('security_rules').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
});

// Günlük Yönetimi Rotaları
app.get('/logs', authenticateToken, async (req, res) => {
  console.log('/logs için istek alındı');
  let query = supabase.from('logs').select('*');

  const { severity, startDate, endDate, keyword } = req.query;
  console.log('Filtreler:', { severity, startDate, endDate, keyword });

  if (severity) {
    query = query.eq('severity', severity);
  }
  if (startDate) {
    query = query.gte('timestamp', startDate);
  }
  if (endDate) {
    query = query.lte('timestamp', endDate + 'T23:59:59.999Z'); // Gün sonu
  }
  if (keyword) {
    query = query.ilike('message', `%${keyword}%`);
  }

  query = query.order('timestamp', { ascending: false });

  const { data, error } = await query;
  if (error) {
    console.error('Günlükler getirilirken Supabase hatası:', error);
    return res.status(500).json({ error: error.message });
  }
  console.log('Günlükler başarıyla getirildi. Sayı:', data ? data.length : 0);
  res.json(data);
});

// Yeni: Simüle edilmiş log ekleme rotası
app.post('/logs/generate-mock', authenticateToken, async (req, res) => {
  const severities = ['INFO', 'WARN', 'ERROR'];
  const messages = [
    'Şüpheli bağlantı girişimi engellendi.',
    'Başarısız kimlik doğrulama denemesi.',
    'Yüksek CPU kullanımı algılandı.',
    'Yeni güvenlik kuralı uygulandı.',
    'Sistem güncellemesi tamamlandı.',
    'Port tarama girişimi tespit edildi.',
    'Veritabanı bağlantı hatası.',
  ];
  const sourceIps = ['192.168.1.10', '10.0.0.5', '203.0.113.45', '172.16.0.1'];
  const destinationIps = ['192.168.1.1', '8.8.8.8', '198.51.100.2'];
  const protocols = ['TCP', 'UDP', 'ICMP', 'HTTP', 'HTTPS'];
  const ports = [80, 443, 22, 21, 23, 53, 8080, null]; // null = herhangi bir port

  const randomSeverity = severities[Math.floor(Math.random() * severities.length)];
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  const randomSourceIp = sourceIps[Math.floor(Math.random() * sourceIps.length)];
  const randomDestinationIp = destinationIps[Math.floor(Math.random() * destinationIps.length)];
  const randomProtocol = protocols[Math.floor(Math.random() * protocols.length)];
  const randomPort = ports[Math.floor(Math.random() * ports.length)];

  const { data, error } = await supabase.from('logs').insert([{
    timestamp: new Date().toISOString(),
    severity: randomSeverity,
    message: randomMessage,
    source_ip: randomSourceIp,
    destination_ip: randomDestinationIp,
    protocol: randomProtocol,
    port: randomPort,
    rule_id: null // Şimdilik kural kimliği yok
  }]).select();

  if (error) {
    console.error('Mock log eklenirken Supabase hatası:', error);
    return res.status(500).json({ error: error.message });
  }
  res.status(201).json({ message: 'Mock log başarıyla eklendi!', log: data[0] });
});


// Güncellemeler Rotaları (Simüle Edilmiş)
app.get('/updates', authenticateToken, async (req, res) => {
  const { data, error } = await supabase.from('updates').select('*').order('release_date', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/updates/check', authenticateToken, async (req, res) => {
  // Yeni güncellemeleri kontrol etme simülasyonu
  const newUpdateAvailable = Math.random() > 0.5; // Yeni güncelleme için %50 şans
  if (newUpdateAvailable) {
    const newVersion = `1.0.${Math.floor(Math.random() * 10) + 1}`;
    const { data, error } = await supabase.from('updates').insert([{
      version: newVersion,
      release_date: new Date().toISOString(),
      description: `v${newVersion} için yeni güvenlik yaması ve performans iyileştirmeleri`,
      status: 'available'
    }]).select();
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: `Yeni güncelleme v${newVersion} bulundu!`, update: data[0] });
  } else {
    res.json({ message: 'Yeni güncelleme mevcut değil.' });
  }
});

app.post('/updates/apply/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('updates').update({ status: 'applied' }).eq('id', id).select();
  if (error) return res.status(500).json({ error: error.message });
  if (data && data.length > 0) {
    res.json({ message: `v${data[0].version} güncellemesi başarıyla uygulandı!`, newVersion: data[0].version });
  } else {
    res.status(404).json({ message: 'Güncelleme bulunamadı.' });
  }
});

// Raporlar Rotaları (Simüle Edilmiş)
app.get('/reports/generate', authenticateToken, (req, res) => {
  const { type } = req.query;
  res.json({ message: `Simüle edilmiş ${type} raporu oluşturuldu. (İndirme uygulanmadı)` });
});

// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`NetGate Backend sunucusu ${PORT} portunda çalışıyor!`);
});
