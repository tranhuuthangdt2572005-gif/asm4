Dưới đây là toàn bộ cấu trúc hệ thống và mã nguồn Frontend hoàn chỉnh của Assignment 4, được tổ chức 100% theo phương pháp Feature-Sliced Design (FSD). Cấu trúc này được tối ưu hóa thành một tệp Markdown duy nhất, sẵn sàng để nạp trực tiếp vào Antigravity Agent CLI của Thành để tự động sinh mã nguồn cho dự án React + Redux Toolkit + Bootstrap 5
---

**Folder tham chiếu (ASM số 3):** D:\FPT\SU26\SDN302\projects\asm_o3_src_o1

--- 
## BẢN ĐỒ CẤU TRÚC FSD FRONTEND (FEATURE-SLICED DESIGN)

```text
src/
├── app/
│ ├── store.js
│ ├── rootReducer.js
│ └── index.css
├── shared/
│ ├── api/
│ │ └── axiosClient.js
│ └── ui/
│ └── ProtectedRoute.tsx
├── features/
│ ├── auth/
│ │ └── authSlice.js
│ ├── quiz-runner/
│ │ └── quizSlice.js
│ └── question-manager/
│ └── managerSlice.js
├── pages/
│ ├── login/
│ │ └── index.tsx
│ ├── register/
│ │ └── index.tsx
│ ├── dashboard/
│ │ └── index.tsx
│ ├── quiz-session/
│ │ └── index.tsx
│ └── admin-dashboard/
│ └── index.tsx
├── main.tsx
└── App.tsx

```

---
## CHI TIẾT MÃ NGUỒN CÁC THÀNH PHẦN THEO TẦNG LAYER
1. LAYER 1: SHARED (Các thành phần dùng chung hệ thống)
**src/shared/api/axiosClient.js**

Cấu hình Axios tự động đính kèm chuỗi JWT Token "Bearer" lấy từ localStorage vào tiêu đề của mọi request gửi lên Backend ở ASM3.

```tsx
import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:5000', // Khớp với PORT cổng Backend của ASM3
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor tự động gài mã token của ASM3 vào header trước khi request bay đi
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosClient;
```

**src/shared/ui/ProtectedRoute.tsx**
Bộ lọc phân quyền tuyến đường chặn truy cập trái phép: Khách chưa login không được vào Dashboard , User thường không thể mò vào phân hệ của Admin.

```tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

export const ProtectedRoute = ({ requireAdmin = false }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !user?.admin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
```

---

2. LAYER 2: FEATURES (Quản lý trạng thái logic nghiệp vụ bằng Redux Toolkit)

**src/features/auth/authSlice.js**
Quản lý trạng thái đăng nhập, đăng xuất, lưu vết token và cờ phân quyền

```tsx
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../shared/api/axiosClient';

export const loginUser = createAsyncThunk('auth/loginUser', async (credentials, { rejectWithValue }) => {
  try {
    const response = await axiosClient.post('/users/login', credentials);
    localStorage.setItem('token', response.data.token);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Đăng nhập thất bại!');
  }
});

const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    setUserData: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, setUserData } = authSlice.actions;
export default authSlice.reducer;
```

**src/features/quiz-runner/quizSlice.js**
Quản lý trạng thái kéo đề thi trắc nghiệm từ Backend và chấm điểm tương tác của thí sinh.

```tsx
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../shared/api/axiosClient';

export const fetchQuizzes = createAsyncThunk('quiz/fetchQuizzes', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosClient.get('/quizzes');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Lỗi kéo đề thi!');
  }
});

const quizSlice = createSlice({
  name: 'quiz',
  initialState: {
    list: [],
    currentQuiz: null,
    currentQuestionIndex: 0,
    score: 0,
    isCompleted: false,
    loading: false,
    error: null,
  },
  reducers: {
    selectQuiz: (state, action) => {
      state.currentQuiz = action.payload;
      state.currentQuestionIndex = 0;
      state.score = 0;
      state.isCompleted = false;
    },
    submitAnswer: (state, action) => {
      const selectedIndex = action.payload;
      const currentQuestion = state.currentQuiz.questions[state.currentQuestionIndex];
      
      if (selectedIndex === currentQuestion.correctAnswerIndex) {
        state.score += 1;
      }

      if (state.currentQuestionIndex + 1 < state.currentQuiz.questions.length) {
        state.currentQuestionIndex += 1;
      } else {
        state.isCompleted = true;
      }
    },
    restartQuiz: (state) => {
      state.currentQuestionIndex = 0;
      state.score = 0;
      state.isCompleted = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuizzes.pending, (state) => { state.loading = true; })
      .addCase(fetchQuizzes.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchQuizzes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { selectQuiz, submitAnswer, restartQuiz } = quizSlice.actions;
export default quizSlice.reducer;
```

