import Job from '../models/jobs.model.js';

// Create a new job post
const createJob = async (req, res) => {
    try {
        const { jobTitle, jobLink, company, jobDescription, thumbnail, department } = req.body;
        const newJob = new Job({ jobTitle, jobLink, company, jobDescription, thumbnail, department });
        await newJob.save();
        res.status(201).json({ message: 'Job created successfully', job: newJob });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};

// Get all job posts
const getJobs = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', sort = 'latest', department = 'all' } = req.query;

        const query = {};
        if (search) {
            query.$or = [
                { jobTitle: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } },
                { jobDescription: { $regex: search, $options: 'i' } },
            ];
        }
        if (department !== 'all') {
            query.department = department;
        }

        const sortOption = sort === 'latest' ? { createdAt: -1 } : { createdAt: 1 };

        const jobs = await Job.find(query)
            .sort(sortOption)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Job.countDocuments(query);

        res.status(200).json({ jobs, total });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};

// Update a job post
const updateJob = async (req, res) => {
    try {
        const { id } = req.params;
        const { jobTitle, jobLink, company, jobDescription, thumbnail, department } = req.body;
        const updatedJob = await Job.findByIdAndUpdate(id, { jobTitle, jobLink, company, jobDescription, thumbnail, department });
        if (!updatedJob) {
            return res.status(404).json({ message: 'Job not found' });
        }
        res.status(200).json({ message: 'Job updated successfully', job: updatedJob });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};

// Delete a job post
const deleteJob = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedJob = await Job.findByIdAndDelete(id);
        if (!deletedJob) {
            return res.status(404).json({ message: 'Job not found' });
        }
        res.status(200).json({ message: 'Job deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};

export { createJob, getJobs, updateJob, deleteJob };