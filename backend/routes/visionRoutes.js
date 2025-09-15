import express from 'express';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import upload from '../upload.js';

const router = express.Router();

// Creates a client
const client = new ImageAnnotatorClient({
  keyFilename: './google-credentials.json'
});

router.post('/extract-text', upload, async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  try {
    // Performs text detection on the local file
    const [result] = await client.textDetection(req.file.path);
    const detections = result.textAnnotations;
    const fullText = detections.length > 0 ? detections[0].description : '';
    
    res.json({ text: fullText });
  } catch (err) {
    console.error('GOOGLE_VISION_ERROR:', err);
    res.status(500).json({ 
      message: 'Error processing image with Google Vision.',
      error: err.message 
    });
  }
});

export default router;