**src/features/question-manager/managerSlice.js**
Quản lý trạng thái đồng bộ hóa các tác vụ CRUD (Thêm, Sửa, Xóa) ngân hàng câu hỏi của Admin xuống MongoDB

```tsx

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../shared/api/axiosClient';

export const fetchAllQuestions = createAsyncThunk('manager/fetchAllQuestions', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosClient.get('/question');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Lỗi lấy câu hỏi!');
  }
});

export const addQuestion = createAsyncThunk('manager/addQuestion', async (questionData, { rejectWithValue }) => {
  try {
    const response = await axiosClient.post('/question', questionData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Lỗi thêm câu hỏi!');
  }
});

export const deleteQuestion = createAsyncThunk('manager/deleteQuestion', async (id, { rejectWithValue }) => {
  try {
    await axiosClient.delete(`/question/${id}`);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Lỗi xóa câu hỏi!');
  }
});

const managerSlice = createSlice({
  name: 'manager',
  initialState: { questions: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllQuestions.fulfilled, (state, action) => { state.questions = action.payload; })
      .addCase(addQuestion.fulfilled, (state, action) => { state.questions.push(action.payload); })
      .addCase(deleteQuestion.fulfilled, (state, action) => {
        state.questions = state.questions.filter(q => q._id !== action.payload);
      });
  }
});

export default managerSlice.reducer;

```

---
3.LAYER 3: APP (Cấu hình trung tâm hệ thống)
**src/app/rootReducer.js**

```tsx
import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import quizReducer from '../features/quiz-runner/quizSlice';
import managerReducer from '../features/question-manager/managerSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  quiz: quizReducer,
  manager: managerReducer,
});

export default rootReducer;
```

**src/app/store.js**

```tsx
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';

export const store = configureStore({
  reducer: rootReducer,
});
```

**src/app/index.css**
```css
body {
  background-color: #f8f9fa;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
.card {
  border-radius: 8px;
}
```
---
4.LAYER 4: PAGES (Các màn hình giao diện lắp ráp hoàn chỉnh)

**src/pages/login/index.tsx**
Khớp chính xác với hình ảnh minh họa số 1 (Giao diện Form đăng nhập bọc Card Bootstrap 5).

```tsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../../features/auth/authSlice';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user, error, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && user) {
      user.admin ? navigate('/admin') : navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({ username, password }));
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card p-4 shadow-sm" style={{ width: '400px', border: '1px solid #dee2e6' }}>
        <h3 className="text-center mb-4 fw-bold">Login</h3>
        {error && <div className="alert alert-danger py-2 small text-center">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label text-muted small">Username</label>
            <input type="text" className="form-control py-2" value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="John" />
          </div>
          <div className="mb-4">
            <label className="form-label text-muted small">Password</label>
            <input type="password" className="form-control py-2" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="•••" />
          </div>
          <button type="submit" className="btn btn-primary w-100 py-2 fw-medium" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="text-center mt-3">
          <Link to="/register" className="text-decoration-none small">Don't have an account? Register here</Link>
        </div>
      </div>
    </div>
  );
}
```
*src/pages/register/index.tsx*
Giao diện đăng ký tài khoản hỗ trợ gán quyền Admin phục vụ cho việc kiểm thử tính năng

```tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../../shared/api/axiosClient';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [info, setInfo] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/users/register', { username, password, admin: isAdmin });
      setInfo('Đăng ký thành công! Đang chuyển hướng...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setInfo(err.response?.data?.err || 'Username đã tồn tại trên hệ thống!');
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card p-4 shadow-sm" style={{ width: '400px' }}>
        <h3 className="text-center mb-4 fw-bold">Register</h3>
        {info && <div className="alert alert-info py-2 small text-center">{info}</div>}
        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <label className="form-label text-muted small">Username</label>
            <input type="text" className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label text-muted small">Password</label>
            <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="form-check mb-4">
            <input type="checkbox" className="form-check-input" id="adminCheck" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} />
            <label className="form-check-label small text-muted" htmlFor="adminCheck">Đăng ký với đặc quyền tài khoản Admin</label>
          </div>
          <button type="submit" className="btn btn-success w-100 py-2">Create Account</button>
        </form>
        <div className="text-center mt-3"><Link to="/login" className="small text-decoration-none">Back to Login</Link></div>
      </div>
    </div>
  );
}
```

**src/pages/dashboard/index.tsx**
Khớp chính xác với hình ảnh minh họa số 2 (Thanh điều hướng ngang + Lựa chọn Menu làm đề thi Quiz).

```tsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../features/auth/authSlice';
import { fetchQuizzes, selectQuiz } from '../../features/quiz-runner/quizSlice';

export default function DashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const { list: quizzes, loading } = useSelector(state => state.quiz);

  useEffect(() => { dispatch(fetchQuizzes()); }, [dispatch]);

  const handleStartQuiz = (quiz) => {
    dispatch(selectQuiz(quiz));
    navigate('/dashboard/quiz');
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="display-5 fw-bold m-0">Dashboard</h1>
        <span className="text-muted">Welcome, {user?.username}</span>
      </div>
      <div className="bg-white p-3 border rounded mb-5 d-flex gap-4">
        <button className="btn btn-link text-dark text-decoration-none fw-bold px-0">Home</button>
        <button className="btn btn-link text-muted text-decoration-none px-0">Quiz</button>
        <button className="btn btn-link text-muted text-decoration-none px-0">Article</button>
        <button className="btn btn-link text-muted text-decoration-none px-0 ms-auto" onClick={() => dispatch(logout())}>Logout</button>
      </div>
      <div className="row g-4">
        {loading ? <p className="text-center">Loading quizzes...</p> : 
          quizzes.map((quiz) => (
            <div className="col-md-4" key={quiz._id}>
              <div className="card shadow-sm h-100 p-3">
                <h5 className="fw-bold text-primary">{quiz.title}</h5>
                <p className="text-muted small flex-grow-1">{quiz.description || 'Không có mô tả cho đề trắc nghiệm này.'}</p>
                <button className="btn btn-outline-primary btn-sm mt-2 w-100" onClick={() => handleStartQuiz(quiz)}>Do Quiz</button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}
```

**src/pages/quiz-session/index.tsx**
Khớp chính xác với hình ảnh minh họa số 3 và số 4 (Giao diện chọn Input Radio, nút Submit và bảng điểm Quiz Completed).

```tsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { submitAnswer, restartQuiz } from '../../features/quiz-runner/quizSlice';

export default function QuizSessionPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentQuiz, currentQuestionIndex, score, isCompleted } = useSelector(state => state.quiz);
  const [selectedOption, setSelectedOption] = useState(null);

  if (!currentQuiz) return <div className="container py-5 text-center"><button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Back to Dashboard</button></div>;

  const currentQuestion = currentQuiz.questions[currentQuestionIndex];

  const handleNext = () => {
    if (selectedOption === null) return alert('Vui lòng chọn 1 đáp án!');
    dispatch(submitAnswer(selectedOption));
    setSelectedOption(null);
  };

  if (isCompleted) {
    return (
      <div className="container py-5 text-center min-vh-100 d-flex flex-column justify-content-center align-items-center">
        <h1 className="display-4 fw-bold mb-3">Quiz Completed</h1>
        <p className="fs-4 text-secondary mb-4">Your score: {score}</p>
        <div className="d-flex gap-2">
          <button className="btn btn-primary px-4 py-2" onClick={() => dispatch(restartQuiz())}>Restart Quiz</button>
          <button className="btn btn-secondary px-4 py-2" onClick={() => navigate('/dashboard')}>Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="bg-white p-3 border rounded mb-5 d-flex gap-4">
        <button className="btn btn-link text-muted text-decoration-none px-0" onClick={() => navigate('/dashboard')}>Home</button>
        <button className="btn btn-link text-dark text-decoration-none fw-bold px-0">Quiz</button>
        <button className="btn btn-link text-muted text-decoration-none px-0">Article</button>
      </div>

      <div className="text-center mx-auto" style={{ maxWidth: '600px', marginTop: '80px' }}>
        <h2 className="display-5 fw-bold mb-4">Quiz</h2>
        <h3 className="h4 fw-semibold mb-4">{currentQuestion?.text}</h3>
        
        <div className="text-start mx-auto mb-4" style={{ width: 'fit-content' }}>
          {currentQuestion?.options.map((option, index) => (
            <div className="form-check mb-3 fs-5" key={index}>
              <input className="form-check-input" type="radio" name="quizOpt" id={`opt-${index}`} checked={selectedOption === index} onChange={() => setSelectedOption(index)} />
              <label className="form-check-label ps-2" htmlFor={`opt-${index}`}>{option}</label>
            </div>
          ))}
        </div>

        <button className="btn btn-primary px-5 py-2.5 fs-5 mt-3" onClick={handleNext}>Submit Answer</button>
      </div>
    </div>
  );
}
```

**src/pages/admin-dashboard/index.tsx**
Khớp chính xác với hình ảnh minh họa số 5 và số 6 (Form Admin soạn Question Text, nhập danh sách Options và cụm nút Edit/Delete thời gian thực).

```tsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import { fetchAllQuestions, addQuestion, deleteQuestion } from '../../features/question-manager/managerSlice';

export default function AdminDashboardPage() {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { questions } = useSelector(state => state.manager);

  const [text, setText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(0);

  useEffect(() => { dispatch(fetchAllQuestions()); }, [dispatch]);

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleCreate = (e) => {
    e.preventDefault();
    const filteredOptions = options.filter(opt => opt.trim() !== '');
    if (filteredOptions.length < 2) return alert('Vui lòng điền tối thiểu 2 phương án đáp án!');
    dispatch(addQuestion({ text, options: filteredOptions, correctAnswerIndex: Number(correctIndex) }));
    setText('');
    setOptions(['', '', '', '']);
    setCorrectIndex(0);
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="display-5 fw-bold m-0">Admin Dashboard</h1>
        <span className="text-muted">Welcome, {user?.username}</span>
      </div>
      <div className="bg-white p-3 border rounded mb-5 d-flex gap-4">
        <button className="btn btn-link text-muted text-decoration-none px-0">Home</button>
        <button className="btn btn-link text-dark text-decoration-none fw-bold px-0">Manage Questions</button>
        <button className="btn btn-link text-muted text-decoration-none px-0">Manage Articles</button>
        <button className="btn btn-link text-muted text-decoration-none px-0 ms-auto" onClick={() => dispatch(logout())}>Logout</button>
      </div>

      <h2 className="h4 fw-bold mb-4">Questions</h2>
      <div className="card p-4 border rounded shadow-sm mb-5 bg-white">
        <form onSubmit={handleCreate}>
          <div className="row mb-3 align-items-center">
            <div className="col-md-2 fw-medium text-muted small">Question Text:</div>
            <div className="col-md-10"><input type="text" className="form-control" value={text} onChange={(e) => setText(e.target.value)} required /></div>
          </div>
          {options.map((opt, idx) => (
            <div className="row mb-2 align-items-center" key={idx}>
              {idx === 0 && <div className="col-md-2 fw-medium text-muted small">Options:</div>}
              <div className={`${idx > 0 ? 'offset-md-2' : ''} col-md-10`}>
                <input type="text" className="form-control" value={opt} onChange={(e) => handleOptionChange(idx, e.target.value)} required />
              </div>
            </div>
          ))}
          <div className="row mb-4 align-items-center mt-3">
            <div className="col-md-2 fw-medium text-muted small">Correct Answer Index:</div>
            <div className="col-md-10"><input type="number" className="form-control" min="0" max="3" value={correctIndex} onChange={(e) => setCorrectIndex(e.target.value)} required /></div>
          </div>
          <button type="submit" className="btn btn-primary w-100 py-2">Add Question</button>
        </form>
      </div>

      <div className="d-flex flex-column gap-4">
        {questions.map((q) => (
          <div className="card p-4 border rounded bg-white shadow-sm" key={q._id}>
            <h4 className="fw-bold h5 mb-3">{q.text}</h4>
            <ul className="list-unstyled ps-3 mb-3 fs-6">
              {q.options.map((opt, idx) => (
                <li key={idx} className={idx === q.correctAnswerIndex ? 'text-success fw-bold' : 'text-dark'}>• {opt}</li>
              ))}
            </ul>
            <div className="d-flex gap-2">
              <button className="btn btn-warning btn-sm px-3 text-white">Edit</button>
              <button className="btn btn-danger btn-sm px-3" onClick={() => dispatch(deleteQuestion(q._id))}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```
---
5.ĐIỂM KHỞI CHẠY KHỚP NỐI HỆ THỐNG GIAO DIỆN (APP CORNER)

**src/App.tsx**
Ma trận lưới Router tích hợp bộ lọc bảo vệ.

```tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/login';
import RegisterPage from './pages/register';
import DashboardPage from './pages/dashboard';
import QuizSessionPage from './pages/quiz-session';
import AdminDashboardPage from './pages/admin-dashboard';
import { ProtectedRoute } from './shared/ui/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      {/* Các tuyến đường công khai công cộng */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Phân hệ bảo vệ dành riêng cho SINH VIÊN / USER THƯỜNG */}
      <Route element={<ProtectedRoute requireAdmin={false} />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/quiz" element={<QuizSessionPage />} />
      </Route>

      {/* Phân hệ bảo vệ dành riêng cho QUẢN TRỊ VIÊN / ADMIN */}
      <Route element={<ProtectedRoute requireAdmin={true} />}>
        <Route path="/admin" element={<AdminDashboardPage />} />
      </Route>

      {/* Điều hướng mặc định nếu gõ sai URL */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
```

**src/main.tsx**
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from './app/store';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css'; // Khởi động Bootstrap 5 toàn cục
import './app/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
```