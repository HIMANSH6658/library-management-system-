import mongoose from "mongoose";

const BookSchema = new mongoose.Schema({
    itemType: {
        type: String, // "Book" or "Movie"
        require: true,
        default: "Book"
    },
    bookName: {
        type: String,
        require: true
    },
    serialNo: {
        type: String,
        require: true,
        unique: true
    },
    author: {
        type: String,
        require: true
    },
    dateOfProcurement: {
        type: Date,
        default: Date.now
    },
    bookCountAvailable: {
        type: Number,
        require: true,
        default: 1
    },
    bookStatus: {
        type: String,
        default: "Available"
    },
    transactions: [{
        type: mongoose.Types.ObjectId,
        ref: "BookTransaction"
    }]
},
{
    timestamps: true
})

export default mongoose.model("Book", BookSchema)