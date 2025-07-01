const express = require('express');
const http = require('http');
const routes = require('./routes.js');
const cors = require('cors');

const app = express();

// Enhanced CORS setup with debugging
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://moneymatra.vercel.app',
      'http://localhost:5500',
      'http://localhost:3000',
    ];
    
    console.log('CORS Origin Check:', origin);
    console.log('Allowed Origins:', allowedOrigins);
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      console.log('No origin - allowing');
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      console.log('Origin allowed:', origin);
      callback(null, true);
    } else {
      console.log('Origin blocked:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma'
  ],
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}));

// Add preflight debugging middleware
app.options('*', (req, res) => {
  console.log('OPTIONS request received:', {
    origin: req.headers.origin,
    method: req.method,
    headers: req.headers
  });
  res.status(200).end();
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Request headers:', req.headers);
  next();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Money Mantra backend is running!',
    cors: 'enabled',
    timestamp: new Date().toISOString()
  });
});

// Test CORS endpoint
app.get('/api/test-cors', (req, res) => {
  res.json({ 
    message: 'CORS test successful!',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  if (err.message === 'Not allowed by CORS') {
    res.status(403).json({ 
      error: 'CORS policy violation',
      origin: req.headers.origin,
      allowedOrigins: [
        'https://moneymatra.vercel.app',
        'http://localhost:5500',
        'http://localhost:3000'
      ]
    });
  } else {
    res.status(500).json({ 
      error: 'Internal server error',
      message: err.message 
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
  console.log('CORS enabled for origins:', [
    'https://moneymatra.vercel.app',
    'http://localhost:5500',
    'http://localhost:3000'
  ]);
});
