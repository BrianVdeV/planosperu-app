const mysql = require('mysql2'); 
const connection = mysql.createConnection({ 
host: 'localhost', 
port: 3306, // <-- Agrega esta línea si tu MySQL corre en 3307 
user: 'root', 
password: '', 
database: 'react' 
}); 
connection.connect((err) => { 
if (err) throw err; 
console.log('✓ Conectado a MySQL'); 
}); 
module.exports = connection;