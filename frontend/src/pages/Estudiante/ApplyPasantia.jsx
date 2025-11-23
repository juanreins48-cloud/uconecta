import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../services/api.js";

export default function ApplyPasantia() {
  const navigate = useNavigate();
  const [internships, setInternships] = useState([]);
  const [applied, setApplied] = useState([]);
  const [cv, setCV] = useState(null);
  const [showCV, setShowCV] = useState(false);
  const [loading, setLoading] = useState(true);

  const studentId = localStorage.getItem("studentId");

  useEffect(() => {
    const fetchInternships = async () => {
      try {
        const res = await fetch(`${API_URL}/ofertas`);
        const data = await res.json();
        if (data.success) {
          setInternships(Array.isArray(data.ofertas) ? data.ofertas : []);
        } else {
          alert(data.message || "Error fetching offers");
        }
      } catch (err) {
        console.error(err);
        alert("Error fetching offers from server");
      } finally {
        setLoading(false);
      }
    };

    fetchInternships();
  }, []);

  const applyToInternship = async (id) => {
    if (!studentId) {
      alert("No studentId found. Please log in again.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/aplicaciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, internshipId: id }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message);
        return;
      }
      setApplied([...applied, id]);
      alert("Aplicación enviada correctamente");
    } catch (err) {
      console.error(err);
      alert("Error al aplicar");
    }
  };

  const fetchCV = async () => {
    if (!studentId) {
      alert("No studentId found. Please log in again.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/cv/${studentId}`);
      const data = await res.json();
      if (!data.success) {
        alert(data.message);
        return;
      }
      setCV(data.cv);
      setShowCV(true);
    } catch (err) {
      console.error("Error fetching CV:", err);
      alert("Server error");
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Available Internships</h1>
        <button
          className="px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800"
          onClick={() => navigate(`/student/cv/view/${studentId}`)}
        >
          My CV
        </button>
      </header>

      {loading ? (
        <p className="text-gray-500">Loading internships...</p>
      ) : internships.length === 0 ? (
        <p className="text-gray-500">No active internships available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {internships.map((job) => (
            <div
              key={job.id}
              className="bg-white shadow rounded-xl p-4 border border-gray-100 hover:shadow-md transition"
            >
              <h3 className="font-bold text-gray-800 text-lg mb-1">{job.titulo}</h3>
              <p className="text-sm text-gray-600 mb-1">{job.company} • {job.ubicacion}</p>
              <p className="text-sm text-gray-500 mb-3">{job.descripcion}</p>

              <button
                onClick={() => applyToInternship(job.id)}
                disabled={applied.includes(job.id)}
                className={`w-full py-2 rounded-lg font-medium transition ${
                  applied.includes(job.id)
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-teal-700 text-white hover:bg-teal-800"
                }`}
              >
                {applied.includes(job.id) ? "Already Applied" : "Apply to Internship"}
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end mt-6">
        <button
          type="button"
          onClick={() => navigate("/estudiante")}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
