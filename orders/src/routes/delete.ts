import express, { Request, Response } from 'express';
import {
	NotAuthorizedError,
	NotFoundError,
	OrderStatus,
	requireAuth,
	validateRequest,
} from '@invmtickets/common';
import { param } from 'express-validator';
import { Order } from '../models/order';

const router = express.Router();

router.delete(
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

		if (!order) throw new NotFoundError();
		if (order.userId !== req.currentUser!.id) {
			throw new NotAuthorizedError();
		}
		order.status = OrderStatus.Cancelled;
		await order.save();

		res.status(204).send();
	}
);

export { router as deleteOrderRoute };
