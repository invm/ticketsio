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
import { OrderCancelledPublisher } from '../events/publishers/OrderCancelledPublisher';
import { natsWrapper } from '../nats-wrapper';

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

		await new OrderCancelledPublisher(natsWrapper.client).publish({
			id: order.id,
			version: order.version,
			ticket: {
				id: order.ticket.id,
			},
		});
		res.status(200).send();
	}
);

export { router as deleteOrderRoute };
