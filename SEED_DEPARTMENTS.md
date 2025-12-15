# Bölüm ve Programları Yükleme (Seed) Rehberi

## 🎯 Amaç
`/api/departments/seed` endpoint'ini çağırarak tüm eski bölümleri silip, JSON dosyasındaki yeni bölüm ve programları yüklemek.

---

## 📋 Yöntemler

### Yöntem 1: PowerShell Script (Önerilen - Windows)

1. Backend klasörüne gidin:
```powershell
cd "c:\Users\Dell\Documents\PROJECT\Gaun Mudek\Gaun_mudek-\backend"
```

2. Script'i çalıştırın:
```powershell
.\seed-departments.ps1
```

**Veya direkt komut:**
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/departments/seed" -Method POST -ContentType "application/json" -UseBasicParsing
```

---

### Yöntem 2: Batch Script (Windows)

1. Backend klasörüne gidin:
```cmd
cd "c:\Users\Dell\Documents\PROJECT\Gaun Mudek\Gaun_mudek-\backend"
```

2. Script'i çalıştırın:
```cmd
seed-departments.bat
```

**Veya direkt komut:**
```cmd
curl -X POST http://localhost:5000/api/departments/seed -H "Content-Type: application/json"
```

---

### Yöntem 3: Terminal'den (curl - Eğer yüklüyse)

**Windows'ta curl genellikle yüklü gelir (Windows 10+):**

```bash
curl -X POST http://localhost:5000/api/departments/seed -H "Content-Type: application/json"
```

**Daha detaylı çıktı için:**
```bash
curl -X POST http://localhost:5000/api/departments/seed -H "Content-Type: application/json" -v
```

---

### Yöntem 4: Browser Console (Frontend'den)

1. Frontend uygulamanızı açın (http://localhost:3000)
2. Browser Developer Tools'u açın (F12)
3. Console tab'ına gidin
4. Şu komutu çalıştırın:

```javascript
fetch('http://localhost:5000/api/departments/seed', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => {
  console.log('✅ Başarılı:', data);
  alert('Bölümler yüklendi: ' + data.message);
})
.catch(err => {
  console.error('❌ Hata:', err);
  alert('Hata: ' + err.message);
});
```

---

### Yöntem 5: Postman / Insomnia / Thunder Client

1. **Method:** POST
2. **URL:** `http://localhost:5000/api/departments/seed`
3. **Headers:**
   - `Content-Type: application/json`
4. **Body:** (boş bırakın veya `{}`)
5. **Send** butonuna tıklayın

---

### Yöntem 6: Production (Render'da)

Eğer backend Render'da deploy edildiyse:

```bash
curl -X POST https://gaun-mudek.onrender.com/api/departments/seed -H "Content-Type: application/json"
```

**Veya PowerShell:**
```powershell
Invoke-WebRequest -Uri "https://gaun-mudek.onrender.com/api/departments/seed" -Method POST -ContentType "application/json" -UseBasicParsing
```

---

## ⚠️ Önemli Notlar

1. **Backend çalışıyor olmalı:**
   - Local: `npm run dev` veya `npm start` çalışıyor olmalı
   - Production: Render'da deploy edilmiş olmalı

2. **Port kontrolü:**
   - Default port: `5000`
   - Eğer farklı bir port kullanıyorsanız, URL'deki port'u değiştirin

3. **Ne yapar:**
   - ✅ Tüm eski bölümleri siler
   - ✅ Tüm eski programları siler
   - ✅ Course'lardaki department ve program referanslarını temizler
   - ✅ JSON'daki 8 bölümü ve programlarını ekler
   - ✅ Toplam ~25 program oluşturur

4. **Güvenlik:**
   - Production'da bu endpoint'i korumak isteyebilirsiniz (authentication ekleyin)

---

## ✅ Başarılı Yanıt Örneği

```json
{
  "success": true,
  "message": "8 bölüm ve 25 program başarıyla oluşturuldu. Tüm eski bölümler ve programlar silindi.",
  "data": [
    {
      "_id": "...",
      "name": "EL SANATLARI",
      "code": "ELSAN",
      "programs": [
        {
          "_id": "...",
          "code": "HALICILIK",
          "name": "HALICILIK VE KİLİMCİLİK"
        },
        ...
      ]
    },
    ...
  ]
}
```

---

## 🐛 Sorun Giderme

### "Connection refused" hatası
- Backend çalışıyor mu kontrol edin
- Port doğru mu kontrol edin (5000)

### "404 Not Found" hatası
- URL doğru mu kontrol edin (`/api/departments/seed`)
- Backend route'ları doğru yapılandırılmış mı kontrol edin

### "500 Internal Server Error"
- MongoDB bağlantısı çalışıyor mu kontrol edin
- Backend console log'larını kontrol edin

---

## 📝 Hızlı Komutlar

**PowerShell (Local):**
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/departments/seed" -Method POST -ContentType "application/json" -UseBasicParsing | Select-Object -ExpandProperty Content
```

**PowerShell (Production):**
```powershell
Invoke-WebRequest -Uri "https://gaun-mudek.onrender.com/api/departments/seed" -Method POST -ContentType "application/json" -UseBasicParsing | Select-Object -ExpandProperty Content
```

**curl (Local):**
```bash
curl -X POST http://localhost:5000/api/departments/seed -H "Content-Type: application/json"
```

**curl (Production):**
```bash
curl -X POST https://gaun-mudek.onrender.com/api/departments/seed -H "Content-Type: application/json"
```
