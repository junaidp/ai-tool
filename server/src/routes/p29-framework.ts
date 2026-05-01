import express from 'express';
import { generateP29Framework } from '../services/p29-generator';

const router = express.Router();

router.post('/generate', async (req, res) => {
  try {
    const profile = req.body;
    
    console.log('Generating P29 Framework for:', profile.organisationName);
    
    const result = await generateP29Framework(profile);
    
    res.json(result);
  } catch (error: any) {
    console.error('Error generating P29 framework:', error);
    res.status(500).json({ 
      error: 'Failed to generate framework',
      message: error.message 
    });
  }
});

export default router;
