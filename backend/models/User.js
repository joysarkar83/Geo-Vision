import { model, Schema } from 'mongoose';

const userSchema = new Schema({
    aadhar: {
        type: Number,
        unique: true
    },
    phone: {
        type: Number,
        unique: true
    },
    email: {
        type: String,
        unique: true
    },
    password: String
})

export default model("User", userSchema);