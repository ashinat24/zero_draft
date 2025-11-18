import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:8000";

const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNewDocModal, setShowNewDocModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const navigate = useNavigate();

  const fetchDocuments = async () => {
    setLoading(true);
    const res = await fetch(`${API_BASE_URL}/documents/`);
    const data = await res.json();
    setDocuments(data);
    setLoading(false);
  };

  const createDocument = async () => {
    const res = await fetch(`${API_BASE_URL}/documents/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle, content: newContent, status: "draft" }),
    });
    if (res.ok) {
      await fetchDocuments();
      setShowNewDocModal(false);
      setNewTitle("");
      setNewContent("");
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Utility for colored status badges
  const getStatusColor = (status) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Autonomous Zero-Draft
        </h1>
        <button
          onClick={() => setShowNewDocModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Document
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => navigate(`/edit/${doc.id}`)}
              className="p-4 bg-white border rounded-lg shadow-sm hover:shadow-md cursor-pointer"
            >
              <h2 className="font-semibold text-lg mb-2">{doc.title}</h2>
              <span
                className={`text-sm font-medium px-2 py-1 rounded-full ${getStatusColor(
                  doc.status
                )}`}
              >
                {doc.status ? doc.status.charAt(0).toUpperCase() + doc.status.slice(1) : "Draft"}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* New Document Modal */}
      {showNewDocModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-lg font-semibold mb-4">Create New Document</h2>
            <input
              type="text"
              placeholder="Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full border rounded-lg p-2 mb-4"
            />
            <textarea
              placeholder="Content"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="w-full border rounded-lg p-2 mb-4 h-32"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNewDocModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={createDocument}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
