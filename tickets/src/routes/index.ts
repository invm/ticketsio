import { createTicketRoute } from './new';

import express from 'express';

const router = express.Router();

router.use([createTicketRoute]);

export default router;
