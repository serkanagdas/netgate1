import React, { useState, useEffect } from 'react';
    import { fetchAuthenticated } from '../api/supabaseClient'; // Yeni yardımcı fonksiyonu içe aktar

    const Updates = () => {
      const [updates, setUpdates] = useState([]);
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState(null);
      const [currentVersion, setCurrentVersion] = useState('1.0.0'); // Simüle edilmiş mevcut sürüm

      const fetchUpdates = async () => {
        setLoading(true);
        setError(null);
        try {
          // fetchAuthenticated kullan
          const response = await fetchAuthenticated('/api/updates');
          if (!response.ok) {
            throw new Error(`HTTP hatası! durum: ${response.status}`);
          }
          const data = await response.json();
          setUpdates(data);
        } catch (err) {
          setError('Güncellemeler getirilemedi: ' + err.message);
          console.error('Güncellemeler getirilirken hata oluştu:', err);
        } finally {
          setLoading(false);
        }
      };

      useEffect(() => {
        fetchUpdates();
      }, []);

      const handleCheckForUpdates = async () => {
        setLoading(true);
        setError(null);
        try {
          // Güncellemeleri kontrol etme simülasyonu
          // fetchAuthenticated kullan
          const response = await fetchAuthenticated('/api/updates/check', { method: 'POST' });
          if (!response.ok) {
            throw new Error(`HTTP hatası! durum: ${response.status}`);
          }
          const result = await response.json();
          alert(result.message);
          fetchUpdates(); // Kontrol ettikten sonra listeyi yenile
        } catch (err) {
          setError('Güncellemeler kontrol edilemedi: ' + err.message);
          console.error('Güncellemeler kontrol edilirken hata oluştu:', err);
        } finally {
          setLoading(false);
        }
      };

      const handleApplyUpdate = async (updateId) => {
        setLoading(true);
        setError(null);
        try {
          // Bir güncelleme uygulama simülasyonu
          // fetchAuthenticated kullan
          const response = await fetchAuthenticated(`/api/updates/apply/${updateId}`, { method: 'POST' });
          if (!response.ok) {
            throw new Error(`HTTP hatası! durum: ${response.status}`);
          }
          const result = await response.json();
          alert(result.message);
          setCurrentVersion(result.newVersion || currentVersion); // Simüle edilmiş sürümü güncelle
          fetchUpdates(); // Uyguladıktan sonra listeyi yenile
        } catch (err) {
          setError('Güncelleme uygulanamadı: ' + err.message);
          console.error('Güncelleme uygulanırken hata oluştu:', err);
        } finally {
          setLoading(false);
        }
      };

      return (
        <div className="main-content">
          <h1>Sistem Güncellemeleri ve Yama Yönetimi</h1>

          <div className="card-grid">
            <div className="card">
              <h3>Mevcut Sistem Sürümü</h3>
              <p><b>Sürüm:</b> {currentVersion}</p>
              <button onClick={handleCheckForUpdates} disabled={loading}>
                {loading ? 'Kontrol Ediliyor...' : 'Güncellemeleri Kontrol Et'}
              </button>
            </div>
          </div>

          <div className="table-container">
            <h3>Mevcut Güncellemeler</h3>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {loading && <p>Güncellemeler yükleniyor...</p>}
            <table>
              <thead>
                <tr>
                  <th>Sürüm</th>
                  <th>Yayın Tarihi</th>
                  <th>Açıklama</th>
                  <th>Durum</th>
                  <th>Eylemler</th>
                </tr>
              </thead>
              <tbody>
                {updates.length > 0 ? (
                  updates.map((update) => (
                    <tr key={update.id}>
                      <td>{update.version}</td>
                      <td>{new Date(update.release_date).toLocaleDateString()}</td>
                      <td>{update.description}</td>
                      <td>{update.status}</td>
                      <td>
                        {update.status === 'available' && (
                          <button onClick={() => handleApplyUpdate(update.id)} disabled={loading}>
                            Güncellemeyi Uygula
                          </button>
                        )}
                        {update.status === 'applied' && (
                          <span>Uygulandı</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">Mevcut güncelleme yok.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    };

    export default Updates;
