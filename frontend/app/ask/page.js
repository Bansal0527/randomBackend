'use client'
import React, { useState } from "react";
import Link from "next/link";
import Tag from "../components/Tag";

const RAG_TOPICS = ["How-to", "Product", "Best practices", "API/SDK", "SSO"];

export default function InteractiveAgent() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [finalResponse, setFinalResponse] = useState(null);
  const [sources, setSources] = useState([]);
  const [error, setError] = useState(null);

  const classifyTicket = async (text) => {
    const res = await fetch("http://localhost:8000/generate-response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: text.split('\n')[0] || text.substring(0, 50),
        body: text,
      }),
    });
    if (!res.ok) throw new Error("Failed to classify ticket");
    const data = await res.json();
    return data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setAnalysis(null);
    setFinalResponse(null);
    setSources([]);

    try {
      const result = await classifyTicket(query);
      setAnalysis(result.internal_analysis);
      setFinalResponse(result.final_response);
      setSources(result.sources || []);
    } catch (err) {
      setError('An error occurred. Please check the console for details.');
      console.error(err);
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
          <Link href="/">
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
              Dashboard
            </button>
          </Link>
          <button style={{ 
            padding: "0.5rem 1rem", 
            background: "#6366f1", 
            color: "#fff", 
            border: "none", 
            borderRadius: "6px", 
            fontWeight: "500",
            fontSize: "0.875rem"
          }}>
            Agent
          </button>
        </div>

        {/* Main Content */}
        <div style={{ background: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
          {/* Header */}
          <div style={{ 
            padding: "1.5rem",
            borderBottom: "1px solid #e5e7eb"
          }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#111827", margin: 0 }}>
              Interactive AI Agent
            </h3>
            <p style={{ 
              color: "#6b7280", 
              fontSize: "0.875rem", 
              marginTop: "0.5rem",
              marginBottom: 0,
              lineHeight: "1.5"
            }}>
              Submit a new ticket or question to see the AI copilot in action.
            </p>
          </div>

          {/* Form */}
          <div style={{ padding: "1.5rem" }}>
            <form onSubmit={handleSubmit} style={{ marginBottom: "1.5rem" }}>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter a customer support query here... e.g., 'How do I create a custom metadata field in Atlan?'"
                style={{
                  width: "100%",
                  minHeight: "120px",
                  padding: "1rem",
                  border: "2px solid #6366f1",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  background: "#374151",
                  color: "#fff",
                  outline: "none",
                  resize: "vertical",
                  fontFamily: "inherit"
                }}
                required
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                style={{
                  marginTop: "1rem",
                  padding: "0.75rem 1.5rem",
                  background: loading ? "#9ca3af" : "#6366f1",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  fontWeight: "600",
                  fontSize: "0.875rem",
                  cursor: loading || !query.trim() ? "not-allowed" : "pointer"
                }}
              >
                {loading ? "Processing..." : "Submit Ticket"}
              </button>
            </form>

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

            {/* Results */}
            {(analysis || finalResponse) && (
              <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "1fr 1fr" }}>
                {/* Internal Analysis View */}
                <div style={{ 
                  background: "#f9fafb", 
                  border: "1px solid #e5e7eb", 
                  borderRadius: "8px", 
                  padding: "1.5rem" 
                }}>
                  <h4 style={{ 
                    fontSize: "1rem", 
                    fontWeight: "600", 
                    color: "#374151", 
                    marginBottom: "1rem",
                    margin: 0
                  }}>
                    Internal Analysis View
                  </h4>
                  {analysis && (
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "1rem" }}>
                      <Tag type="topic" value={analysis.topic} />
                      <Tag type="sentiment" value={analysis.sentiment} />
                      <Tag type="priority" value={analysis.priority} />
                    </div>
                  )}
                </div>

                {/* Final Response View */}
                <div style={{ 
                  background: "#f9fafb", 
                  border: "1px solid #e5e7eb", 
                  borderRadius: "8px", 
                  padding: "1.5rem" 
                }}>
                  <h4 style={{ 
                    fontSize: "1rem", 
                    fontWeight: "600", 
                    color: "#374151", 
                    marginBottom: "1rem",
                    margin: 0
                  }}>
                    Final Response View
                  </h4>
                  {finalResponse && (
                    <div style={{ marginTop: "1rem" }}>
                      <p style={{ 
                        fontSize: "0.875rem", 
                        color: "#374151", 
                        lineHeight: "1.6",
                        margin: 0
                      }}>
                        {finalResponse}
                      </p>
                      {sources && sources.length > 0 && (
                        <div style={{ marginTop: "1rem" }}>
                          <h5 style={{ 
                            fontSize: "0.75rem", 
                            fontWeight: "600", 
                            color: "#6b7280", 
                            marginBottom: "0.5rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em"
                          }}>
                            Sources:
                          </h5>
                          <ul style={{ 
                            margin: 0, 
                            paddingLeft: "1rem", 
                            fontSize: "0.75rem" 
                          }}>
                            {sources.map((source, index) => (
                              <li key={index} style={{ marginBottom: "0.25rem" }}>
                                <a 
                                  href={source} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  style={{ 
                                    color: "#6366f1", 
                                    textDecoration: "underline" 
                                  }}
                                >
                                  {source}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
