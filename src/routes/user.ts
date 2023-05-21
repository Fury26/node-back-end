import { Request, Response, Router } from 'express';
import User from '../models/user';
import { authorizationMiddleware } from '../middleware/auth';
const router = Router();

router.use(authorizationMiddleware);
router.get('/me', async (req: Request, res: Response) => {
	try {
		const user = await User.findById(req.authUser.id);
		if (!user) {
			return res.json({ error: `Can't get user information` }).status(404);
		}
		res.json({ user });
	} catch {
		res.json({ error: `Can't get user information` }).status(400);
	}
	return;
});

export default router;
