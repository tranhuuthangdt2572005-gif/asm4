/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../features/authSlice";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const { isAuthenticated, user, error, loading } = useSelector(
    (state: any) => state.auth,
  );

  useEffect(() => {
    if (isAuthenticated && user) {
      user.admin ? navigate("/admin") : navigate("/dashboard");
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginUser({ username: username, password: password }));
  };

  return (
    <div
      className="position-relative d-flex align-items-center justify-content-center min-vh-100 px-3"
      style={{ background: "#fdf6ef" }}
    >
      <div
        className="position-relative w-100 d-flex justify-content-center align-items-center"
        style={{ maxWidth: "1000px", minHeight: "550px", zIndex: 10 }}
      >
        <div
          className="card login-card w-100 h-100"
          style={{ background: "var(--natural-color)" }}
        >
          <div className="row g-0 h-100">
            {/* Left Column: Branding — warm terracotta */}
            <div
              className="col-md-6 d-flex flex-column justify-content-between p-5 text-white position-relative overflow-hidden shadow-inner"
              style={{ backgroundColor: "#8B4513", minHeight: "550px" }}
            >
              <div
                className="position-absolute"
                style={{
                  width: "300px",
                  height: "300px",
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 70%)",
                  top: "-50px",
                  left: "-50px",
                }}
              />

              <div className="position-relative">
                <h1
                  className="display-2 font-josefin fw-bold text-white mb-0"
                  style={{ letterSpacing: "0.2em" }}
                >
                  QUIZ
                </h1>
                <p
                  className="fs-3 font-rhodium text-white-50 text-uppercase"
                  style={{ letterSpacing: "0.15em" }}
                >
                  Management
                </p>
              </div>

              <div className="position-relative mt-auto">
                <hr className="bg-white opacity-25 w-25 mb-3" />
                <p className="small text-white-50 mb-0 font-monospace">
                  ELEVATE YOUR KNOWLEDGE
                </p>
              </div>
            </div>

            {/* Right Column: Login Form */}
            <div
              className="col-md-6 d-flex flex-column justify-content-center p-5 position-relative"
              style={{ backgroundColor: "var(--natural-color)" }}
            >
              <div className="w-100">
                <h2
                  className="fw-bold mb-4 font-josefin"
                  style={{ color: "#3d1a0a" }}
                >
                  Login
                </h2>

                {error && (
                  <div className="alert alert-danger py-2 small text-center mb-4">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-semibold">
                      Username
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg py-2 fs-6"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      placeholder="Enter username"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label text-muted small fw-semibold">
                      Password
                    </label>
                    <input
                      type="password"
                      className="form-control form-control-lg py-2 fs-6"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-lg w-100 py-2 fw-semibold font-josefin text-white"
                    disabled={loading}
                    style={{
                      letterSpacing: "0.05em",
                      backgroundColor: "#8B4513",
                      border: "none",
                    }}
                  >
                    {loading ? "Logging in..." : "Login"}
                  </button>
                </form>

                <div className="text-center mt-4">
                  <Link
                    to="/register"
                    className="text-decoration-none small text-muted"
                  >
                    Don't have an account?{" "}
                    <span style={{ color: "#8B4513" }} className="fw-bold">
                      Register here
                    </span>
                  </Link>

                  <button
                    onClick={() => navigate("/dashboard")}
                    className="btn btn-lg w-100 py-2 mt-4 fw-semibold font-josefin text-white"
                    disabled={loading}
                    style={{
                      letterSpacing: "0.05em",
                      backgroundColor: "#8B4513",
                      border: "none",
                    }}
                  >
                    {loading ? "Forwarding..." : "Continue as Guest"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
