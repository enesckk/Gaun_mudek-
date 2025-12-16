# Backend Dokümantasyonu - MEDEK Exam Automation System

## 📋 Genel Bakış

Backend, MEDEK uyumlu sınav otomasyon sistemi için RESTful API sağlar. Express.js, MongoDB (Mongoose) ve AI (Gemini Vision API) kullanır.

---

## 🏗️ Proje Yapısı

```
backend/
├── server.js                 # Ana Express server
├── package.json             # Dependencies ve scripts
├── .env                     # Environment variables
│
├── models/                  # MongoDB Schema'ları
│   ├── Course.js           # Ders modeli (embedded structure)
│   ├── Exam.js             # Sınav modeli
│   ├── Question.js         # Soru modeli
│   ├── Student.js          # Öğrenci modeli
│   ├── Score.js            # Puan modeli
│   ├── LearningOutcome.js  # Öğrenme Çıktısı modeli
│   └── ProgramOutcome.js   # Program Çıktısı modeli
│
├── routes/                  # API Route'ları
│   ├── courseRoutes.js     # Course CRUD endpoints
│   ├── examRoutes.js       # Exam endpoints
│   ├── questionRoutes.js   # Question endpoints
│   ├── studentRoutes.js    # Student endpoints
│   ├── scoreRoutes.js      # Score endpoints
│   ├── learningOutcomeRoutes.js
│   ├── programOutcomeRoutes.js
│   └── aiRoutes.js         # AI processing endpoints
│
├── controllers/            # Business logic (eski yapı, şu an kullanılmıyor)
│   └── ...
│
└── utils/                  # Yardımcı fonksiyonlar
    ├── pdfToPng.js         # PDF → PNG conversion
    ├── markerDetect.js     # Marker detection (OpenCV)
    ├── roiCrop.js          # ROI cropping & warping
    └── geminiVision.js     # Gemini Vision API integration
```

---

## 🚀 Başlatma

### Gereksinimler
- Node.js v18+
- MongoDB (local veya cloud)
- Environment variables (.env)

### Kurulum
```bash
cd backend
npm install
```

### Environment Variables (.env)
```env
MONGODB_URI=mongodb://localhost:27017/mudekdb
PORT=5001
GEMINI_API_KEY=your_gemini_api_key_here
```

### Çalıştırma
```bash
# Development (nodemon ile auto-reload)
npm run dev

# Production
npm start
```

**Backend başladığında:** `http://localhost:5001`

---

## 📡 API Endpoints

### Health Check
- **GET** `/api/health` → `{ status: "OK" }`
- **GET** `/api` → API bilgileri

### Courses (`/api/courses`)

#### CREATE Course
- **POST** `/api/courses/create`
- **Body:**
```json
{
  "name": "Veri Yapıları",
  "code": "CS201",
  "semester": "Güz 2024",
  "department": "Bilgisayar Mühendisliği",
  "description": "Ders açıklaması",
  "learningOutcomes": [
    { "code": "ÖÇ1", "description": "Algoritma analizini anlama" }
  ],
  "programOutcomes": ["PÇ1", "PÇ2"],
  "midtermExam": {
    "examCode": "01",
    "questionCount": 10,
    "maxScorePerQuestion": 10
  },
  "finalExam": {
    "examCode": "02",
    "questionCount": 10,
    "maxScorePerQuestion": 10
  },
  "students": [
    { "studentNumber": "20231021", "fullName": "Ahmet Yılmaz" }
  ]
}
```
- **Response:** `{ success: true, course: {...} }`

#### GET All Courses
- **GET** `/api/courses`
- **Response:** `{ success: true, courses: [...] }`

#### GET Course by ID
- **GET** `/api/courses/:id`
- **Response:** `{ success: true, course: {...} }`

