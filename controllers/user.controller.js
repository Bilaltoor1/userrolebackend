import bcrypt from 'bcrypt';
import UserModel from "../models/user.model.js";
import { generateTokenAndSetCookie } from "../GenerateTokenAndSetCookie.js";
import Batch from "../models/batch.model.js";
const signup = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = new UserModel({
            name,
            email,
            password: hashedPassword,
            role,
            profileSetup: false,
            identityConfirmed: role === 'student'
        });

        await newUser.save();

        if (role === 'student') {
            generateTokenAndSetCookie(res, newUser);
        }

        res.status(201).json({
            message: 'User registered successfully',
            user: newUser
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        if (!user.identityConfirmed && user.role !== 'student') {
            return res.status(403).json({ message: 'Identity not confirmed by admin' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        generateTokenAndSetCookie(res, user);

        res.status(200).json({
            message: 'Login successful',
            user: user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};

const logout = (req, res) => {
    try {
        res.clearCookie('token');
        res.status(200).json({message: 'Logged out successfully'});
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({message: 'Logout failed'});
    }}

export const getAllTeachers = async (req, res) => {
    try {
        const teachers = await UserModel.find({ role: 'teacher' });
        res.status(200).json(teachers);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};
const getUser = async (req, res) => {
    try {
        let query = UserModel.findOne({ _id: req.user._id });

        if (req.user.role === 'student') {
            query = query.populate({
                path: 'batch',
                select: 'name',
                match: { students: req.user._id } // Ensure user is in batch.students
            });
        }

        const user = await query;

        if (!user) {
            return res.status(404).json({ message: "User Not Found" });
        }
        const userWithBatch = user.toObject();
        if (user.batch) {
            userWithBatch.batchName = user.batch.name;
        }
        // console.log('user with batch',userWithBatch)
        res.status(200).json({ user: userWithBatch });
    } catch (e) {
        res.status(500).json({ message: "Something went wrong, please try again later" });
    }
};
    const isAdmin = async (req, res) => {
        const user = await UserModel.findOne({_id: req.userId});
        console.log(user);
        try {
            if (user.role === 'admin') {
                res.status(200).json({
                    isAdmin: true
                });
            }
        } catch (e) {
            res.status(404).json({
                message: "User Not Found"
            });
        }
    };
const updateProfileSetup = async (req, res) => {
    try {
        const { userId, profileData } = req.body;
        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role === 'student') {
            const { batchId } = profileData;
            const batch = await Batch.findById(batchId);
            if (batch) {
                batch.students.push(user._id);
                await batch.save();
                profileData.batchName = batch.name; // Add batchName to profileData
            }
        }

        Object.assign(user, profileData);
        user.profileSetup = true;
        await user.save();

        generateTokenAndSetCookie(res, user);

        res.status(200).json({
            message: 'Profile setup completed successfully',
            user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};
// const updateProfileSetup = async (req, res) => {
//     try {
//         const { userId, profileData } = req.body;
//         const user = await UserModel.findById(userId);
//
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }
//
//         if (user.role === 'student') {
//             const { batchId } = profileData;
//             console.log(batchId)
//             const batch = await Batch.findById(batchId);
//             if (batch) {
//                 batch.students.push(user._id);
//                 await batch.save();
//             }
//         }
//
//         Object.assign(user, profileData);
//         user.profileSetup = true;
//         await user.save();
//
//         generateTokenAndSetCookie(res, user);
//
//         res.status(200).json({
//             message: 'Profile setup completed successfully',
//             user
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Something went wrong, please try again later' });
//     }
// };

const updateUser = async (req, res) => {
    try {
        const { userId, ...profileData } = req.body;
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (profileData.password) {
            profileData.password = await bcrypt.hash(profileData.password, 12);
        }

        if (user.role === 'student') {
            const { batchId } = profileData;
            const batch = await Batch.findById(batchId);
            if (batch) {
                batch.students.push(user._id);
                await batch.save();
            }
        }

        Object.assign(user, profileData);
        await user.save();
        console.log('updated user', user);

        generateTokenAndSetCookie(res, user);

        res.status(200).json({
            message: 'User updated successfully',
            user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};

 const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    try {
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
// const getStudentsWithoutBatch = async (req, res) => {
//     try {
//         const students = await UserModel.find({ role: 'student', $or: [{ batch: { $exists: false } }, { batch: null }] });
//         console.log('students', students);
//         res.status(200).json(students);
//     } catch (error) {
//         console.error('Error fetching students without batch:', error);
//         res.status(500).json({ message: 'Something went wrong, please try again later' });
//     }
// };
const getStudentsWithoutBatch = async (req, res) => {
    try {
        // Fetch all batches and extract student IDs
        const batches = await Batch.find({}, 'students');
        const studentIdsInBatches = batches.flatMap(batch => batch.students);

        // Find students who are not in any batch
        const studentsWithoutBatch = await UserModel.find({
            role: 'student',
            _id: { $nin: studentIdsInBatches }
        });

        console.log('studentsWithoutBatch', studentsWithoutBatch);
        res.status(200).json(studentsWithoutBatch);
    } catch (error) {
        console.error('Error fetching students without batch:', error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};
export { signup, login,getStudentsWithoutBatch,updateUser,changePassword, logout, getUser, isAdmin, updateProfileSetup };