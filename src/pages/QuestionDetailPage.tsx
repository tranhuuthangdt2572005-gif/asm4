/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, Link } from "react-router-dom";
import { logout } from "../features/authSlice";
import { fetchQuestionById } from "../features/managerSlice";

export default function QuestionDetailPage() {
  const { questionId } = useParams<{ questionId: string }>();
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();

  const { user, isAuthenticated } = useSelector((state: any) => state.auth);
  const { currentQuestion, loading, error } = useSelector(
    (state: any) => state.manager,
  );

  useEffect(() => {
    if (questionId) {
      dispatch(fetchQuestionById(questionId));
    }
  }, [dispatch, questionId]);

  return (
    <div
      className="position-relative min-vh-100 pb-5 px-3"
      style={{ background: "#fdf6ef", paddingTop: "110px" }}
    >
      <img
        src="/Rectangle 481.png"
        alt="decor"
        className="position-fixed top-0 start-0"
        style={{
          width: "40vw",
          maxWidth: "600px",
          height: "auto",
          pointerEvents: "none",
          zIndex: 0,
          opacity: 0.6,
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
          opacity: 0.6,
        }}
      />

      {/* Navigation Header */}
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
          <button
            className="btn nav-link-custom active btn-link text-decoration-none px-2 py-1"
            onClick={() => navigate("/dashboard")}
          >
            Question Detail
          </button>
          <button
            className="btn nav-link-custom btn-link text-decoration-none px-2 py-1"
            onClick={() => navigate("/dashboard")}
          >
            Article
          </button>
        </div>

        <div className="ms-auto d-flex align-items-center gap-2">
          {user?.admin && (
            <Link
              to="/admin"
              className="btn btn-sm px-3 rounded-pill fw-medium me-2"
              style={{ border: "1px solid #8B4513", color: "#8B4513" }}
            >
              Admin Panel
            </Link>
          )}
          {isAuthenticated ? (
            <button
              className="btn btn-outline-danger btn-sm px-3 rounded-pill fw-medium"
              onClick={() => {
                dispatch(logout());
                navigate("/dashboard");
              }}
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
        {loading ? (
          <div className="text-center py-5">
            <div
              className="spinner-border"
              style={{ color: "#8B4513" }}
              role="status"
            />
          </div>
        ) : error ? (
          <div className="alert alert-danger text-center shadow-sm rounded-4 py-4">
            <h4 className="fw-bold mb-2">Đã xảy ra lỗi</h4>
            <p className="mb-3">{error}</p>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => navigate("/dashboard")}
            >
              Quay lại Dashboard
            </button>
          </div>
        ) : currentQuestion ? (
          <div className="mx-auto" style={{ maxWidth: "650px" }}>
            <div
              className="card p-5 border-0 shadow-lg rounded-4"
              style={{ backgroundColor: "var(--natural-color)" }}
            >
              <div className="mb-4">
                <span
                  className="badge rounded-pill px-3 py-2 text-white font-monospace text-uppercase"
                  style={{
                    letterSpacing: "0.05em",
                    backgroundColor: "#8B4513",
                  }}
                >
                  Question Details
                </span>
              </div>

              <h2
                className="fw-bold font-josefin mb-4"
                style={{ color: "#3d1a0a", lineHeight: "1.4" }}
              >
                {currentQuestion.text}
              </h2>

              <h5 className="text-muted small fw-bold mb-3">OPTIONS</h5>
              <ul className="list-group list-group-flush rounded-3 border mb-4">
                {currentQuestion.options?.map((opt: string, idx: number) => {
                  const isCorrect = idx === currentQuestion.correctAnswerIndex;
                  return (
                    <li
                      key={idx}
                      className={`list-group-item d-flex align-items-center py-3 px-4 border-0 ${isCorrect ? "bg-success bg-opacity-10 fw-bold" : ""}`}
                      style={{ color: isCorrect ? "#2e7d32" : "inherit" }}
                    >
                      <span className="me-3 fw-bold">#{idx}</span> {opt}
                      {isCorrect && (
                        <span className="badge bg-success ms-auto small rounded-pill px-3 py-1">
                          Correct Answer
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>

              {currentQuestion.keywords &&
                currentQuestion.keywords.length > 0 && (
                  <div className="mb-4">
                    <h6 className="text-muted small fw-bold mb-2">KEYWORDS</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {currentQuestion.keywords.map((kw: string, i: number) => (
                        <span
                          className="badge rounded-pill px-2 py-1"
                          key={i}
                          style={{
                            backgroundColor: "rgba(139,69,19,0.12)",
                            color: "#5c2a0e",
                          }}
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              <div className="border-top pt-4 mt-4 d-flex justify-content-between align-items-center">
                <button
                  className="btn btn-outline-secondary px-4 py-2 rounded-3 font-josefin"
                  onClick={() => navigate("/dashboard")}
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-5">
            <p className="text-muted">Không tìm thấy câu hỏi.</p>
          </div>
        )}
      </div>
    </div>
  );
}
