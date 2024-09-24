import express from 'express';
import {
    createAnnouncementFilter,
    getAnnouncementFilters,
    deleteAnnouncementFilter,
    getAllAnnouncementFilters
} from '../controllers/announcementFilter.controller.js';
import {verifyToken} from "../middleware/verifyToken.js";

const router = express.Router();

router.get('/',verifyToken ,getAnnouncementFilters);
router.post('/', createAnnouncementFilter);
router.delete('/:id', deleteAnnouncementFilter);
router.get('/all', getAllAnnouncementFilters);
export default router;