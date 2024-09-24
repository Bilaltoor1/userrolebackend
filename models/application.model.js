import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    studentID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true },
    content: { type: String, required: true },
    rollNo: { type: String, required: true },
    applicationStatus: { type: String, enum: ['Pending', 'Transit', 'Forwarded'], default: 'Pending' },
    signature: { type: String },
    advisor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    coordinator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const Application = mongoose.model('Application', applicationSchema);
export default Application;