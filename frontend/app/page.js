

"use client"
import Link from "next/link";
import Image from "next/image";
import React, { useState } from "react";
import TicketCard from "./components/TicketCard";

export default function Home() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult([]);
    setError(null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult([]);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("http://localhost:8000/upload-tickets", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to upload and classify tickets");
      const data = await res.json();
      setResult(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between",
        padding: "1rem 2rem",
        borderBottom: "1px solid #e2e8f0",
        background: "#fff"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ 
            background: "#6366f1", 
            width: "24px", 
            height: "24px", 
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <span style={{ color: "#fff", fontSize: "14px", fontWeight: "bold" }}>◆</span>
          </div>
          <span style={{ fontWeight: "600", color: "#1f2937" }}>Customer Support Copilot</span>
        </div>
      </div>

      {/* Tools Navigation */}
      <div style={{ padding: "1rem 2rem" }}>
        <h2 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#374151", marginBottom: "1rem" }}>Tools</h2>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem" }}>
          <button style={{ 
            padding: "0.5rem 1rem", 
            background: "#6366f1", 
            color: "#fff", 
            border: "none", 
            borderRadius: "6px", 
            fontWeight: "500",
            fontSize: "0.875rem"
          }}>
            Dashboard
          </button>
          <Link href="/ask">
            <button style={{ 
              padding: "0.5rem 1rem", 
              background: "#f3f4f6", 
              color: "#6b7280", 
              border: "none", 
              borderRadius: "6px", 
              fontWeight: "500",
              fontSize: "0.875rem",
              cursor: "pointer"
            }}>
              Agent
            </button>
          </Link>
        </div>

        {/* Main Dashboard Content */}
        <div style={{ background: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
          {/* Dashboard Header */}
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            padding: "1.5rem",
            borderBottom: "1px solid #e5e7eb"
          }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#111827", margin: 0 }}>
              Bulk Ticket Classification Dashboard
            </h3>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <form onSubmit={handleUpload} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <input
                  type="file"
                  accept="application/json"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  id="file-upload"
                />
                <label 
                  htmlFor="file-upload"
                  style={{ 
                    padding: "0.5rem 1rem",
                    background: "#6366f1",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    fontWeight: "500",
                    fontSize: "0.875rem",
                    cursor: "pointer",
                    display: "inline-block"
                  }}
                >
                  Upload JSON
                </label>
                {file && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ 
                      background: "#f3f4f6", 
                      padding: "0.25rem 0.5rem", 
                      borderRadius: "4px", 
                      fontSize: "0.75rem",
                      color: "#6b7280"
                    }}>
                      {file.name} ✕
                    </span>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{ 
                        padding: "0.5rem 1rem",
                        background: loading ? "#9ca3af" : "#10b981",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        fontWeight: "500",
                        fontSize: "0.875rem",
                        cursor: loading ? "not-allowed" : "pointer"
                      }}
                    >
                      {loading ? "Processing..." : "Classify"}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Dashboard Content */}
          <div style={{ padding: "1.5rem" }}>
            <p style={{ 
              color: "#6b7280", 
              fontSize: "0.875rem", 
              marginBottom: "2rem",
              lineHeight: "1.5"
            }}>
              Upload your own JSON file to classify support tickets in bulk. The file should be an array of ticket objects, each with "id", "subject", and "body" properties.
            </p>

            {error && (
              <div style={{ 
                background: "#fef2f2", 
                border: "1px solid #fecaca", 
                borderRadius: "6px", 
                padding: "1rem", 
                marginBottom: "1rem" 
              }}>
                <p style={{ color: "#dc2626", margin: 0 }}>Error: {error}</p>
              </div>
            )}

            {result.length === 0 && !loading && (
              <div style={{ 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center", 
                justifyContent: "center",
                padding: "3rem",
                color: "#6b7280"
              }}>
                <div style={{ 
                  width: "48px", 
                  height: "48px", 
                  background: "#f3f4f6", 
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1rem"
                }}>
                  <span style={{ fontSize: "24px" }}>📄</span>
                </div>
                <h4 style={{ margin: "0 0 0.5rem 0", fontWeight: "500" }}>No tickets to display</h4>
                <p style={{ margin: 0, fontSize: "0.875rem" }}>Upload a JSON file to get started.</p>
              </div>
            )}

            {loading && (
              <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
                {[...Array(6)].map((_, index) => (
                  <TicketCard key={`loading-${index}`} ticket={{}} isLoading={true} />
                ))}
              </div>
            )}

            {result.length > 0 && !loading && (
              <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
                {result.map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} isLoading={false} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
