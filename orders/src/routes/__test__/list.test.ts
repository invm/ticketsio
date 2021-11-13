import request from 'supertest';
import { app } from '../../app';

describe('retrieve ticket list route', () => {
	it('returns list of tickets', async () => {
		let res = await request(app)
			.get(`/api/orders?offset=0&limit=10`)
			.send()
			.expect(200);

		expect(res.body.data.length).toEqual(0);
	});
});
