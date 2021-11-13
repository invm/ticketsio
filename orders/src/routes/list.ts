import express, { Request, Response } from 'express';
import { BadRequestError, validateRequest } from '@invmtickets/common';
import { query } from 'express-validator';
import { Ticket } from '../models/ticket';

const router = express.Router();

router.get(
	'/',
	[
		query('offset')
			.not()
			.isEmpty()
			.toInt()
			.isInt({ min: 0 })
			.withMessage('Offset must be equals to greater than 0'),
		query('limit').not().isEmpty().toInt().isInt({ min: 1 }).withMessage('Limit must be greater than 0')
	],
	validateRequest,
	async (req: Request, res: Response) => {
		const { offset, limit } = req.query;

		if (typeof offset !== 'number' || typeof limit !== 'number')
			throw new BadRequestError('Invalid offset or limit');

		let tickets = await Ticket.find({})
			.skip(offset * limit)
			.limit(limit);

		res.status(200).send({ data: tickets });
	}
);

export { router as listOrderRoute };
