/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, Link } from "react-router-dom";
import { logout } from "../features/authSlice";
import {
  fetchQuizById,
  createQuestionForQuiz,
  createManyQuestionsForQuiz,
} from "../features/quizSlice";
import { updateQuestion, deleteQuestion } from "../features/managerSlice";

export default function QuizDetailPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();

  const { user, isAuthenticated } = useSelector((state: any) => state.auth);
  const { currentQuiz, loading, error } = useSelector(
    (state: any) => state.quiz,
  );

  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(
    null,
  );
  const [singleText, setSingleText] = useState("");
  const [singleOptions, setSingleOptions] = useState<string[]>([
    "",
    "",
    "",
    "",
  ]);
  const [singleCorrect, setSingleCorrect] = useState<number>(0);

  const [bulkQuestions, setBulkQuestions] = useState<any[]>([
    { text: "", options: ["", "", "", ""], correctAnswerIndex: 0 },
  ]);
  const [mode, setMode] = useState<"single" | "bulk">("single");

  useEffect(() => {
    if (quizId) {
      dispatch(fetchQuizById(quizId));
    }
  }, [dispatch, quizId]);

  const handleSingleOptionChange = (idx: number, val: string) => {
    const updated = [...singleOptions];
    updated[idx] = val;
    setSingleOptions(updated);
  };

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizId) return;
    const filteredOptions = singleOptions.filter((opt) => opt.trim() !== "");
    if (filteredOptions.length < 2)
      return alert("Vui lòng điền tối thiểu 2 phương án đáp án!");

    const questionData = {
      text: singleText,
      options: filteredOptions,
      correctAnswerIndex: Number(singleCorrect),
    };

    if (editingQuestionId) {
      dispatch(updateQuestion({ id: editingQuestionId, questionData })).then(
        (res: any) => {
          if (!res.error) {
            alert("Cập nhật câu hỏi thành công!");
            dispatch(fetchQuizById(quizId));
            setEditingQuestionId(null);
            setSingleText("");
            setSingleOptions(["", "", "", ""]);
            setSingleCorrect(0);
          }
        },
      );
    } else {
      dispatch(createQuestionForQuiz({ quizId, questionData })).then(
        (res: any) => {
          if (!res.error) {
            alert("Đã thêm câu hỏi thành công!");
            dispatch(fetchQuizById(quizId));
            setSingleText("");
            setSingleOptions(["", "", "", ""]);
            setSingleCorrect(0);
          }
        },
      );
    }
  };

  const handleCancelEdit = () => {
    setEditingQuestionId(null);
    setSingleText("");
    setSingleOptions(["", "", "", ""]);
    setSingleCorrect(0);
  };

  const handleBulkOptionChange = (
    qIdx: number,
    optIdx: number,
    val: string,
  ) => {
    const updated = [...bulkQuestions];
    const updatedOpts = [...updated[qIdx].options];
    updatedOpts[optIdx] = val;
    updated[qIdx] = { ...updated[qIdx], options: updatedOpts };
    setBulkQuestions(updated);
  };

  const handleBulkTextChange = (qIdx: number, val: string) => {
    const updated = [...bulkQuestions];
    updated[qIdx] = { ...updated[qIdx], text: val };
    setBulkQuestions(updated);
  };

  const handleBulkCorrectChange = (qIdx: number, val: number) => {
    const updated = [...bulkQuestions];
    updated[qIdx] = { ...updated[qIdx], correctAnswerIndex: val };
    setBulkQuestions(updated);
  };

  const addBulkQuestionSlot = () => {
    setBulkQuestions([
      ...bulkQuestions,
      { text: "", options: ["", "", "", ""], correctAnswerIndex: 0 },
    ]);
  };

  const removeBulkQuestionSlot = (idx: number) => {
    if (bulkQuestions.length <= 1) return;
    setBulkQuestions(bulkQuestions.filter((_, i) => i !== idx));
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizId) return;

    for (let i = 0; i < bulkQuestions.length; i++) {
      const q = bulkQuestions[i];
      if (!q.text.trim()) return alert(`Câu hỏi #${i + 1} trống nội dung!`);
      const filtered = q.options.filter((opt: string) => opt.trim() !== "");
      if (filtered.length < 2)
        return alert(`Câu hỏi #${i + 1} cần có ít nhất 2 đáp án!`);
    }

    const questionsFormatted = bulkQuestions.map((q) => ({
      text: q.text,
      options: q.options.filter((opt: string) => opt.trim() !== ""),
      correctAnswerIndex: Number(q.correctAnswerIndex),
    }));

    dispatch(
      createManyQuestionsForQuiz({ quizId, questions: questionsFormatted }),
    ).then((res: any) => {
      if (!res.error) {
        alert("Đã thêm toàn bộ câu hỏi thành công!");
        dispatch(fetchQuizById(quizId));
        setBulkQuestions([
          { text: "", options: ["", "", "", ""], correctAnswerIndex: 0 },
        ]);
      }
    });
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
            Quiz Detail
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
        ) : currentQuiz ? (
          <div className="row g-4">
            {/* Left: Quiz Info and Questions List */}
            <div className={isAuthenticated ? "col-lg-7" : "col-lg-12"}>
              <div
                className="card p-4 border-0 shadow-sm rounded-4 mb-4"
                style={{ backgroundColor: "var(--natural-color)" }}
              >
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <h1
                    className="h2 fw-bold font-josefin m-0"
                    style={{ color: "#3d1a0a" }}
                  >
                    {currentQuiz.title}
                  </h1>
                  <span
                    className="badge rounded-pill px-3 py-2 font-monospace"
                    style={{
                      color: "#5c2a0e",
                      backgroundColor: "rgba(139,69,19,0.12)",
                      border: "1px solid rgba(139,69,19,0.2)",
                    }}
                  >
                    {currentQuiz.questions?.length || 0} Questions
                  </span>
                </div>
                <p className="text-muted fs-5 mb-4">
                  {currentQuiz.description ||
                    "Không có mô tả cho đề trắc nghiệm này."}
                </p>
                <div className="d-flex gap-3">
                  <button
                    className="btn btn-md px-4 rounded-3 font-josefin text-white"
                    style={{ backgroundColor: "#8B4513", border: "none" }}
                    onClick={() => {
                      dispatch({
                        type: "quiz/selectQuiz",
                        payload: currentQuiz,
                      });
                      navigate("/dashboard/quiz");
                    }}
                  >
                    Do Quiz
                  </button>
                  <button
                    className="btn btn-outline-secondary btn-md px-4 rounded-3 font-josefin"
                    onClick={() => navigate("/dashboard")}
                  >
                    Back to List
                  </button>
                </div>
              </div>

              <h4
                className="fw-bold font-josefin mb-3"
                style={{ color: "#3d1a0a" }}
              >
                Questions List
              </h4>
              <div className="d-flex flex-column gap-3">
                {currentQuiz.questions && currentQuiz.questions.length > 0 ? (
                  currentQuiz.questions.map((q: any, qIdx: number) => {
                    const isQuestionAuthor =
                      isAuthenticated &&
                      (q.author === user?._id || q.author?._id === user?._id);
                    return (
                      <div
                        className="card p-4 border-0 shadow-sm rounded-4"
                        key={q._id || qIdx}
                        style={{ backgroundColor: "var(--natural-color)" }}
                      >
                        <div className="d-flex gap-2 align-items-start mb-3">
                          <span
                            className="badge rounded-circle d-flex align-items-center justify-content-center text-white"
                            style={{
                              width: "24px",
                              height: "24px",
                              fontSize: "0.8rem",
                              backgroundColor: "#8B4513",
                            }}
                          >
                            {qIdx + 1}
                          </span>
                          <h5
                            className="fw-bold h6 m-0 font-josefin"
                            style={{ color: "#3d1a0a", lineHeight: "1.4" }}
                          >
                            <Link
                              to={`/dashboard/questions/${q._id || q}`}
                              className="text-decoration-none"
                              style={{ color: "#3d1a0a" }}
                            >
                              {q.text || `Question ID: ${q}`}
                            </Link>
                          </h5>
                        </div>

                        {q.options && (
                          <ul className="list-group list-group-flush rounded-3 border mb-3">
                            {q.options.map((opt: string, idx: number) => {
                              const isCorrect = idx === q.correctAnswerIndex;
                              return (
                                <li
                                  key={idx}
                                  className={`list-group-item d-flex align-items-center py-2 px-3 border-0 small ${isCorrect ? "bg-success bg-opacity-10 fw-bold" : ""}`}
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
                        )}

                        {isQuestionAuthor && (
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm px-3 rounded-pill fw-medium font-josefin text-white"
                              style={{
                                backgroundColor: "#c97a3a",
                                border: "none",
                              }}
                              onClick={() => {
                                setMode("single");
                                setEditingQuestionId(q._id);
                                setSingleText(q.text);
                                setSingleOptions(
                                  q.options
                                    .concat(
                                      Array(4 - q.options.length).fill(""),
                                    )
                                    .slice(0, 4),
                                );
                                setSingleCorrect(q.correctAnswerIndex);
                              }}
                            >
                              Edit Question
                            </button>
                            <button
                              className="btn btn-outline-danger btn-sm px-3 rounded-pill fw-medium font-josefin"
                              onClick={() => {
                                if (
                                  window.confirm(
                                    "Bạn có chắc chắn muốn xóa câu hỏi này khỏi hệ thống không?",
                                  )
                                ) {
                                  dispatch(deleteQuestion(q._id)).then(() => {
                                    alert("Đã xóa câu hỏi thành công!");
                                    if (quizId) dispatch(fetchQuizById(quizId));
                                  });
                                }
                              }}
                            >
                              Delete Question
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div
                    className="card text-center p-5 border-0 rounded-4"
                    style={{ backgroundColor: "var(--natural-color)" }}
                  >
                    <p className="text-muted mb-0">
                      Đề thi này chưa có câu hỏi nào được gán.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Add/Edit Questions Forms */}
            {isAuthenticated && (
              <div className="col-lg-5">
                <h4
                  className="fw-bold font-josefin mb-3"
                  style={{ color: "#3d1a0a" }}
                >
                  {editingQuestionId
                    ? "Edit Question"
                    : "Add Questions to Quiz"}
                </h4>

                {!editingQuestionId && (
                  <div className="d-flex mb-3 border-bottom">
                    <button
                      className={`btn py-2 px-3 font-josefin fw-bold border-0`}
                      style={{
                        background: "none",
                        color: mode === "single" ? "#8B4513" : "#888",
                        borderBottom:
                          mode === "single" ? "2px solid #8B4513" : "none",
                      }}
                      onClick={() => setMode("single")}
                    >
                      Single Question
                    </button>
                    <button
                      className={`btn py-2 px-3 font-josefin fw-bold border-0`}
                      style={{
                        background: "none",
                        color: mode === "bulk" ? "#8B4513" : "#888",
                        borderBottom:
                          mode === "bulk" ? "2px solid #8B4513" : "none",
                      }}
                      onClick={() => setMode("bulk")}
                    >
                      Multiple Questions
                    </button>
                  </div>
                )}

                {mode === "single" ? (
                  <div
                    className="card p-4 border-0 shadow-sm rounded-4"
                    style={{ backgroundColor: "var(--natural-color)" }}
                  >
                    <form onSubmit={handleSingleSubmit}>
                      <div className="mb-3">
                        <label className="form-label text-muted small fw-semibold">
                          Question Text
                        </label>
                        <textarea
                          className="form-control"
                          rows={2}
                          value={singleText}
                          onChange={(e) => setSingleText(e.target.value)}
                          required
                          placeholder="Nhập nội dung câu hỏi..."
                        />
                      </div>

                      <label className="form-label text-muted small fw-semibold mb-2">
                        Options
                      </label>
                      {singleOptions.map((opt, idx) => (
                        <div className="input-group mb-2" key={idx}>
                          <span className="input-group-text bg-light text-muted border-end-0 small fw-bold">
                            #{idx}
                          </span>
                          <input
                            type="text"
                            className="form-control"
                            value={opt}
                            onChange={(e) =>
                              handleSingleOptionChange(idx, e.target.value)
                            }
                            required
                            placeholder={`Phương án ${idx + 1}`}
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
                          value={singleCorrect}
                          onChange={(e) =>
                            setSingleCorrect(Number(e.target.value))
                          }
                          required
                        />
                        <div className="form-text small text-muted">
                          Chỉ số từ 0 đến 3.
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="btn w-100 py-2 rounded-3 fw-medium font-josefin mb-2 text-white"
                        style={{ backgroundColor: "#8B4513", border: "none" }}
                      >
                        {editingQuestionId
                          ? "Update Question"
                          : "Add Single Question"}
                      </button>
                      {editingQuestionId && (
                        <button
                          type="button"
                          className="btn btn-outline-secondary w-100 py-2 rounded-3 fw-medium font-josefin"
                          onClick={handleCancelEdit}
                        >
                          Cancel Edit
                        </button>
                      )}
                    </form>
                  </div>
                ) : (
                  <div
                    className="card p-4 border-0 shadow-sm rounded-4"
                    style={{ backgroundColor: "var(--natural-color)" }}
                  >
                    <form onSubmit={handleBulkSubmit}>
                      <div
                        className="overflow-y-auto pe-1 mb-3"
                        style={{ maxHeight: "420px" }}
                      >
                        {bulkQuestions.map((q, qIdx) => (
                          <div
                            className="border rounded p-3 mb-3 bg-white position-relative"
                            key={qIdx}
                          >
                            {bulkQuestions.length > 1 && (
                              <button
                                type="button"
                                className="btn-close position-absolute top-0 end-0 m-2"
                                style={{ transform: "scale(0.8)" }}
                                onClick={() => removeBulkQuestionSlot(qIdx)}
                              />
                            )}
                            <h6 className="fw-bold text-muted small mb-3">
                              Question #{qIdx + 1}
                            </h6>

                            <div className="mb-2">
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Question Text"
                                value={q.text}
                                onChange={(e) =>
                                  handleBulkTextChange(qIdx, e.target.value)
                                }
                                required
                              />
                            </div>

                            <div className="row g-2 mb-2">
                              {q.options.map((opt: string, optIdx: number) => (
                                <div className="col-6" key={optIdx}>
                                  <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    placeholder={`Opt #${optIdx}`}
                                    value={opt}
                                    onChange={(e) =>
                                      handleBulkOptionChange(
                                        qIdx,
                                        optIdx,
                                        e.target.value,
                                      )
                                    }
                                    required
                                  />
                                </div>
                              ))}
                            </div>

                            <div className="d-flex align-items-center gap-2">
                              <span className="small text-muted fw-semibold">
                                Correct index:
                              </span>
                              <input
                                type="number"
                                className="form-control form-control-sm"
                                min="0"
                                max="3"
                                value={q.correctAnswerIndex}
                                onChange={(e) =>
                                  handleBulkCorrectChange(
                                    qIdx,
                                    Number(e.target.value),
                                  )
                                }
                                required
                                style={{ width: "60px" }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-outline-dark btn-sm flex-grow-1 font-josefin"
                          onClick={addBulkQuestionSlot}
                        >
                          + Add Question Slot
                        </button>
                        <button
                          type="submit"
                          className="btn btn-sm flex-grow-1 font-josefin text-white"
                          style={{ backgroundColor: "#8B4513", border: "none" }}
                        >
                          Submit All ({bulkQuestions.length})
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-5">
            <p className="text-muted">Không tìm thấy thông tin đề thi.</p>
          </div>
        )}
      </div>
    </div>
  );
}
