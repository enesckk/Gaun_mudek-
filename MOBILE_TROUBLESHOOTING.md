# Mobil Veride Açılmama Sorunu - Sorun Giderme Rehberi

## 🔍 Olası Nedenler

### 1. **Backend URL Erişilebilirliği**
- Render backend URL'i mobil veride erişilebilir olmayabilir
- Network timeout veya yavaş bağlantı

### 2. **CORS Hatası**
- Backend, mobil cihazdan gelen isteklere izin vermiyor olabilir
- Vercel URL'i CORS allow list'inde olmayabilir

### 3. **Environment Variable Eksikliği**
- `NEXT_PUBLIC_API_BASE_URL` Vercel'de ayarlanmamış olabilir
- Frontend backend URL'ini bulamıyor

### 4. **HTTPS/HTTP Karışıklığı**
- Mobil tarayıcılar HTTPS gerektirebilir
- Mixed content (HTTP/HTTPS) sorunları

---

## ✅ Çözümler

### 1. Vercel Environment Variables Kontrolü

Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_API_BASE_URL=https://your-backend.onrender.com/api
```

**Önemli:**
- `NEXT_PUBLIC_` prefix'i zorunlu
- URL'in sonunda `/api` olmalı
- HTTPS kullanılmalı (HTTP değil)

### 2. Render Backend Kontrolü

1. Render Dashboard'da backend servisin çalıştığını kontrol et
2. Backend URL'ini tarayıcıda aç: `https://your-backend.onrender.com/api/health`
3. Response: `{"status":"OK"}` gelmeli

### 3. CORS Ayarları (Backend)

`backend/server.js` içinde CORS yapılandırması güncellendi:

- Vercel origin'leri otomatik allow ediliyor (`.vercel.app`)
- `FRONTEND_URL` environment variable'ı kontrol ediliyor
- Development'ta tüm origin'lere izin veriliyor

**Render Environment Variables:**
```
FRONTEND_URL=https://your-frontend.vercel.app
```

### 4. Mobil Cihazda Test

1. Mobil cihazda Vercel URL'ini aç
2. Browser console'u aç (Chrome: chrome://inspect)
3. Network tab'ında API isteklerini kontrol et
4. Hata mesajlarını kontrol et

---

## 🐛 Debug Adımları

### Adım 1: Frontend API URL Kontrolü

Mobil cihazda browser console'da:

```javascript
console.log('API URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
```

Eğer `undefined` ise, Vercel environment variable'ı ayarlanmamış.

### Adım 2: Backend Health Check

Mobil cihazdan backend URL'ini test et:

```bash
# Tarayıcıda aç:
https://your-backend.onrender.com/api/health
```

Eğer açılmıyorsa:
- Render servisi çalışmıyor olabilir
- Network erişim sorunu olabilir

### Adım 3: CORS Hatası Kontrolü

Browser console'da CORS hatası görüyorsan:

```
Access to XMLHttpRequest at '...' from origin '...' has been blocked by CORS policy
```

**Çözüm:**
1. Render'da `FRONTEND_URL` environment variable'ını kontrol et
2. Vercel URL'inin tam olarak eşleştiğinden emin ol
3. Backend'i yeniden deploy et

### Adım 4: Network Timeout

Mobil veride yavaş bağlantı varsa:

1. Backend timeout ayarlarını artır
2. Frontend'de retry mekanizması ekle
3. Loading state'leri iyileştir

---

## 📱 Mobil Optimizasyonlar

### 1. API Client Timeout Ayarları

`frontend/lib/api/apiClient.ts`:

```typescript
export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 saniye
  headers: {
    "Content-Type": "application/json",
  },
});
```

### 2. Retry Mekanizması

Network hatalarında otomatik retry eklenebilir.

### 3. Offline Detection

Mobil cihazda internet yoksa kullanıcıya bilgi ver.

---

## 🔧 Hızlı Düzeltmeler

### Sorun: "Backend sunucusuna bağlanılamıyor"

**Çözüm:**
1. Render backend servisinin çalıştığını kontrol et
2. `NEXT_PUBLIC_API_BASE_URL` Vercel'de doğru mu kontrol et
3. Backend URL'ini tarayıcıda test et

### Sorun: CORS Hatası

**Çözüm:**
1. Render'da `FRONTEND_URL` environment variable'ını ayarla
2. Vercel URL'inin tam olarak eşleştiğinden emin ol
3. Backend'i yeniden deploy et

### Sorun: Timeout / Yavaş Yükleme

**Çözüm:**
1. API client timeout'unu artır
2. Backend response time'ını optimize et
3. Database query'lerini optimize et

---

## 📞 Destek

Sorun devam ederse:

1. Browser console log'larını kontrol et
2. Network tab'ında failed request'leri kontrol et
3. Render backend log'larını kontrol et
4. Vercel deployment log'larını kontrol et

