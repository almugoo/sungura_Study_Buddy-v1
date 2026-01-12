const express = require('express');
const cors = require('cors');
const compression = require('compression');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Middleware
app.use(cors());
app.use(compression());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Sungura API is running 🐰');
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Simple Browser Test Page
app.get('/chat', (req, res) => {
  res.send(`
    <html>
      <body style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: auto;">
        <h1>Sungura AI Test Playground</h1>
        <p>Testing Model: <b>nvidia/nemotron-nano-9b-v2:free</b></p>
        <div id="chat" style="border: 1px solid #ccc; padding: 10px; height: 300px; overflow-y: scroll; margin-bottom: 10px; background: #f9f9f9;"></div>
        <input type="text" id="msg" placeholder="Ask Sungura..." style="width: 80%; padding: 10px;">
        <button onclick="send()" style="padding: 10px;">Send</button>
        <script>
          async function send() {
            const msg = document.getElementById('msg').value;
            const chat = document.getElementById('chat');
            chat.innerHTML += '<p><b>You:</b> ' + msg + '</p>';
            document.getElementById('msg').value = '';
            
            const res = await fetch('/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ message: msg, learningStyle: 'Visual', courseContext: 'General' })
            });
            const data = await res.json();
            chat.innerHTML += '<p style="color: blue;"><b>Sungura:</b> ' + data.response + '</p>';
            chat.scrollTop = chat.scrollHeight;
          }
        </script>
      </body>
    </html>
  `);
});

app.post('/chat', async (req, res) => {
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
    }

    const systemPrompt = `You are Sungura AI, a personalized study buddy for East African students. 
Personality: Encouraging and Patient.
Current Course: ${courseContext || 'General Study'}
Learning Style: ${learningStyle || 'Standard'}
${styleInstruction}
Always be helpful, culturally relevant to East Africa when possible, and focus on academic excellence. 
If an image is provided, perform OCR and explain the content.`;

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

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
