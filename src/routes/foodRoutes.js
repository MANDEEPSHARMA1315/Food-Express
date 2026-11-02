const express = require('express');
const router = express.Router();
const foodController = require('../controllers/foodController');

router.get('/menu', foodController.getMenu);
router.get('/food/:id', foodController.getFoodDetails);

module.exports = router;
