import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { logout } from "../features/authSlice";
import { fetchQuizzes, selectQuiz } from "../features/quizSlice";
import {
  fetchAllQuestions,
  addQuestion,
  deleteQuestion,
  updateQuestion,
} from "../features/managerSlice";

export default function DashboardPage() {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state: any) => state.auth);
  const { list: quizzes, loading: loadingQuizzes } = useSelector(
    (state: any) => state.quiz,
  );
  const { questions, loading: loadingQuestions } = useSelector(
    (state: any) => state.manager,
  );

  const [activeTab, setActiveTab] = useState<"quizzes" | "questions">(
    "quizzes",
  );

  const [questionSearch, setQuestionSearch] = useState("");
  const [quizSearch, setQuizSearch] = useState("");

  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(
    null,
  );
  const [text, setText] = useState("");
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState<number>(0);

  useEffect(() => {
    dispatch(fetchQuizzes());
    dispatch(fetchAllQuestions());
  }, [dispatch]);

  const handleStartQuiz = (quiz: any) => {
    dispatch(selectQuiz(quiz));
    navigate("/dashboard/quiz");
  };

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleQuestionCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const filteredOptions = options.filter((opt) => opt.trim() !== "");
    if (filteredOptions.length < 2)
      return alert("Vui lòng điền tối thiểu 2 phương án đáp án!");

    if (editingQuestionId) {
      dispatch(
        updateQuestion({
          id: editingQuestionId,
          questionData: {
            text,
            options: filteredOptions,
            correctAnswerIndex: Number(correctIndex),
          },
        }),
      ).then(() => {
        dispatch(fetchAllQuestions());
        dispatch(fetchQuizzes());
      });
      setEditingQuestionId(null);
    } else {
      dispatch(
        addQuestion({
          text,
          options: filteredOptions,
          correctAnswerIndex: Number(correctIndex),
        }),
      ).then(() => {
        dispatch(fetchAllQuestions());
      });
    }

    setText("");
    setOptions(["", "", "", ""]);
    setCorrectIndex(0);
  };

  const handleCancelQuestionEdit = () => {
    setEditingQuestionId(null);
    setText("");
    setOptions(["", "", "", ""]);
    setCorrectIndex(0);
  };

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
            className={`btn nav-link-custom btn-link text-decoration-none px-2 py-1 ${activeTab === "quizzes" ? "active" : ""}`}
            onClick={() => setActiveTab("quizzes")}
          >
            Quizzes
          </button>
          <button
            className={`btn nav-link-custom btn-link text-decoration-none px-2 py-1 ${activeTab === "questions" ? "active" : ""}`}
            onClick={() => setActiveTab("questions")}
          >
            Questions
          </button>
        </div>

        <div className="ms-auto d-flex align-items-center gap-2">
          {isAuthenticated && user?.admin && (
            <Link
              to="/admin"
              className="btn btn-sm px-3 rounded-pill fw-medium me-2"
              style={{
                border: "1px solid #8B4513",
                color: "#8B4513",
                backgroundColor: "transparent",
              }}
            >
              Admin Panel
            </Link>
          )}

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
        {/* Header Block */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1
              className="h3 fw-bold font-josefin m-0"
              style={{ color: "#3d1a0a", letterSpacing: "0.05em" }}
            >
              Dashboard
            </h1>
            {isAuthenticated ? (
              <p className="small text-muted mb-0">
                Welcome back,{" "}
                <span className="fw-semibold" style={{ color: "#3d1a0a" }}>
                  {user?.username}
                </span>
              </p>
            ) : (
              <p className="small text-muted mb-0">
                Welcome,{" "}
                <span className="fw-semibold" style={{ color: "#3d1a0a" }}>
                  Guest
                </span>{" "}
                (login to create questions)
              </p>
            )}
          </div>
          <span
            className="badge rounded-pill px-3 py-2 font-monospace"
            style={{
              color: "#3d1a0a",
              backgroundColor: isAuthenticated
                ? user?.admin
                  ? "rgba(220, 53, 69, 0.12)"
                  : "rgba(139, 69, 19, 0.12)"
                : "rgba(108, 117, 125, 0.12)",
              border: isAuthenticated
                ? user?.admin
                  ? "1px solid rgba(220, 53, 69, 0.2)"
                  : "1px solid rgba(139, 69, 19, 0.25)"
                : "1px solid rgba(108, 117, 125, 0.2)",
            }}
          >
            {isAuthenticated
              ? user?.admin
                ? "ADMIN MODE"
                : "STUDENT MODE"
              : "GUEST MODE"}
          </span>
        </div>

        {/* Tab 1: QUIZZES TAB */}
        {activeTab === "quizzes" && (
          <div
            className="d-flex flex-column overflow-hidden"
            style={{ maxHeight: "calc(100vh - 200px)" }}
          >
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4
                className="fw-bold font-josefin text-uppercase m-0"
                style={{ color: "#5c2a0e", letterSpacing: "0.05em" }}
              >
                Available Quizzes
              </h4>
              <input
                type="text"
                className="form-control form-control-sm rounded-pill px-3"
                style={{ maxWidth: "200px" }}
                placeholder="Tìm đề thi..."
                value={quizSearch}
                onChange={(e) => setQuizSearch(e.target.value)}
              />
            </div>

            {loadingQuizzes ? (
              <div className="d-flex justify-content-center py-5">
                <div
                  className="spinner-border"
                  style={{ color: "#8B4513" }}
                  role="status"
                />
              </div>
            ) : (
              <div
                className="flex-grow-1 overflow-y-auto pe-2"
                style={{ minHeight: 0 }}
              >
                <div className="row g-4">
                  {quizzes && quizzes.length > 0 ? (
                    quizzes
                      .filter((quiz: any) =>
                        quiz.title
                          .toLowerCase()
                          .includes(quizSearch.toLowerCase()),
                      )
                      .map((quiz: any) => (
                        <div className="col-md-6" key={quiz._id}>
                          <div
                            className="card h-100 p-4 border-0"
                            style={{
                              backgroundColor: "var(--natural-color)",
                              borderRadius: "1rem",
                            }}
                          >
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <h5
                                className="fw-bold font-josefin text-uppercase m-0"
                                style={{
                                  color: "#8B4513",
                                  letterSpacing: "0.05em",
                                }}
                              >
                                {quiz.title}
                              </h5>
                              <span
                                className="badge rounded-pill bg-light border font-monospace small"
                                style={{ color: "#a0522d" }}
                              >
                                {quiz.questions?.length || 0} Questions
                              </span>
                            </div>
                            <p className="text-muted small flex-grow-1 lh-base mb-4">
                              {quiz.description ||
                                "Không có mô tả cho đề trắc nghiệm này."}
                            </p>
                            <div className="d-flex gap-2 mt-auto">
                              <button
                                className="btn btn-md flex-grow-1 py-2 rounded-3 fw-medium font-josefin text-white"
                                style={{
                                  backgroundColor: "#8B4513",
                                  border: "none",
                                }}
                                onClick={() => handleStartQuiz(quiz)}
                              >
                                Do Quiz
                              </button>
                              <Link
                                to={`/dashboard/quizzes/${quiz._id}`}
                                className="btn btn-outline-dark btn-md px-3 rounded-3 fw-medium font-josefin"
                              >
                                Details
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="col-12">
                      <div
                        className="card text-center p-5 border-0 rounded-4"
                        style={{ backgroundColor: "var(--natural-color)" }}
                      >
                        <p className="text-muted mb-0">
                          Hiện tại chưa có đề trắc nghiệm nào khớp hoặc được
                          tạo.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: QUESTIONS TAB */}
        {activeTab === "questions" &&
          (isAuthenticated ? (
            <div className="row g-4">
              {/* Left Column: Create Question Form */}
              <div className="col-lg-5">
                <h4
                  className="fw-bold font-josefin mb-4"
                  style={{ color: "#3d1a0a" }}
                >
                  {editingQuestionId ? "Edit Question" : "Create New Question"}
                </h4>
                <div
                  className="card p-4 border-0 shadow-sm rounded-4"
                  style={{ background: "var(--natural-color)" }}
                >
                  <form onSubmit={handleQuestionCreate}>
                    <div className="mb-3">
                      <label className="form-label text-muted small fw-semibold">
                        Question Text
                      </label>
                      <textarea
                        className="form-control"
                        rows={2}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        required
                        placeholder="Enter question content..."
                      />
                    </div>

                    <label className="form-label text-muted small fw-semibold mb-2">
                      Options
                    </label>
                    {options.map((opt, idx) => (
                      <div className="input-group mb-2" key={idx}>
                        <span className="input-group-text bg-light text-muted border-end-0 small fw-bold">
                          #{idx}
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          value={opt}
                          onChange={(e) =>
                            handleOptionChange(idx, e.target.value)
                          }
                          required
                          placeholder={`Option ${idx + 1}`}
                        />
                      </div>
                    ))}

                    <div className="mb-4 mt-3">
                      <label className="form-label text-muted small fw-semibold">
                        Correct Answer Index
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        max="3"
                        value={correctIndex}
                        onChange={(e) =>
                          setCorrectIndex(Number(e.target.value))
                        }
                        required
                      />
                      <div className="form-text small text-muted">
                        Chỉ số từ 0 đến 3 khớp với tuỳ chọn tương ứng.
                      </div>
                    </div>

                    <div className="d-flex gap-2">
                      <button
                        type="submit"
                        className="btn btn-md flex-grow-1 py-2 rounded-3 fw-medium font-josefin text-white"
                        style={{ backgroundColor: "#8B4513", border: "none" }}
                      >
                        {editingQuestionId ? "Update Question" : "Add Question"}
                      </button>
                      {editingQuestionId && (
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-md py-2 rounded-3 fw-medium font-josefin"
                          onClick={handleCancelQuestionEdit}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>

              {/* Right Column: Scrollable Questions Bank List */}
              <div
                className="col-lg-7 d-flex flex-column overflow-hidden"
                style={{ maxHeight: "calc(100vh - 200px)" }}
              >
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4
                    className="fw-bold font-josefin m-0"
                    style={{ color: "#3d1a0a" }}
                  >
                    Questions Bank ({questions?.length || 0})
                  </h4>
                  <input
                    type="text"
                    className="form-control form-control-sm rounded-pill px-3"
                    style={{ maxWidth: "200px" }}
                    placeholder="Tìm câu hỏi..."
                    value={questionSearch}
                    onChange={(e) => setQuestionSearch(e.target.value)}
                  />
                </div>
                <div
                  className="flex-grow-1 overflow-y-auto pe-2"
                  style={{ minHeight: 0 }}
                >
                  <div className="d-flex flex-column gap-3">
                    {loadingQuestions ? (
                      <div className="d-flex justify-content-center py-4">
                        <div
                          className="spinner-border spinner-border-sm"
                          style={{ color: "#8B4513" }}
                          role="status"
                        />
                      </div>
                    ) : questions && questions.length > 0 ? (
                      questions
                        .filter((q: any) =>
                          q.text
                            .toLowerCase()
                            .includes(questionSearch.toLowerCase()),
                        )
                        .map((q: any) => {
                          const isAuthor =
                            q.author === user?._id ||
                            q.author?._id === user?._id;
                          return (
                            <div
                              className="card p-4 border-0 shadow-sm rounded-4"
                              key={q._id}
                              style={{ background: "var(--natural-color)" }}
                            >
                              <h5
                                className="fw-bold h6 mb-3 font-josefin"
                                style={{ color: "#3d1a0a", lineHeight: "1.4" }}
                              >
                                {q.text}
                              </h5>

                              <ul className="list-group list-group-flush mb-4 rounded-3 border">
                                {q.options.map((opt: string, idx: number) => {
                                  const isCorrect =
                                    idx === q.correctAnswerIndex;
                                  return (
                                    <li
                                      key={idx}
                                      className={`list-group-item d-flex align-items-center py-2 px-3 border-0 ${isCorrect ? "bg-success bg-opacity-10 fw-bold" : ""}`}
                                      style={{
                                        color: isCorrect
                                          ? "#2e7d32"
                                          : "inherit",
                                      }}
                                    >
                                      <span className="me-2">•</span> {opt}
                                      {isCorrect && (
                                        <span className="badge bg-success ms-auto small rounded-pill px-2">
                                          Correct
                                        </span>
                                      )}
                                    </li>
                                  );
                                })}
                              </ul>

                              <div className="d-flex gap-2 align-items-center">
                                <Link
                                  to={`/dashboard/questions/${q._id}`}
                                  className="btn btn-outline-secondary btn-sm px-3 rounded-pill fw-medium font-josefin"
                                >
                                  Details
                                </Link>
                                {isAuthor && (
                                  <>
                                    <button
                                      className="btn btn-sm px-3 rounded-pill fw-medium font-josefin text-white"
                                      style={{
                                        backgroundColor: "#c97a3a",
                                        border: "none",
                                      }}
                                      onClick={() => {
                                        setEditingQuestionId(q._id);
                                        setText(q.text);
                                        setOptions(
                                          q.options
                                            .concat(
                                              Array(4 - q.options.length).fill(
                                                "",
                                              ),
                                            )
                                            .slice(0, 4),
                                        );
                                        setCorrectIndex(q.correctAnswerIndex);
                                      }}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      className="btn btn-outline-danger btn-sm px-3 rounded-pill fw-medium font-josefin"
                                      onClick={() => {
                                        if (
                                          window.confirm(
                                            "Bạn có chắc chắn muốn xóa câu hỏi này không?",
                                          )
                                        ) {
                                          dispatch(deleteQuestion(q._id)).then(
                                            () => {
                                              dispatch(fetchAllQuestions());
                                              dispatch(fetchQuizzes());
                                            },
                                          );
                                        }
                                      }}
                                    >
                                      Delete
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })
                    ) : (
                      <div
                        className="card text-center p-5 border-0 rounded-4"
                        style={{ backgroundColor: "var(--natural-color)" }}
                      >
                        <p className="text-muted mb-0">
                          Ngân hàng câu hỏi trống hoặc không tìm thấy câu hỏi
                          phù hợp.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Guest Question View */
            <div
              className="d-flex flex-column overflow-hidden"
              style={{ maxHeight: "calc(100vh - 200px)" }}
            >
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4
                  className="fw-bold font-josefin text-uppercase m-0"
                  style={{ color: "#3d1a0a", letterSpacing: "0.05em" }}
                >
                  Questions Bank ({questions?.length || 0})
                </h4>
                <input
                  type="text"
                  className="form-control form-control-sm rounded-pill px-3"
                  style={{ maxWidth: "200px" }}
                  placeholder="Tìm câu hỏi..."
                  value={questionSearch}
                  onChange={(e) => setQuestionSearch(e.target.value)}
                />
              </div>

              {loadingQuestions ? (
                <div className="d-flex justify-content-center py-5">
                  <div
                    className="spinner-border"
                    style={{ color: "#8B4513" }}
                    role="status"
                  />
                </div>
              ) : (
                <div
                  className="flex-grow-1 overflow-y-auto pe-2"
                  style={{ minHeight: 0 }}
                >
                  <div className="row g-4">
                    {questions && questions.length > 0 ? (
                      questions
                        .filter((q: any) =>
                          q.text
                            .toLowerCase()
                            .includes(questionSearch.toLowerCase()),
                        )
                        .map((q: any) => (
                          <div className="col-md-6" key={q._id}>
                            <div
                              className="card p-4 border-0 shadow-sm rounded-4 h-100 d-flex flex-column justify-content-between"
                              style={{ background: "var(--natural-color)" }}
                            >
                              <div>
                                <h5
                                  className="fw-bold h6 mb-3 font-josefin"
                                  style={{
                                    color: "#3d1a0a",
                                    lineHeight: "1.4",
                                  }}
                                >
                                  {q.text}
                                </h5>
                                <ul className="list-group list-group-flush mb-3 rounded-3 border">
                                  {q.options.map((opt: string, idx: number) => {
                                    const isCorrect =
                                      idx === q.correctAnswerIndex;
                                    return (
                                      <li
                                        key={idx}
                                        className={`list-group-item d-flex align-items-center py-2 px-3 border-0 small ${isCorrect ? "bg-success bg-opacity-10 fw-bold" : ""}`}
                                        style={{
                                          color: isCorrect
                                            ? "#2e7d32"
                                            : "inherit",
                                        }}
                                      >
                                        <span className="me-2">•</span> {opt}
                                        {isCorrect && (
                                          <span className="badge bg-success ms-auto small rounded-pill px-2">
                                            Correct
                                          </span>
                                        )}
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                              <Link
                                to={`/dashboard/questions/${q._id}`}
                                className="btn btn-outline-secondary btn-sm px-3 rounded-pill fw-medium font-josefin align-self-start"
                              >
                                Details
                              </Link>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="col-12">
                        <div
                          className="card text-center p-5 border-0 rounded-4"
                          style={{ backgroundColor: "var(--natural-color)" }}
                        >
                          <p className="text-muted mb-0">
                            Ngân hàng câu hỏi trống hoặc không tìm thấy câu hỏi
                            phù hợp.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
