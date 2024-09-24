import AnnouncementFilter from "../models/announcement-filter.model.js";

// Create a new section
const createAnnouncementFilter = async (req, res) => {
    try {
        const section = req.body.section;
        const announcementFilter = new AnnouncementFilter({ section });
        await announcementFilter.save();
        res.status(201).json({
            message: 'Section created successfully',
            section
        });
    } catch (error) {
        res.status(500).send({ message: error.message });
        console.error(error);
    }
};

// Get all sections
// const getAnnouncementFilters = async (req, res) => {
//     try {
//         const sections = await AnnouncementFilter.find();
//         res.status(200).json(sections);
//     } catch (error) {
//         res.status(500).send({ message: error.message });
//         console.error(error);
//     }
// };
const getAnnouncementFilters = async (req, res) => {
    try {
        let sections;
        if (req.user.role === 'student') {
            sections = await AnnouncementFilter.find({ section: { $in: [req.user.section, 'all'] } });
        } else {
            sections = await AnnouncementFilter.find();
        }
        res.status(200).json(sections);
    } catch (error) {
        res.status(500).send({ message: error.message });
        console.error(error);
    }
};
// Delete a section by ID
const deleteAnnouncementFilter = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedSection = await AnnouncementFilter.findByIdAndDelete(id);
        if (!deletedSection) {
            return res.status(404).json({ message: 'Section not found' });
        }
        res.status(200).json({ message: 'Section deleted successfully' });
    } catch (error) {
        res.status(500).send({ message: error.message });
        console.error(error);
    }
};
const getAllAnnouncementFilters = async (req, res) => {
    try {
        const sections = await AnnouncementFilter.find();
        res.status(200).json(sections);
    } catch (error) {
        res.status(500).send({ message: error.message });
        console.error(error);
    }
};
export { createAnnouncementFilter, getAllAnnouncementFilters,getAnnouncementFilters, deleteAnnouncementFilter };