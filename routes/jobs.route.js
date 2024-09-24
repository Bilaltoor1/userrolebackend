import express from 'express';
import { createJob, getJobs, updateJob, deleteJob } from '../controllers/jobs.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { checkCoordinator } from '../middleware/checkCoordinator.js';
const router = express.Router();

router.get('/', verifyToken, getJobs);
router.post('/', verifyToken, checkCoordinator,createJob);
router.patch('/:id', verifyToken, checkCoordinator, updateJob);
router.delete('/:id', verifyToken, checkCoordinator, deleteJob);

export default router;