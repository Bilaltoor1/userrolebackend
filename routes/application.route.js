import express from 'express';
import {
    createApplication, fetchApplicationById,
    fetchApplications, fetchHistoryofApplication,
    updateApplicationByAdvisor,
    updateApplicationByCoordinator
} from '../controllers/application.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { checkCoordinator } from '../middleware/checkCoordinator.js';

const router = express.Router();
router.get('/', verifyToken, fetchApplications);
router.post('/', verifyToken, createApplication);
router.patch('/advisor/:id', verifyToken, updateApplicationByAdvisor);
router.patch('/coordinator/:id', verifyToken, checkCoordinator, updateApplicationByCoordinator);
router.get('/history', verifyToken, fetchHistoryofApplication);
router.get('/:id', verifyToken, fetchApplicationById);
export default router;