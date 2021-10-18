import express, { Request, Response } from 'express';
import { NotFoundError, validateRequest } from '@invmtickets/common';
import { param } from 'express-validator';
import { Ticket } from '../models/ticket';

const router = express.Router();

router.get(
	'/:id',
	[param('id').not().isEmpty().isMongoId().withMessage('Provide valid ticket id')],
	validateRequest,
	async (req: Request, res: Response) => {
		const { id } = req.params;

		let ticket = await Ticket.findOne({ _id: id });
		if (!ticket) {
			throw new NotFoundError();
		}

		res.status(200).send({ data: ticket });
	}
);

export { router as showTicketRoute };
