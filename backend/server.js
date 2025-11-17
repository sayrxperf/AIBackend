const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { router: authRouter } = require('./routes/auth');
const chatsRouter = require('./routes/chats');

const app = express();

// Update CORS to allow Vercel domain
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-vercel-app.vercel.app'  // ← Add your Vercel URL here
  ],
  credentials: true
}));

app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/chats', chatsRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});