import { User } from './src/routers/auth';
import { VocUser } from './src/helpers/auth/types';
import { OrganizationAccount } from './src/entity/organization-account.entity';
import { Entitlement} from './src/entity/app/src/entity/user-org-account.entity';

declare global {
	namespace Express {
		interface Request {
			authUser: VocUser;
			orgAccount: OrganizationAccount;
			userOrgAccountProps: {
				settings: string | {},
				permissions: Entitlement.permissions,
			}
		}
	}
}
