import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { Check, X, Save } from "lucide-react";

const API_BASE_URL = "http://localhost:8000";

const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"], // users can insert more images
      ["clean"],
    ],
  };

  // ✅ Fetch document
  const fetchDoc = async () => {
    const res = await fetch(`${API_BASE_URL}/documents/${id}`);
    const data = await res.json();
    setDoc(data);

    let htmlContent = data.content || "";
    const isPlainText = !/<\/?[a-z][\s\S]*>/i.test(htmlContent);

    if (isPlainText) {
      htmlContent = htmlContent
        .split("\n")
        .map((line) => `<p>${line || "<br>"}</p>`)
        .join("");
    }

    // ✅ Insert logo inside the document if not already there
if (!htmlContent.includes("class='doc-logo'")) {
  const logoBlock = `
    <div style="
      position: relative;
      width: 100%;
      height: 0;
    ">
      <img
        src="/logo.jpg"
        class="doc-logo"
        alt="Logo"
        style="
          position: absolute;
          top: 0;
          right: 0;
          width: 100px;
          height: auto;
          z-index: 1;
        "
      />
    </div>
  `;
  htmlContent = logoBlock + htmlContent;
}


    setContent(htmlContent);
  };

  // ✅ Save document
  const saveChanges = async () => {
    setLoading(true);
    await fetch(`${API_BASE_URL}/documents/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    setLoading(false);
  };

  const acceptDoc = async () => {
    await fetch(`${API_BASE_URL}/documents/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "accepted" }),
    });
    await exportDoc();
  };

  const rejectDoc = async () => {
    await fetch(`${API_BASE_URL}/documents/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "rejected" }),
    });
    navigate("/");
  };

  const exportDoc = async () => {
    const res = await fetch(`${API_BASE_URL}/documents/${id}/export?format=pdf`);
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc.title}.pdf`;
    a.click();
    a.remove();
  };

  useEffect(() => {
    fetchDoc();
  }, []);

  return doc ? (
    <div className="p-6 min-h-screen bg-gray-50 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{doc.title}</h1>
        <div className="flex gap-3">
          <button
            onClick={saveChanges}
            disabled={loading}
            className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            <Save className="w-4 h-4" /> Save
          </button>
          <button
            onClick={acceptDoc}
            className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            <Check className="w-4 h-4" /> Accept
          </button>
          <button
            onClick={rejectDoc}
            className="flex items-center gap-1 bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            <X className="w-4 h-4" /> Reject
          </button>
        </div>
      </div>

      {/* ✅ Editor area with logo embedded */}
      <div className="flex-1 bg-white rounded-lg shadow-sm p-4">
        <ReactQuill
          theme="snow"
          value={content}
          onChange={setContent}
          modules={modules}
          className="h-[75vh]"
        />
      </div>
    </div>
  ) : (
    <p>Loading...</p>
  );
};

export default Editor;
