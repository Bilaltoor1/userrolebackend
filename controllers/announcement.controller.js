import Announcement from '../models/announcement.model.js';
import Batch from '../models/batch.model.js';
import cloudinary from '../helpers/cloudinary.js';
import Comment from '../models/comment.model.js';
import UserModel from "../models/user.model.js";
// export const getAnnouncements = async (req, res) => {
//     try {
//         const { page = 1, limit = 8, search = '', sort = 'latest', section = 'all' } = req.query;
//         const query = search ? { description: { $regex: search, $options: 'i' } } : {};
//
//         if (req.user.role === 'student' || req.user.role === 'teacher') {
//             const batches = await Batch.find({
//                 $or: [
//                     { students: req.user._id },
//                     { teachers: req.user._id }
//                 ]
//             }).select('_id');
//
//             const batchIds = batches.map(batch => batch._id);
//
//             if (req.user.role === 'student') {
//                 query.$or = [
//                     { section: { $in: ['all', req.user.section] } },
//                     { batch: { $in: batchIds } }
//                 ];
//             } else if (req.user.role === 'teacher') {
//                 query.$or = [
//                     { batch: { $in: batchIds } },
//                     { user: req.user._id },
//                     { batch: { $exists: false } } // Teachers can see announcements without a specific batch
//                 ];
//             }
//         } else if (section !== 'all') {
//             query.section = section;
//         }
//
//         const sortOrder = sort === 'latest' ? { created: -1 } : { created: 1 };
//
//         const announcements = await Announcement.find(query)
//             .populate('user', '_id name email role')
//             .sort(sortOrder)
//             .skip((page - 1) * limit)
//             .limit(parseInt(limit));
//
//         const total = await Announcement.countDocuments(query);
//
//         res.status(200).json({
//             total,
//             page: parseInt(page),
//             limit: parseInt(limit),
//             announcements
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Something went wrong, please try again later' });
//     }
// };

