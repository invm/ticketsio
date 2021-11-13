import express, { Request, Response } from 'express';
import {
	NotFoundError,
	requireAuth,
	validateRequest,
	NotAuthorizedError,
} from '@invmtickets/common';
import { param } from 'express-validator';
import { Order } from '../models/order';

const router = express.Router();

router.get(
	'/:id',
	requireAuth,
	[
		param('id')
			.not()
			.isEmpty()
			.isMongoId()
			.withMessage('Provide valid ticket id'),
	],
	validateRequest,
	async (req: Request, res: Response) => {
		const { id } = req.params;

		let order = await Order.findOne({ _id: id });
		if (!order) {
			throw new NotFoundError();
		}
		if (order.userId !== req.currentUser!.id) {
			throw new NotAuthorizedError();
		}

		res.status(200).send({ data: order });
	}
);

export { router as showOrderRoute };
