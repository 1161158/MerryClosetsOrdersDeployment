const express = require('express');
const router = express.Router();

const city_controller = require('../controllers/city.controller');

router.get('', city_controller.all_cities);
router.get('/:latitude&:longitude',city_controller.get_city);
router.post('', city_controller.submit_city);
router.delete('/:latitude&:longitude', city_controller.delete);

module.exports = router;