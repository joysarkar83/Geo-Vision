import { model, Schema } from 'mongoose';

const userSchema = new Schema({
    aadhar: {
        type: Number,
        unique: true,
        required: true
    },
    phone: {
        type: Number,
        unique: true,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    }
})

export default model("User", userSchema);