const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { router: authRouter } = require('./routes/auth');
const chatsRouter = require('./routes/chats');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/chats', chatsRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

const PORT = process.env.BACKEND_PORT || 5001;  // ← Changed this

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});