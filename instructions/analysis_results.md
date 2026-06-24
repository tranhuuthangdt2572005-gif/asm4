# Báo Cáo Phân Tích Ngữ Cảnh Dự Án (Assignment 4) & API ASM 3

Tài liệu này tổng hợp toàn bộ thông tin thu thập được từ tài liệu hướng dẫn (`Assignment 4 - Full-stack application.docx`), cấu trúc mã nguồn được định nghĩa (`STRUCTURE.md`), và việc quét thực tế toàn bộ thư mục tham chiếu API Backend từ **ASM 3** (`D:\FPT\SU26\SDN302\projects\asm_o3_src_o1`).

---

## 1. Yêu Cầu Tổng Quan Của Assignment 4 (Từ DOCX)

Dự án yêu cầu xây dựng một ứng dụng trắc nghiệm Full-stack:
*   **Backend:** Sử dụng Node.js (Express) + MongoDB (Mongoose) để quản lý CRUD cho các Quiz và Question. (Dựa trên mã nguồn tham chiếu ASM 3).
*   **Frontend:** Sử dụng **React** + **Redux Toolkit** (Quản lý trạng thái) + **React Router** (Điều hướng tuyến đường) + **Bootstrap 5** (Giao diện).
*   **Phân quyền và Nghiệp vụ:**
    *   **User thường (Sinh viên):** Đăng nhập -> Chọn đề thi trắc nghiệm -> Làm bài trắc nghiệm (chọn đáp án trắc nghiệm bằng radio) -> Gửi bài/Nộp bài -> Xem kết quả điểm thi.
    *   **Admin:** Đăng nhập -> Quản lý ngân hàng câu hỏi độc lập (Thêm, Sửa, Xóa câu hỏi thời gian thực).

---

## 2. Bản Đồ Cấu Trúc Frontend Theo Feature-Sliced Design (FSD)

