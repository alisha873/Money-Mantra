const express = require ('express');
const http = require('http');
const routes=require('./routes.js')
const cors = require('cors');

const app=express();

app.use(cors({
  origin: ['https://moneymatra.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

//middlewares - to parse data and handle form requests
app.use(express.json());
app.use(express.urlencoded({extended:true}));

//routes
app.use('/api',routes);

app.get('/', (req, res) => {
  res.send('Money Mantra backend is running!');
});

const PORT= process.env.PORT;
app.listen(PORT,()=>{
    console.log(`Server running on PORT ${PORT}`);
});

