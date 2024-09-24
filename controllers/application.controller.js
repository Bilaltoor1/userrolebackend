import Application from '../models/application.model.js';
import Batch from '../models/batch.model.js';

export const fetchHistoryofApplication = async (req, res) => {
    const {studentID, advisor, coordinator} = req.query;
    const query = {};

    if (studentID) query.studentID = studentID;
    if (advisor) query.advisor = advisor;
    if (coordinator) query.coordinator = coordinator;
    console.log(query)
    try {

        const applications = await Application.find(query)
            .populate('advisor', 'name email')
            .populate('coordinator', 'name email')
            .populate('studentID', 'name email');

        return res.status(200).json(applications);
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({message: 'Something went wrong, please try again later'});
    }
};

export const fetchApplicationById = async (req, res) => {
    try {
        const {id} = req.params;
        const application = await Application.findById(id)
            .populate('advisor', 'name email')
            .populate('coordinator', 'name email')
            .populate('studentID', 'name email');

        if (!application) return res.status(404).json({message: 'Application not found'});

        return res.status(200).json(application);
    } catch (error) {
        console.error('Error fetching application:', error);
        res.status(500).json({message: 'Something went wrong, please try again later'});
    }
};
// export const fetchHistoryofApplication = async (req, res) => {
//     try {
//         const { studentID, advisor, coordinator } = req.query;
//         const query = {};
//
//         if (studentID) query.studentID = studentID;
//         if (advisor) query.advisor = advisor;
//         if (coordinator) query.coordinator = coordinator;
//
//         const applications = await Application.find(query)
//             .populate('advisor', 'name email')
//             .populate('coordinator', 'name email')
//             .populate('studentID', 'name email');
//
//         return res.status(200).json(applications);
//     } catch (error) {
//         console.error('Error fetching applications:', error);
//         res.status(500).json({ message: 'Something went wrong, please try again later' });
//     }
// };
//
// export const fetchApplicationById = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const application = await Application.findById(id)
//             .populate('advisor', 'name email')
//             .populate('coordinator', 'name email')
//             .populate('studentID', 'name email');
//
//         if (!application) return res.status(404).json({ message: 'Application not found' });
//
//         return res.status(200).json(application);
//     } catch (error) {
//         console.error('Error fetching application:', error);
//         res.status(500).json({ message: 'Something went wrong, please try again later' });
//     }
// };
export const fetchApplications = async (req, res) => {
    try {
        const {status, advisor, coordinator} = req.query;
        const query = {};

        if (status) query.applicationStatus = status;
        if (advisor) query.advisor = advisor;
        if (coordinator) query.coordinator = coordinator;

        const userId = req.user._id;
        const userRole = req.user.role;

        if (userRole === 'coordinator') {
            // Coordinator can see only Transit applications
            query.applicationStatus = 'Transit';
            const applications = await Application.find(query)
                .populate('advisor', 'name email')
                .populate('coordinator', 'name email')
                .populate('studentID', 'name email');

            return res.status(200).json(applications);
        } else {
            // Find batches where the teacher is an advisor
            const batches = await Batch.find({advisor: userId});

            // Get student IDs from these batches
            const studentIds = batches.flatMap(batch => batch.students);

            // Find applications where the student belongs to the same batch as the advisor
            const applications = await Application.find({
                ...query, studentID: {$in: studentIds}, applicationStatus: {$ne: 'Forwarded'} // Exclude forwarded applications
            })
                .populate('advisor', 'name email')
                .populate('coordinator', 'name email')
                .populate('studentID', 'name email');

            return res.status(200).json(applications);
        }
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({message: 'Something went wrong, please try again later'});
    }
};
export const createApplication = async (req, res) => {
    try {
        const {name, email, studentID, rollNo, reason, content} = req.body;
        const batch = await Batch.findOne({students: studentID}).populate('advisor').populate('coordinator');
        if (!batch) return res.status(404).json({message: 'Batch not found'});
        console.log(batch)
        const application = new Application({
            name,
            email,
            studentID,
            reason,
            content,
            advisor: batch.advisor._id,
            rollNo,
            coordinator: batch.coordinator._id // Ensure coordinator is correctly populated
        });

        await application.save();
        res.status(201).json({message: 'Application created successfully', application});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Something went wrong, please try again later'});
    }
};

export const updateApplicationByAdvisor = async (req, res) => {
    try {
        const {id} = req.params;
        const {signature, applicationStatus} = req.body;

        const application = await Application.findById(id);
        if (!application) return res.status(404).json({message: 'Application not found'});

        application.signature = signature;
        application.applicationStatus = applicationStatus || 'Transit';

        await application.save();
        res.status(200).json({message: 'Application updated successfully', application});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Something went wrong, please try again later'});
    }
};

export const updateApplicationByCoordinator = async (req, res) => {
    try {
        const {id} = req.params;
        const {applicationStatus} = req.body;

        const application = await Application.findById(id);
        if (!application) return res.status(404).json({message: 'Application not found'});

        application.applicationStatus = applicationStatus || 'Forwarded';

        await application.save();
        res.status(200).json({message: 'Application updated successfully', application});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Something went wrong, please try again later'});
    }
};