Theo tệp [STRUCTURE.md](file:///D:/FPT/SU26/SDN302/projects/asm_o4/instructions/STRUCTURE.md), Frontend được cấu trúc như sau:

```text
src/
├── app/
│   ├── store.js            # Cấu hình Redux Store
│   ├── rootReducer.js      # Gộp các reducer (auth, quiz, manager)
│   └── index.css           # CSS toàn cục
├── shared/
│   ├── api/
│   │   └── axiosClient.js  # Cấu hình Axios đính kèm Bearer Token JWT
│   └── ui/
│       └── ProtectedRoute.tsx # Route bảo vệ theo phân quyền
├── features/
│   ├── auth/
│   │   └── authSlice.js    # Quản lý auth state, login, logout
│   ├── quiz-runner/
│   │   └── quizSlice.js    # Quản lý trạng thái thi trắc nghiệm & điểm
│   └── question-manager/
│       └── managerSlice.js # Đồng bộ hóa các thao tác CRUD câu hỏi của Admin
├── pages/
│   ├── login/
│   │   └── index.tsx       # Màn hình đăng nhập
│   ├── register/
│   │   └── index.tsx       # Màn hình đăng ký (cho phép gán quyền Admin)
│   ├── dashboard/
│   │   └── index.tsx       # Màn hình chính của user (chọn Quiz)
│   ├── quiz-session/
│   │   └── index.tsx       # Giao diện thi trắc nghiệm tương tác
│   └── admin-dashboard/
│       └── index.tsx       # Màn hình quản lý câu hỏi của Admin
├── main.tsx
└── App.tsx                 # Khớp nối các route (lưới định tuyến bảo vệ)
```

---

## 3. Khảo Sát Chi Tiết API Từ Backend ASM 3 (`asm_o3_src_o1`)

Dưới đây là chi tiết kỹ thuật các endpoints và cấu trúc dữ liệu của Backend ASM 3 đã được rà soát trực tiếp từ thư mục `D:\FPT\SU26\SDN302\projects\asm_o3_src_o1`:

### 3.1. Các Mongoose Schemas (Cấu trúc DB)

#### **User Schema** ([User.js](file:///D:/FPT/SU26/SDN302/projects/asm_o3_src_o1/models/User.js))
*   Sử dụng plugin `passport-local-mongoose` để tự động hóa việc băm mật khẩu và xác thực.
```javascript
{
  username: { type: String, default: "" },
  admin: { type: Boolean, default: false }
}
```

#### **Question Schema** ([Question.js](file:///D:/FPT/SU26/SDN302/projects/asm_o3_src_o1/models/Question.js))
```javascript
{
  text: { type: String, required: [true, "Nội dung câu hỏi không được để trống"] },
  options: { type: [String], required: [true, "Danh sách đáp án không được để trống"] },
  keywords: { type: [String], default: [] },
  correctAnswerIndex: { type: Number, required: [true, "Vị trí đáp án đúng không được để trống"] },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}
```

#### **Quiz Schema** ([Quiz.js](file:///D:/FPT/SU26/SDN302/projects/asm_o3_src_o1/models/Quiz.js))
```javascript
{
  title: { type: String, required: [true, "Tiêu đề Quiz không được để trống"] },
  description: { type: String, default: "" },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}
```

---

### 3.2. Đặc Tả Chi Tiết Các API Endpoints

#### **1. Phân Hệ Người Dùng (`/users`)**
*   **POST `/users/register`**: Đăng ký tài khoản mới.
    *   *Body:* `{ username, password, admin }`
    *   *Response (200 OK):* `{ message, user: { _id, username, admin } }`
*   **POST `/users/login`**: Đăng nhập tài khoản.
    *   *Body:* `{ username, password }`
    *   *Response (200 OK):*
        ```json
        {
          "success": true,
          "message": "Đăng nhập thành công!",
          "access_token": "<jwt-token-string>",
          "user": {
            "_id": "<user-id>",
            "username": "<username>",
            "admin": true/false
          }
        }
        ```
        > [!IMPORTANT]
        > Lưu ý: Token trả về trong trường `access_token`, trong khi ở cấu trúc mẫu `authSlice.js` của Frontend đang cố gắng đọc `response.data.token`. Cần sửa cấu trúc `authSlice.js` để đọc đúng `response.data.access_token` và lưu vào localStorage.
*   **GET `/users`**: Lấy danh sách toàn bộ thành viên.
    *   *Yêu cầu:* Bearer Token JWT của tài khoản có quyền Admin (`verifyUser`, `verifyAdmin`).
    *   *Response (200 OK):* Danh sách User.

#### **2. Phân Hệ Câu Hỏi (`/question`)**
*   **GET `/question`**: Lấy danh sách toàn bộ câu hỏi độc lập.
    *   *Response (200 OK):* Danh sách câu hỏi đầy đủ.
*   **POST `/question`**: Tạo mới một câu hỏi độc lập.
    *   *Yêu cầu:* Bearer Token JWT của User (`verifyUser`).
    *   *Body:* `{ text, options, keywords, correctAnswerIndex }`
    *   *Response (201 Created):* Trả về Object Question vừa tạo chứa thông tin `author`.
*   **GET `/question/:questionId`**: Xem chi tiết 1 câu hỏi theo ID.
*   **PUT `/question/:questionId`**: Cập nhật câu hỏi.
    *   *Yêu cầu:* Bearer Token JWT của chính người tạo câu hỏi (`verifyUser`, `verifyAuthor`).
*   **DELETE `/question/:questionId`**: Xóa câu hỏi độc lập.
    *   *Yêu cầu:* Bearer Token JWT của chính người tạo câu hỏi (`verifyUser`, `verifyAuthor`).
    *   > [!WARNING]
    *   *Lưu ý từ code Backend:* Hàm `deleteQuestion` trong `questionController.js` bị lỗi biến `questionId` không được khai báo mà chỉ có `req.params.questionId`. Khi Frontend gọi, hãy đảm bảo ID truyền vào khớp, và Backend xử lý đúng.

#### **3. Phân Hệ Đề Thi (`/quizzes`)**
*   **GET `/quizzes`**: Lấy danh sách đề thi (đã populate chi tiết câu hỏi).
    *   *Response (200 OK):* Mảng các Quiz.
*   **POST `/quizzes`**: Tạo mới đề thi Quiz.
    *   *Yêu cầu:* Bearer Token JWT của Admin (`verifyUser`, `verifyAdmin`).
    *   *Body:* `{ title, description, questions: [...] }`
    *   *Response (200 OK):* `{ message: "Quiz added", _id: "<quiz-id>" }`
*   **GET `/quizzes/:quizId`**: Chi tiết 1 đề thi theo ID (đã populate câu hỏi).
*   **PUT `/quizzes/:quizId`**: Cập nhật thông tin đề thi Quiz.
    *   *Yêu cầu:* Bearer Token JWT của Admin (`verifyUser`, `verifyAdmin`).
*   **DELETE `/quizzes/:quizId`**: Xóa đề thi Quiz.
    *   *Yêu cầu:* Bearer Token JWT của Admin (`verifyUser`, `verifyAdmin`).
*   **GET `/quizzes/:quizId/populate`**: Lấy đề thi chỉ lọc các câu hỏi có chứa từ khóa `"capital"` (không phân biệt hoa thường).
*   **POST `/quizzes/:quizId/question`**: Thêm một câu hỏi mới trực tiếp vào đề thi.
    *   *Yêu cầu:* Bearer Token JWT của User (`verifyUser`).
*   **POST `/quizzes/:quizId/questions`**: Thêm hàng loạt câu hỏi mới vào đề thi.
    *   *Yêu cầu:* Bearer Token JWT của User (`verifyUser`).
    *   *Body:* Mảng các câu hỏi `[{ text, options, correctAnswerIndex }, ...]`.

---

## 4. Các Vấn Đề/Điểm Lưu Ý Cần Giải Quyết Khi Bắt Đầu Triển Khai Frontend

1.  **Cài đặt Thư viện:**
    Dự án hiện tại là React + TS trắng (chỉ có `react`, `react-dom` trong dependencies).
    Ta cần cài đặt thêm:
    *   `redux` và `@reduxjs/toolkit`
    *   `react-redux`
    *   `react-router-dom`
    *   `axios`
    *   `bootstrap`
    *   Các `@types` tương ứng nếu viết TypeScript (ví dụ `@types/bootstrap` hoặc cài đặt bootstrap css).
2.  **Khớp nối Tên Biến Token:**
    *   Backend trả về `access_token` khi đăng nhập thành công.
    *   Mẫu trong `authSlice.js` của Frontend đọc `response.data.token`.
    *   *Khắc phục:* Sửa `authSlice.js` thành `response.data.access_token` để lưu chuẩn xác vào localStorage.
3.  **Tích Hợp Bootstrap 5 CSS:**
    *   Cần import `'bootstrap/dist/css/bootstrap.min.css'` trong `src/main.tsx` đúng như cấu trúc mẫu.
4.  **Cập nhật Axios baseURL:**
    *   `baseURL` của `axiosClient.js` cấu hình mặc định là `http://localhost:5000` (Khớp với cổng của Backend ASM 3).
