import { currentUserRouter } from './current-user';
import { signInRouter } from './signin';
import { signOutRouter } from './signout';
import { signUpRouter } from './signup';

import express from 'express';

const router = express.Router();

router.use([currentUserRouter, signUpRouter]);

export default router;
