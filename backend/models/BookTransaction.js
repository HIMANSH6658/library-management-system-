import mongoose from "mongoose"

const BookTransactionSchema = new mongoose.Schema({
    bookId: {
        type: mongoose.Types.ObjectId,
        ref: "Book",
        require: true
    },
    borrowerId: {
        type: mongoose.Types.ObjectId,
        ref: "Membership",
        require: true
    },
    bookName: {
        type: String,
        require: true
    },
    borrowerName: {
        type: String,
        require: true
    },
    transactionType: { 
        type: String,
        require: true,
    },
    fromDate: {
        type: Date,
        require: true,
    },
    toDate: {
        type: Date,
        require: true,
    },
    returnDate: {
        type: Date
    },
    actualReturnDate: {
        type: Date
    },
    transactionStatus: { 
        type: String,
        enum: ['AVAILABLE', 'SELECTED', 'ISSUED', 'RETURN_INITIATED', 'FINE_PENDING', 'COMPLETED'],
        default: "ISSUED"
    },
    fineCalculated: {
        type: Number,
        default: 0
    },
    finePaid: {
        type: Boolean,
        default: false
    }
},
{
    timestamps: true
});

export default mongoose.model("BookTransaction", BookTransactionSchema)