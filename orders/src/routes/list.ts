import express, { Request, Response } from 'express';
import {
	BadRequestError,
	requireAuth,
	validateRequest,
} from '@invmtickets/common';
import { query } from 'express-validator';
import { Order } from '../models/order';

const router = express.Router();

router.get(
	'/',
	requireAuth,
	[
		query('offset')
			.not()
			.isEmpty()
			.toInt()
			.isInt({ min: 0 })
			.withMessage('Offset must be equals to greater than 0'),
		query('limit')
			.not()
			.isEmpty()
			.toInt()
			.isInt({ min: 1 })
			.withMessage('Limit must be greater than 0'),
	],
	validateRequest,
	async (req: Request, res: Response) => {
		const { offset, limit } = req.query;

		if (typeof offset !== 'number' || typeof limit !== 'number') {
			throw new BadRequestError('Invalid offset or limit');
		}
		let orders = await Order.find({
			userId: req.currentUser!.id,
		})
			.skip(offset)
			.limit(limit)
			.populate('ticket');

		res.status(200).send({ data: orders });
	}
);

export { router as listOrderRoute };
