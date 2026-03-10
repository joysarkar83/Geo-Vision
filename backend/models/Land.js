import { model, Schema } from 'mongoose';

// 10: On Sale
// 11: Not for sale
// 0: Pending verification
// 1: Verified

const landSchema = new Schema({
    ownerId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    fatherName: String,
    dob: Date,
    address: String,
    landArea: {
        type: Number,
        required: true
    },
    pan: String,
    regNum: {
        type: String,
        unique: true
    },
    coordinates: {
        type: [[Number]],
        required: true
    },
    landmark: String,
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