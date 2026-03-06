import { model, Schema } from 'mongoose';

// 10: On Sale
// 11: Not for sale
// 0: Pending verification
// 1: Verified

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
        type: String,
        unique: true
    },
    regNum: {
        type: String,
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
    sellingStatus: {
        type: Number,
        default: 11
    },
    verificationStatus: {
        type: Number,
        default: 0
    }
});

export default model("Land", landSchema);