import React, { useState, useEffect } from 'react';
    import { fetchAuthenticated } from '../api/supabaseClient'; // Yeni yardımcı fonksiyonu içe aktar

    const LogManagement = () => {
      const [logs, setLogs] = useState([]);
      const [filters, setFilters] = useState({
        severity: '',
        startDate: '',
        endDate: '',
        keyword: '',
      });
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState(null);

      const fetchLogs = async () => {
        setLoading(true);
        setError(null);
        try {
          const queryParams = new URLSearchParams(filters).toString();
          // fetchAuthenticated kullan
          const response = await fetchAuthenticated(`/api/logs?${queryParams}`);
          if (!response.ok) {
            throw new Error(`HTTP hatası! durum: ${response.status}`);
          }
          const data = await response.json();
          setLogs(data);
        } catch (err) {
          setError('Günlükler getirilemedi: ' + err.message);
          console.error('Günlükler getirilirken hata oluştu:', err);
        } finally {
          setLoading(false);
        }
      };

      useEffect(() => {
        fetchLogs();
      }, []); // Bileşen ilk yüklendiğinde günlükleri getir

      const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
      };

      const handleApplyFilters = () => {
        fetchLogs();
      };

      const handleExport = (format) => {
        alert(`${format} olarak günlükler dışa aktarılıyor... (Bu demoda uygulanmadı)`);
        // Gerçek bir uygulamada, dosyayı oluşturmak ve indirmek için bir API çağrısı yaparsınız
      };

      // Yeni: Simüle edilmiş log oluşturma fonksiyonu
      const handleGenerateMockLog = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await fetchAuthenticated('/api/logs/generate-mock', {
            method: 'POST',
          });
          if (!response.ok) {
            throw new Error(`HTTP hatası! durum: ${response.status}`);
          }
          const result = await response.json();
          alert(result.message);
          fetchLogs(); // Yeni logu görmek için günlükleri yeniden getir
        } catch (err) {
          setError('Mock log oluşturulamadı: ' + err.message);
          console.error('Mock log oluşturulurken hata oluştu:', err);
        } finally {
          setLoading(false);
        }
      };

      return (
        <div className="main-content">
          <h1>Günlük Yönetimi</h1>

          <div className="filter-section">
            <select name="severity" value={filters.severity} onChange={handleFilterChange}>
              <option value="">Tüm Önem Dereceleri</option>
              <option value="INFO">BİLGİ</option>
              <option value="WARN">UYARI</option>
              <option value="ERROR">HATA</option>
            </select>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              placeholder="Başlangıç Tarihi"
            />
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              placeholder="Bitiş Tarihi"
            />
            <input
              type="text"
              name="keyword"
              value={filters.keyword}
              onChange={handleFilterChange}
              placeholder="Anahtar kelime ara..."
            />
            <button onClick={handleApplyFilters} disabled={loading}>
              {loading ? 'Filtreleniyor...' : 'Filtreleri Uygula'}
            </button>
            <button onClick={() => handleExport('PDF')}>PDF Dışa Aktar</button>
            <button onClick={() => handleExport('CSV')}>CSV Dışa Aktar</button>
            {/* Yeni: Simüle edilmiş log oluşturma düğmesi */}
            <button onClick={handleGenerateMockLog} disabled={loading} style={{ backgroundColor: '#28a745' }}>
              {loading ? 'Oluşturuluyor...' : 'Simüle Log Oluştur'}
            </button>
          </div>

          {error && <p style={{ color: 'red' }}>{error}</p>}
          {loading && <p>Günlükler yükleniyor...</p>}

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Zaman Damgası</th>
                  <th>Önem Derecesi</th>
                  <th>Kaynak IP</th>
                  <th>Hedef IP</th>
                  <th>Protokol</th>
                  <th>Port</th>
                  <th>Mesaj</th>
                  <th>Kural Kimliği</th>
                </tr>
              </thead>
              <tbody>
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <tr key={log.id}>
                      <td>{new Date(log.timestamp).toLocaleString()}</td>
                      <td>{log.severity}</td>
                      <td>{log.source_ip}</td>
                      <td>{log.destination_ip}</td>
                      <td>{log.protocol}</td>
                      <td>{log.port}</td>
                      <td>{log.message}</td>
                      <td>{log.rule_id || 'Yok'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8">Günlük bulunamadı.</td>
                  </tr>
                )}
              </tbody>
            </table>
            {/* Sayfalama buraya gelecektir */}
            <div className="pagination">
              <button disabled>Önceki</button>
              <button disabled>Sonraki</button>
            </div>
          </div>
        </div>
      );
    };

    export default LogManagement;
