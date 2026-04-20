const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const { generateUserId } = require("../utils/helpers");
const { sendSMS } = require("../utils/sms");

// ── In-memory OTP store (use Redis in production) ────────────────────────────
const otpStore = new Map(); // key: phone_no, value: { otp, expires, user_id }

router.post("/login", async (req, res) => {
  const client = await pool.connect();
  try {
    const { user_id, password } = req.body;
    if (!user_id || !password)
      return res.status(400).json({ error: "User ID and Password are required" });

    // ── HARDCODED ADMIN ACCOUNT ──────────────────────────────────────────────
    if (user_id === "ADMIN" && password === "admin123") {
      const payload = { user_id: "ADMIN", name: "Administrator", role: "ADMIN" };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      });
      return res.json({
        success: true,
        token,
        user: { user_id: "ADMIN", name: "Administrator", role: "ADMIN" },
      });
    }

    const userResult = await client.query(
      "SELECT user_id, name, role, password, status FROM users WHERE user_id = $1",
      [user_id]
    );
    if (userResult.rows.length === 0)
      return res.status(401).json({ error: "Invalid User ID or Password" });

    const user = userResult.rows[0];

    if (user.status !== "ACTIVE")
      return res.status(403).json({ error: "Your account is deactivated. Please contact an admin." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ error: "Invalid User ID or Password" });

    const payload = {
      user_id: user.user_id,
      name: user.name,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

    res.json({
      success: true,
      token,
      user: { user_id: user.user_id, name: user.name, role: user.role },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Server error during login" });
  } finally {
    client.release();
  }
});


// ── FORGOT PASSWORD: Send OTP to phone ───────────────────────────────────────
// POST /auth/forgot-password/send-otp
// Body: { user_id }
router.post("/forgot-password/send-otp", async (req, res) => {
  const client = await pool.connect();
  try {
    const { user_id } = req.body;
    if (!user_id)
      return res.status(400).json({ error: "User ID is required." });

    const userResult = await client.query(
      "SELECT user_id, name, phone_no, status FROM users WHERE user_id = $1",
      [user_id]
    );

    if (userResult.rows.length === 0)
      return res.status(404).json({ error: "No account found with this User ID." });

    const user = userResult.rows[0];

    if (user.status !== "ACTIVE")
      return res.status(403).json({ error: "Your account is deactivated. Please contact an admin." });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP (overwrite any existing one for this user)
    otpStore.set(user.user_id, { otp, expires, phone_no: user.phone_no });

    // Send OTP via SMS
    const maskedPhone = user.phone_no.slice(0, 3) + "****" + user.phone_no.slice(-3);
    const smsMessage = `English Gate LMS\n\nYour password reset OTP is: ${otp}\n\nThis code expires in 10 minutes. Do not share it with anyone.`;

    try {
      await sendSMS(user.phone_no, smsMessage);
      console.log(`📩 OTP sent to ${maskedPhone} for user ${user.user_id}`);
    } catch (smsErr) {
      console.error("❌ OTP SMS error:", smsErr.message);
      return res.status(500).json({ error: "Failed to send OTP. Please try again." });
    }

    res.json({
      success: true,
      message: `OTP sent to your registered phone number (${maskedPhone}).`,
      masked_phone: maskedPhone,
    });

  } catch (err) {
    console.error("Send OTP Error:", err);
    res.status(500).json({ error: "Server error. Please try again." });
  } finally {
    client.release();
  }
});


// ── FORGOT PASSWORD: Verify OTP & Reset Password ─────────────────────────────
// POST /auth/forgot-password/reset
// Body: { user_id, otp, new_password, confirm_password }
router.post("/forgot-password/reset", async (req, res) => {
  const client = await pool.connect();
  try {
    const { user_id, otp, new_password, confirm_password } = req.body;

    if (!user_id || !otp || !new_password || !confirm_password)
      return res.status(400).json({ error: "All fields are required." });

    if (new_password !== confirm_password)
      return res.status(400).json({ error: "Passwords do not match." });

    if (new_password.length < 8)
      return res.status(400).json({ error: "Password must be at least 8 characters." });

    // Check OTP store
    const stored = otpStore.get(user_id);

    if (!stored)
      return res.status(400).json({ error: "No OTP found. Please request a new one." });

    if (Date.now() > stored.expires) {
      otpStore.delete(user_id);
      return res.status(400).json({ error: "OTP has expired. Please request a new one." });
    }

    if (stored.otp !== otp.trim())
      return res.status(400).json({ error: "Invalid OTP. Please try again." });

    // OTP is valid — update password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    await client.query(
      "UPDATE users SET password = $1 WHERE user_id = $2",
      [hashedPassword, user_id]
    );

    // Clear OTP from store
    otpStore.delete(user_id);

    // Notify user via SMS
    const smsMessage = `English Gate LMS\n\nYour password has been successfully reset.\n\nIf you did not make this change, please contact admin immediately.`;
    sendSMS(stored.phone_no, smsMessage).catch(err =>
      console.error("❌ Reset confirmation SMS error:", err.message)
    );

    console.log(`✅ Password reset successful for user ${user_id}`);

    res.json({ success: true, message: "Password reset successfully! You can now log in." });

  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ error: "Server error. Please try again." });
  } finally {
    client.release();
  }
});


