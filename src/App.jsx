import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './api/supabaseClient';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import LogManagement from './components/LogManagement';
import SecurityRules from './components/SecurityRules';
import Updates from './components/Updates';
import Reports from './components/Reports';

const App = () => {
  const [session, setSession] = useState(null);
  const navigate = useNavigate();
  const location = useLocation(); // useLocation hook'unu ekle

  console.log("Uygulama bileşeni render edildi. Mevcut oturum:", session); // Hata ayıklama günlüğü

  useEffect(() => {
    console.log("Uygulama useEffect çalışıyor."); // Hata ayıklama günlüğü
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      console.log("İlk oturum kontrol sonucu:", session); // Hata ayıklama günlüğü
      if (!session) {
        navigate('/auth');
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      console.log("Kimlik doğrulama durumu değişti olayı:", session); // Hata ayıklama günlüğü
      if (!session) {
        navigate('/auth');
      } else {
        // Yalnızca bir dashboard rotasında değilse '/' adresine git
        if (location.pathname === '/auth') {
          navigate('/');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]); // location.pathname'i bağımlılıklara ekle

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    navigate('/auth');
  };

  // Orijinal koşullu renderlama (yorumsuz)
  if (!session) {
    return <Auth onLogin={setSession} />;
  }

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h2>NetGate</h2>
        <ul>
          <li><Link to="/" className={location.pathname === '/' ? 'active' : ''}>Kontrol Paneli</Link></li>
          <li><Link to="/logs" className={location.pathname === '/logs' ? 'active' : ''}>Günlük Yönetimi</Link></li>
          <li><Link to="/rules" className={location.pathname === '/rules' ? 'active' : ''}>Güvenlik Kuralları</Link></li>
          <li><Link to="/updates" className={location.pathname === '/updates' ? 'active' : ''}>Güncellemeler</Link></li>
          <li><Link to="/reports" className={location.pathname === '/reports' ? 'active' : ''}>Raporlar</Link></li>
          <li><a onClick={handleLogout} style={{ cursor: 'pointer' }}>Çıkış Yap</a></li>
        </ul>
      </div>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/logs" element={<LogManagement />} />
        <Route path="/rules" element={<SecurityRules />} />
        <Route path="/updates" element={<Updates />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/auth" element={<Auth onLogin={setSession} />} />
      </Routes>
    </div>
  );
};

const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;
