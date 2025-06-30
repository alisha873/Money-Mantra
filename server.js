const express = require ('express');
const http = require('http');
const routes=require('./routes.js')
const cors = require('cors');

const app=express();

app.use(cors({
    origin: ['http://127.0.0.1:5500', 'http://127.0.0.1:8080', 'http://localhost:5500', 'http://localhost:8080'],
    credentials: true
}));
//middlewares - to parse data and handle form requests
app.use(express.json());
app.use(express.urlencoded({extended:true}));

//routes
app.use('/api',routes);

const PORT= 3000;
app.listen(PORT,()=>{
    console.log("Server running on PORT 3000");
});