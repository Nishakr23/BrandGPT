import express from 'express';
import OpenAI from 'openai';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

const client = new OpenAI({
  baseURL: "https://models.inference.ai.azure.com",
  apiKey: process.env.GITHUB_TOKEN
});

app.post('/api/generate', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!process.env.GITHUB_TOKEN) {
      return res.status(500).json({ error: "GitHub Token missing..env file check karo" });
    }

    if (!prompt) {
      return res.status(400).json({ error: "Brand description likho pehle" });
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are BrandGPT, an expert branding AI. For any business description, provide: 1) Three creative brand names, 2) Three catchy taglines, 3) One 2-sentence marketing pitch. Use markdown bold for headings."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 600
    });

    res.json({
      success: true,
      text: completion.choices[0].message.content
    });

  } catch (error) {
    console.error("API Error:", error.message);
    res.status(500).json({
      error: "AI se connect nahi ho paaya",
      message: error.message
    });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 BrandGPT Pro running at http://localhost:${PORT}`);
  console.log(`Token: ${process.env.GITHUB_TOKEN? '✅ Ready' : '❌ Missing'}\n`);
});