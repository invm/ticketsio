import express from 'express';
import { listTicketRoute } from './list';
import { createTicketRoute } from './new';
import { showTicketRoute } from './show';
import { updateTicketRoute } from './update';

const router = express.Router();

router.use([createTicketRoute, listTicketRoute, showTicketRoute, updateTicketRoute]);

export default router;
