const express = require("express");
const router = express.Router();
const Author = require("../models/Author");
const jwt = require("jsonwebtoken");
const { comparePassword } = require("../utils/passwordUtils");

// Helper funciton to generate jsonwebtoken
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );
}

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, role, password } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({
        message: "Please enter your email address",
      });
    }

    if (!password || typeof password !== "string") {
      return res.status(400).json({
        message: "Please enter Password",
      });
    }

    if (!["author", "admin"].includes(role)) {
      return res.status(400).json({
        message: "Please select a valid role",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Admin login: only emails configured in the backend are accepted
    if (role === "admin") {
      const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
      const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

      if (!adminEmail || !adminPasswordHash) {
        return res.status(500).json({
          message: "Admin login is not configured",
        });
      }

      const isEmailValid = normalizedEmail === adminEmail;
      const isPasswordValid = await comparePassword(
        password,
        adminPasswordHash,
      );

      if (!isEmailValid || !isPasswordValid) {
        return res.status(401).json({
          message: "Invalid email or password",
        });
      }

      const user = {
        email: adminEmail,
        role: "admin",
      };

      const token = generateToken({
        id: adminEmail,
        ...user,
      });

      return res.status(200).json({
        message: "Admin login successful",
        token,
        user,
      });
    }

    // Author login: find the existing author in MongoDB
    const author = await Author.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!author) {
      return res.status(401).json({
        message: "Invalid email or Password",
      });
    }

    const isPasswordValid = await comparePassword(password, author.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }
    const user = {
      id: author._id.toString(),
      author_id: author.author_id,
      name: author.name,
      email: author.email,
      role: "author",
    };

    const token = generateToken(user);

    return res.status(200).json({
      message: "Author login successful",
      token,
      user,
    });

    // return res.status(200).json({
    //   message: "Author login successful",
    //   user: {
    //     id: author._id,
    //     author_id: author.author_id,
    //     name: author.name,
    //     email: author.email,
    //     role: "author",
    //   },
    // });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      message: "Server error during login",
    });
  }
});

module.exports = router;
