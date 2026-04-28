import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    userId: {
        type: String,
        require: true,
        unique: true
    },
    userFullName: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true,
        min: 6
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    }
},
{
    timestamps: true
});

export default mongoose.model("User", UserSchema);