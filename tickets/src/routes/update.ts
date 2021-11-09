import express, { Request, Response } from 'express';
import { NotAuthorizedError, NotFoundError, requireAuth, validateRequest } from '@invmtickets/common';
import { body, param } from 'express-validator';
import { Ticket } from '../models/ticket';

const router = express.Router();

router.patch(
	'/:id',
	requireAuth,
	[
		param('id').not().isEmpty().isMongoId().withMessage('Provide valid ticket id'),
		body('title').not().isEmpty().isLength({ max: 200, min: 1 }).withMessage('Title must not be empty'),
		body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0')
	],
	validateRequest,
	async (req: Request, res: Response) => {
		const { id } = req.params;
		const { price, title } = req.body;

		let ticket = await Ticket.findOne({ _id: id });

		if (!ticket) throw new NotFoundError();

		if (ticket.userId !== req.currentUser!.id) throw new NotAuthorizedError();

		await Ticket.updateOne(
			{ _id: id },
			{
				$set: {
					...(price && { price }),
					...(title && { title })
				}
			}
		);

		ticket = await Ticket.findOne({ _id: id });

		res.status(200).send({ data: ticket });
	}
);

export { router as updateTicketRoute };