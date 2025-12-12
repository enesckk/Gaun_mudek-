// Vercel Serverless Function wrapper for Express backend
// Backend klasörü installCommand ile api/backend/ içine kopyalanıyor
// Vercel @vercel/node builder Express app'i otomatik handle ediyor

// Backend'i import et
import expressApp from './backend/server.js';

// Vercel serverless function handler
// @vercel/node Express app'i otomatik olarak handler'a çeviriyor
export default expressApp;

