import request from 'supertest';
import { app } from '../../app';
import { randomBytes } from 'crypto';

export const createTicket = (cookie: string[]) =>
	request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({ price: Math.floor(Math.random() * 100), title: randomBytes(8).toString('hex') })
		.expect(201);

describe('retrieve ticket list route', () => {
	it('returns list of tickets', async () => {
		let cookie = signIn('1');
		await createTicket(cookie);
		await createTicket(cookie);
		await createTicket(cookie);
		await createTicket(cookie);

		let res = await request(app).get(`/api/tickets?offset=0&limit=10`).send().expect(200);

		expect(res.body.data.length).toEqual(4);
	});
});
