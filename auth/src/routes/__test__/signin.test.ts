import request from 'supertest';
import { app } from '../../app';

describe('signin route', () => {
	it('returns cookie on successful signin', async () => {
		await request(app)
			.post('/api/users/signup')
			.send({
				email: 'test@test.com',
				password: 'password'
			})
			.expect(201);

		const res = await request(app)
			.post('/api/users/signin')
			.send({
				email: 'test@test.com',
				password: 'password'
			})
			.expect(200);

		expect(res.get('Set-Cookie')).toBeDefined();
	});

	it('returns 400 on invalid email', async () => {
		return request(app)
			.post('/api/users/signin')
			.send({
				email: 'test@test.com',
				password: 'password'
			})
			.expect(400);
	});
});
