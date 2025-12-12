// Vercel Serverless Function wrapper for Express backend
// ES Module import (using .mjs extension for explicit ES module support)
// Note: Backend dependencies should be in api/node_modules (via api/package.json)

// Backend'i import et - Vercel backend klasörünü otomatik dahil edecek
import expressApp from '../backend/server.js';

// Vercel serverless function handler
// Express app'i direkt export et, Vercel otomatik handle edecek
export default expressApp;

