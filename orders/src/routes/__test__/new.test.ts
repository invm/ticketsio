import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/ticket';
import { OrderStatus } from '@invmtickets/common';
import { Order } from '../../models/order';

describe('create new order route', () => {
	it('has a route handler on /api/orders post request', async () => {
		let res = await request(app).post('/api/orders').send();

		expect(res.statusCode).not.toEqual(404);
	});

	it('can only be access if usr is signed in', async () => {
		await request(app).post('/api/orders').send().expect(401);
	});

	it('returns status other than 401 if the user is signed in', async () => {
		let cookie = signIn('1');

		let res = await request(app)
			.post('/api/tickets')
			.set('Cookie', cookie)
			.send();

		expect(res.statusCode).not.toEqual(401);
	});

	it('returns an error if the ticket does not exist', () => {
		let cookie = signIn('1');

		return request(app)
			.post('/api/orders')
			.set('Cookie', cookie)
			.send({ ticketId: new mongoose.Types.ObjectId() })
			.expect(404);
	});

	it('return an error if the ticket is already reserved', async () => {
		let ticket = Ticket.build({
			title: 'concert',
			price: 20,
		});
		await ticket.save();

		const order = Order.build({
			ticket,
			userId: '1',
			status: OrderStatus.Created,
			expiresAt: new Date(),
		});

		await order.save();

		return request(app)
			.post('/api/orders')
			.set('Cookie', signIn('1'))
			.send({ ticketId: ticket.id })
			.expect(400);
	});

	it('reserves a ticket', async () => {
		let ticket = Ticket.build({
			title: 'concert',
			price: 20,
		});
		await ticket.save();

		return request(app)
			.post('/api/orders')
			.set('Cookie', signIn('1'))
			.send({ ticketId: ticket.id })
			.expect(201);
	});

	it.todo('publishes an event');
});
