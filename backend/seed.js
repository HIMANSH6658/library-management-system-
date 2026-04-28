import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const seedUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
        });

        console.log("Connected to MongoDB");

        await User.deleteMany({}); // Wipe existing users

        const salt = await bcrypt.genSalt(10);
        const adminPass = await bcrypt.hash("adm", salt);
        const userPass = await bcrypt.hash("user", salt);

        const users = [
            {
                userId: "adm",
                userFullName: "Admin User",
                password: adminPass,
                isAdmin: true,
                isActive: true
            },
            {
                userId: "user",
                userFullName: "Regular User",
                password: userPass,
                isAdmin: false,
                isActive: true
            }
        ];

        await User.insertMany(users);
        console.log("Seeded 'adm' and 'user' accounts successfully!");

        mongoose.connection.close();
    } catch (error) {
        console.error("Error seeding data:", error);
        process.exit(1);
    }
};

seedUsers();
