import { model, Schema } from 'mongoose';

const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    aadhar: {
        type: String,
        unique: true,
        required: true
    },
    phone: {
        type: String,
        unique: true,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    role: {
        type: String,
        enum: ["user", "admin", "agent"],
        default: "user"
    },
    password: {
        type: String,
        required: true
    }
})

export default model("User", userSchema);