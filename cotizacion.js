const db= require('./db.js'); 
// Obtener todos 
exports.getUsers= (req, res) => { 
db.query('SELECT FROM usuario', (err, rows)=> { 
if (err) throw err; 
res.json(rows); 
}); 
};