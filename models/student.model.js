import User from './user.model.js';
import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
    section: {
        type: String,
    },
    sessionStart: {
        type: Date,
    },
    sessionEnd: {
        type: Date,
    },
    rollNo: {
        type: String,
    },
    batch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch'
    },
    batchName: {
        type: String,
    }
});

const Student = User.discriminator('student', studentSchema);

export default Student;