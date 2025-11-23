import { useState, useEffect } from "react";
import { API_URL } from "../../services/api.js";

export default function MyCV() {
  const [cv, setCv] = useState(null);
  const studentId = localStorage.getItem("studentId");

  useEffect(() => {
    if (!studentId) return;

    const fetchCV = async () => {
      try {
        const res = await fetch(`${API_URL}/cv/${studentId}`);
        const data = await res.json();
        if (data.success) setCv(data.cv);
      } catch (err) {
        console.error("Error loading CV:", err);
      }
    };

    fetchCV();
  }, [studentId]);


  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">My CV</h2>

      <div className="bg-white p-6 rounded shadow space-y-4">
        <p><strong>Name:</strong> {cv.full_name}</p>
        <p><strong>Email:</strong> {cv.email}</p>
        <p><strong>Phone:</strong> {cv.phone}</p>
        <p><strong>Summary:</strong> {cv.summary}</p>
        <p><strong>Experience:</strong> {cv.experience}</p>
        <p><strong>Education:</strong> {cv.education}</p>
        <p><strong>Skills:</strong> {cv.skills}</p>
      </div>
    </div>
  );
}
