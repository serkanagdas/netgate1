import React, { useState, useEffect } from 'react';
    import { fetchAuthenticated } from '../api/supabaseClient'; // Yeni yardımcı fonksiyonu içe aktar

    const Dashboard = () => {
      const [systemStatus, setSystemStatus] = useState({
        uptime: 'Yükleniyor...',
        cpu: 'Yükleniyor...',
        ram: 'Yükleniyor...',
        activeConnections: 'Yükleniyor...',
      });
      const [threats, setThreats] = useState([]);

      useEffect(() => {
        // Sistem durumunu getirme simülasyonu
        const fetchSystemStatus = async () => {
          try {
            // fetchAuthenticated kullan
            const response = await fetchAuthenticated('/api/dashboard/status');
            const data = await response.json();
            setSystemStatus(data);
          } catch (error) {
            console.error('Sistem durumu getirilirken hata oluştu:', error);
            setSystemStatus({
              uptime: 'Yok',
              cpu: 'Yok',
              ram: 'Yok',
              activeConnections: 'Yok',
            });
          }
        };

        // Son tehditleri getirme simülasyonu
        const fetchThreats = async () => {
          try {
            // fetchAuthenticated kullan
            const response = await fetchAuthenticated('/api/dashboard/threats');
            const data = await response.json();
            setThreats(data);
          } catch (error) {
            console.error('Tehditler getirilirken hata oluştu:', error);
            setThreats([]);
          }
        };

        fetchSystemStatus();
        fetchThreats();

        // Gerçek zamanlı güncellemeler için aralık ayarla (simüle edilmiş)
        const interval = setInterval(() => {
          fetchSystemStatus();
          fetchThreats();
        }, 5000); // Her 5 saniyede bir güncelle

        return () => clearInterval(interval);
      }, []);

      return (
        <div className="main-content">
          <h1>Kontrol Paneli</h1>
          <div className="card-grid">
            <div className="card">
              <h3>Sistem Durumu</h3>
              <p><b>Çalışma Süresi:</b> {systemStatus.uptime}</p>
              <p><b>CPU Kullanımı:</b> {systemStatus.cpu}</p>
              <p><b>RAM Kullanımı:</b> {systemStatus.ram}</p>
              <p><b>Aktif Bağlantılar:</b> {systemStatus.activeConnections}</p>
            </div>
            <div className="card">
              <h3>Gerçek Zamanlı Trafik (Yer Tutucu)</h3>
              <p>Ağ trafiğini gösteren grafik burada görünecektir.</p>
              {/* Chart.js veya benzeri entegrasyon buraya gelecektir */}
            </div>
            <div className="card">
              <h3>Hızlı Eylemler</h3>
              <button onClick={() => alert('Günlük Yönetimine gidiliyor...')}>Günlük Yönetimi</button>
              <br /><br />
              <button onClick={() => alert('Kural Yönetimine gidiliyor...')}>Kural Yönetimi</button>
            </div>
          </div>

          <div className="table-container">
            <h3>Son Tehditler / Uyarılar</h3>
            {threats.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Zaman Damgası</th>
                    <th>Tip</th>
                    <th>Kaynak IP</th>
                    <th>Açıklama</th>
                  </tr>
                </thead>
                <tbody>
                  {threats.map((threat, index) => (
                    <tr key={index}>
                      <td>{new Date(threat.timestamp).toLocaleString()}</td>
                      <td>{threat.type}</td>
                      <td>{threat.source_ip}</td>
                      <td>{threat.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>Son tehdit algılanmadı.</p>
            )}
          </div>
        </div>
      );
    };

    export default Dashboard;
