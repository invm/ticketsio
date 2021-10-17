import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { BadRequestError } from '../errors';
import { validateRequest } from '../middleware';
import { User } from '../models/user';

const router = express.Router();

router.post(
	'/signup',
	[
		body('email').isEmail().withMessage('Email must be valid'),
		body('password')
			.trim()
			.isLength({ min: 4, max: 20 })
			.withMessage('Password must be between 4 and 20 characters')
	],
	validateRequest,
	async (req: Request, res: Response) => {
		const { email, password } = req.body;

		const existingUser = await User.findOne({ email });

		if (existingUser) {
			throw new BadRequestError('Email is use');
		}

		const user = User.build({ email, password });

		await user.save();

		// generate jwt and store it on the request
		const userJwt = jwt.sign({ _id: user._id, email: user.email }, process.env.JWT_KEY!);

		req.session = {
			jwt: userJwt
		};

		return res.status(201).send({ user });
	}
);

export { router as signUpRouter };
