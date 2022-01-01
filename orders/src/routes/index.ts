import express from 'express';
import { listOrderRoute } from './list';
import { createOrderRoute } from './new';
import { showOrderRoute } from './show';
import { deleteOrderRoute } from './delete';

const router = express.Router();

router.use([createOrderRoute, listOrderRoute, showOrderRoute, deleteOrderRoute]);

export default router;
