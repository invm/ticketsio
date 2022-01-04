import { OrderStatus } from '@invmtickets/common';
import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import mongoose from 'mongoose';
import { stripe } from '../../stripe';

describe('make payment route', () => {
	it('returns 404 when purchasing an order that does not exist', async () => {
		let res = await request(app)
			.post('/api/payments')
			.set('Cookie', signIn('1'))
			.send({
				token: '1',
				orderId: new mongoose.Types.ObjectId().toHexString(),
			});

		expect(res.statusCode).toEqual(404);
	});

	it('returns 401 when purchasing an order that does not belong to the user', async () => {
		const order = Order.build({
			id: new mongoose.Types.ObjectId().toHexString(),
			userId: '1',
			version: 0,
			price: 20,
			status: OrderStatus.Created,
		});

		await order.save();

		await request(app)
			.post('/api/payments')
			.set('Cookie', signIn('2'))
			.send({ token: '1', orderId: order.id })
			.expect(401);
	});

	it('returns 400 when purchasing a cancelled order', async () => {
		const order = Order.build({
			id: new mongoose.Types.ObjectId().toHexString(),
			userId: '1',
			version: 0,
			price: 20,
			status: OrderStatus.Cancelled,
		});

		await order.save();

		await request(app)
			.post('/api/payments')
			.set('Cookie', signIn('1'))
			.send({ token: '1', orderId: order.id })
			.expect(400);
	});

	it('returns 401 if order does not belong to user', async () => {
		const order = Order.build({
			id: new mongoose.Types.ObjectId().toHexString(),
			userId: '1',
			version: 0,
			price: 20,
			status: OrderStatus.Cancelled,
		});

		await order.save();

		await request(app)
			.post('/api/payments')
			.set('Cookie', signIn('2'))
			.send({ token: '1', orderId: order.id })
			.expect(401);
	});

	it('returns 200 when makes a charge', async () => {
    // makes an actual api call to stripe with the token in the .env file
		const price = Math.floor(Math.random() * 100000);
		const order = Order.build({
			id: new mongoose.Types.ObjectId().toHexString(),
			userId: '1',
			version: 0,
			price,
			status: OrderStatus.Created,
		});

		await order.save();

		await request(app)
			.post('/api/payments')
			.set('Cookie', signIn('1'))
			.send({ token: 'tok_visa', orderId: order.id })
			.expect(201);

		const stripeCharges = await stripe.charges.list({ limit: 50 });
		const stripeCharge = stripeCharges.data.find(
			(v) => v.metadata?.orderId === order.id
		);

		expect(stripeCharge).toBeDefined();
		expect(stripeCharge!.currency).toEqual('usd');
	});
});
