import express, { Request, Response } from 'express';
import {
	BadRequestError,
	NotAuthorizedError,
	NotFoundError,
	OrderStatus,
	requireAuth,
	validateRequest,
} from '@invmtickets/common';
import { body } from 'express-validator';
import { Order } from '../models/order';
import { stripe } from '../stripe';
const router = express.Router();

router.post(
	'/',
	requireAuth,
	[
		body('token').not().isEmpty().withMessage('Must provide a token'),
		body('orderId').not().isEmpty().withMessage('Must provide order id'),
	],
	validateRequest,
	async (req: Request, res: Response) => {
		const { token, orderId } = req.body;

		const order = await Order.findById(orderId);

		if (!order) throw new NotFoundError();

		if (req.currentUser!.id !== order.userId) throw new NotAuthorizedError();

		if (order.status === OrderStatus.Cancelled)
			throw new BadRequestError('Can not pay for cancelled order');

		await stripe.charges.create({
			currency: 'usd',
			amount: order.price * 100,
			source: token,
			description: `Payment for order #${orderId} over at Tickets.io`,
			metadata: { orderId },
		});

		res.status(201).send({ success: true });
	}
);

export { router as makePaymentRoute };
