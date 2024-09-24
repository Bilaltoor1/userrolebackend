import express from 'express'
import {
    getUser,
    login,
    logout,
    signup,
    isAdmin,
    updateProfileSetup,
    updateUser, changePassword, getAllTeachers, getStudentsWithoutBatch
} from "../controllers/user.controller.js";
import {verifyToken} from "../middleware/verifyToken.js";
import {checkCoordinator} from "../middleware/checkCoordinator.js";

const router = express.Router()

router.post('/signup',signup)
router.post('/login',login)
router.post('/logout',logout)
router.get('/get-user',verifyToken,getUser)
router.post('/profile-setup',verifyToken,updateProfileSetup)
router.get('/is-admin',verifyToken,isAdmin)
router.patch('/update-user', verifyToken, updateUser);
router.post('/change-password', verifyToken, changePassword);
router.get('/teachers', verifyToken, checkCoordinator, getAllTeachers);
router.get('/students-without-batch', verifyToken, checkCoordinator, getStudentsWithoutBatch);
export default router