import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { BadRequestError } from '../errors';
import { User } from '../models/user';
import jwt from 'jsonwebtoken';
import { validateRequest } from '../middleware';
import { PasswordManager } from '../utils/password-manager';

const router = express.Router();

router.post(
	'/signin',
	[
		body('email').isEmail().withMessage('Email must be valid'),
		body('password').trim().notEmpty().withMessage('You must supply a password')
	],
	validateRequest,
	async (req: Request, res: Response) => {
		const { email, password } = req.body;

		const existingUser = await User.findOne({ email });

		if (!existingUser) {
			throw new BadRequestError('Invalid credentials');
		}

		let passwordMatch = await PasswordManager.compare(existingUser.password, password);

		if (!passwordMatch) {
			throw new BadRequestError('Invalid credentials');
		}

		// generate jwt and store it on the request
		const userJwt = jwt.sign({ id: existingUser.id, email: existingUser.email }, process.env.JWT_KEY!);

		req.session = {
			jwt: userJwt
		};

		return res.status(200).send({ user: existingUser });
	}
);

export { router as signInRouter };
