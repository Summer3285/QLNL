# 🚀 Báo Cáo Tiến Độ Dự Án & Hồ Sơ Bàn Giao - NexNova HRM

> **Tài liệu kiểm toán trạng thái codebase thực tế (Context Handoff Document)**  
> **Phiên bản:** `v2.2.0-multi-kpi`  
> **Thời điểm cập nhật:** 20/10/2026  
> **Trạng thái Git:** Branch `main` | Đã kiểm tra qua `git status` và `git diff --stat` (30 tệp tin đã cập nhật)

---

## 🏛️ 1. TỔNG QUAN KIẾN TRÚC & TRẠNG THÁI CƠ SỞ DỮ LIỆU

### 1.1. Công nghệ & Hạ tầng Full-Stack
- **Frontend:** Next.js 14.2.5 (App Router), React 18, Tailwind CSS (chuẩn Flat B2B SaaS, bo góc `rounded-sm` 4px, hairline borders, không đổ bóng, không emoji).
- **Backend:** Node.js 20 LTS + Express.js 4.19.2 + TypeScript 5.3.3.
- **ORM & Database:** Prisma ORM 5.22.0.
  - Cơ sở dữ liệu phát triển: SQLite (`dev.db`).
  - Cấu hình Production: PostgreSQL (`schema.postgresql.prisma` đồng bộ 100%).
- **Kiểm thử tự động:** Node.js Native Test Runner (`backend/src/tests/`).
- **Tài liệu hành chính:** Microsoft Word (`.docx`) chuẩn thể thức Nghị định 30/2020/NĐ-CP (Font Times New Roman 13pt, dãn dòng 1.35, thụt đầu dòng 12mm, bảng biểu chuẩn).

### 1.2. Cơ cấu Dữ liệu 18 Bảng (Prisma Data Model)
1. `User` (Tài khoản người dùng, RBAC: `ADMIN`, `HR_MANAGER`, `EMPLOYEE`)
2. `EmployeeProfile` (Hồ sơ cán bộ 360 độ, mã `NN-[MÃ_PHÒNG]-[SỐ]`, cờ `isCadre`, `cadreType`, `lineManagerId`)
3. `Department` (5 phòng ban chuẩn: `PB-TECH`, `PB-AI`, `PB-PROD`, `PB-HR`, `PB-FIN`)
4. `Contract` (Hợp đồng lao động, 5 loại hình, mức lương đóng BHXH)
5. `Attendance` (Chấm công điện tử, Check-In/Check-Out, phân loại `PRESENT`, `LATE`, `HALF_DAY`)
6. `LeaveRequest` (Đơn xin nghỉ phép, trừ ngày công chỉ tính T2-T6, loại trừ T7-CN)
7. `Payroll` (Bảng lương chuẩn Luật Việt Nam: BHXH 8%, BHYT 1.5%, BHTN 1%, Thuế TNCN lũy tiến 7 bậc)
8. `Reward` (Quyết định khen thưởng, tự động cộng `rewardAmount` vào bảng lương)
9. `Discipline` (Quyết định kỷ luật, tự động trừ `deductions` khỏi bảng lương)
10. `TransferHistory` (Lịch sử điều chuyển cán bộ thực thi bằng Database Transaction)
11. `RecruitmentPlan` (Kế hoạch tuyển dụng theo phòng ban, chỉ tiêu)
12. `Candidate` (Ứng viên phễu Kanban 5 giai đoạn, One-Click Onboarding)
13. `KpiTemplate` (Khung tiêu chí đánh giá: mở rộng `targetDepartment`, `targetRole`)
14. `KpiCategory` (Nhóm năng lực: Trọng số nhóm `weight`, thứ tự `sortOrder`)
15. `KpiCriteria` (Tiêu chí thành phần: Trọng số thành phần `weight`, mô tả chi tiết)
16. `PerformanceCycle` (Kỳ đánh giá hiệu suất, liên kết `templateId`)
17. `PerformanceReview` (Bản đánh giá nhân sự trong kỳ, liên kết `templateId`, điểm tổng hợp 5.00)
18. `ReviewScore` (Điểm chi tiết từng tiêu chí: `selfScore`, `mgrScore`, ghi chú minh chứng)

### 1.3. Hệ Thống 04 Bộ Tiêu Chí KPI Chuyên Biệt Đã Seed Vào Database
1. **Bộ 1 (Mặc định toàn công ty - `isDefault: true`, `targetDepartment: "ALL"`, `targetRole: "ALL"`):**
   *Khung Tiêu Chí Đánh Giá Chuẩn NexNova 2026* (Work Output 50%, Technical 20%, Behavioral 20%, Discipline 10%).
