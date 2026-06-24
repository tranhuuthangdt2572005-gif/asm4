/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosClient from "../shared/api/axiosClient";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [info, setInfo] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axiosClient.post("/users/register", { username, password });
      setInfo("Đăng ký thành công! Đang chuyển hướng...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err: any) {
      setInfo(
        err.response?.data?.message ||
          err.response?.data?.err ||
          "Username đã tồn tại trên hệ thống!",
      );
    }
  };

  return (
    <div
      className="position-relative d-flex align-items-center justify-content-center min-vh-100 px-3"
      style={{ background: "#fdf6ef" }}
    >
      {/* <img
        src="/Rectangle 481.png"
        alt="decor"
        className="position-fixed top-0 start-0"
        style={{
          width: "40vw",
          maxWidth: "600px",
          height: "auto",
          pointerEvents: "none",
          zIndex: 0,
          opacity: 0.8,
        }}
      />
      <img
        src="/Rectangle 480.png"
        alt="decor"
        className="position-fixed bottom-0 end-0"
        style={{
          width: "40vw",
          maxWidth: "600px",
          height: "auto",
          pointerEvents: "none",
          zIndex: 0,
          opacity: 0.8,
        }}
      /> */}

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
              className="col-md-6 d-flex flex-column justify-content-between p-5 text-white position-relative overflow-hidden"
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
                  JOIN OUR COMMUNITY
                </p>
              </div>
            </div>

            {/* Right Column: Register Form */}
            <div
              className="col-md-6 d-flex flex-column justify-content-center p-5 position-relative"
              style={{ backgroundColor: "var(--natural-color)" }}
            >
              <div className="w-100">
                <h2
                  className="fw-bold mb-4 font-josefin"
                  style={{ color: "#3d1a0a" }}
                >
                  Register
                </h2>

                {info && (
                  <div className="alert alert-info py-2 small text-center mb-4">
                    {info}
                  </div>
                )}

                <form onSubmit={handleRegister}>
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
                      placeholder="Choose a username"
                    />
                  </div>
                  <div className="mb-3">
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
                    style={{
                      letterSpacing: "0.05em",
                      backgroundColor: "#8B4513",
                      border: "none",
                    }}
                  >
                    Create Account
                  </button>
                </form>

                <div className="text-center mt-4">
                  <Link
                    to="/login"
                    className="text-decoration-none small text-muted"
                  >
                    Already have an account?{" "}
                    <span style={{ color: "#8B4513" }} className="fw-bold">
                      Back to Login
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
