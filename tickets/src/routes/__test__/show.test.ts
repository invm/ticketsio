import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';

describe('retrieve ticket route', () => {
	it('returns 404 if ticket not found', async () => {
		const id = new mongoose.Types.ObjectId().toHexString();
		await request(app).get(`/api/tickets/${id}`).send().expect(404);
	});

	it('returns ticket if ticket was found', async () => {
		let cookie = signIn('1');

		const title = 'title';
		const price = 20;

		let ticketRes = await request(app)
			.post('/api/tickets')
			.set('Cookie', cookie)
			.send({ price, title })
			.expect(201);

		expect(ticketRes.statusCode).toEqual(201);

		let res = await request(app).get(`/api/tickets/${ticketRes.body.data.id}`).set('Cookie', cookie).send();

		expect(res.statusCode).toEqual(200);
		expect(res.body.data.id).toEqual(ticketRes.body.data.id);
	});
});