2. **Bộ 2 (Cấp Lãnh đạo & Quản lý - `targetDepartment: "ALL"`, `targetRole: "CADRE"`):**
   *Khung Đánh Giá Năng Lực Quản Trị & Lãnh Đạo (Leadership & Management KPI)* (Department OKRs 45%, Leadership & Strategy 30%, Domain Expertise 15%, Governance & Culture 10%).
3. **Bộ 3 (Khối Kỹ thuật & AI - `targetDepartment: "PB-TECH,PB-AI"`, `targetRole: "STAFF"`):**
   *Khung Đánh Giá Kỹ Sư Phần Mềm, AI & Dữ Liệu (Engineering & AI KPI)* (Engineering Output 50%, Technical Mastery 25%, Agile Collaboration 15%, Security & Discipline 10%).
4. **Bộ 4 (Khối Sản phẩm, Nhân sự & Tài chính - `targetDepartment: "PB-PROD,PB-HR,PB-FIN"`, `targetRole: "STAFF"`):**
   *Khung Đánh Giá Khối Sản Phẩm & Vận Hành Doanh Nghiệp (Product & Operations KPI)* (Operational Output 50%, Professional Competency 20%, Cross-functional Service 15%, Compliance & Discipline 15%).

---

## 📂 2. DANH SÁCH CÁC TỆP TIN CHỈNH SỬA GẦN NHẤT (GIT WORKING TREE)

### Backend (17 files):
- `backend/prisma/schema.prisma`: Thêm trường `targetDepartment`, `targetRole` vào `KpiTemplate` và quan hệ `templateId` vào `PerformanceReview`.
- `backend/prisma/schema.postgresql.prisma`: Đồng bộ cấu hình schema PostgreSQL tương thích 100%.
- `backend/prisma/seed-kpi.ts`: Khởi tạo và gieo mầm dữ liệu 4 khung tiêu chí KPI chuyên biệt vào cơ sở dữ liệu.
- `backend/prisma/seed.ts`: Chuẩn hóa xóa an toàn 18 bảng theo đúng thứ tự khóa ngoại.
- `backend/prisma/seed-recruitment-expansion.ts`: Bổ sung dữ liệu tuyển dụng và kế hoạch thử việc.
- `backend/src/services/performance.service.ts`:
  - Hàm `resolveTemplateForEmployee`: Tự động phân giải bộ tiêu chí căn cứ theo `isCadre` và `departmentRef.code`.
  - Cập nhật `getEmployeeReview`, `submitSelfReview`, `submitManagerReview`, `getReviewsByCycle`, `getCycleSummary` liên kết chính xác `templateId` và chuẩn hóa điểm trọng số 5.00.
- `backend/src/services/attendance.service.ts`: `getTodayRange` chuẩn hóa UTC midnight tránh lệch ngày khi lưu qua Prisma.
- `backend/src/services/employee.service.ts`: Gỡ bỏ triệt để `mode: 'insensitive'` để tương thích hoàn toàn với SQLite.
- `backend/src/services/transfer.service.ts`: Cập nhật đồng bộ `department` và `departmentId` khi duyệt điều chuyển cán bộ.
- `backend/src/services/pdf.service.ts`: Bổ sung hàm `removeVietnameseTones` giúp xuất PDF phiếu lương không lỗi font.
- `backend/src/services/recruitment.service.ts`: Cập nhật sinh mã nhân viên chuẩn `NN-[MÃ_PHÒNG]-[SỐ]`.
- `backend/src/services/payroll.service.ts`: Công thức bảo hiểm và thuế TNCN chuẩn Luật Lao động.
- `backend/src/routes/performance.routes.ts`: Bổ sung middleware phân quyền RBAC `requireRoles(['ADMIN', 'HR_MANAGER'])`.
- `backend/src/controllers/attendance.controller.ts`, `contract.controller.ts`, `recruitment.controller.ts`: Chuẩn hóa validation input.
- `backend/src/tests/recruitment.test.ts`: Kiểm thử đơn vị cho quy trình tuyển dụng và onboarding.

### Frontend (10 files):
- `frontend/src/types/index.ts`: Bổ sung các trường `targetDepartment`, `targetRole` trong `KpiTemplate` và `templateId`, `template` trong `PerformanceReview`.
- `frontend/src/app/dashboard/performance/page.tsx`:
  - Header banner hiển thị tên khung tiêu chí và badge màu sắc (Tím Quản trị CADRE, Xanh lam Kỹ thuật/AI, Cam Sản phẩm/Vận hành, Xanh lá Khung chuẩn).
  - Modal chấm điểm 2 chiều quản lý hiển thị thông tin chức danh, cấp bậc và khung KPI riêng của từng nhân sự.
  - Thêm cột "Bộ Tiêu Chí KPI" vào bảng đánh giá của Quản lý.
  - Tab "Bộ Tiêu Chí KPI & Trọng Số" nâng cấp thành giao diện tương tác duyệt 4 bộ tiêu chí chi tiết.
