import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(" ")[1];
        jwt.verify(token, process.env.JWT_SECRET || "default_secret", (err, user) => {
            if (err) {
                return res.status(403).json("Token is not valid");
            }
            req.user = user;
            next();
        });
    } else {
        return res.status(401).json("You are not authenticated");
    }
};

export const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.isAdmin) {
            next();
        } else {
            return res.status(403).json("Only admins can perform this action");
        }
    });
};

export const verifyUserOrAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.userId || req.user.isAdmin) {
            next();
        } else {
            return res.status(403).json("Access Denied");
        }
    });
};
