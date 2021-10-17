import request from 'supertest';
import { app } from '../../app';

describe('signout route', () => {
	it('clears cookie after signout', async () => {
		await request(app)
			.post('/api/users/signup')
			.send({
				email: 'test@test.com',
				password: 'password'
			})
			.expect(201);

		const res = await request(app).post('/api/users/signout').send({}).expect(200);

		expect(res.get('Set-Cookie')).toBeDefined();
	});
});
