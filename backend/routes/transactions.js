import express from "express"
import Book from "../models/Book.js"
import BookTransaction from "../models/BookTransaction.js"
import { verifyUserOrAdmin } from "../middleware/auth.js"

const router = express.Router()

router.use(verifyUserOrAdmin);

router.post("/add-transaction", async (req, res) => {
    try {
        const { bookId, borrowerId, bookName, borrowerName, transactionType, fromDate } = req.body;

        if (!bookId || !borrowerId || !bookName || !borrowerName) {
            return res.status(400).json("All mandatory transaction fields (Book, Borrower) are required");
        }

        const today = new Date();
        today.setHours(0,0,0,0);

        const from = new Date();
        const toDate = new Date(from.getTime() + 15 * 24 * 60 * 60 * 1000);

        const newtransaction = await new BookTransaction({
            bookId,
            borrowerId,
            bookName,
            borrowerName,
            transactionType: transactionType || "Issued",
            fromDate: from,
            toDate: toDate,
            transactionStatus: 'ISSUED'
        });

        const transaction = await newtransaction.save();
        const book = await Book.findById(bookId);
        if (book) {
            await book.updateOne({ 
                $push: { transactions: transaction._id },
                $inc: { bookCountAvailable: -1 } 
            });
        }
        
        res.status(200).json(transaction);
    }
    catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

router.get("/all-transactions", async (req, res) => {
    try {
        const transactions = await BookTransaction.find({}).sort({ _id: -1 })
        res.status(200).json(transactions)
    }
    catch (err) {
        return res.status(504).json(err)
    }
})

// Active Issues
router.get("/active", async (req, res) => {
    try {
        const transactions = await BookTransaction.find({ 
            transactionStatus: { $in: ["ISSUED", "FINE_PENDING"] } 
        }).sort({ _id: -1 });
        res.status(200).json(transactions);
    }
    catch (err) {
        return res.status(500).json(err);
    }
});

// Overdue Returns
router.get("/overdue", async (req, res) => {
    try {
        const now = new Date();
        const transactions = await BookTransaction.find({ 
            transactionStatus: { $in: ["ISSUED", "FINE_PENDING"] },
            toDate: { $lt: now } 
        }).sort({ _id: -1 });
        res.status(200).json(transactions);
    }
    catch (err) {
        return res.status(500).json(err);
    }
});

// Issue Requests
router.get("/requests", async (req, res) => {
    try {
        const transactions = await BookTransaction.find({ 
            transactionStatus: "ISSUED" 
        }).sort({ _id: -1 });
        res.status(200).json(transactions);
    }
    catch (err) {
        return res.status(500).json(err);
    }
});

router.put("/update-transaction/:id", async (req, res) => {
    try {
        const transaction = await BookTransaction.findById(req.params.id);
        if (!transaction) return res.status(404).json("Transaction not found");

        const updateData = req.body;
        const currentStatus = transaction.transactionStatus;
        const nextStatus = updateData.transactionStatus;

        // Strict Transition Guards
        if (currentStatus === 'ISSUED' && nextStatus === 'RETURN_INITIATED') {
            // Moving to Return Initiated
            if (!updateData.actualReturnDate) {
                return res.status(400).json("actualReturnDate is mandatory to initiate return");
            }
            
            // Calculate Fine deterministically
            const actualReturn = new Date(updateData.actualReturnDate);
            const toDate = new Date(transaction.toDate);
            const diffTime = actualReturn - toDate;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            let fine = 0;
            if (diffDays > 0) {
                fine = diffDays * 10; // Default 10/day
            }
            updateData.fineCalculated = fine;

            updateData.transactionStatus = 'FINE_PENDING';
            if (fine === 0) {
                updateData.finePaid = true;
            } else {
                updateData.finePaid = false;
            }
        } 
        else if (currentStatus === 'FINE_PENDING' && nextStatus === 'COMPLETED') {
            if (!updateData.finePaid) {
                return res.status(400).json("Fine must be paid to complete the return transaction");
            }
        }
        else if (currentStatus !== nextStatus) {
            return res.status(400).json(`Invalid state transition from ${currentStatus} to ${nextStatus}`);
        }

        const updatedTransaction = await BookTransaction.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        );

        // Update book status if completed
        if (updateData.transactionStatus === 'COMPLETED') {
            const book = await Book.findById(transaction.bookId);
            if (book) {
                await book.updateOne({ $inc: { bookCountAvailable: 1 } });
            }
        }

        res.status(200).json(updatedTransaction);
    }
    catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

router.delete("/remove-transaction/:id", async (req, res) => {
    if (req.body.isAdmin) {
        try {
            const data = await BookTransaction.findByIdAndDelete(req.params.id);
            const book = await Book.findById(data.bookId)
            if(book) {
                await book.updateOne({ $pull: { transactions: req.params.id } })
            }
            res.status(200).json("Transaction deleted successfully");
        } catch (err) {
            return res.status(504).json(err);
        }
    } else {
        return res.status(403).json("You dont have permission to delete a transaction!");
    }
})

export default router