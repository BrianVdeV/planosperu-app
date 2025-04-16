const express = require('express'); 
const router= express.Router(); 
const userController = require('./cotizacion.js'); 
router.get('/', userController.getUsers); 

module.exports = router;