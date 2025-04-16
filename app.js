const express = require('express'); 
const bodyParser = require('body-parser'); 
const cors = require('cors'); 
const userRoutes = require('./cotizacion-route.js') 
const app =express(); 
const PORT = 3000; 
app.use(cors()); 
app.use(bodyParser.json()); 
app.use('/api/cotizacion', userRoutes); 
app.listen(PORT, () => { 
console.log(`Servidor corriendo en http://localhost:${PORT}`); 
});