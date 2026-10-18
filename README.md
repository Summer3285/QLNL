# NexNova Technologies - Enterprise HRM Web Application

> **Hệ thống Thông tin Quản lý Nguồn Nhân lực Doanh nghiệp (Enterprise Human Resource Management - HRM)**  
> Được xây dựng chuẩn kiến trúc Full-stack cao cấp, bảo mật đa tầng, tuân thủ RBAC và tích hợp 5 phân hệ nghiệp vụ cốt lõi theo tiêu chuẩn ISO 27001 & Bộ luật Lao động Việt Nam.

---

## 🏢 1. Hồ Sơ Doanh Nghiệp (Enterprise Context)

- **Tên Doanh Nghiệp**: **NexNova Technologies (NN-TECH)**
- **Lĩnh Vực Hoạt Động**: Tập đoàn Công nghệ, Điện toán Đám mây & Giải pháp Trí tuệ Nhân tạo (Cloud & AI Enterprise Solutions).
- **Trụ Sở**: Tòa nhà NexNova Innovation Tower, Khu Công nghệ cao, TP. Hồ Chí Minh / Cầu Giấy, Hà Nội.
- **Cơ cấu Khối Phòng Ban**:
  1. `Software Engineering`: Phát triển Phần mềm, Cloud DevOps & Kiến trúc Hệ thống.
  2. `AI & Data Intelligence`: Trí tuệ Nhân tạo, Machine Learning & Kỹ thuật Dữ liệu.
  3. `Product & Design`: Quản lý Sản phẩm công nghệ & Thiết kế Trải nghiệm UI/UX.
  4. `People & Culture (HR)`: Tuyển dụng, Đào tạo, Đãi ngộ & Quản trị Nhân tài.
  5. `Finance & Operations`: Tài chính Kế toán, Ngân sách Quỹ lương & Vận hành Doanh nghiệp.

---

## 🛠️ 2. Technology Stack

