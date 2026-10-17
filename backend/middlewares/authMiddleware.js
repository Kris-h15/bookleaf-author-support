const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  try {
    // Read the token from the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Access denied. Please log in first.",
      });
    }

    // Extract the token
    const token = authHeader.split(" ")[1];

    // Verify the token using our secret from .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach authenticated user information to the request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token. Please log in again.",
    });
  }
}

module.exports = authMiddleware;
