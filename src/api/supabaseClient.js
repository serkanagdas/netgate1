import { createClient } from '@supabase/supabase-js';

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Supabase URL veya Anon Anahtarı eksik. Lütfen .env dosyanızı kontrol edin.");
    } else {
      console.log("Supabase URL:", supabaseUrl);
      console.log("Supabase Anon Anahtarı (ilk 5 karakter):", supabaseAnonKey ? supabaseAnonKey.substring(0, 5) + '...' : 'Yok');
    }

    export const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Kimlik doğrulamalı fetch istekleri yapmak için yardımcı fonksiyon
    export const fetchAuthenticated = async (url, options = {}) => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        console.error("Kimlik doğrulamalı fetch için aktif oturum bulunamadı:", sessionError);
        // İsteğe bağlı olarak, giriş sayfasına yönlendirin veya bir hata fırlatın
        throw new Error("Kimlik doğrulama gerekli.");
      }

      const headers = {
        ...options.headers,
        'Authorization': `Bearer ${session.access_token}`,
      };

      const response = await fetch(url, { ...options, headers });

      if (response.status === 401 || response.status === 403) {
        // Token süresi dolmuş veya geçersiz, kullanıcıyı çıkış yap
        await supabase.auth.signOut();
        window.location.href = '/auth'; // Giriş sayfasına yönlendir
        throw new Error("Oturum süresi doldu veya geçersiz. Lütfen tekrar giriş yapın.");
      }

      return response;
    };
