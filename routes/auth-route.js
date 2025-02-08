import { Router } from 'express';
import { register, login, getAllUsers, getRemainingUsersInOrganization } from '../controller/auth-controller.js';
import { authMiddleware } from '../middleware/auth-middleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/users', authMiddleware, getAllUsers);
router.get('/organizations/:orgId/remaining-users', authMiddleware, getRemainingUsersInOrganization);

export const authRoutes = router;