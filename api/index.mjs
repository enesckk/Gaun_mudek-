// Vercel Serverless Function wrapper for Express backend
// ES Module import (using .mjs extension for explicit ES module support)
// Backend klasörü build sırasında api/ içine kopyalanmalı

// Backend'i import et - api/backend/server.js'den import ediyoruz
import expressApp from './backend/server.js';

// Vercel serverless function handler
// Express app'i direkt export et, Vercel otomatik handle edecek
export default expressApp;

