const express = require('express');
const router = express.Router();
const manufacture_controller = require('../controllers/manufacture.controller');

router.post('', manufacture_controller.submit_manufacture);
router.get('/:factoryRef', manufacture_controller.get_manufacture);
router.get('', manufacture_controller.all_manufactures);
router.put('/:factoryRef', manufacture_controller.update);
router.delete('/:factoryRef', manufacture_controller.delete);
module.exports = router;