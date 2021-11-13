import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Ticket } from '../../models/ticket';

describe('retrieve order route', () => {
	it('returns 404 if order not found', async () => {
		const id = new mongoose.Types.ObjectId().toHexString();
		await request(app)
			.get(`/api/orders/${id}`)
			.set('Cookie', signIn('1'))
			.send()
			.expect(404);
	});

	it('returns an error if a user tries to fetch other users order', async () => {
		let ticket = Ticket.build({
			title: 'concert',
			price: 20,
		});

		await ticket.save();
		const user = signIn('1');

		let createdOrderRes = await request(app)
			.post('/api/orders')
			.set('Cookie', user)
			.send({ ticketId: ticket.id })
			.expect(201);

		await request(app)
			.get(`/api/orders/${createdOrderRes.body.data.id}`)
			.set('Cookie', signIn('2'))
			.send()
			.expect(401);
	});

	it('returns an order if ticket was found', async () => {
		let ticket = Ticket.build({
			title: 'concert',
			price: 20,
		});

		await ticket.save();
		const user = signIn('1');

		let createdOrderRes = await request(app)
			.post('/api/orders')
			.set('Cookie', user)
			.send({ ticketId: ticket.id });

		expect(createdOrderRes.statusCode).toEqual(201);

		let res = await request(app)
			.get(`/api/orders/${createdOrderRes.body.data.id}`)
			.set('Cookie', user)
			.send();

		expect(createdOrderRes.statusCode).toEqual(201);
		expect(createdOrderRes.body.data.id).toEqual(res.body.data.id);
	});
});
