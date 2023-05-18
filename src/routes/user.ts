import { Request, Response } from 'express';
import User, { validateUser } from '../models/user';
import { Router } from 'express';
const router = Router();

router.post('/', async (req: Request, res: Response) => {
	const { error } = validateUser(req.body);
	if (error) {
		return res.status(400).send({ error: error.details[0].message });
	}

	let user = await User.findOne({ email: req.body.email });
	if (user) {
		return res.status(400).send({ error: 'That user already exisits!' });
	} else {
		user = new User({
			name: req.body.name,
			email: req.body.email,
			password: req.body.password,
		});
		await user.save();
		return res.send(user);
	}
});

export default router;
