import { useState } from "react";

const API = "http://localhost:3000";

/**
 * Hook for AI services
 */
export function useAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Extract data from document
   */
  const extractDocument = async (file) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("document", file);

      const response = await fetch(`${API}/ai/extract-document`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to extract document");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verify document authenticity
   */
  const verifyDocument = async (file, docType = "land_deed") => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("document", file);
      formData.append("docType", docType);

      const response = await fetch(`${API}/ai/verify-document`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to verify document");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Analyze land listing
   */
  const analyzeLand = async (landData, documentsExtracted = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API}/ai/analyze-land`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          landData,
          documentsExtracted,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze land");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check for duplicates
   */
  const checkDuplicate = async (currentLand, similarLands = []) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API}/ai/check-duplicate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentLand,
          similarLands,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to check duplicates");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verify coordinates
   */
  const verifyCoordinates = async (coordinates, landmark = "", address = "") => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API}/ai/verify-coordinates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coordinates,
          landmark,
          address,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to verify coordinates");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Full verification workflow
   */
  const fullVerification = async (landData, documentsExtracted = {}, similarLands = []) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API}/ai/full-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          landData,
          documentsExtracted,
          similarLands,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to verify land");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    extractDocument,
    verifyDocument,
    analyzeLand,
    checkDuplicate,
    verifyCoordinates,
    fullVerification,
  };
}

export default useAI;
