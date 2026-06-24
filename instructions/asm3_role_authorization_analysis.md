# Phân Tích Phân Quyền Người Dùng (Guest / User / Author / Admin) - ASM 3 Backend

Dựa trên việc rà soát ngược lại các tệp trong thư mục [middlewares](file:///D:/FPT/SU26/SDN302/projects/asm_o3_src_o1/middlewares/authenticate.js) và [routes](file:///D:/FPT/SU26/SDN302/projects/asm_o3_src_o1/routes) của ASM 3, dưới đây là đặc tả chi tiết về cơ chế xác thực và logic phân quyền.

---

## 1. Cơ Chế Hoạt Động Của Các Middlewares Xác Thực
Nằm tại tệp [authenticate.js](file:///D:/FPT/SU26/SDN302/projects/asm_o3_src_o1/middlewares/authenticate.js), backend định nghĩa 3 chốt chặn:

*   **`verifyUser` (Xác thực đăng nhập):**
    *   Kiểm tra tiêu đề `Authorization` có chứa mã JWT token dạng `"Bearer <token>"` hay không.
    *   Nếu không có hoặc token hết hạn/không hợp lệ -> Trả về lỗi `401 Unauthorized` ("Bạn cần cung cấp mã token đăng nhập!").
    *   Nếu hợp lệ -> Đính kèm thông tin user vừa giải mã vào `req.user` và cho phép đi tiếp.
*   **`verifyAdmin` (Phân quyền Admin):**
    *   Chạy sau `verifyUser`. Kiểm tra trường `req.user.admin` trong database.
    *   Nếu `admin === true` -> Cho phép đi tiếp.
    *   Nếu không -> Trả về lỗi `403 Forbidden` ("Bạn không có quyền thực hiện yêu cầu này!").
*   **`verifyAuthor` (Phân quyền chính chủ/Tác giả câu hỏi):**
    *   Chạy sau `verifyUser`. Tìm câu hỏi trong cơ sở dữ liệu dựa theo tham số `req.params.questionId`.
    *   Đối sánh xem trường `question.author` (ObjectId) có trùng khớp với `req.user._id` (ObjectId của người đang đăng nhập) hay không.
    *   Nếu khớp -> Cho phép đi tiếp.
    *   Nếu không khớp -> Trả về lỗi `403 Forbidden` ("Bạn không phải người tạo ra câu hỏi này!").

---

## 2. Ma Trận Quyền Truy Cập Chi Tiết (Role Access Matrix)

Dưới đây là bảng tổng hợp quyền hạn của từng vai trò đối với các định tuyến APIs trong hệ thống:

| Nhóm chức năng | Endpoint | Phương thức | Guest (Chưa Login) | User thường (Non-Author) | Author (Người tạo câu hỏi) | Admin |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Quản lý đề thi (Quizzes)** | `/quizzes` | **GET** | ✅ Cho phép | ✅ Cho phép | ✅ Cho phép | ✅ Cho phép |
| | `/quizzes` | **POST** | ❌ Chặn (401) | ❌ Chặn (403) | ❌ Chặn (403) | ✅ Cho phép |
| | `/quizzes/:quizId` | **GET** | ✅ Cho phép | ✅ Cho phép | ✅ Cho phép | ✅ Cho phép |
| | `/quizzes/:quizId` | **PUT** | ❌ Chặn (401) | ❌ Chặn (403) | ❌ Chặn (403) | ✅ Cho phép |
| | `/quizzes/:quizId` | **DELETE** | ❌ Chặn (401) | ❌ Chặn (403) | ❌ Chặn (403) | ✅ Cho phép |
| | `/quizzes/:quizId/populate` | **GET** | ✅ Cho phép | ✅ Cho phép | ✅ Cho phép | ✅ Cho phép |
| **Thêm câu hỏi vào đề** | `/quizzes/:quizId/question` | **POST** | ❌ Chặn (401) | ✅ Cho phép | ✅ Cho phép | ✅ Cho phép |
| | `/quizzes/:quizId/questions` | **POST** | ❌ Chặn (401) | ✅ Cho phép | ✅ Cho phép | ✅ Cho phép |
| **Ngân hàng câu hỏi** | `/question` | **GET** | ✅ Cho phép | ✅ Cho phép | ✅ Cho phép | ✅ Cho phép |
| | `/question` | **POST** | ❌ Chặn (401) | ✅ Cho phép | ✅ Cho phép | ✅ Cho phép |
| | `/question/:questionId` | **GET** | ✅ Cho phép | ✅ Cho phép | ✅ Cho phép | ✅ Cho phép |
| | `/question/:questionId` | **PUT** | ❌ Chặn (401) | ❌ Chặn (403) | ✅ Cho phép | ❌ Chặn (403)* |
| | `/question/:questionId` | **DELETE**| ❌ Chặn (401) | ❌ Chặn (403) | ✅ Cho phép | ❌ Chặn (403)* |

---

## 3. Các Điểm Logic Cốt Lõi Rút Ra Từ Hệ Thống

### 3.1. Quyền của Guest (Khách không cần Login)
*   **Được phép xem tự do:** Guest hoàn toàn có thể thực hiện **GET** đến `/quizzes`, `/quizzes/:quizId`, `/quizzes/:quizId/populate`, `/question` và `/question/:questionId`.
*   **Ý nghĩa:** Bất cứ ai ghé thăm trang web đều có thể xem danh sách đề thi trắc nghiệm và nội dung ngân hàng câu hỏi mà không cần đăng nhập. Tuy nhiên, họ không thể thực hiện bài kiểm tra có ghi nhận hoặc làm các thao tác thay đổi dữ liệu (như thi cử hay tạo mới câu hỏi/đề thi).

### 3.2. Sự khác biệt giữa Admin và Author đối với Câu hỏi
> [!IMPORTANT]
> **Điểm đặc biệt trong logic của `verifyAuthor`:**
> Middleware `verifyAuthor` **chỉ** kiểm tra xem `question.author` có trùng khớp với `req.user._id` hay không. Nó **không** chứa điều kiện ngoại lệ bỏ qua xác thực nếu người dùng đăng nhập là Admin (`req.user.admin === true`).
>
> Do đó, trong hệ thống ASM 3 này:
> *   **Admin** cũng **không thể** tự ý sửa (**PUT**) hoặc xóa (**DELETE**) các câu hỏi thuộc phân hệ độc lập `/question/:questionId` nếu người tạo ra câu hỏi đó (author) là một user khác. Admin sẽ bị lỗi `403 Forbidden` do cơ chế kiểm tra trùng khớp ID tác giả.
> *   **Author** (có thể là User thường hoặc Admin) là người duy nhất có quyền chỉnh sửa/xóa câu hỏi do chính họ tạo ra.

### 3.3. Quyền hạn tối cao của Admin đối với Đề thi (Quizzes)
*   Chỉ có người dùng có cờ `admin === true` mới được tạo (`POST`), sửa (`PUT`) và xóa (`DELETE`) các đề thi trắc nghiệm (đối tượng đầu mục ở `/quizzes`).
*   User thường chỉ có thể xem đề thi và thêm câu hỏi vào đề thi đó (qua các endpoint `/quizzes/:quizId/question(s)`).