// ── PUBLIC REGISTRATION ───────────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  const client = await pool.connect();
  try {
    const { name, phone_no, gender, birthday, address, isic_no, profile_picture_url } = req.body;

    if (!name || !phone_no || !gender || !birthday || !address) {
      return res.status(400).json({ error: "All fields except ISIC number and Profile Picture are required." });
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone_no)) {
      return res.status(400).json({ error: "Invalid phone number. Must be exactly 10 digits." });
    }

    const existingPhone = await client.query(
      "SELECT user_id FROM users WHERE phone_no = $1",
      [phone_no]
    );

    if (existingPhone.rows.length > 0) {
      return res.status(409).json({ error: "This phone number is already registered." });
    }

    await client.query("BEGIN");

    const newId = await generateUserId(client, "STD");
    const hashedPassword = await bcrypt.hash(phone_no, 10);

    await client.query(
      `INSERT INTO users (user_id, name, phone_no, password, role, gender, birthday, address, profile_picture_url, status, created_at)
       VALUES ($1, $2, $3, $4, 'STUDENT', $5, $6, $7, $8, 'PENDING', CURRENT_TIMESTAMP)`,
      [newId, name, phone_no, hashedPassword, gender, birthday, address, profile_picture_url || null]
    );

    await client.query(
      "INSERT INTO students (student_id, isic_no) VALUES ($1, $2)",
      [newId, isic_no || null]
    );

    await client.query("COMMIT");

    const smsMessage = `Welcome to English Gate LMS!\n\nYour login credentials:\nID: ${newId}\nPassword: ${phone_no}\n\nPlease login and change your password immediately.\nThank You!`;
    sendSMS(phone_no, smsMessage).then(smsRes => {
      console.log("📩 Register SMS result:", smsRes);
    }).catch(err => {
      console.error("❌ Register SMS error:", err.message);
    });

    res.status(201).json({
      success: true,
      message: "Registration successful!",
      userId: newId
    });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Public Reg Error:", err);
    res.status(500).json({ error: "Registration failed", details: err.message });
  } finally {
    client.release();
  }
});


// GET /public/teachers
router.get('/public/teachers', async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT 
        u.user_id, 
        u.name, 
        u.profile_picture_url, 
        t.specialization, 
        t.description 
      FROM users u
      JOIN teachers t ON u.user_id = t.teacher_id
      WHERE u.role = 'TEACHER' AND u.status = 'ACTIVE'
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching public teachers:', err);
    res.status(500).json({ error: 'Failed to fetch teachers' });
  } finally {
    client.release();
  }
});

module.exports = router;
