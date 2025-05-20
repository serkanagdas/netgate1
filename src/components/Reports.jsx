import React, { useState } from 'react';
    import { fetchAuthenticated } from '../api/supabaseClient'; // Yeni yardımcı fonksiyonu içe aktar

    const Reports = () => {
      const [reportType, setReportType] = useState('performance');
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState(null);

      const handleGenerateReport = async () => {
        setLoading(true);
        setError(null);
        try {
          // Rapor oluşturmak için API çağrısı simülasyonu
          // fetchAuthenticated kullan
          const response = await fetchAuthenticated(`/api/reports/generate?type=${reportType}`);
          if (!response.ok) {
            throw new Error(`HTTP hatası! durum: ${response.status}`);
          }
          const data = await response.json();
          alert(`Rapor başarıyla oluşturuldu: ${data.message}`);
          // Gerçek bir uygulamada, bir indirme bağlantısı alabilir veya rapor içeriğini görüntüleyebilirsiniz
        } catch (err) {
          setError('Rapor oluşturulamadı: ' + err.message);
          console.error('Rapor oluşturulurken hata oluştu:', err);
        } finally {
          setLoading(false);
        }
      };

      return (
        <div className="main-content">
          <h1>Raporlar</h1>

          <div className="card-grid">
            <div className="card">
              <h3>Yeni Rapor Oluştur</h3>
              {error && <p style={{ color: 'red' }}>{error}</p>}
              <div className="form-group">
                <label htmlFor="reportType">Rapor Tipini Seçin:</label>
                <select
                  id="reportType"
                  name="reportType"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <option value="performance">Performans Raporu</option>
                  <option value="threat">Tehdit Raporu</option>
                  <option value="activity">Etkinlik Günlüğü Raporu</option>
                </select>
              </div>
              <button onClick={handleGenerateReport} disabled={loading}>
                {loading ? 'Oluşturuluyor...' : 'Rapor Oluştur'}
              </button>
            </div>
          </div>

          <div className="table-container">
            <h3>Son Raporlar (Yer Tutucu)</h3>
            <p>Daha önce oluşturulan raporların listesi burada görünecektir.</p>
            <table>
              <thead>
                <tr>
                  <th>Rapor Adı</th>
                  <th>Tip</th>
                  <th>Oluşturulma Tarihi</th>
                  <th>Eylemler</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="4">Henüz rapor oluşturulmadı.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      );
    };

    export default Reports;
