import express, { Request, Response } from 'express';
import { requireAuth, validateRequest } from '@invmtickets/common';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';

const router = express.Router();

router.post(
	'/',
	requireAuth,
	[
		body('title').not().isEmpty().isLength({ max: 200, min: 1 }).withMessage('Title must not be empty'),
		body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0')
	],
	validateRequest,
	async (req: Request, res: Response) => {
		const { price, title } = req.body;

		let ticket = Ticket.build({ price, title, userId: req.currentUser!.id });

		await ticket.save();

		res.status(201).send({ ticket });
	}
);

export { router as createTicketRoute };
