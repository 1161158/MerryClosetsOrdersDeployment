const express = require('express');
const router = express.Router();

const order_controller = require('../controllers/order.controller');

router.get('/:orderRef', order_controller.get_order);
router.get('/:orderRef/state', order_controller.get_current_state);
router.post('', order_controller.submit_order);
router.put('/:orderRef/state', order_controller.update_state);
router.get('/client/:clientRef', order_controller.all_orders_by_client);
router.get('', order_controller.all_orders);
router.get('/:orderRef/states', order_controller.all_states);
router.put('/:orderRef/packaging', order_controller.add_packages);
router.get('/:orderRef/best_manufacture', order_controller.get_best_manufacture);
router.post('/:orderRef/manufacture', order_controller.add_manufacture);
module.exports = router;