import request from 'supertest';
import { app } from '../../app';

describe('current user route', () => {
	it('responds with details about the current user', async () => {
		const cookie = await signIn();

		const res = await request(app).get('/api/users/currentuser').set('Cookie', cookie).send().expect(200);

		expect(res.body.currentUser.email).toEqual('test@test.com');
	});

	it('responds with null if not authenticated', async () => {
		const res = await request(app).get('/api/users/currentuser').send().expect(200);

		expect(res.body.currentUser).toEqual(null);
	});
});
