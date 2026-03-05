import { model, Schema } from 'mongoose';

// 100: On Sale
// 101: Not for sale
// 102: Pending verification

const landSchema = new Schema({
    ownerName: String,
    fatherName: String,
    dob: Date,
    address: String,
    landArea: Number,
    aadhar: {
        type: Number,
        unique: true
    },
    pan: {
        type: Number,
        unique: true
    },
    regNum: {
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
    coordinates: {
        type: [[Number]]
    },
    documents: [String],
    driveFolder: String,
    propertyValue: Number,
    status: {
        type: Number,
        default: 102
    }
});

export default model("Land", landSchema);