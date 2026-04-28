import express from "express";
import Membership from "../models/Membership.js";
import User from "../models/User.js";
import Book from "../models/Book.js";
import { verifyAdmin } from "../middleware/auth.js";

const router = express.Router();

// Apply verifyAdmin to all routes in this router
router.use(verifyAdmin);

// --- MEMBERSHIP MAINTENANCE ---

// Add Membership
router.post("/membership", async (req, res) => {
    try {
        const { membershipDuration, ...membershipData } = req.body;
        
        // Calculate end date based on duration if not explicitly provided
        let endDate = membershipData.endDate;
        if (!endDate && membershipDuration) {
            const start = new Date(membershipData.startDate || Date.now());
            let monthsToAdd = 0;
            if (membershipDuration === "6m") monthsToAdd = 6;
            else if (membershipDuration === "1y") monthsToAdd = 12;
            else if (membershipDuration === "2y") monthsToAdd = 24;
            
            endDate = new Date(start.setMonth(start.getMonth() + monthsToAdd));
        }

        const newMembership = new Membership({
            ...membershipData,
            endDate: endDate
        });

        const savedMembership = await newMembership.save();
        res.status(200).json(savedMembership);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Update Membership
router.put("/membership/:id", async (req, res) => {
    try {
        const { membershipDuration, ...updateData } = req.body;
        
        if (membershipDuration && updateData.startDate) {
            const start = new Date(updateData.startDate);
            let monthsToAdd = 0;
            if (membershipDuration === "6m") monthsToAdd = 6;
            else if (membershipDuration === "1y") monthsToAdd = 12;
            else if (membershipDuration === "2y") monthsToAdd = 24;
            updateData.endDate = new Date(start.setMonth(start.getMonth() + monthsToAdd));
        }

        const updatedMembership = await Membership.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        );
        res.status(200).json(updatedMembership);
    } catch (err) {
        res.status(500).json(err);
    }
});

// --- USER MANAGEMENT ---

// Update User
router.put("/user/:id", async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        res.status(200).json(updatedUser);
    } catch (err) {
        res.status(500).json(err);
    }
});

// --- BOOK/MOVIE MAINTENANCE ---

// Update Book/Movie
router.put("/item/:id", async (req, res) => {
    try {
        const updatedItem = await Book.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        res.status(200).json(updatedItem);
    } catch (err) {
        res.status(500).json(err);
    }
});

export default router;
