const express = require('express');
const router = express.Router();

const size_controller = require('../controllers/size.controller');

router.get('', size_controller.all_sizes);
router.get('/:sizeRef', size_controller.get_size);
router.post('', size_controller.submit_size);
router.put('/:sizeRef', size_controller.update);
router.delete('/:sizeRef', size_controller.delete);

module.exports = router;