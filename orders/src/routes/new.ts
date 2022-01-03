import express, { Request, Response } from 'express';
import {
	BadRequestError,
	NotFoundError,
	OrderStatus,
	requireAuth,
	validateRequest,
} from '@invmtickets/common';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import { Order } from '../models/order';
import { OrderCreatedPublisher } from '../events/publishers/OrderCreatedPublisher';
import { natsWrapper } from '../nats-wrapper';
const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 15 * 60; // 15 minutes reservation in seconds

router.post(
	'/',
	requireAuth,
	[
		body('ticketId').not().isEmpty().withMessage('Ticket id must be provided'),
		// removed is mongoid, won't make assumptions about the type of the id
	],
	validateRequest,
	async (req: Request, res: Response) => {
		const { ticketId } = req.body;

		// find the ticket the user is trying to order in the database
		let ticket = await Ticket.findById(ticketId);

		if (!ticket) {
			throw new NotFoundError();
		}

		// make sure the ticket in not already reserved
		const isReserved = await ticket.isReserved();

		if (isReserved) {
			throw new BadRequestError('Ticket is already reserved');
		}

		// calculate the expiration date for this order
		let expiresAt = new Date();
		expiresAt.setSeconds(expiresAt.getSeconds() + EXPIRATION_WINDOW_SECONDS);

		// build the order and save
		const order = Order.build({
			userId: req.currentUser!.id,
			status: OrderStatus.Created,
			expiresAt,
			ticket,
		});

		await order.save();

		// publish an event that the order was created
		await new OrderCreatedPublisher(natsWrapper.client).publish({
			id: order.id,
			version: order.version,
			status: order.status,
			userId: order.userId,
			expiresAt: order.expiresAt.toISOString(),
			ticket: {
				id: ticket.id,
				price: ticket.price,
			},
		});

		res.status(201).send({ data: order });
	}
);

export { router as createOrderRoute };
