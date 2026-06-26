/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { logout } from "../features/authSlice";
import { submitAnswer, restartQuiz } from "../features/quizSlice";

export default function QuizSessionPage() {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const { currentQuiz, currentQuestionIndex, score, isCompleted } = useSelector(
    (state: any) => state.quiz,
  );
  const { isAuthenticated } = useSelector((state: any) => state.auth);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  if (!currentQuiz) {
    return (
      <div className="container py-5 text-center min-vh-100 d-flex justify-content-center align-items-center">
        <div
          className="card p-5 border-0 shadow-lg text-center rounded-4"
          style={{ maxWidth: "500px", background: "var(--natural-color)" }}
        >
          <h4
            className="fw-bold font-josefin mb-3"
            style={{ color: "#3d1a0a" }}
          >
            No Active Session
          </h4>
          <p className="text-muted small mb-4">
            Please select a quiz from the dashboard first.
          </p>
          <button
            className="btn btn-lg px-4 py-2 text-white"
            style={{
              backgroundColor: "#8B4513",
              border: "none",
              borderRadius: "0.5rem",
            }}
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = currentQuiz.questions[currentQuestionIndex];
  const progressPercent =
    currentQuiz.questions.length > 0
      ? (currentQuestionIndex / currentQuiz.questions.length) * 100
      : 0;

  const handleNext = () => {
    if (selectedOption === null) return alert("Vui lòng chọn 1 đáp án!");
    dispatch(submitAnswer(selectedOption));
    setSelectedOption(null);
  };

  if (isCompleted) {
    return (
      <div
        className="position-relative min-vh-100 d-flex flex-column justify-content-center align-items-center px-3"
        style={{ background: "#fdf6ef" }}
      >
        <div
          className="card border-0 p-5 shadow-lg text-center rounded-4 position-relative"
          style={{
            maxWidth: "550px",
            width: "100%",
            background: "var(--natural-color)",
            zIndex: 10,
          }}
        >
          <div
            className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4"
            style={{
              width: "80px",
              height: "80px",
              backgroundColor: "rgba(139, 69, 19, 0.1)",
            }}
          >
            <span className="fs-1" style={{ color: "#8B4513" }}>
              ✓
            </span>
          </div>
          <h1
            className="display-5 fw-bold font-josefin mb-2"
            style={{ color: "#3d1a0a" }}
          >
            Quiz Completed
          </h1>
          <p className="fs-5 text-muted mb-4">
            Your final score:{" "}
            <span className="fw-bold fs-4" style={{ color: "#3d1a0a" }}>
              {score}
            </span>{" "}
            / {currentQuiz.questions.length}
          </p>
          <div className="d-flex gap-3 justify-content-center">
            <button
              className="btn px-4 py-2 font-josefin text-white"
              style={{
                backgroundColor: "#8B4513",
                border: "none",
                borderRadius: "0.5rem",
              }}
              onClick={() => dispatch(restartQuiz())}
            >
              Restart Quiz
            </button>
            <button
              className="btn btn-outline-secondary px-4 py-2 font-josefin"
              onClick={() => navigate("/dashboard")}
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="position-relative min-vh-100 pb-5 px-3"
      style={{ background: "#fdf6ef", paddingTop: "110px" }}
    >
      {/* Fixed top glassmorphic Navigation Bar */}
      <nav
        className="navbar glass-nav position-fixed top-0 start-50 translate-middle-x my-3 p-3 d-flex align-items-center gap-4"
        style={{ zIndex: 100, width: "calc(100% - 30px)", maxWidth: "1320px" }}
      >
        <div className="d-flex gap-3">
          <button
            className="btn nav-link-custom btn-link text-decoration-none px-2 py-1"
            onClick={() => navigate("/dashboard")}
          >
            Home
          </button>
          <button className="btn nav-link-custom active btn-link text-decoration-none px-2 py-1">
            Quiz
          </button>
          <button
            className="btn nav-link-custom btn-link text-decoration-none px-2 py-1"
            onClick={() => navigate("/dashboard")}
          >
            Article
          </button>
        </div>

        <div className="ms-auto d-flex align-items-center gap-2">
          {isAuthenticated ? (
            <button
              className="btn btn-outline-danger btn-sm px-3 rounded-pill fw-medium"
              onClick={() => dispatch(logout())}
              style={{ transition: "all 0.2s ease" }}
            >
              Logout
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="btn btn-outline-dark btn-sm px-3 rounded-pill fw-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="btn btn-sm px-3 rounded-pill fw-medium text-white"
                style={{ backgroundColor: "#8B4513", border: "none" }}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>

      <div className="container position-relative" style={{ zIndex: 10 }}>
        <div
          className="mx-auto"
          style={{ maxWidth: "700px", marginTop: "40px" }}
        >
          <div
            className="card border-0 p-5 shadow-lg rounded-4"
            style={{ background: "var(--natural-color)" }}
          >
            {/* Session Info */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span
                className="text-muted small fw-semibold text-uppercase font-monospace"
                style={{ letterSpacing: "0.05em" }}
              >
                {currentQuiz.title}
              </span>
              <span className="small text-muted fw-bold">
                Question {currentQuestionIndex + 1} of{" "}
                {currentQuiz.questions.length}
              </span>
            </div>

            {/* Progress Bar */}
            <div
              className="progress mb-5"
              style={{
                height: "6px",
                borderRadius: "3px",
                backgroundColor: "rgba(139, 69, 19, 0.1)",
              }}
            >
              <div
                className="progress-bar"
                role="progressbar"
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: "#8B4513",
                  transition: "width 0.3s ease",
                }}
              />
            </div>

            {/* Question Text */}
            <h3
              className="h4 fw-bold mb-4 font-josefin text-center"
              style={{ color: "#3d1a0a", lineHeight: "1.5" }}
            >
              {currentQuestion?.text}
            </h3>

            {/* Options List */}
            <div className="my-4">
              {currentQuestion?.options.map((option: string, index: number) => (
                <div
                  className={`option-box mb-3 ${selectedOption === index ? "selected" : ""}`}
                  key={index}
                  onClick={() => setSelectedOption(index)}
                >
                  <input
                    className="form-check-input me-3"
                    type="radio"
                    name="quizOpt"
                    id={`opt-${index}`}
                    checked={selectedOption === index}
                    onChange={() => setSelectedOption(index)}
                    style={{ cursor: "pointer", accentColor: "#8B4513" }}
                  />
                  <span className="fs-5">{option}</span>
                </div>
              ))}
            </div>

            {/* Submit Action */}
            <button
              className="btn btn-lg w-100 py-3 mt-4 rounded-3 fw-semibold font-josefin text-white"
              onClick={handleNext}
              style={{
                letterSpacing: "0.05em",
                backgroundColor: "#8B4513",
                border: "none",
              }}
            >
              Submit Answer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
