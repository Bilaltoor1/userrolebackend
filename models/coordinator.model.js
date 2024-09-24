import User from './user.model.js';
import mongoose from "mongoose";

const coordinatorSchema = new mongoose.Schema({
    department: {
        type: String,
    },
    officeNumber: {
        type: String,
    }
});

const Coordinator = User.discriminator('coordinator', coordinatorSchema);

export default Coordinator;