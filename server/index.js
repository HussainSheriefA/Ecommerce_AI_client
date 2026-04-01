require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { connectDB } = require('./db/db');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to EcommerceAI API'
  });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    
    const server = app.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
    
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        console.log(`💡 Try: Get-Process -Name node | Stop-Process -Force`);
        process.exit(1);
      }
      console.error('Server error:', err.message);
    });
    
  } catch (err) {
    console.error('Server start failed:', err.message);
    process.exit(1);
  }
};

startServer();