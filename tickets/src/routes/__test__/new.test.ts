import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';

describe('create new ticket route', () => {
	it('has a route handler on /api/tickets post request', async () => {
		let res = await request(app).post('/api/tickets').send();

		expect(res.statusCode).not.toEqual(404);
	});

	it('can only be access if usr is signed in', async () => {
		await request(app).post('/api/tickets').send().expect(401);
	});

	it('returns status other than 401 if the user is signed in', async () => {
		let cookie = signIn('1');

		let res = await request(app).post('/api/tickets').set('Cookie', cookie).send();

		expect(res.statusCode).not.toEqual(401);
	});

	it('responds with an error due to invalid title', async () => {
		let cookie = signIn('1');

		await request(app).post('/api/tickets').set('Cookie', cookie).send({ title: '' }).expect(400);
	});

	it('responds with an error due to invalid price', async () => {
		let cookie = signIn('1');

		await request(app).post('/api/tickets').set('Cookie', cookie).send({ price: 0 }).expect(400);
	});

	it('successfully creates a ticket', async () => {
		// check to make sure a ticket was saved
		let tickets = await Ticket.find({});

		expect(tickets.length).toEqual(0);
		let cookie = signIn('1');

		const title = 'title';
		const price = 20;

		await request(app).post('/api/tickets').set('Cookie', cookie).send({ price, title }).expect(201);
		
		tickets = await Ticket.find({});

		expect(tickets.length).toEqual(1);
		expect(tickets[0].price).toEqual(price);
		expect(tickets[0].title).toEqual(title);
	});
});
