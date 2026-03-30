import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { uploadFile, deleteFile, setCurrentFile, fetchFilesHistory } from '../features/files/fileSlice';

const Dashboard = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { allFiles, loading, error } = useSelector((state) => state.files);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchFilesHistory());
  }, [dispatch]);

  // Handle upload
  const handleUpload = () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    dispatch(uploadFile(formData))
      .unwrap()
      .then((res) => {
        setSelectedFile(null);
        navigate(`/analysis/${res.fileInfo._id}`);
      })
      .catch((err) => console.error(err));
  };

  // Handle delete
  const handleDelete = (fileId) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      dispatch(deleteFile(fileId));
    }
  };

  // Analyze
  const handleAnalyze = (file) => {
    dispatch(setCurrentFile(file));
    navigate(`/analysis/${file.fileInfo._id}`);
  };

  // Date format
  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-8 text-white">

      {/* Header */}
      <h1 className="text-3xl font-bold mb-6 text-cyan-400">
        Welcome, {user?.name}
      </h1>

      {/* Upload Section */}
      <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg">

        <h2 className="text-xl font-semibold mb-4">
          Upload a New Excel File
        </h2>

        <div className="flex items-center gap-10">

          {/* Drag & Drop */}
          <div
            className={`flex-1 border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all
            ${dragActive ? "border-cyan-400 bg-cyan-400/10" : "border-gray-400/30"}`}

            onClick={() => document.getElementById("fileInput").click()}

            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);

              const file = e.dataTransfer.files[0];
              if (file) setSelectedFile(file);
            }}
          >
            <input
              id="fileInput"
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="hidden"
            />

            {!selectedFile ? (
              <>
                <div className="text-5xl mb-3">📂</div>
                <p className="text-gray-300">
                  Drag & drop your file here or click to upload
                </p>
              </>
            ) : (
              <p className="text-green-400 font-semibold text-lg">
                ✔ {selectedFile.name}
              </p>
            )}
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={loading || !selectedFile}
            className="px-16 py-3 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-green-500 hover:scale-105 transition-all disabled:bg-gray-500"
          >
            {loading ? "Uploading..." : "Upload & Analyze"}
          </button>

        </div>

        {error && <p className="text-red-400 mt-3">{error}</p>}
      </div>

      {/* History Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4 text-cyan-400">
          My Upload History
        </h2>

        <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg">

          {(allFiles && allFiles.length > 0) ? (
            <div className="space-y-4">

              {allFiles.map((file) => (
                <div
                  key={file.fileInfo._id}
                  className="flex justify-between items-center p-4 rounded-lg hover:bg-white/10 transition cursor-pointer"
                  onClick={() => handleAnalyze(file)}
                >
                  <div>
                    <p className="font-semibold text-white hover:text-cyan-400">
                      {file.fileInfo.originalName}
                    </p>
                    <p className="text-sm text-gray-300">
                      Uploaded on: {formatDate(file.fileInfo.uploadDate)}
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(file.fileInfo._id);
                    }}
                    className="bg-red-500 px-3 py-1 rounded text-sm hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              ))}

            </div>
          ) : (
            <p className="text-gray-300">
              You haven't uploaded any files yet.
            </p>
          )}

        </div>
      </div>

    </div>
  );
};

export default Dashboard;