import React, { useState } from 'react';
    import { supabase } from '../api/supabaseClient';

    const Auth = ({ onLogin }) => {
      const [isLogin, setIsLogin] = useState(true);
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState(null);

      const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
          let authResponse;
          if (isLogin) {
            authResponse = await supabase.auth.signInWithPassword({ email, password });
          } else {
            authResponse = await supabase.auth.signUp({ email, password });
          }

          const { data, error } = authResponse;

          if (error) {
            setError(error.message);
          } else if (data.user) {
            onLogin(data.user);
          } else {
            setError("Beklenmeyen bir hata oluştu.");
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      return (
        <div className="container">
          <form onSubmit={handleAuth} className="auth-form">
            <h2>{isLogin ? 'Giriş Yap' : 'Kaydol'}</h2>
            {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
            <div className="form-group">
              <label htmlFor="email">E-posta:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Şifre:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Yükleniyor...' : (isLogin ? 'Giriş Yap' : 'Kaydol')}
            </button>
            <p>
              {isLogin ? "Hesabın yok mu?" : "Zaten bir hesabın var mı?"}{' '}
              <a onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? 'Kaydol' : 'Giriş Yap'}
              </a>
            </p>
          </form>
        </div>
      );
    };

    export default Auth;
