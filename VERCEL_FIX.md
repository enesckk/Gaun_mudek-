# Vercel Deployment Fix - Backend Dependencies Sorunu

## Sorun
Vercel serverless function'da `backend/server.js` çalıştığında, Node.js module resolution `backend/node_modules`'e bakıyor ama Vercel'de sadece `api/node_modules` var.

## Çözüm Seçenekleri

### Seçenek 1: Backend'i api/ içine taşı (Önerilen)
Backend kodlarını `api/backend/` içine kopyalayın veya symlink yapın, sonra `api/index.mjs`'de import path'ini değiştirin.

### Seçenek 2: Root package.json kullan
Root'ta bir `package.json` oluşturup tüm dependencies'leri oraya koyun.

### Seçenek 3: Vercel'in includeFiles kullan
`vercel.json`'da `includeFiles` ile backend'i dahil edin ve dependencies'leri api/ içine kopyalayın.

## Şu Anki Durum
- `api/package.json` backend dependencies'lerini içeriyor ✅
- `api/index.mjs` backend'i import ediyor ✅
- Ama backend kodları çalıştığında `backend/node_modules` arıyor ❌

## Hızlı Çözüm
`api/index.mjs`'yi düzenleyip, backend'i import etmeden önce module resolution'ı `api/node_modules`'e yönlendirin. Ama ES modules'da bu zor.

**En Pratik Çözüm:** Backend'i `api/backend/` içine taşıyın ve import path'ini değiştirin.