- `frontend/src/components/Navbar.tsx`: Gỡ bỏ hardcode "08:15", truy vấn động trạng thái điểm danh thực tế của user từ API `/api/attendance/my-logs`.
- `frontend/src/components/Sidebar.tsx`: Chống cắt chữ trên thanh icon rail 72px khi ở chế độ thu gọn.
- `frontend/src/app/dashboard/attendance/page.tsx`:
  - Thuật toán `calculateBusinessDays` loại trừ Thứ 7 và Chủ Nhật khi tính số ngày nghỉ phép.
  - Chặn người dùng tự phê duyệt đơn xin nghỉ phép của chính mình.
  - Mở khóa nút "Check-Out Ca" ngay lập tức sau khi Check-In thành công.
- `frontend/src/app/dashboard/reports/page.tsx`: Sửa lỗi hiển thị số đếm nâng lương (`eligibleSalaryList.length`).
- `frontend/src/app/dashboard/transfers/page.tsx`: Sửa lỗi gãy đường viền dọc bảng điều chuyển công tác.
- `frontend/src/app/dashboard/employees/page.tsx`: Đồng bộ mã nhân viên tự sinh `NN-[MÃ_PHÒNG]-[SỐ]`.
- `frontend/src/app/dashboard/recruitment/page.tsx`: Đồng bộ số lượng cảnh báo thử việc với tab "Theo Dõi Thử Việc".
- `frontend/src/app/dashboard/payroll/page.tsx`: Tối ưu thanh lọc phòng ban và hiển thị chi tiết tiền lương.

### Documentation (3 files):
- `docs/Bao_cao_HTTT_QLNL.md`: Bổ sung mô tả kiến trúc Đa Khung Tiêu Chí và Bảng 3.1.b (Ma trận phân hóa 04 Bộ tiêu chí KPI).
- `docs/MoTa_HeThong_QLNL_NexNova.docx`: Tái sinh file Word chuẩn Nghị định 30/2020/NĐ-CP (147 Paragraphs, 9 Tables, 100% Passed).
- `docs/org_chart.png`: Cập nhật sơ đồ tổ chức công ty.

---

## 📋 3. BẢNG CHECKLIST CHI TIẾT TRẠNG THÁI (STATUS AUDIT)

