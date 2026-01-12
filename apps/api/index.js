const express = require('express');
const cors = require('cors');
const compression = require('compression');
const OpenAI = require('openai');
require('dotenv').config();

console.log('Sungura API Initializing...');
if (process.env.OPENROUTER_API_KEY) {
  console.log(`API Key detected (starts with: ${process.env.OPENROUTER_API_KEY.substring(0, 10)}...)`);
} else {
  console.error('WARNING: OPENROUTER_API_KEY is missing!');
}

const app = express();
const PORT = process.env.PORT || 3000;

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  timeout: 60000, // 60 second timeout for slow free models
  maxRetries: 2,  // Retry on connection failures
});

// Middleware
app.use(cors());
app.use(compression());
app.use(express.json());

// Router
const router = express.Router();

// Routes
router.get('/', (req, res) => {
  res.send('Sungura API is running 🐰');
});

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    apiKeySet: !!process.env.OPENROUTER_API_KEY,
    url: req.url
  });
});

router.get('/debug', (req, res) => {
  res.json({
    env: process.env.NODE_ENV,
    apiKeySet: !!process.env.OPENROUTER_API_KEY,
    apiKeyPrefix: process.env.OPENROUTER_API_KEY ? process.env.OPENROUTER_API_KEY.substring(0, 10) : 'none',
    headers: req.headers,
    url: req.url,
    method: req.method,
    originalUrl: req.originalUrl
  });
});

// Simple Browser Test Page
router.get('/chat', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Sungura AI Playground</title>
        <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
        <style>
            body { font-family: 'Segoe UI', sans-serif; padding: 20px; max-width: 800px; margin: auto; background: #f0f2f5; }
            h1 { color: #6B4EFF; text-align: center; }
            #chat { border-radius: 12px; padding: 20px; height: 500px; overflow-y: auto; margin-bottom: 10px; background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .user-msg { background: #6B4EFF; color: white; padding: 10px 15px; border-radius: 15px 15px 0 15px; margin: 10px 0 10px auto; max-width: 80%; width: fit-content; }
            .ai-msg { background: #f0f0f0; color: #333; padding: 15px; border-radius: 15px 15px 15px 0; margin: 10px auto 10px 0; max-width: 80%; }
            .ai-msg p { margin: 0 0 10px; }
            .ai-msg h2, .ai-msg h3 { margin-top: 10px; color: #444; }
            .ai-msg ul { padding-left: 20px; }
            .input-area { display: flex; gap: 10px; }
            input { flex: 1; padding: 12px; border: 1px solid #ddd; border-radius: 25px; outline: none; }
            button { padding: 10px 25px; background: #6B4EFF; color: white; border: none; border-radius: 25px; cursor: pointer; font-weight: bold; }
            button:hover { opacity: 0.9; }
        </style>
      </head>
      <body>
        <h1>🐰 Sungura AI Playground</h1>
        <div id="chat"></div>
        <div class="input-area">
            <input type="text" id="msg" placeholder="Ask Sungura..." onkeypress="if(event.key==='Enter') send()">
            <button onclick="send()">Send</button>
        </div>
        <script>
          async function send() {
            const msgInput = document.getElementById('msg');
            const msg = msgInput.value;
            if (!msg) return;

            const chat = document.getElementById('chat');
            chat.innerHTML += '<div class="user-msg">' + msg + '</div>';
            msgInput.value = '';
            chat.scrollTop = chat.scrollHeight;
            
            try {
                const res = await fetch('/chat', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ message: msg, learningStyle: 'Visual', courseContext: 'General' })
                });
                const data = await res.json();
                
                // Render Markdown using marked
                const htmlContent = marked.parse(data.response);
                chat.innerHTML += '<div class="ai-msg">' + htmlContent + '</div>';
            } catch (err) {
                chat.innerHTML += '<div class="ai-msg" style="color:red">Error connecting to AI</div>';
            }
            chat.scrollTop = chat.scrollHeight;
          }
        </script>
      </body>
    </html>
  `);
});

router.post('/chat', async (req, res) => {
  const { message, image, courseContext, learningStyle } = req.body;

  if (!message && !image) {
    return res.status(400).json({ error: 'Message or image is required' });
  }

  try {
    let styleInstruction = "";
    if (learningStyle === 'Visual') {
      styleInstruction = "\n- Use Mermaid syntax for flowcharts (e.g., ```mermaid ... ```).";
      styleInstruction += "\n- Use Markdown tables to explain concepts visually.";
    } else if (learningStyle === 'Auditory') {
      styleInstruction = "\n- Use a conversational, rhythmic tone. Use metaphors and explain things in a way that sounds good when read aloud.";
    } else if (learningStyle === 'Reading/Writing') {
      styleInstruction = "\n- Use detailed written explanations with bullet points and numbered lists.";
    } else if (learningStyle === 'Kinesthetic') {
      styleInstruction = "\n- Give practical, hands-on examples. Suggest activities or exercises to try.";
    }

    const systemPrompt = `You are Sungura AI, a personalized study buddy for East African students.

## Personality
- Encouraging, patient, and culturally aware
- Use occasional Swahili greetings (Habari, Karibu, Hongera) when appropriate

## Current Context
- Course: ${courseContext || 'General Study'}
- Learning Style: ${learningStyle || 'Standard'}
${styleInstruction}

## Response Format Guidelines
- Use clear headings (## or ###) to organize your response
- Use bullet points for lists
- Use **bold** for key terms
- Keep paragraphs short (2-3 sentences max)
- Add blank lines between sections for readability
- If explaining a concept, structure it as: Definition → Explanation → Example

## Important
- Be concise but thorough
- Focus on academic excellence
- If an image is provided, describe and explain its content`;

    let userContent = [];
    if (message) {
      userContent.push({ type: "text", text: message });
    }
    if (image) {
      userContent.push({
        type: "image_url",
        image_url: { url: `data:image/jpeg;base64,${image}` }
      });
    }

    // Default to a multi-modal model if an image is sent
    const model = image ? "anthropic/claude-3-sonnet" : "nvidia/nemotron-nano-9b-v2:free";

    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent }
      ],
      temperature: 0.7,
    });

    res.json({
      response: completion.choices[0].message.content,
      usage: completion.usage
    });
  } catch (error) {
    console.error('Error calling OpenRouter:', error);
    res.status(500).json({ error: 'Failed to get response from AI' });
  }
});

// Mount router at root AND /api to handle Netlify rewrites correctly
// Mount router at root AND /api AND the internal Netlify function path
app.use('/', router);
app.use('/api', router);
app.use('/.netlify/functions/api', router);

// Export the app for serverless
module.exports.app = app;

// Only start the server if running locally (not imported)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
