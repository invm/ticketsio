import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';

export const buildTicket = async () => {
	const ticket = Ticket.build({
		title: 'concert',
		price: 20,
	});
	await ticket.save();
	return ticket;
};

describe('retrieve order list route', () => {
	it('returns list of orders per user', async () => {
		let ticket1 = await buildTicket();
		let ticket2 = await buildTicket();
		let ticket3 = await buildTicket();

		const userOne = signIn('1');
		const userTwo = signIn('2');
		let {
			body: { data: orderOne },
		} = await request(app)
			.post('/api/orders')
			.set('Cookie', userOne)
			.send({ ticketId: ticket1.id })
			.expect(201);

		let {
			body: { data: orderTwo },
		} = await request(app)
			.post('/api/orders')
			.set('Cookie', userTwo)
			.send({ ticketId: ticket2.id })
			.expect(201);

		let {
			body: { data: orderThree },
		} = await request(app)
			.post('/api/orders')
			.set('Cookie', userTwo)
			.send({ ticketId: ticket3.id })
			.expect(201);

		let resUserOne = await request(app)
			.get(`/api/orders?offset=0&limit=10`)
			.set('Cookie', userOne)
			.send()
			.expect(200);

		expect(resUserOne.body.data.length).toEqual(1);
		expect(resUserOne.body.data[0].id).toEqual(orderOne.id);

		let resUserTwo = await request(app)
			.get(`/api/orders?offset=0&limit=10`)
			.set('Cookie', userTwo)
			.send()
			.expect(200);

		expect(resUserTwo.body.data.length).toEqual(2);
		expect(resUserTwo.body.data[0].id).toEqual(orderTwo.id);
		expect(resUserTwo.body.data[1].id).toEqual(orderThree.id);
	});
});