#### UPDATE Course
- **PUT** `/api/courses/:id`
- **Body:** Aynı create formatı (tüm field'lar optional)
- **Response:** `{ success: true, course: {...} }`

#### DELETE Course
- **DELETE** `/api/courses/:id`
- **Response:** `{ success: true, message: "Course deleted" }`

---

## 🗄️ Database Models

### Course Model (Embedded Structure)

```javascript
{
  name: String (required),
  code: String (required, unique),
  semester: String,
  department: String,
  description: String,
  
  learningOutcomes: [
    {
      code: String,
      description: String
    }
  ],
  
  programOutcomes: [String],
  
  midtermExam: {
    examCode: String,
    questionCount: Number,
    maxScorePerQuestion: Number
  },
  
  finalExam: {
    examCode: String,
    questionCount: Number,
    maxScorePerQuestion: Number
  },
  
  students: [
    {
      studentNumber: String,
      fullName: String
    }
  ],
  
  createdAt: Date,
  updatedAt: Date
}
```

**Önemli:** Course model'i **embedded structure** kullanıyor:
- `learningOutcomes` → Embedded array (ayrı collection değil)
- `students` → Embedded array
- `midtermExam` ve `finalExam` → Embedded objects

---

## 🤖 AI Processing Pipeline

### Endpoint: `/api/ai/process`

**POST** `/api/ai/process`
- **Content-Type:** `multipart/form-data`
- **Body:** `file` (PDF exam sheet)

### Pipeline Adımları:

1. **PDF → PNG Conversion** (`utils/pdfToPng.js`)
   - PDF sayfasını PNG buffer'a çevirir

2. **Marker Detection** (`utils/markerDetect.js`)
   - 4 siyah kare marker'ı tespit eder
   - OpenCV kullanır (fallback: error döndürür)
   - Koordinatlar: `topLeft`, `topRight`, `bottomLeft`, `bottomRight`

3. **Image Warping** (`utils/roiCrop.js`)
   - Perspective transform ile standardize eder
   - Boyut: 2480px × 3508px

4. **ROI Cropping** (`utils/roiCrop.js`)
   - Student Number ROI
   - Exam ID ROI
   - 10 Score Box ROI'leri

5. **Gemini Vision API** (`utils/geminiVision.js`)
   - Her ROI'yi Gemini'ye gönderir
   - Numeric değerleri extract eder

6. **Response Format:**
```json
{
  "success": true,
  "data": {
    "studentNumber": "20231021",
    "examId": "01",
    "answers": [
      { "questionNumber": 1, "score": 8 },
      { "questionNumber": 2, "score": 9 },
      ...
    ]
  }
}
```

---

## 🛠️ Utilities

### `pdfToPng.js`
- PDF → PNG conversion
- `pdf-poppler` kullanır

### `markerDetect.js`
- OpenCV ile marker detection
- Fallback: `{ success: false, reason: "opencv_missing" }`
- Crash etmez

### `roiCrop.js`
- Image warping (perspective transform)
- ROI cropping
- `sharp` kullanır

### `geminiVision.js`
- Gemini Vision API integration
- OCR için prompt'lar
- Numeric extraction

---

## 📦 Dependencies

### Core
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `cors` - CORS middleware
- `dotenv` - Environment variables

### File Processing
- `multer` - File upload handling
- `pdf-poppler` - PDF → PNG conversion
- `sharp` - Image processing

### AI
- `@google/generative-ai` - Gemini API

### Optional
- `opencv4nodejs` - Marker detection (optional dependency)

---

## 🔧 Configuration

### Port
- Default: `5000`
- Environment: `PORT=5001` (.env'de)
- **Not:** macOS'ta port 5000 Control Center tarafından kullanılıyor, bu yüzden 5001 kullanılıyor

### MongoDB
- Connection: `process.env.MONGODB_URI || process.env.MONGO_URI`
- Database: `mudekdb`

### CORS
- Tüm origin'lere açık (`cors()`)
- Production'da kısıtlanmalı

---

## 🎯 Ana Görevler

1. **Course Management**
   - Course CRUD operations
   - Embedded learning outcomes, students, exams
   - Full course object kaydetme/güncelleme

2. **AI Exam Processing**
   - PDF exam sheet'i işleme
   - Marker detection
   - OCR ile score extraction
   - JSON formatında data döndürme

3. **Data Consistency**
   - Embedded structure ile tutarlılık
   - Validation
   - Error handling

---

## 🐛 Error Handling

### Format
```json
{
  "error": "Error message here"
}
```

### Status Codes
- `200` - Success
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Server Error

---

## 📝 Notlar

1. **ES6 Modules:** Backend `"type": "module"` kullanıyor
2. **Embedded Structure:** Course model'i embedded arrays/objects kullanıyor
3. **OpenCV Optional:** Marker detection OpenCV olmadan da çalışır (fallback)
4. **Port Conflict:** macOS'ta port 5000 kullanılamaz, 5001 kullanılıyor

---

## 🚦 Test Endpoints

```bash
# Health Check
curl http://localhost:5001/api/health

# Get All Courses
curl http://localhost:5001/api/courses

# Create Course
curl -X POST http://localhost:5001/api/courses/create \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","code":"TEST","semester":"Güz","department":"Test","learningOutcomes":[{"code":"ÖÇ1","description":"Test"}],"programOutcomes":[],"midtermExam":{"examCode":"01","questionCount":10,"maxScorePerQuestion":10},"finalExam":{"examCode":"02","questionCount":10,"maxScorePerQuestion":10},"students":[{"studentNumber":"123","fullName":"Test"}]}'
```

---

## ✅ Mevcut Durum

- ✅ Backend çalışıyor (port 5001)
- ✅ Course CRUD endpoints hazır
- ✅ AI processing pipeline hazır
- ✅ MongoDB bağlantısı çalışıyor
- ✅ Error handling mevcut
- ✅ CORS yapılandırılmış

---

**Son Güncelleme:** Backend tamamen çalışır durumda ve production-ready.

