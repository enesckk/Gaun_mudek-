# Test Rehberi - Course Creation System

## 🚀 Sistem Durumu

### Backend
- **Port:** 5000
- **Health Check:** http://localhost:5000/api/health
- **Status:** Çalışıyor olmalı

### Frontend
- **Port:** 3000
- **URL:** http://localhost:3000
- **Status:** Çalışıyor

## 📋 Test Senaryoları

### Senaryo 1: Course List Page (Derslerim)
**URL:** http://localhost:3000/dashboard/courses

**Beklenen:**
- ✅ "Derslerim" başlığı görünmeli
- ✅ "Yeni Ders Oluştur" butonu sağ üstte
- ✅ Search bar görünmeli
- ✅ Course cards görünmeli (varsa)
- ✅ Her card'da: Ders adı, dönem, ÖÇ sayısı, öğrenci sayısı, sınav kodları
- ✅ "Düzenle" ve "Sil" butonları

**Test Adımları:**
1. Sidebar'dan "Derslerim" tıklayın
2. Sayfa yüklendiğini kontrol edin
3. Search bar'ı test edin
4. Course card'ları kontrol edin

---

### Senaryo 2: Create Course Page
**URL:** http://localhost:3000/dashboard/courses/create

**Beklenen:**
- ✅ 5 collapsible section
- ✅ Büyük, okunabilir inputlar
- ✅ Fixed submit button (alt kısımda)

**Test Adımları:**

#### Section 1: Ders Bilgileri
1. Ders Adı: "Test Dersi"
2. Ders Kodu: "TEST101"
3. Bölüm: "Bilgisayar Mühendisliği"
4. Dönem: "Güz" seçin
5. Açıklama: "Test açıklaması"

#### Section 2: Öğrenme Çıktıları
1. "+ ÖÇ Ekle" butonuna tıklayın
2. ÖÇ Kodu: "ÖÇ1"
3. Açıklama: "Test öğrenme çıktısı"
4. Başka bir ÖÇ ekleyin (ÖÇ2)

#### Section 3: Program Çıktıları
1. PÇ badge'lerine tıklayarak seçin
2. Seçili badge'ler vurgulanmalı

#### Section 4: Sınav Ayarları
1. **Vize:**
   - Sınav Kodu: "01"
   - Soru Sayısı: "10"
   - Soru Başına Maksimum Puan: "10"
2. **Final:**
   - Sınav Kodu: "02" (farklı olmalı!)
   - Soru Sayısı: "10"
   - Soru Başına Maksimum Puan: "10"

#### Section 5: Öğrenci Listesi
**Seçenek 1: Dosya Yükleme**
1. Bir .txt dosyası oluşturun:
   ```
   20231021 Ahmet Yılmaz
   20231034 Ayşe Karadağ
   20231045 Mehmet Demir
   ```
2. "Öğrenci Listesini Yükle" butonuna tıklayın
3. Dosyayı seçin
4. Preview table'da öğrenciler görünmeli

**Seçenek 2: Manuel Ekleme**
1. Öğrenci No: "20231021"
2. Ad Soyad: "Ahmet Yılmaz"
3. "Ekle" butonuna tıklayın
4. Table'da görünmeli

#### Submit
1. "Dersi Oluştur" butonuna tıklayın
2. Loading state görünmeli
3. Success toast: "Ders başarıyla oluşturuldu."
4. `/dashboard/courses` sayfasına yönlendirilmeli
5. Yeni ders listede görünmeli

---

### Senaryo 3: Validation Test
**Hatalı Form Testi:**

1. Ders Adı boş bırakın → Hata mesajı görünmeli
2. Ders Kodu geçersiz (örn: "test-101") → Hata mesajı
3. ÖÇ eklemeden submit → "En az bir ÖÇ eklemelisiniz"
4. Vize ve Final aynı kod → "Farklı olmalıdır" hatası
5. Öğrenci eklemeden submit → "En az bir öğrenci" hatası

---

### Senaryo 4: Edit Course Page
**URL:** http://localhost:3000/dashboard/courses/edit/[id]

**Test Adımları:**
1. Course list'te bir dersin "Düzenle" butonuna tıklayın
2. Form pre-filled olmalı
3. Değişiklik yapın
4. "Değişiklikleri Kaydet" butonuna tıklayın
5. Başarı mesajı görünmeli

---

## 🔍 Kontrol Edilecekler

### Frontend
- [ ] Tüm sayfalar açılıyor mu?
- [ ] Form validation çalışıyor mu?
- [ ] Loading states görünüyor mu?
- [ ] Error messages doğru mu?
- [ ] Success toast gösteriliyor mu?
- [ ] Redirect çalışıyor mu?

### Backend
- [ ] POST /api/courses endpoint çalışıyor mu?
- [ ] Exams oluşturuluyor mu?
- [ ] Questions oluşturuluyor mu?
- [ ] Students oluşturuluyor mu?
- [ ] Learning outcomes oluşturuluyor mu?
- [ ] Program outcomes bağlanıyor mu?

### Database
- [ ] Course kaydediliyor mu?
- [ ] Exams course'a bağlanıyor mu?
- [ ] Questions exam'lara bağlanıyor mu?
- [ ] Students oluşturuluyor mu?
- [ ] Learning outcomes course'a bağlanıyor mu?

## 🐛 Bilinen Sorunlar

Şu an bilinen bir sorun yok. Test sırasında bulunan sorunları buraya ekleyin.

## 📝 Test Sonuçları

Test ederken şunları not edin:
- Hangi adımda sorun oldu?
- Hata mesajı neydi?
- Browser console'da hata var mı?
- Network tab'ında API isteği başarılı mı?

