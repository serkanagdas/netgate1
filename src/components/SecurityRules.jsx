import React, { useState, useEffect } from 'react';
    import { fetchAuthenticated } from '../api/supabaseClient'; // Yeni yardımcı fonksiyonu içe aktar

    const SecurityRules = () => {
      const [rules, setRules] = useState([]);
      const [newRule, setNewRule] = useState({
        name: '',
        type: 'block', // 'block' veya 'allow'
        protocol: 'any', // 'tcp', 'udp', 'icmp', 'any'
        source_ip: '',
        destination_ip: '',
        port: '',
        priority: 100,
        status: true, // varsayılan olarak aktif
      });
      const [editingRuleId, setEditingRuleId] = useState(null);
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState(null);

      const fetchRules = async () => {
        setLoading(true);
        setError(null);
        try {
          // fetchAuthenticated kullan
          const response = await fetchAuthenticated('/api/rules');
          if (!response.ok) {
            throw new Error(`HTTP hatası! durum: ${response.status}`);
          }
          const data = await response.json();
          setRules(data);
        } catch (err) {
          setError('Kurallar getirilemedi: ' + err.message);
          console.error('Kurallar getirilirken hata oluştu:', err);
        } finally {
          setLoading(false);
        }
      };

      useEffect(() => {
        fetchRules();
      }, []);

      const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewRule({
          ...newRule,
          [name]: type === 'checkbox' ? checked : value,
        });
      };

      const handleAddRule = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
          const method = editingRuleId ? 'PUT' : 'POST';
          const url = editingRuleId ? `/api/rules/${editingRuleId}` : '/api/rules';
          // fetchAuthenticated kullan
          const response = await fetchAuthenticated(url, {
            method: method,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(newRule),
          });

          if (!response.ok) {
            throw new Error(`HTTP hatası! durum: ${response.status}`);
          }

          setNewRule({
            name: '',
            type: 'block',
            protocol: 'any',
            source_ip: '',
            destination_ip: '',
            port: '',
            priority: 100,
            status: true,
          });
          setEditingRuleId(null);
          fetchRules(); // Listeyi yenile
        } catch (err) {
          setError('Kural kaydedilemedi: ' + err.message);
          console.error('Kural kaydedilirken hata oluştu:', err);
        } finally {
          setLoading(false);
        }
      };

      const handleEditRule = (rule) => {
        setNewRule(rule);
        setEditingRuleId(rule.id);
      };

      const handleDeleteRule = async (id) => {
        if (!window.confirm('Bu kuralı silmek istediğinizden emin misiniz?')) {
          return;
        }
        setLoading(true);
        setError(null);
        try {
          // fetchAuthenticated kullan
          const response = await fetchAuthenticated(`/api/rules/${id}`, {
            method: 'DELETE',
          });
          if (!response.ok) {
            throw new Error(`HTTP hatası! durum: ${response.status}`);
          }
          fetchRules(); // Listeyi yenile
        } catch (err) {
          setError('Kural silinemedi: ' + err.message);
          console.error('Kural silinirken hata oluştu:', err);
        } finally {
          setLoading(false);
        }
      };

      const handleToggleStatus = async (rule) => {
        setLoading(true);
        setError(null);
        try {
          const updatedRule = { ...rule, status: !rule.status };
          // fetchAuthenticated kullan
          const response = await fetchAuthenticated(`/api/rules/${rule.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedRule),
          });
          if (!response.ok) {
            throw new Error(`HTTP hatası! durum: ${response.status}`);
          }
          fetchRules(); // Listeyi yenile
        } catch (err) {
          setError('Kural durumu değiştirilemedi: ' + err.message);
          console.error('Kural durumu değiştirilirken hata oluştu:', err);
        } finally {
          setLoading(false);
        }
      };

      return (
        <div className="main-content">
          <h1>Güvenlik Kuralları Yönetimi</h1>

          <div className="table-container">
            <h3>{editingRuleId ? 'Kuralı Düzenle' : 'Yeni Kural Ekle'}</h3>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleAddRule}>
              <div className="form-group">
                <label htmlFor="name">Kural Adı:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newRule.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="type">Tip:</label>
                <select id="type" name="type" value={newRule.type} onChange={handleInputChange}>
                  <option value="block">Engelle</option>
                  <option value="allow">İzin Ver</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="protocol">Protokol:</label>
                <select id="protocol" name="protocol" value={newRule.protocol} onChange={handleInputChange}>
                  <option value="any">Herhangi</option>
                  <option value="tcp">TCP</option>
                  <option value="udp">UDP</option>
                  <option value="icmp">ICMP</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="source_ip">Kaynak IP (örn: 192.168.1.1 veya 0.0.0.0/0 herhangi için):</label>
                <input
                  type="text"
                  id="source_ip"
                  name="source_ip"
                  value={newRule.source_ip}
                  onChange={handleInputChange}
                  placeholder="örn: 192.168.1.1 veya 0.0.0.0/0"
                />
              </div>
              <div className="form-group">
                <label htmlFor="destination_ip">Hedef IP (örn: 192.168.1.1 veya 0.0.0.0/0 herhangi için):</label>
                <input
                  type="text"
                  id="destination_ip"
                  name="destination_ip"
                  value={newRule.destination_ip}
                  onChange={handleInputChange}
                  placeholder="örn: 192.168.1.1 veya 0.0.0.0/0"
                />
              </div>
              <div className="form-group">
                <label htmlFor="port">Port (örn: 80, 443 veya herhangi için boş bırakın):</label>
                <input
                  type="number"
                  id="port"
                  name="port"
                  value={newRule.port}
                  onChange={handleInputChange}
                  placeholder="örn: 80 veya 443"
                />
              </div>
              <div className="form-group">
                <label htmlFor="priority">Öncelik (düşük sayı = yüksek öncelik):</label>
                <input
                  type="number"
                  id="priority"
                  name="priority"
                  value={newRule.priority}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="status"
                    checked={newRule.status}
                    onChange={handleInputChange}
                  />
                  Aktif
                </label>
              </div>
              <button type="submit" disabled={loading}>
                {loading ? 'Kaydediliyor...' : (editingRuleId ? 'Kuralı Güncelle' : 'Kural Ekle')}
              </button>
              {editingRuleId && (
                <button type="button" onClick={() => {
                  setEditingRuleId(null);
                  setNewRule({
                    name: '', type: 'block', protocol: 'any', source_ip: '',
                    destination_ip: '', port: '', priority: 100, status: true,
                  });
                }} style={{ marginLeft: '10px', backgroundColor: '#6c757d' }}>
                  Düzenlemeyi İptal Et
                </button>
              )}
            </form>
          </div>

          <div className="table-container" style={{ marginTop: '30px' }}>
            <h3>Mevcut Kurallar</h3>
            {loading && <p>Kurallar yükleniyor...</p>}
            <table>
              <thead>
                <tr>
                  <th>Ad</th>
                  <th>Tip</th>
                  <th>Protokol</th>
                  <th>Kaynak IP</th>
                  <th>Hedef IP</th>
                  <th>Port</th>
                  <th>Öncelik</th>
                  <th>Durum</th>
                  <th>Eylemler</th>
                </tr>
              </thead>
              <tbody>
                {rules.length > 0 ? (
                  rules.map((rule) => (
                    <tr key={rule.id}>
                      <td>{rule.name}</td>
                      <td>{rule.type}</td>
                      <td>{rule.protocol}</td>
                      <td>{rule.source_ip || 'Herhangi'}</td>
                      <td>{rule.destination_ip || 'Herhangi'}</td>
                      <td>{rule.port || 'Herhangi'}</td>
                      <td>{rule.priority}</td>
                      <td>{rule.status ? 'Aktif' : 'Pasif'}</td>
                      <td className="action-buttons">
                        <button onClick={() => handleEditRule(rule)}>Düzenle</button>
                        <button onClick={() => handleToggleStatus(rule)}>
                          {rule.status ? 'Devre Dışı Bırak' : 'Aktif Et'}
                        </button>
                        <button className="delete" onClick={() => handleDeleteRule(rule.id)}>Sil</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9">Güvenlik kuralı bulunamadı.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    };

    export default SecurityRules;
