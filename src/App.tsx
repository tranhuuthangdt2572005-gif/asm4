import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import QuizSessionPage from './pages/QuizSessionPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import QuizDetailPage from './pages/QuizDetailPage';
import QuestionDetailPage from './pages/QuestionDetailPage';
import { ProtectedRoute } from './shared/ui/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      {/* Các tuyến đường công khai công cộng cho cả Khách và User */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/dashboard/quiz" element={<QuizSessionPage />} />
      <Route path="/dashboard/quizzes/:quizId" element={<QuizDetailPage />} />
      <Route path="/dashboard/questions/:questionId" element={<QuestionDetailPage />} />

      {/* Phân hệ bảo vệ dành riêng cho QUẢN TRỊ VIÊN / ADMIN */}
      <Route element={<ProtectedRoute requireAdmin={true} />}>
        <Route path="/admin" element={<AdminDashboardPage />} />
      </Route>

      {/* Điều hướng mặc định về Dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
