import express from 'express';
import { currentUser } from '@invmtickets/common';

const router = express.Router();

router.get('/currentuser', currentUser, async (req, res) => {
	res.send({ currentUser: req.currentUser || null });
});

export { router as currentUserRouter };
