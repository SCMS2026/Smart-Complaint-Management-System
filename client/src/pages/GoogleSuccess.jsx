import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

function GoogleSuccess() {
  const [params] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const token = params.get("token");
      const user = params.get("user");

      if (!token) {
        setError("No authentication token received");
        setLoading(false);
        return;
      }

      // Store JWT token
      localStorage.setItem("user_token", token);

      // Store user data if available
      if (user) {
        try {
          const userData = JSON.parse(decodeURIComponent(user));
          localStorage.setItem("user", JSON.stringify(userData));
        } catch (e) {
          console.warn("Could not parse user data", e);
        }
      }

      // Redirect to home
      setTimeout(() => {
        window.location.href = "/";
      }, 300);
    } catch (err) {
      console.error("Google success page error:", err);
      setError(err.message || "Something went wrong");
      setLoading(false);
    }
  }, [params]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <a href="/login" className="text-indigo-600 hover:underline">
            Back to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Processing your login...</p>
      </div>
    </div>
  );
}

export default GoogleSuccess;
