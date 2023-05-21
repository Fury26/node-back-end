import * as express from 'express';

type AuthUser = {
	id: string;
};
declare global {
	namespace Express {
		interface Request {
			authUser: AuthUser;
		}
	}
}
