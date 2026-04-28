import mongoose from "mongoose";

const MembershipSchema = new mongoose.Schema({
    membershipId: {
        type: String,
        require: true,
        unique: true
    },
    firstName: {
        type: String,
        require: true
    },
    lastName: {
        type: String,
        require: true
    },
    contactNumber: {
        type: String,
        require: true
    },
    contactAddress: {
        type: String,
        require: true
    },
    aadharCardNo: {
        type: String,
        require: true,
        unique: true
    },
    startDate: {
        type: Date,
        require: true
    },
    endDate: {
        type: Date,
        require: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    finePending: {
        type: Number,
        default: 0
    },
    activeTransactions: [{
        type: mongoose.Types.ObjectId,
        ref: "BookTransaction"
    }],
    prevTransactions: [{
        type: mongoose.Types.ObjectId,
        ref: "BookTransaction"
    }]
},
{
    timestamps: true
});

export default mongoose.model("Membership", MembershipSchema);
