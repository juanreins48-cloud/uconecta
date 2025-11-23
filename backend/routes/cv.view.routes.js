// routes/cv.view.routes.js
import { Router } from "express";
import { db } from "../firebase.js";

const router = Router();

router.get("/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({ success: false, message: "studentId is required" });
    }

    const snap = await db
      .collection("cv_estudiantes")
      .doc(studentId)
      .collection("versiones")
      .orderBy("actualizado_en", "desc")
      .limit(1)
      .get();

    if (snap.empty) {
      return res.status(404).json({ success: false, message: "CV not found" });
    }

    return res.json({ success: true, cv: snap.docs[0].data() });

  } catch (err) {
    console.error("Error fetching CV:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

export default router;