| Nhóm | Hạng mục công việc | Trạng thái thực tế | Ghi chú kỹ thuật / Chi tiết file |
| :--- | :--- | :---: | :--- |
| **A.1** | Chuẩn hóa múi giờ chấm công, cập nhật tức thì khung hôm nay và mở khóa Check-Out | **`[DONE]`** | `attendance.service.ts` dùng UTC date, `attendance/page.tsx` so sánh `toLocaleDateString('vi-VN')` và gán `todayLog` ngay. |
| **A.2** | Gỡ bỏ hardcode "Đã điểm danh: 08:15" trên Navbar, hiển thị trạng thái thực tế | **`[DONE]`** | `Navbar.tsx` truy vấn `/api/attendance/my-logs`, cập nhật thời gian check-in động hoặc ẩn badge nếu chưa điểm danh. |
| **A.3** | Loại trừ Thứ 7/CN khi tính ngày phép, chặn tự duyệt đơn xin nghỉ của chính mình | **`[DONE]`** | `attendance/page.tsx` hàm `calculateBusinessDays` đếm T2-T6; hàm `openReviewModal` chặn duyệt nếu `currentEmpId === leave.employeeId`. |
| **A.4** | Dọn dẹp seed 18 bảng theo thứ tự khóa ngoại, đồng bộ đếm tab "Theo Dõi Thử Việc" | **`[DONE]`** | `seed.ts` xóa đủ 18 bảng; `recruitment/page.tsx` tab Thử việc hiển thị badge `{alerts.length}`. |
| **A.5** | Chuẩn hóa mã nhân viên tự sinh `NN-[MÃ_PHÒNG]-[SỐ]` (thay vì VN-EMP hay NV-xxx) | **`[DONE]`** | `recruitment.service.ts` (`getNextEmployeeCode`) và `employees/page.tsx` (`generateNextEmployeeCode`) đồng bộ sinh `NN-[MÃ]-[SỐ]`. |
| **A.6** | Sửa lỗi đếm "Nâng lương (0)" tại `/dashboard/reports` khớp với cán bộ >= 24 tháng | **`[DONE]`** | `reports/page.tsx` đếm theo `eligibleSalaryList.length` (`item.isDue || item.eligible`). |
| **A.7** | Xóa `mode: insensitive`, cập nhật `departmentId` thuyên chuyển, PDF tiếng Việt, RBAC, PostgreSQL | **`[DONE]`** | `employee.service.ts` bỏ `insensitive`, `transfer.service.ts` set `departmentId`, `pdf.service.ts` dùng `removeVietnameseTones`, RBAC ở `contract`/`performance`, đồng bộ schema PG. |
| **A.8** | Sửa lỗi gãy dòng dọc bảng `/dashboard/transfers` và lỗi cắt chữ trên `Sidebar.tsx` | **`[DONE]`** | `transfers/page.tsx` dùng `min-w-[...]` và `overflow-x-auto`; `Sidebar.tsx` dùng `w-full px-1 tracking-tight` hiển thị trọn vẹn nhãn. |
| **A.8b**| Thay thế toàn bộ `window.confirm` và `alert` còn sót lại bằng Custom Modal / Toast UI | **`[IN_PROGRESS]`** | Các chức năng chính đã dùng Modal, nhưng còn sót các lệnh `alert()` / `confirm()` tại `employees/page.tsx:340`, `attendance/page.tsx:177`, `transfers/page.tsx:124`, `rewards/page.tsx:88`, `payroll/page.tsx:77`. |
| **B.1** | Mở rộng `KpiTemplate` (`targetDepartment`, `targetRole`) và `PerformanceReview.templateId` | **`[DONE]`** | Đã cập nhật `schema.prisma`, `schema.postgresql.prisma`, chạy `prisma db push` và `prisma generate` thành công. |
| **B.2** | Seed 4 bộ tiêu chí KPI chuyên biệt trong `seed-kpi.ts` (Chuẩn chung, CADRE, Tech/AI, Prod/Ops) | **`[DONE]`** | Đã tạo và nạp thành công 4 khung tiêu chí vào DB với tổng trọng số 100% chuẩn hóa trên thang 5.00. |
| **B.3** | Logic `resolveTemplateForEmployee` tự động gán bộ tiêu chí & UI xem 4 bộ tiêu chí | **`[DONE]`** | `performance.service.ts` tự động định tuyến template; `performance/page.tsx` có badge vai trò và tab xem chi tiết 4 bộ KPI. |
| **C.1** | Hàm `calculateAttendanceAndDisciplineMetrics` tính chỉ số vi phạm $V$ và kiểm tra kỷ luật ACTIVE | **`[DONE]`** | Đã viết `evaluateViolationMetrics` & `calculateAttendanceAndDisciplineMetrics` trong `performance.service.ts`, tích hợp vào `my-review`, `reviews` và route `metrics/:employeeId`, 24 unit tests pass 100%. |
| **C.2** | Hiển thị Banner đối soát tự động và nút áp dụng điểm tại nhóm "Kỷ luật & Thái độ" | **`[DONE]`** | Đã tích hợp `AttendanceDisciplineAuditBanner` tại nhóm tiêu chí 4 trên cả Tab Tự đánh giá và Modal Quản lý đối chiếu 2 cột, kèm nút 1-click áp dụng điểm và minh chứng. |
| **D.1** | Cập nhật `docs/Bao_cao_HTTT_QLNL.md` và `docs/MoTa_HeThong_QLNL_NexNova.docx` khớp 100% codebase | **`[DONE]`** | Đã cập nhật Bảng 3.1.b vào Markdown và tái tạo file Word chuẩn NĐ 30/2020/NĐ-CP (147 Paragraphs, 9 Tables, 0 lỗi dính chữ). |
| **D.2** | Bổ sung thuyết minh công thức đối soát chuyên cần $V$ vào Mục 2.1 & 3.6 tài liệu báo cáo | **`[DONE]`** | Đã bổ sung công thức toán $V$, bảng quy đổi 1-5 sao, trần kỷ luật lao động và cơ chế liên thông tự động vào cả Markdown và file Word `.docx`. |

---

## 🎯 4. THỨ TỰ ƯU TIÊN CHO CÁC BƯỚC KẾ TIẾP

### 🥇 Ưu tiên 1: Dọn dẹp triệt để `alert()` & `confirm()` còn sót lại (Nhóm A - UI Polish)
1. Thay thế các lệnh `window.confirm` / `alert()` còn lại ở `employees/page.tsx:340`, `attendance/page.tsx:177`, `transfers/page.tsx:124`, `rewards/page.tsx:88`, `payroll/page.tsx:77` bằng Custom Modal hoặc Toast Notification.

### 🥈 Ưu tiên 2: Tối ưu hóa Hiệu năng & Mở rộng Kiểm thử E2E
1. Bổ sung các bài test E2E (Playwright) cho luồng đánh giá hiệu suất liên thông chấm công và luồng tuyển dụng tiếp nhận One-Click Onboarding.
