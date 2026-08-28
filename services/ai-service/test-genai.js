require('dotenv').config({ path: '../../.env' });
const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
ai.models.generateContent({model: 'gemini-3.6-flash', contents: 'hi'})
  .then(r => console.log('Response:', r.text))
  .catch(e => console.error('Error:', e));