// export const getAnnouncements = async (req, res) => {
//     try {
//         const { page = 1, limit = 8, search = '', sort = 'latest', section = 'all', role = 'all' } = req.query;
//         const query = search ? { description: { $regex: search, $options: 'i' } } : {};
//
//         if (req.user.role === 'student' || req.user.role === 'teacher' || req.user.role === 'coordinator') {
//             const batches = await Batch.find({
//                 $or: [
//                     { students: req.user._id },
//                     { teachers: req.user._id }
//                 ]
//             }).select('_id');
//
//             const batchIds = batches.map(batch => batch._id);
//
//             if (section === 'all') {
//                 query.$or = [
//                     { section: 'all' },
//                     { section: req.user.section },
//                     { batch: { $in: batchIds } }
//                 ];
//             } else {
//                 query.section = section;
//             }
//         } else if (section !== 'all') {
//             query.section = section;
//         }
//
//         if (role !== 'all') {
//             query['user.role'] = role;
//         }
//
//         const sortOrder = sort === 'latest' ? { created: -1 } : { created: 1 };
//
//         const announcements = await Announcement.find(query)
//             .populate('user', '_id name email role')
//             .sort(sortOrder)
//             .skip((page - 1) * limit)
//             .limit(parseInt(limit));
//
//         const total = await Announcement.countDocuments(query);
//
//         res.status(200).json({
//             total,
//             page: parseInt(page),
//             limit: parseInt(limit),
//             announcements
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Something went wrong, please try again later' });
//     }
// };
export const getAnnouncements = async (req, res) => {
    try {
        const { page = 1, limit = 8, search = '', sort = 'latest', section = 'all', role = 'all' } = req.query;
        const query = search ? { description: { $regex: search, $options: 'i' } } : {};

        if (req.user.role === 'student') {
            const user = await UserModel.findById(req.user._id).populate('batch');
            const batchName = user.batchName;

            query.$or = [
                { section: 'all' },
                { section: user.section, batchName: { $exists: false } },
                { batchName: batchName }
            ];
        } else if (req.user.role === 'teacher') {
            const batches = await Batch.find({
                $or: [
                    { students: req.user._id },
                    { teachers: req.user._id }
                ]
            }).select('_id');

            const batchIds = batches.map(batch => batch._id);

            query.$or = [
                { section: 'all' },
                { section: req.user.section },
                { batch: { $in: batchIds } },
                { user: req.user._id }
            ];
        } else if (req.user.role === 'coordinator') {
            query.$or = [
                { section: 'all' },
                { section: req.user.section }
            ];
        }

        if (section !== 'all') {
            query.section = section;
        }

        if (role !== 'all') {
            query['user.role'] = role;
        }

        const sortOrder = sort === 'latest' ? { created: -1 } : { created: 1 };

        const announcements = await Announcement.find(query)
            .populate('user', '_id name email role')
            .sort(sortOrder)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Announcement.countDocuments(query);

        res.status(200).json({
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            announcements
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};
export const getAnnouncementById = async (req, res) => {
    try {
        const { id } = req.params;
        const announcement = await Announcement.findById(id).populate('user', 'name email');

        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        res.status(200).json(announcement);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};

// export const createAnnouncement = async (req, res) => {
//     try {
//         if (req.user.role !== 'teacher' && req.user.role !== 'coordinator') {
//             return res.status(403).json({ message: 'You do not have permission to perform this action' });
//         }
//
//         const { description, image, section, batchId } = req.body;
//         let batchName;
//
//         if (batchId) {
//             const batch = await Batch.findById(batchId);
//             if (batch) {
//                 batchName = batch.name;
//             }
//         }
//
//         const newAnnouncement = new Announcement({
//             description,
//             image,
//             section,
//             batch: batchId,
//             batchName,
//             user: req.user._id
//         });
//
//         await newAnnouncement.save();
//         res.status(201).json(newAnnouncement);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Something went wrong, please try again later' });
//     }
// };
// `controllers/announcement.controller.js`
export const createAnnouncement = async (req, res) => {
    try {

        if (req.user.role !== 'teacher' && req.user.role !== 'coordinator') {
            return res.status(403).json({ message: 'You do not have permission to perform this action' });
        }

        const { description, section, batchId } = req.body;
        let batchName;

        if (batchId) {
            const batch = await Batch.findById(batchId);
            if (batch) {
                batchName = batch.name;
            }
        }
        const uploadPromises = req.files.map(file => cloudinary.uploader.upload(file.path, {
            resource_type: 'auto' // This allows Cloudinary to automatically detect the file type
        }));

        const uploadResults = await Promise.all(uploadPromises);
        const mediaUrls = uploadResults.map(upload => upload.secure_url);

        const newAnnouncement = new Announcement({
            description,
            section,
            batch: batchId,
            batchName,
            user: req.user._id,
            media: mediaUrls // Store the URLs in the media array
        });

        await newAnnouncement.save();
        res.status(201).json(newAnnouncement);
    } catch (error) {
        console.error('Error creating announcement:', error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};// Like an announcement
// Like an announcement
export const likeAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const announcement = await Announcement.findById(id);

        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        if (announcement.likes.includes(userId)) {
            announcement.likes = announcement.likes.filter(user => user.toString() !== userId.toString());
        } else {
            announcement.likes.push(userId);
            announcement.dislikes = announcement.dislikes.filter(user => user.toString() !== userId.toString());
        }

        await announcement.save();

        res.status(200).json(announcement);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};

// Dislike an announcement
export const dislikeAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const announcement = await Announcement.findById(id);

        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        if (announcement.dislikes.includes(userId)) {
            announcement.dislikes = announcement.dislikes.filter(user => user.toString() !== userId.toString());
        } else {
            announcement.dislikes.push(userId);
            announcement.likes = announcement.likes.filter(user => user.toString() !== userId.toString());
        }

        await announcement.save();

        res.status(200).json(announcement);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};

export const deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const announcement = await Announcement.findById(id);

        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        // Check if the user owns the announcement
        if (announcement.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You do not have permission to delete this announcement' });
        }

        await Announcement.findByIdAndDelete(id);

        res.status(200).json({ message: 'Announcement deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};

// Update an announcement by ID
export const updateAnnouncement = async (req, res) => {
    const { id } = req.params;
    const { description, image, section } = req.body;
    console.log('request body update',req.body);
    try {

        const announcement = await Announcement.findById(id);

        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        // Check if the user owns the announcement
        if (announcement.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You do not have permission to update this announcement' });
        }

        announcement.description = description;
        announcement.image = image;
        announcement.section = section;

        await announcement.save();

        res.status(200).json(announcement);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong, please try again later next time' });
    }
};


// Add a comment to an announcement
export const addComment = async (req, res) => {
    try {
        const { text } = req.body;
        const { announcementId } = req.params;

        const newComment = new Comment({
            text,
            user: req.user._id,
            announcement: announcementId
        });

        await newComment.save();
        res.status(201).json(newComment);
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};

// Get comments for an announcement
export const getComments = async (req, res) => {
    try {
        const { announcementId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const comments = await Comment.find({ announcement: announcementId })
            .populate('user', 'name')
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ created: -1 });

        const total = await Comment.countDocuments({ announcement: announcementId });

        res.status(200).json({ total, comments });
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};
// export const getComments = async (req, res) => {
//     try {
//         const { announcementId } = req.params;
//         const { page = 1, limit = 10 } = req.query;
//
//         // Fetch the announcement to get the batch and user information
//         const announcement = await Announcement.findById(announcementId).populate('user', 'name role').populate('batch', 'name');
//
//         if (!announcement) {
//             return res.status(404).json({ message: 'Announcement not found' });
//         }
//
//         // Check if the user is the teacher who created the announcement
//         const isTeacher = req.user.role === 'teacher' && req.user._id.toString() === announcement.user._id.toString();
//
//         // Check if the user is a student in the batch
//         const isStudentInBatch = req.user.role === 'student' && announcement.batch && announcement.batch.students.includes(req.user._id);
//
//         // Fetch the comments
//         const comments = await Comment.find({ announcement: announcementId })
//             .populate('user', 'name')
//             .skip((page - 1) * limit)
//             .limit(parseInt(limit))
//             .sort({ created: -1 });
//
//         // Add commentVisible property
//         const commentsWithVisibility = comments.map(comment => ({
//             ...comment.toObject(),
//             commentVisible: isTeacher || isStudentInBatch
//         }));
//
//         const total = await Comment.countDocuments({ announcement: announcementId });
//
//         res.status(200).json({ total, comments: commentsWithVisibility });
//     } catch (error) {
//         console.error('Error fetching comments:', error);
//         res.status(500).json({ message: 'Something went wrong, please try again later' });
//     }
// };