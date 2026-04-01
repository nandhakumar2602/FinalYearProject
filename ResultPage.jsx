import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import TemporalAnalysis from "../Temporal_Analysis/TemporalAnalysis";
import "./ResultPage.css";

const ResultsPage = ({ prediction }) => {
  const reportRef = useRef();
  const navigate = useNavigate();

  if (!prediction) {
    return <h2 className="no-data">No prediction available</h2>;
  }

  const handlePrint = () => {
    if (!reportRef.current) return;
    const printContents = reportRef.current.innerHTML;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  const isFake = prediction.prediction === 1;
  const confidence = (prediction.probability * 100).toFixed(2);

  const domainData = prediction.domain_verification;

  return (
    <div className="results-page">
      <div className="report-card" ref={reportRef}>

        <h1 className="title">Job Analysis Result</h1>

        {/* ✅ MAIN RESULT (Clean Output) */}
        <div className="result-summary">
          <h2 className={isFake ? "fake" : "real"}>
            {isFake ? "Fake Job ❌" : "Real Job ✅"}
          </h2>

          <p className="confidence">
            Confidence: {confidence}%
          </p>
        </div>

        <hr />

        {/* Job Info */}
        <div className="section">
          <p><strong>Title:</strong> {prediction.title}</p>

          <p><strong>Description:</strong></p>
          <div className="job-desc">
            {prediction.description}
          </div>
        </div>

        {/* Domain Verification */}
        {domainData && (
          <div className="section">
            <h3>Domain Verification</h3>

            <p><strong>Email:</strong> {domainData.email || "Not Found"}</p>
            <p><strong>Status:</strong> {domainData.status}</p>
            <p><strong>Reason:</strong> {domainData.reason}</p>
          </div>
        )}

        {/* Temporal Analysis */}
        <div className="section">
          <TemporalAnalysis temporalData={prediction.temporal} />
        </div>

      </div>

      {/* Buttons */}
      <div className="button-group">
        <button onClick={() => navigate("/analyze")}>
          Analyze Another Job
        </button>

        <button
          onClick={() =>
            navigate("/cross-platform", {
              state: {
                title: prediction.title,
                description: prediction.description,
              },
            })
          }
        >
          Check Cross-Platform Presence
        </button>

        <button onClick={handlePrint}>Print Report</button>
      </div>
    </div>
  );
};

export default ResultsPage;
