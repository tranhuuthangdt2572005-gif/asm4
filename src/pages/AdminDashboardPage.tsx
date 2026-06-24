import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { logout, fetchUsers } from "../features/authSlice";
import {
  fetchAllQuestions,
  addQuestion,
  deleteQuestion,
  updateQuestion,
} from "../features/managerSlice";
import {
  fetchQuizzes,
  addQuiz,
  deleteQuiz,
  updateQuiz,
} from "../features/quizSlice";

export default function AdminDashboardPage() {
  const dispatch = useDispatch<any>();
  const { user, usersList } = useSelector((state: any) => state.auth);
  const { questions } = useSelector((state: any) => state.manager);
  const { list: quizzes, loading: loadingQuizzes } = useSelector(
    (state: any) => state.quiz,
  );

  const [activeTab, setActiveTab] = useState<"quizzes" | "questions">(
    "questions",
  );
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [questionSearch, setQuestionSearch] = useState("");
  const [quizSearch, setQuizSearch] = useState("");

  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(
    null,
  );
  const [text, setText] = useState("");
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState<number>(0);

  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDesc, setQuizDesc] = useState("");
  const [selectedQuizQuestions, setSelectedQuizQuestions] = useState<string[]>(
    [],
  );

  useEffect(() => {
    dispatch(fetchAllQuestions());
    dispatch(fetchQuizzes());
  }, [dispatch]);

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

  const handleQuizCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTitle.trim()) return alert("Vui lòng điền tiêu đề đề thi!");

    if (editingQuizId) {
      dispatch(
        updateQuiz({
          id: editingQuizId,
          quizData: {
            title: quizTitle,
            description: quizDesc,
            questions: selectedQuizQuestions,
          },
        }),
      ).then(() => {
        dispatch(fetchQuizzes());
      });
      setEditingQuizId(null);
    } else {
      dispatch(
        addQuiz({
          title: quizTitle,
          description: quizDesc,
          questions: selectedQuizQuestions,
        }),
      ).then(() => {
        dispatch(fetchQuizzes());
      });
    }

    setQuizTitle("");
    setQuizDesc("");
    setSelectedQuizQuestions([]);
  };

  const handleCancelQuestionEdit = () => {
    setEditingQuestionId(null);
    setText("");
    setOptions(["", "", "", ""]);
    setCorrectIndex(0);
  };

  const handleCancelQuizEdit = () => {
    setEditingQuizId(null);
    setQuizTitle("");
    setQuizDesc("");
    setSelectedQuizQuestions([]);
  };

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
        <button
          className="btn btn-outline-danger btn-sm ms-auto px-3 rounded-pill fw-medium"
          onClick={() => dispatch(logout())}
          style={{ transition: "all 0.2s ease" }}
        >
          Logout
        </button>
      </nav>

      <div className="container position-relative" style={{ zIndex: 10 }}>
        {/* Header Block */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1
              className="h3 fw-bold font-josefin m-0"
              style={{ color: "#3d1a0a", letterSpacing: "0.05em" }}
            >
              Admin Dashboard
            </h1>
            <p className="small text-muted mb-0">
              Welcome,{" "}
              <span className="fw-semibold" style={{ color: "#3d1a0a" }}>
                {user?.username}
              </span>
            </p>
          </div>
          <div className="d-flex gap-2 align-items-center">
            <button
              className="btn btn-outline-dark btn-sm px-3 rounded-pill fw-medium font-josefin"
              onClick={() => {
                dispatch(fetchUsers());
                setShowUsersModal(true);
              }}
            >
              View User List
            </button>
            <span
              className="badge rounded-pill px-3 py-2 text-white font-monospace"
              style={{ backgroundColor: "#8B4513", letterSpacing: "0.05em" }}
            >
              ADMIN PANEL
            </span>
          </div>
        </div>

        {activeTab === "questions" ? (
          <div className="row g-4">
            {/* Left: Create Question Form */}
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
                      onChange={(e) => setCorrectIndex(Number(e.target.value))}
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

            {/* Right: Questions Bank List */}
            <div
              className="col-lg-7 d-flex flex-column overflow-hidden"
              style={{ maxHeight: "calc(100vh - 200px)" }}
            >
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4
                  className="fw-bold font-josefin m-0"
                  style={{ color: "#3d1a0a" }}
                >
                  Question Bank ({questions?.length || 0})
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
                  {questions && questions.length > 0 ? (
                    questions
                      .filter((q: any) =>
                        q.text
                          .toLowerCase()
                          .includes(questionSearch.toLowerCase()),
                      )
                      .map((q: any) => {
                        const isAuthor =
                          q.author === user?._id || q.author?._id === user?._id;
                        return (
                          <div
                            className="card p-4 border-0 shadow-sm rounded-4"
                            key={q._id}
                            style={{ background: "var(--natural-color)" }}
                          >
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <h5
                                className="fw-bold h6 font-josefin m-0 me-3"
                                style={{ color: "#3d1a0a", lineHeight: "1.4" }}
                              >
                                {q.text}
                              </h5>
                              <span className="badge bg-secondary bg-opacity-10 text-secondary small rounded-pill px-2 py-1 text-nowrap font-monospace">
                                Author: {q.author?.username || "Anonymous"}
                              </span>
                            </div>

                            <ul className="list-group list-group-flush mb-4 rounded-3 border">
                              {q.options.map((opt: string, idx: number) => {
                                const isCorrect = idx === q.correctAnswerIndex;
                                return (
                                  <li
                                    key={idx}
                                    className={`list-group-item d-flex align-items-center py-2 px-3 border-0 ${isCorrect ? "bg-success bg-opacity-10 fw-bold" : ""}`}
                                    style={{
                                      color: isCorrect ? "#2e7d32" : "inherit",
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
                              {isAuthor ? (
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
                              ) : (
                                <div className="text-muted small fst-italic ms-auto">
                                  Owned by another author (Read-Only)
                                </div>
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
                        Ngân hàng câu hỏi trống hoặc không tìm thấy câu hỏi phù
                        hợp.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {/* Left: Create Quiz Form */}
            <div className="col-lg-5">
              <h4
                className="fw-bold font-josefin mb-4"
                style={{ color: "#3d1a0a" }}
              >
                {editingQuizId ? "Edit Quiz" : "Create New Quiz"}
              </h4>
              <div
                className="card p-4 border-0 shadow-sm rounded-4"
                style={{ background: "var(--natural-color)" }}
              >
                <form onSubmit={handleQuizCreate}>
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-semibold">
                      Quiz Title
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={quizTitle}
                      onChange={(e) => setQuizTitle(e.target.value)}
                      required
                      placeholder="e.g. Geography Test"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-semibold">
                      Description
                    </label>
                    <textarea
                      className="form-control"
                      rows={2}
                      value={quizDesc}
                      onChange={(e) => setQuizDesc(e.target.value)}
                      placeholder="e.g. Test your basic geography knowledge..."
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label text-muted small fw-semibold mb-2">
                      Select Questions
                    </label>
                    <div
                      className="overflow-y-auto border rounded p-3"
                      style={{ maxHeight: "180px", backgroundColor: "#fff" }}
                    >
                      {questions && questions.length > 0 ? (
                        questions.map((q: any) => (
                          <div className="form-check mb-2" key={q._id}>
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id={`quiz-q-${q._id}`}
                              checked={selectedQuizQuestions.includes(q._id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedQuizQuestions([
                                    ...selectedQuizQuestions,
                                    q._id,
                                  ]);
                                } else {
                                  setSelectedQuizQuestions(
                                    selectedQuizQuestions.filter(
                                      (id) => id !== q._id,
                                    ),
                                  );
                                }
                              }}
                              style={{
                                cursor: "pointer",
                                accentColor: "#8B4513",
                              }}
                            />
                            <label
                              className="form-check-label small text-dark user-select-none"
                              htmlFor={`quiz-q-${q._id}`}
                              style={{ cursor: "pointer" }}
                            >
                              {q.text}
                            </label>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted small mb-0">
                          Hãy tạo câu hỏi trước khi lập đề thi.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      type="submit"
                      className="btn btn-md flex-grow-1 py-2 rounded-3 fw-medium font-josefin text-white"
                      style={{ backgroundColor: "#8B4513", border: "none" }}
                    >
                      {editingQuizId ? "Update Quiz" : "Add Quiz"}
                    </button>
                    {editingQuizId && (
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-md py-2 rounded-3 fw-medium font-josefin"
                        onClick={handleCancelQuizEdit}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* Right: Quizzes Bank List */}
            <div
              className="col-lg-7 d-flex flex-column overflow-hidden"
              style={{ maxHeight: "calc(100vh - 200px)" }}
            >
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4
                  className="fw-bold font-josefin m-0"
                  style={{ color: "#3d1a0a" }}
                >
                  Quizzes List ({quizzes?.length || 0})
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
              <div
                className="flex-grow-1 overflow-y-auto pe-2"
                style={{ minHeight: 0 }}
              >
                <div className="d-flex flex-column gap-3">
                  {loadingQuizzes ? (
                    <div className="d-flex justify-content-center py-4">
                      <div
                        className="spinner-border spinner-border-sm"
                        style={{ color: "#8B4513" }}
                        role="status"
                      />
                    </div>
                  ) : quizzes && quizzes.length > 0 ? (
                    quizzes
                      .filter((quiz: any) =>
                        quiz.title
                          .toLowerCase()
                          .includes(quizSearch.toLowerCase()),
                      )
                      .map((quiz: any) => (
                        <div
                          className="card p-4 border-0 shadow-sm rounded-4 h-100"
                          key={quiz._id}
                          style={{ background: "var(--natural-color)" }}
                        >
                          <h5
                            className="fw-bold font-josefin text-uppercase mb-2"
                            style={{
                              color: "#8B4513",
                              letterSpacing: "0.05em",
                            }}
                          >
                            {quiz.title}
                          </h5>
                          <p className="text-muted small mb-3">
                            {quiz.description ||
                              "Không có mô tả cho đề trắc nghiệm này."}
                          </p>
                          <div className="d-flex justify-content-between align-items-center mt-auto">
                            <span className="small text-muted fw-semibold">
                              {quiz.questions?.length || 0} Questions
                            </span>
                            <div>
                              <Link
                                to={`/dashboard/quizzes/${quiz._id}`}
                                className="btn btn-outline-secondary btn-sm px-3 rounded-pill fw-medium font-josefin me-2"
                              >
                                Details
                              </Link>
                              <button
                                className="btn btn-sm px-3 rounded-pill fw-medium font-josefin me-2 text-white"
                                style={{
                                  backgroundColor: "#c97a3a",
                                  border: "none",
                                }}
                                onClick={() => {
                                  setEditingQuizId(quiz._id);
                                  setQuizTitle(quiz.title);
                                  setQuizDesc(quiz.description || "");
                                  setSelectedQuizQuestions(
                                    quiz.questions
                                      ? quiz.questions.map(
                                          (qItem: any) => qItem._id || qItem,
                                        )
                                      : [],
                                  );
                                }}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-outline-danger btn-sm px-3 rounded-pill fw-medium font-josefin"
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      "Bạn có chắc chắn muốn xóa đề thi này không?",
                                    )
                                  ) {
                                    dispatch(deleteQuiz(quiz._id)).then(() => {
                                      dispatch(fetchQuizzes());
                                    });
                                  }
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div
                      className="card text-center p-5 border-0 rounded-4"
                      style={{ backgroundColor: "var(--natural-color)" }}
                    >
                      <p className="text-muted mb-0">
                        Chưa có đề thi nào hoặc không tìm thấy đề thi phù hợp.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* System Users Modal */}
      {showUsersModal && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content border-0 shadow-lg rounded-4"
              style={{ backgroundColor: "#fdf6ef" }}
            >
              <div className="modal-header border-0 pb-0 d-flex justify-content-between align-items-center px-4 pt-4">
                <h5
                  className="modal-title fw-bold font-josefin"
                  style={{ letterSpacing: "0.05em", color: "#8B4513" }}
                >
                  System Users List
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowUsersModal(false)}
                ></button>
              </div>
              <div className="modal-body px-4">
                <div
                  className="table-responsive"
                  style={{ maxHeight: "400px" }}
                >
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr>
                        <th className="font-josefin text-muted small fw-bold">
                          USERNAME
                        </th>
                        <th className="font-josefin text-muted small fw-bold text-end">
                          ROLE
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersList && usersList.length > 0 ? (
                        usersList.map((usr: any) => (
                          <tr key={usr._id}>
                            <td className="fw-medium text-dark">
                              {usr.username}
                            </td>
                            <td className="text-end">
                              <span
                                className={`badge rounded-pill px-2 py-1 ${usr.admin ? "bg-danger bg-opacity-10 text-danger" : ""}`}
                                style={
                                  !usr.admin
                                    ? {
                                        backgroundColor: "rgba(139,69,19,0.1)",
                                        color: "#8B4513",
                                      }
                                    : {}
                                }
                              >
                                {usr.admin ? "Admin" : "Student"}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={2}
                            className="text-center text-muted py-3"
                          >
                            No users found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer border-0 px-4 pb-4 pt-0">
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-pill px-4"
                  onClick={() => setShowUsersModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
