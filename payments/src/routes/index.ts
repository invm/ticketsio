import express from 'express';
import { makePaymentRoute } from './new';

const router = express.Router();

router.use([makePaymentRoute]);

export default router;
