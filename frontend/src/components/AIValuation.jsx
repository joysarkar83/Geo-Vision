import "../styles/AIValuation.css";

function AIValuation({ verificationReport }) {
  if (!verificationReport) return null;

  const { overallScore, status, checks } = verificationReport;

  const getScoreColor = (score) => {
    if (score >= 80) return "#22c55e"; // green
    if (score >= 60) return "#eab308"; // yellow
    return "#ef4444"; // red
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "APPROVED":
        return "✅";
      case "APPROVED_WITH_REVIEW":
        return "⚠️";
      case "NEEDS_REVIEW":
        return "🔍";
      case "REJECTED":
        return "❌";
      default:
        return "❓";
    }
  };

  return (
    <div className="ai-valuation">
      <div className="card">
        <div className="valuation-header">
          <h3>🤖 AI Verification Report</h3>
          <span className={`status-badge ${status.toLowerCase()}`}>
            {getStatusIcon(status)} {status}
          </span>
        </div>

        {/* Overall Score */}
        <div className="score-section">
          <div className="circular-score">
            <svg viewBox="0 0 100 100" className="score-circle">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#f3f4f6"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={getScoreColor(overallScore)}
                strokeWidth="8"
                strokeDasharray={`${(overallScore / 100) * 283} 283`}
                strokeLinecap="round"
                style={{ transform: "rotate(-90deg)", transformOrigin: "50px 50px" }}
              />
              <text
                x="50"
                y="50"
                textAnchor="middle"
                dy="0.3em"
                className="score-text"
                fill={getScoreColor(overallScore)}
              >
                {overallScore}
              </text>
            </svg>
            <p className="score-label">Overall Score</p>
          </div>

          <div className="score-details">
            <p className="score-description">
              {status === "APPROVED"
                ? "✅ This land listing meets all verification requirements"
                : status === "APPROVED_WITH_REVIEW"
                ? "⚠️ This listing is approved but may need minor review"
                : status === "NEEDS_REVIEW"
                ? "🔍 This listing needs admin review before approval"
                : "❌ This listing does not meet verification requirements"}
            </p>
          </div>
        </div>

        {/* Detailed Checks */}
        <div className="checks-section">
          <h4>📊 Verification Breakdown</h4>

          {/* Verification Check */}
          {checks?.verification && (
            <div className="check-item">
              <div className="check-header">
                <span className="check-icon">📋</span>
                <span className="check-title">Data Consistency</span>
                <span
                  className="check-score"
                  style={{
                    color: getScoreColor(checks.verification.verification?.verificationScore || 0),
                  }}
                >
                  {checks.verification.verification?.verificationScore || 0}%
                </span>
              </div>
              <div className="check-details">
                {checks.verification.verification?.consistencyCheck?.dataMatches ? (
                  <p className="pass">✅ Data matches documents</p>
                ) : (
                  <p className="fail">❌ Data inconsistencies found</p>
                )}
                {checks.verification.verification?.riskFactors?.priceAnomaly && (
                  <p className="warning">⚠️ Price may be unusual for location</p>
                )}
                {checks.verification.verification?.reasoning && (
                  <p className="detail">{checks.verification.verification.reasoning}</p>
                )}
              </div>
            </div>
          )}

          {/* Fraud Detection */}
          {checks?.duplicateDetection && (
            <div className="check-item">
              <div className="check-header">
                <span className="check-icon">🚨</span>
                <span className="check-title">Fraud Detection</span>
                <span
                  className="check-score"
                  style={{
                    color: getScoreColor(100 - (checks.duplicateDetection.fraud?.duplicateLikelihood || 0)),
                  }}
                >
                  {100 - (checks.duplicateDetection.fraud?.duplicateLikelihood || 0)}%
                </span>
              </div>
              <div className="check-details">
                {checks.duplicateDetection.fraud?.isDuplicate ? (
                  <p className="fail">❌ Possible duplicate listing detected</p>
                ) : (
                  <p className="pass">✅ No duplicate detected</p>
                )}
                {checks.duplicateDetection.fraud?.fraudRiskLevel && (
                  <p className={`badge ${checks.duplicateDetection.fraud.fraudRiskLevel.toLowerCase()}`}>
                    Risk Level: {checks.duplicateDetection.fraud.fraudRiskLevel}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Coordinate Verification */}
          {checks?.coordinates && (
            <div className="check-item">
              <div className="check-header">
                <span className="check-icon">📍</span>
                <span className="check-title">Location Verification</span>
                <span className="check-score" style={{ color: checks.coordinates.valid ? "#22c55e" : "#ef4444" }}>
                  {checks.coordinates.valid ? "Valid" : "Invalid"}
                </span>
              </div>
              <div className="check-details">
                {checks.coordinates.valid ? (
                  <p className="pass">✅ Coordinates are valid</p>
                ) : (
                  <p className="fail">❌ {checks.coordinates.reason}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Recommendation */}
        <div className="recommendation-section">
          <h4>💡 Recommendation</h4>
          <div className={`recommendation ${status.toLowerCase()}`}>
            {status === "APPROVED" && (
              <p>This land listing is verified and ready for the marketplace. Proceed with listing approval.</p>
            )}
            {status === "APPROVED_WITH_REVIEW" && (
              <p>
                The listing appears legitimate but minor issues were detected. A quick admin review is recommended
                before approval.
              </p>
            )}
            {status === "NEEDS_REVIEW" && (
              <p>
                Multiple verification concerns were detected. An admin must manually review this listing before
                approval.
              </p>
            )}
            {status === "REJECTED" && (
              <p>This listing does not meet verification requirements and should not be approved.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIValuation;
