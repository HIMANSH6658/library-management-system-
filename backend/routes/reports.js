import express from "express"
import Book from "../models/Book.js"
import Membership from "../models/Membership.js"
import { verifyUserOrAdmin } from "../middleware/auth.js"

const router = express.Router()

router.use(verifyUserOrAdmin);

// Master List of Books
router.get("/books", async (req, res) => {
    try {
        const books = await Book.find({ itemType: "Book" }).sort({ _id: -1 })
        res.status(200).json(books)
    } catch (err) {
        res.status(500).json(err)
    }
})

// Master List of Movies
router.get("/movies", async (req, res) => {
    try {
        const movies = await Book.find({ itemType: "Movie" }).sort({ _id: -1 })
        res.status(200).json(movies)
    } catch (err) {
        res.status(500).json(err)
    }
})

// Master List of Memberships
router.get("/memberships", async (req, res) => {
    try {
        const memberships = await Membership.find({}).sort({ _id: -1 })
        res.status(200).json(memberships)
    } catch (err) {
        res.status(500).json(err)
    }
})

export default router
