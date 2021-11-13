import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';

describe('update new ticket route', () => {
	it('has a route handler on /api/tickets patch request', async () => {
		const id = new mongoose.Types.ObjectId().toHexString();

		let res = await request(app).patch(`/api/tickets/${id}`).send();

		expect(res.statusCode).not.toEqual(404);
	});

	it('returns 404 for ticket not found', async () => {
		const id = new mongoose.Types.ObjectId().toHexString();

		let res = await request(app)
			.patch(`/api/tickets/${id}`)
			.set('Cookie', signIn('1'))
			.send({ title: 'title', price: 1 });

		expect(res.statusCode).toEqual(404);
	});

	it('can only be access if user is signed in', async () => {
		await request(app)
			.patch('/api/tickets/asd')
			.send({ title: 'title', price: 1 })
			.expect(401);
	});


	it('returns status other than 401 if the user is signed in', async () => {
		let cookie = signIn('1');
		const id = new mongoose.Types.ObjectId().toHexString();

		let res = await request(app)
			.patch(`/api/tickets/${id}`)
			.set('Cookie', cookie)
			.send({ title: 'title', price: 2 });

		expect(res.statusCode).not.toEqual(401);
	});

	it('responds with an error due to invalid title', async () => {
		let cookie = signIn('1');
		const id = new mongoose.Types.ObjectId().toHexString();

		await request(app)
			.patch(`/api/tickets/${id}`)
			.set('Cookie', cookie)
			.send({ title: '' })
			.expect(400);
	});

	it('responds with an error due to invalid price', async () => {
		let cookie = signIn('1');
		const id = new mongoose.Types.ObjectId().toHexString();

		await request(app)
			.patch(`/api/tickets/${id}`)
			.set('Cookie', cookie)
			.send({ price: 0 })
			.expect(400);
	});

	it('successfully updates a ticket', async () => {
		// check to make sure a ticket was saved
		let tickets = await Ticket.find({});

		expect(tickets.length).toEqual(0);
		let cookie = signIn('1');

		const title = 'title';
		const price = 20;
		let ticketRes = await request(app)
			.post('/api/tickets')
			.set('Cookie', cookie)
			.send({ price, title })
			.expect(201);

		expect(ticketRes.statusCode).toEqual(201);

		await request(app)
			.patch(`/api/tickets/${ticketRes.body.data.id}`)
			.set('Cookie', cookie)
			.send({ price: 10, title: 'new' })
			.expect(200);

		tickets = await Ticket.find({});

		expect(tickets.length).toEqual(1);
		expect(tickets[0].price).toEqual(10);
		expect(tickets[0].title).toEqual('new');
	});

	it('publishes an event', async () => {

		let tickets = await Ticket.find({});

		expect(tickets.length).toEqual(0);
		let cookie = signIn('1');

		const title = 'title';
		const price = 20;
		let ticketRes = await request(app)
			.post('/api/tickets')
			.set('Cookie', cookie)
			.send({ price, title })
			.expect(201);

		expect(ticketRes.statusCode).toEqual(201);

		await request(app)
			.patch(`/api/tickets/${ticketRes.body.data.id}`)
			.set('Cookie', cookie)
			.send({ price: 10, title: 'new' })
			.expect(200);

		tickets = await Ticket.find({});

		expect(natsWrapper.client.publish).toHaveBeenCalled();
	});
});