- **Frontend**: Next.js 14+ (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons, Glassmorphism & Enterprise Clean Slate theme.
- **Backend**: Node.js, Express.js với TypeScript, Clean Architecture (Controller - Service - Repository/Prisma), Zod Validation, PDFKit.
- **Database & ORM**: PostgreSQL kết hợp Prisma ORM (hỗ trợ migration, relational integrity và seeding mẫu phong phú).
- **Authentication & Security**: JSON Web Tokens (JWT), Role-Based Access Control (RBAC), bcrypt (12 rounds password hashing), CORS policy.
- **DevOps & Containerization**: Multi-stage Dockerfile cho Frontend & Backend, Docker Compose tự động khởi tạo cơ sở dữ liệu PostgreSQL kèm healthcheck.

---

## 👥 3. Tài Khoản Thử Nghiệm & Phân Quyền (Pre-seeded Accounts)

Hệ thống đã chuẩn bị sẵn 3 cấp quyền chính và các tài khoản mẫu tại màn hình đăng nhập:

| Quyền hạn (Role) | Email Đăng Nhập | Mật Khẩu | Họ Tên & Chức Vụ | Quyền Hạn Thực Tế |
|---|---|---|---|---|
| **ADMIN** | `admin@nexnova.tech` | `Admin@123` | **Trần Quang Huy**<br>(Head of IT & System Admin) | Toàn quyền quản trị hệ thống, quản lý hồ sơ nhân sự, cấu hình quyền, xóa hồ sơ. |
| **HR_MANAGER** | `hr@nexnova.tech` | `HR@123` | **Nguyễn Thu Hà**<br>(People & Culture Director) | Quản lý danh bạ nhân sự, duyệt đơn xin nghỉ phép, kích hoạt tính lương tự động, chấm điểm hiệu suất 360. |
| **EMPLOYEE** | `employee@nexnova.tech` | `Emp@123` | **Lê Hoàng Nam**<br>(Senior Full-stack Engineer) | Check-in/out hằng ngày, nộp đơn xin nghỉ, xem & tải Phiếu lương (Payslip PDF), tự đánh giá hiệu suất cá nhân. |

*(Ngoài ra còn có các nhân sự mẫu thuộc phòng ban AI, Product, Finance: `data.ai@nexnova.tech`, `product@nexnova.tech`, `finance@nexnova.tech` với mật khẩu chung `Emp@123`).*

---

## 🚀 4. Hướng Dẫn Khởi Chạy Nhanh với Docker

Chỉ với một câu lệnh duy nhất, toàn bộ hệ thống (PostgreSQL, Backend API và Frontend Next.js) sẽ tự động được build và kết nối mạng nội bộ:

### Bước 1: Khởi động hệ thống
```bash
docker compose up --build
```

### Bước 2: Truy cập ứng dụng
- **Cổng Web Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API & Healthcheck**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **PostgreSQL Database**: `localhost:5432` (User: `postgres`, Password: `postgres123`, DB: `hrm_nexnova`)

---

## 🖥️ 5. Hướng Dẫn Chạy Bản Desktop App (Windows / macOS)

Ứng dụng Desktop App được xây dựng nguyên bản bằng **Electron + TypeScript**, tích hợp đầy đủ 5 module y hệt bản web cùng các tính năng native:

- **Khay hệ thống Taskbar (System Tray)** với menu thao tác nhanh (Check-in nhanh, Xem bảng lương, Thoát).
- **Thông báo nổi Windows (Desktop Notifications)** khi Check-in / Check-out hoặc duyệt đơn.
- **Hộp thoại lưu tệp Windows (Native Save File Dialog)** lưu trực tiếp Payslip PDF vào máy tính.

### Khởi động nhanh Desktop App:
```bash
# 1. Cài đặt dependencies cho Desktop app (lần đầu)
cd desktop
npm install

# 2. Khởi chạy cửa sổ ứng dụng Desktop
npm run dev
```

### Đóng gói thành file cài đặt Windows (.exe):
```bash
npm run dist:win
```
*(File cài đặt NSIS `.exe` và bản Portable sẽ được tạo ra tại thư mục `desktop/release/`).*

---

## 💻 6. Hướng Dẫn Chạy Cục Bộ Không Cần Docker (Local Development)

Nếu bạn muốn chạy trực tiếp bằng Node.js trên máy cục bộ:

### Bước 1: Thiết lập & Khởi động Backend
```bash
cd backend
npm install

# Khởi tạo cơ sở dữ liệu và seed dữ liệu mẫu
npx prisma generate
npx prisma db push
npm run prisma:seed

# Khởi động Backend API (Port 5000)
npm run dev
```

### Bước 2: Thiết lập & Khởi động Frontend
```bash
cd ../frontend
npm install

# Khởi động Frontend Web App (Port 3000)
npm run dev
```
Truy cập trình duyệt tại: **http://localhost:3000**.

---

## 🧪 6. Chạy Kiểm Thử Tự Động (Unit Tests)

Bộ kiểm thử tự động đã được lập trình sẵn cho **Công thức Tính Lương Doanh nghiệp (Payroll Engine)**, xác minh độ chính xác của số ngày công, các khoản khấu trừ BHXH 10.5% và thuế TNCN lũy tiến:

```bash
cd backend
npm test
```

---

## 📊 7. Cấu Trúc 9 Module Nghiệp Vụ Hoàn Chỉnh (Theo Tiêu Chuẩn Doanh Nghiệp & Đề Án HUHA HRM)

Hệ thống đã tích hợp trọn vẹn 9 module quản lý nguồn nhân lực đa tầng:

1. **Module 1: Authentication & Phân quyền (RBAC)**
   - Đăng nhập JWT Token, mã hóa mật khẩu bcrypt, bảo vệ Endpoint theo Role (`ADMIN`, `HR_MANAGER`, `EMPLOYEE`).
2. **Module 2: Quản lý Hồ sơ Cán bộ & Nhân sự (Employee Directory)**
   - CRUD thông tin nhân viên: Mã NV, Họ tên, Phòng ban, Chức danh, Mức lương, Giới tính, Trình độ đào tạo, Ngày vào làm.
   - Thống kê định biên và tổng quỹ lương theo từng khối phòng ban.
3. **Module 3: Quản lý Chấm công & Nghỉ phép (Time & Attendance)**
   - Check-in / Check-out thời gian thực, tự động gắn cờ Đúng giờ / Đi muộn / Về sớm.
   - Nộp và phê duyệt đơn nghỉ phép trực tuyến có trừ phép năm.
4. **Module 4: Quản lý & Tính Lương Tự Động (Payroll Management)**
   - Động cơ tính lương tự động theo số ngày công thực tế, trừ BHXH 10.5% và thuế TNCN lũy tiến.
   - Xuất phiếu lương điện tử định dạng PDF (`/api/payroll/:id/pdf`) tích hợp chữ ký điện tử.
5. **Module 5: Đánh giá Hiệu suất 360 (Performance Review)**
   - Thiết lập các kỳ đánh giá hiệu suất (Quý/Năm). Tự đánh giá năng lực cá nhân và quản lý xếp loại chung cuộc.
6. **Module 6: Quản lý Khen thưởng & Kỷ luật (Rewards & Disciplines - *Mới theo HUHA*)**
   - Ban hành quyết định khen thưởng / kỷ luật gắn với số quyết định, ngày hiệu lực và số tiền thưởng/phạt.
   - Tự động cộng thưởng / khấu trừ phạt trực tiếp vào bảng lương tháng của nhân sự.
7. **Module 7: Điều Động & Thuyên Chuyển Công Tác (Transfers & Promotions - *Mới theo HUHA*)**
   - Quản lý lịch sử luân chuyển phòng ban, bổ nhiệm chức vụ và điều chỉnh ngạch lương.
   - Cập nhật tự động thông tin phòng ban, vị trí và mức lương mới vào hồ sơ nhân sự.
8. **Module 8: Kế Hoạch Tuyển Dụng & Cảnh Báo Thử Việc (Recruitment & Probation - *Mới theo HUHA*)**
   - Lập và theo dõi chỉ tiêu kế hoạch tuyển dụng từng phòng ban.
   - Quản lý ứng viên & **Cảnh báo hạn thử việc tự động** (đổi màu cảnh báo các hợp đồng còn dưới 15 ngày hoặc quá hạn).
   - Nút thao tác chuyển tiếp nhận chính thức vào danh bạ nhân sự.
9. **Module 9: Báo Cáo Nghiệp Vụ & Sơ Yếu Lý Lịch Cán Bộ (Reports & CV Print - *Mới theo HUHA*)**
   - **Danh sách đến kỳ xét nâng bậc lương** (niên hạn >= 24 tháng theo quy định).
   - **Kế hoạch nghỉ hưu** tự động tính theo tuổi luật định (Nam 62, Nữ 60).
   - **Thống kê cơ cấu nhân lực đa chiều**: Tháp độ tuổi, cơ cấu giới tính, trình độ đào tạo và phân bổ phòng ban.
   - **Trích xuất & In Sơ yếu lý lịch cán bộ** chuẩn hóa (`window.print()`) sẵn sàng đóng dấu ký tên.

---

## 📁 8. Cấu Trúc Thư Mục Toàn Dự Án

```
HTTT QLNL/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Mô hình cơ sở dữ liệu quan hệ PostgreSQL
│   │   └── seed.ts             # Script gieo dữ liệu doanh nghiệp mẫu NexNova
│   ├── src/
│   │   ├── config/             # Biến môi trường & Prisma Client
│   │   ├── controllers/        # 5 Core Controllers xử lý HTTP request
│   │   ├── middleware/         # Auth, RBAC, Validation & Error Handlers
│   │   ├── routes/             # Định tuyến RESTful API
│   │   ├── services/           # Nghiệp vụ core, tính lương & sinh PDF Payslip
│   │   ├── tests/              # Unit Tests kiểm thử tự động thuật toán lương
│   │   ├── types/              # Định nghĩa Types TypeScript
│   │   ├── app.ts              # Cấu hình Express App, CORS
│   │   └── server.ts           # Điểm khởi động Server
│   ├── Dockerfile              # Container image cho Backend
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/
│   │   │   │   ├── attendance/ # Giao diện Chấm công & Nghỉ phép
│   │   │   │   ├── employees/  # Danh bạ Nhân sự & Thêm mới
│   │   │   │   ├── payroll/    # Bảng lương & Tải Payslip PDF
│   │   │   │   ├── performance/# Đánh giá hiệu suất 360 độ
│   │   │   │   ├── layout.tsx  # Layout điều hướng Dashboard
│   │   │   │   └── page.tsx    # Trang chủ Tổng quan Điều hành
│   │   │   ├── login/          # Giao diện Đăng nhập Cổng Doanh nghiệp
│   │   │   ├── globals.css     # Định kiểu giao diện Tailwind CSS
│   │   │   └── layout.tsx      # Root Layout & Auth Provider
│   │   ├── components/         # Sidebar, Navbar, StatCard, Modal
│   │   ├── lib/                # API Client, Auth Context, Formatters
│   │   └── types/              # Types dùng chung cho Frontend
│   ├── Dockerfile              # Multi-stage container image cho Next.js
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
├── docker-compose.yml          # Triển khai toàn bộ cụm dịch vụ cục bộ
├── .gitignore
└── README.md
```
