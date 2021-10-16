import express from 'express';

const router = express.Router();

router.get('/currentuser', (req, res) => {
	res.send('Hi!');
});

export { router as currentUserRouter };
