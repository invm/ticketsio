import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Ticket } from '../../models/ticket';
import { Order, OrderStatus } from '../../models/order';
import { natsWrapper } from '../../nats-wrapper';

describe('delete order route', () => {
	it('has a route handler on /api/orders delete request', async () => {
		const id = new mongoose.Types.ObjectId().toHexString();

		let res = await request(app).delete(`/api/orders/${id}`).send();

		expect(res.statusCode).not.toEqual(404);
	});

	it('returns 404 for order not found', async () => {
		const id = new mongoose.Types.ObjectId().toHexString();

		let res = await request(app)
			.delete(`/api/orders/${id}`)
			.set('Cookie', signIn('1'))
			.send();

		expect(res.statusCode).toEqual(404);
	});

	it('can only be access if user is signed in', async () => {
		await request(app).delete('/api/orders/asd').send().expect(401);
	});

	it('returns status other than 401 if the user is signed in', async () => {
		let cookie = signIn('1');
		const id = new mongoose.Types.ObjectId().toHexString();

		let res = await request(app)
			.delete(`/api/tickets/${id}`)
			.set('Cookie', cookie)
			.send();

		expect(res.statusCode).not.toEqual(401);
	});

	it('marks order as canceleed ', async () => {
		let ticket = Ticket.build({
			id: new mongoose.Types.ObjectId().toHexString(),
			title: 'concert',
			price: 20,
		});

		await ticket.save();
		const user = signIn('1');

		let {
			body: { data: order },
		} = await request(app)
			.post('/api/orders')
			.set('Cookie', user)
			.send({ ticketId: ticket.id })
			.expect(201);

		await request(app)
			.delete(`/api/orders/${order.id}`)
			.set('Cookie', user)
			.send()
			.expect(204);
		const updatedOrder = await Order.findById(order.id);

		expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
	});

	it('publishes an event', async () => {
		let ticket = Ticket.build({
			id: new mongoose.Types.ObjectId().toHexString(),
			title: 'concert',
			price: 20,
		});
		await ticket.save();

		await request(app)
			.post('/api/orders')
			.set('Cookie', signIn('1'))
			.send({ ticketId: ticket.id })
			.expect(201);

		expect(natsWrapper.client.publish).toHaveBeenCalled();
	});
});
