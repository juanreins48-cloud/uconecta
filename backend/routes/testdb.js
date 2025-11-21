import express from "express";
import pool from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT NOW() AS now");
    res.json({
      success: true,
      message: "DB connection OK",
      time: rows[0].now,
    });
  } catch (error) {
    console.error("DB TEST ERROR:", error);
    res.status(500).json({
      success: false,
      message: "DB connection FAILED",
      error: error.message,
    });
  }
});

export default router;
