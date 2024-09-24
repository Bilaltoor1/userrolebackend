import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'student', 'teacher', 'coordinator'],
        default: 'student'
    },
    profileSetup: {
        type: Boolean,
        default: false
    },
    identityConfirmed: {
        type: Boolean,
        default: false
    }
}, { discriminatorKey: 'role' , timestamps : true});

const User = mongoose.model('User', userSchema);

export default User;