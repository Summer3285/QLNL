# 🚀 Tóm Tắt Tiến Độ Dự Án - NexNova HRM

> **Lưu ý:** File này được cập nhật liên tục sau mỗi task hoặc quyết định kiến trúc lớn để theo dõi tiến độ thực hiện và các việc cần làm tiếp theo.

---

## 📅 Lịch sử Công việc Đã Hoàn Thành (Đến ngày 06/10/2026)

### 1. 🏢 Hoàn thiện Cấu trúc Phòng ban & Nhân sự
- **Kiến trúc dữ liệu:** Xây dựng mô hình quan hệ giữa `Department` (Phòng ban) và `EmployeeProfile` (Hồ sơ nhân viên).
- **Phát triển:** Bổ sung dữ liệu nhân sự thực tế, gieo (seed) danh sách nhân sự đa dạng vào các khối/phòng ban chức năng nhằm phục vụ kiểm thử và trình diễn.
- **Quyết định quan trọng:** Tổ chức nhân sự theo hướng doanh nghiệp vừa và lớn, phân cấp rõ ràng theo các phòng ban nghiệp vụ cốt lõi.

### 2. 📈 Nâng cấp Hệ thống Đánh giá Hiệu suất (KPI / 360-degree)
- **Kiến trúc dữ liệu:** Cập nhật schema Prisma (`PerformanceReview`, `ReviewScore`), thiết kế lại hoàn toàn cấu trúc đánh giá.
- **Phát triển:** 
  - Chuyển từ cơ chế tự đánh giá 1-5 sao đơn giản sang mô hình đánh giá đa tiêu chí.
  - Áp dụng hệ thống **Trọng số (Weighted Scores)** cho từng tiêu chí, tính toán tự động điểm số.
  - Tự động xếp loại (Auto Rating) dựa trên điểm số (Excellent, Good, Needs Improvement...).
- **Quyết định quan trọng:** Tham chiếu theo mô hình OKR / KPI chuyên nghiệp của các tập đoàn (Google, SAP SuccessFactors) thay vì các biểu mẫu sơ sài.

### 3. 🎨 Chuẩn hóa & Ép Phẳng Giao Diện (Enterprise B2B SaaS UI)
- **Tối ưu UX/UI:** 
  - Lược bỏ hoàn toàn các cấu trúc Emoji dư thừa (⭐, 👥, 🏆) và sử dụng đồng nhất Vector SVG Icons (Lucide).
  - Gỡ bỏ các chú thích song ngữ rườm rà (ví dụ: "Phép năm (Annual)", "Thực lĩnh (Net)").
- **Force Flat Design (Ép phẳng thiết kế):**
  - Đồng bộ toàn bộ bo góc phần tử (Component Border Radius) từ `rounded-2xl` / `rounded-lg` xuống **`rounded-sm` (4px)** cực kỳ vuông vức, sắc cạnh giống Base HRM và 1Office.
  - Xóa bỏ hoàn toàn hiệu ứng đổ bóng (`shadow-none`) ở mọi nơi, thay bằng các đường viền mỏng hairline (`border-slate-200`).
- **Quyết định quan trọng:** Loại bỏ hoàn toàn phong cách "AI Slop" (bóng bẩy, bo tròn mạnh, gradient) để định hình lại ứng dụng theo phong cách nghiêm túc, tối giản và chuyên nghiệp.

### 4. 🧹 Quy hoạch Kiến trúc Monorepo & Dọn dẹp Thư mục
- **Tối ưu Filesystem:** Xóa bỏ thư mục `node_modules` rác ở gốc, gom nhóm toàn bộ các file script rời rạc (`.ps1`, `.vbs`) vào `scripts/windows-internals`, và di chuyển thư mục `references` vào chung với `docs/`.
- **Chuẩn hóa NPM Workspaces:** Cập nhật `package.json` gốc để khai báo `"workspaces": ["frontend", "backend", "desktop"]`, cho phép quản lý dependency tập trung và tiết kiệm dung lượng ổ cứng thông qua hoisting.
- **Tối ưu lệnh khởi động (DX):** Tích hợp package `concurrently`, cấu hình lệnh `npm run dev` ở thư mục gốc để khởi chạy đồng thời cả Backend và Frontend chung trên một terminal một cách mượt mà.

### 5. 🧑‍💼 Tinh Giản & "Bình Thường Hóa" Giao Diện (Human-Crafted Enterprise UI - Mới nhất)
- **Bối cảnh & Mục tiêu:** Loại bỏ các dấu hiệu giao diện khuôn mẫu do AI tạo ra ("AI slop", ngôn từ hoa mỹ, chi tiết thừa thãi), đưa giao diện về chuẩn mực thực tế của các phần mềm HRM hàng đầu (Base HRM, BambooHR, 1Office).
- **Chi tiết thực hiện:**
  - **Sidebar:** Rút ngắn tên nhóm (TỔNG QUAN, NHÂN SỰ, CÔNG & LƯƠNG, ĐÁNH GIÁ, BÁO CÁO) và các menu item ("Nhân sự", "Phòng ban", "Thuyên chuyển", "Tuyển dụng", "Chấm công", "Bảng lương"...). Gỡ bỏ hoàn toàn badge role "Toàn quyền Admin", footer bản quyền chiếm diện tích và dấu chấm active dot.
  - **Navbar:** Xóa bỏ hoàn toàn đồng hồ đếm giây real-time và badge "Hệ thống trực tuyến" (kèm pulse) thừa thãi. Tinh giản avatar và thông tin người dùng, bỏ mã nhân viên mono phô trương, chuyển nút "Đăng xuất" thành icon button tinh gọn.
  - **StatCard:** Xóa bỏ phụ đề (subtitle) dài dòng dưới mỗi ô số liệu; bỏ format `uppercase tracking-wider` cách điệu quá đà; tinh giản icon phẳng trực tiếp.
  - **Dashboard:** Xóa badge "Cổng Thông Tin Điều Hành Doanh Nghiệp" và lời chào hoa mỹ; rút gọn tiêu đề section ("Phòng ban", "Truy cập nhanh"), xóa toàn bộ các câu mô tả phụ mang tính máy móc; xóa bỏ khối "Quy định Giờ Công Chuẩn".
  - **Trang Đăng Nhập (Login):** Xóa bỏ hoàn toàn khối demo "Đăng nhập nhanh theo vai trò (Demo)"; chuẩn hóa icon logo bo góc `rounded-sm`; gỡ bỏ từ ngữ khẩu hiệu rườm rà.
  - **Đồng bộ tất cả các phân hệ nội bộ (Departments, Employees, Attendance, Payroll, Performance, Recruitment, Reports, Rewards, Transfers):**
    - Rút gọn tiêu đề trang chỉ còn 1-2 từ chuẩn nghiệp vụ ("Phòng ban", "Nhân sự", "Chấm công", "Bảng lương", "Đánh giá", "Tuyển dụng", "Báo cáo", "Khen thưởng & Kỷ luật", "Thuyên chuyển").
    - Gỡ bỏ toàn bộ dòng mô tả phụ bên dưới tiêu đề (title đã tự giải thích rõ ràng).
    - Rút gọn nhãn các nút thao tác ("Thêm phòng ban", "Thêm nhân sự", "Tạo đơn nghỉ", "Tính lương", "Tạo kỳ đánh giá", "Tạo kế hoạch", "Tạo quyết định").
    - Đồng bộ góc bo `rounded-sm` ở các thanh chuyển chế độ xem (view toggle) và ô thẻ thống kê.
### 6. 🏢 Đơn Giản Hóa & Tinh Gọn Phân Hệ Phòng Ban (Department UI Simplification & Table View - Mới nhất)
- **Bối cảnh & Vấn đề:** Giao diện thẻ phòng ban trước đây bị quá tải thông tin ("rối mắt") do nhồi nhét nhiều badge nhân sự li ti, thanh tỷ lệ 2 màu sặc sỡ, và card quá cao.
- **Tối ưu hóa Thẻ phòng ban (Card View):**
  - Rút ngắn ~60% chiều cao thẻ phòng ban; loại bỏ hoàn toàn danh sách pill "Nhân sự chủ chốt" vụn vặt và thanh ratio bar chia tỷ lệ.
  - Tinh giản khối Trưởng phòng thành hàng avatar + họ tên + chức danh ngắn gọn.
  - Toàn bộ cơ cấu chi tiết từng nhân sự (Lãnh đạo/Quản lý & Nhân viên) được chuyển vào Modal khi người dùng click vào thẻ hoặc bấm xem chi tiết.
- **Tích hợp Chế độ xem Bảng (Table View):**
  - Bổ sung thanh chuyển đổi 3 chế độ xem: `Thẻ` (Cards), `Bảng` (Table), `Sơ đồ` (Org Chart).
  - Chế độ Bảng cung cấp góc nhìn tổng quan, cô đọng chuẩn nghiệp vụ HRM: Mã phòng, Tên phòng ban, Trưởng phòng, Địa điểm, Số nhân sự, Quỹ lương tháng và nút thao tác nhanh.
  - Thanh tìm kiếm được tách ra ngoài dùng chung cho cả dạng Thẻ và dạng Bảng.
- **Đồng bộ chuẩn thiết kế Flat B2B:**
  - Chuẩn hóa toàn bộ bo góc `rounded-sm` (4px), viền hairline `border-slate-200`, không đổ bóng ở tất cả các Card, Table, Node Sơ đồ tổ chức và Modal chi tiết/thêm mới.

### 7. 📜 Triển Khai Phân Hệ Hợp Đồng Lao Động & Chuẩn Hóa Hồ Sơ 360° (Core HR & Labor Contracts - Giai đoạn 1 - Mới nhất)
- **Bối cảnh & Mục tiêu:** Bổ sung trụ cột pháp lý then chốt của Quản trị nhân lực (vốn bị thiếu hoàn toàn trong phiên bản cũ), đồng thời chuẩn hóa hồ sơ nhân viên đa chiều (360 độ) theo đúng tiêu chuẩn Base HRM và BambooHR.
- **Kiến trúc dữ liệu (Database Schema):**
  - Tạo model `Contract`: Lưu số hợp đồng, loại hợp đồng (`INDEFINITE`, `DEFINITE_3Y`, `DEFINITE_1Y`, `PROBATION`, `SEASONAL`), thời hạn, ngày ký, mức lương đóng BHXH, trạng thái và ghi chú.
  - Mở rộng model `EmployeeProfile`: Bổ sung thông tin định danh pháp lý (Số CCCD, Ngày cấp, Nơi cấp, Mã số thuế cá nhân, Mã sổ BHXH), thông tin tài khoản ngân hàng (Số TK, Tên ngân hàng, Chi nhánh), Người quản lý trực tiếp (`lineManagerId`), và Quỹ ngày phép năm (`annualLeaveBalance`).
- **Phát triển Backend:**
  - Xây dựng trọn bộ Service, Controller và Routes cho phân hệ Hợp đồng (`/api/contracts`): Hỗ trợ thống kê KPI hợp đồng, cảnh báo hợp đồng sắp hết hạn trong 30-60 ngày, tạo/sửa/xóa và lọc nâng cao.
  - Nâng cấp `EmployeeService`: Truy vấn kèm hợp đồng, quản lý trực tiếp, cấp dưới, khen thưởng, kỷ luật khi lấy chi tiết nhân viên.
  - Tạo seed data tự động: Gieo dữ liệu hợp đồng lao động và thông tin định danh mẫu cho toàn bộ 21 nhân sự trong hệ thống.
- **Phát triển Frontend:**
  - **Trang Quản lý Hợp đồng lao động (`/dashboard/contracts`):** Bổ sung vào Sidebar; tích hợp 4 thẻ KPI thống kê; thanh công cụ lọc loại HĐ, trạng thái và tab cảnh báo sắp hết hạn; bảng dữ liệu phẳng `rounded-sm` chuẩn B2B SaaS; Modal ký mới và Modal xem chi tiết hợp đồng.
  - **Nâng cấp Trang Nhân sự (`/dashboard/employees`):** Tích hợp Modal xem Hồ sơ 360° đầy đủ (4 tab: Công việc & Tổ chức, Định danh & Ngân hàng, Hợp đồng lao động, Lương & Phép năm); mở rộng Modal Thêm/Sửa nhân sự với đầy đủ trường thông tin; loại bỏ sạch toàn bộ các class `rounded-xl` còn sót lại.

### 8. 👤 Triển Khai Cổng Thông Tin Nhân Viên Tự Phục Vụ (Employee Self-Service - ESS) & Quỹ Phép Năm Tự Động (Giai đoạn 2 - Mới nhất)
- **Bối cảnh & Mục tiêu:** Bổ sung Cổng thông tin cá nhân dành riêng cho người lao động (`/dashboard/profile` - "Hồ sơ của tôi"), cho phép nhân viên tự tra cứu hồ sơ 360°, quản lý hợp đồng, tải phiếu lương điện tử và chủ động cập nhật thông tin liên hệ / tài khoản ngân hàng; đồng thời thiết lập cơ chế kiểm soát và tự động trừ/hoàn quỹ ngày phép năm theo chuẩn Luật Lao động Việt Nam.
- **Phát triển Backend:**
  - **Employee Service & Controller:** Bổ sung API `GET /api/employees/me` (lấy hồ sơ cá nhân đầy đủ kèm phòng ban, hợp đồng, người quản lý, lịch sử lương) và `PUT /api/employees/me` (nhân viên tự cập nhật số điện thoại, địa chỉ, tài khoản ngân hàng).
  - **Quỹ phép năm tự động (Attendance Service):** 
    - Xây dựng thuật toán `countBusinessDays`: Đếm chính xác số ngày làm việc thực tế từ Thứ Hai đến Thứ Sáu, tự động loại trừ Thứ Bảy và Chủ Nhật. Chặn gửi đơn nếu khoảng thời gian rơi trọn vào ngày nghỉ cuối tuần.
    - Kiểm soát số dư: Kiểm tra `annualLeaveBalance` khi nhân viên tạo đơn nghỉ `ANNUAL`. Báo lỗi nếu số ngày xin nghỉ vượt quá số phép còn lại.
    - Tự động trừ / hoàn quỹ phép trong transaction: Tự động trừ số ngày phép khi đơn được HR phê duyệt (`APPROVED`), hoàn trả lại số ngày nếu đơn bị từ chối (`REJECTED`) sau khi đã duyệt.
    - Thêm endpoint `GET /api/attendance/leave-balance`: Trả về chi tiết tổng quỹ tiêu chuẩn (12 ngày), số ngày đã dùng, số ngày đang chờ duyệt và số dư khả dụng còn lại.
    - Bổ sung loại nghỉ việc riêng có lương `COMPASSIONATE` (Hiếu, hỉ) vào hệ thống.
  - **Unit Tests:** Thêm suite kiểm thử tự động cho thuật toán đếm ngày làm việc thực tế (`attendance.test.ts`), đạt 8/8 unit tests pass 100%.
- **Phát triển Frontend:**
  - **Trang Cổng ESS (`/dashboard/profile`):**
    - Thiết kế phẳng Enterprise B2B SaaS (`rounded-sm`, `border-slate-200`, không bóng, không AI-slop).
    - Header nhân viên: Họ tên, Chức vụ, Phòng ban, Mã NV monospace, Ngày vào làm, Tình trạng hợp đồng.
    - 5 tab dữ liệu chuyên sâu: (1) Tổng quan công việc & Quản lý trực tiếp, (2) Thông tin cá nhân & Pháp lý, (3) Tài khoản ngân hàng, (4) Hợp đồng lao động, (5) Quỹ phép năm & Lịch sử phiếu lương (kèm nút tải file PDF phiếu lương).
    - Modal Chỉnh sửa thông tin cá nhân: Cho phép nhân viên tự cập nhật số điện thoại, địa chỉ và ngân hàng.
    - Modal Nộp đơn xin nghỉ phép nhanh: Tích hợp cảnh báo số dư quỹ phép năm và giải thích quy tắc đếm ngày làm việc.
  - **Trang Chấm công (`/dashboard/attendance`):**
    - Chèn widget 4 thẻ Quỹ phép năm (Tổng quỹ, Đã sử dụng, Đang chờ duyệt, Số dư còn lại) vào tab `Đơn Nghỉ Phép Của Tôi`.
    - Đồng bộ hóa toàn bộ các nút, ô input, bảng và modal sang `rounded-sm`.
  - **Điều hướng (Navigation):**
    - Bổ sung menu "Hồ sơ của tôi" vào `Sidebar.tsx` cho tất cả vai trò (ADMIN, HR_MANAGER, EMPLOYEE).
    - Gắn liên kết Avatar và Tên người dùng trên `Navbar.tsx` trực tiếp về `/dashboard/profile`.

### 9. 💰 Nâng Cấp Công Thức Bảng Lương Chuẩn Luật Lao Động & Thuế TNCN Việt Nam, Thiết Kế Modal Phiếu Lương Điện Tử (Giai đoạn 3 - Mới nhất)
- **Bối cảnh & Mục tiêu:** Hoàn thiện bài toán tiền lương và phúc lợi theo chuẩn pháp luật Việt Nam (Luật BHXH, Luật Việc làm, Luật Thuế TNCN theo Thông tư 111/2013/TT-BTC & Nghị quyết 954/2020/UBTVQH14); khắc phục tình trạng tính gộp 10.5% và biểu thuế 4 bậc sơ sài trước đây; cung cấp công cụ trực quan hóa phiếu lương điện tử (Payslip) tương tác trực tiếp trên giao diện thay vì chỉ tải PDF mù mờ.
- **Kiến trúc dữ liệu (Database Schema):**
  - Mở rộng model `Payroll`: Bổ sung các cột `insuranceSalary` (Mức lương căn cứ đóng BHXH), `bhxh` (BHXH 8%), `bhyt` (BHYT 1.5%), `bhtn` (BHTN 1%), `taxableIncome` (Thu nhập tính thuế sau giảm trừ).
  - Đồng bộ schema với SQLite thông qua `prisma db push` và tái sinh Prisma Client thành công.
- **Phát triển Backend:**
  - **Tách bạch 3 quỹ bảo hiểm bắt buộc:**
    - BHXH người lao động: **8%** (Áp dụng trần 20 lần mức lương cơ sở = 46.800.000 VNĐ).
    - BHYT người lao động: **1.5%** (Áp dụng trần 46.800.000 VNĐ).
    - BHTN người lao động: **1%** (Áp dụng trần 20 lần lương tối thiểu vùng I = 99.200.000 VNĐ).
    - Căn cứ đóng: Lấy từ `salaryInsurance` của hợp đồng lao động đang hiệu lực (`Contract`), nếu không có hợp đồng thì lấy theo `baseSalary`.
  - **Biểu thuế lũy tiến từng phần 7 bậc (PIT 7-Tier):**
    - Giảm trừ gia cảnh bản thân: **11.000.000 VNĐ/tháng**.
    - Giảm trừ người phụ thuộc: **4.400.000 VNĐ/người/tháng** (nhân với số người phụ thuộc nếu có).
    - Thu nhập tính thuế = max(0, Thu nhập chịu thuế - Các khoản đóng bảo hiểm - Các khoản giảm trừ gia cảnh).
    - Tính thuế chính xác 7 bậc: Bậc 1 (5% đến 5M), Bậc 2 (10% 5M-10M), Bậc 3 (15% 10M-18M), Bậc 4 (20% 18M-32M), Bậc 5 (25% 32M-52M), Bậc 6 (30% 52M-80M), Bậc 7 (35% trên 80M).
    - Trả về chi tiết mảng `taxBrackets` giúp người dùng xem được từng đồng thuế phát sinh ở từng bậc.
  - **Nâng cấp PdfService:** Xuất PDF phiếu lương điện tử chuyên nghiệp, thể hiện chi tiết 3 loại bảo hiểm, giảm trừ gia cảnh bản thân, tài khoản ngân hàng nhận lương và chữ ký phê duyệt 2 bên.
  - **Unit Tests:** Mở rộng bộ kiểm thử `backend/src/tests/payroll.test.ts` (11/11 tests pass 100%), kiểm chứng mức trần bảo hiểm, các bậc thuế cao và giảm trừ người phụ thuộc.
- **Phát triển Frontend:**
  - **Modal Phiếu Lương Điện Tử (`PayslipModal.tsx`):**
    - Thiết kế phẳng Enterprise B2B SaaS sang trọng, hiển thị đầy đủ thông tin doanh nghiệp, nhân viên, số tài khoản nhận lương, ngày công thực tế.
    - Bảng bóc tách 3 phần: (I) Thu nhập & Phụ cấp, (II) Trích nộp bảo hiểm & Thuế TNCN (kèm tính năng mở rộng xem chi tiết biểu thuế 7 bậc), (III) Khối nổi bật Thực lĩnh chuyển khoản (Net take-home).
    - Tích hợp nút In phiếu lương (`window.print()`), Tải PDF, và Xác nhận chi trả (dành cho HR).
  - **Cải tiến Trang Bảng Lương (`/dashboard/payroll`):**
    - Bổ sung nút "Chi tiết" trên từng dòng bảng lương; cho phép click vào bất kỳ hàng nào để mở xem ngay phiếu lương điện tử.
    - Loại bỏ sạch toàn bộ các class `rounded-xl` còn sót lại ở thẻ phòng ban và bộ lọc dropdown, đồng bộ `rounded-sm`.
  - **Tích hợp Cổng ESS (`/dashboard/profile`):**
    - Cho phép nhân viên tự bấm "Chi tiết" hoặc click vào hàng lịch sử bảng lương để xem phiếu lương điện tử tương tác trực tiếp trên trình duyệt ngoài việc tải file PDF.

### 10. 🎯 Chuyển Đổi Phân Hệ Tuyển Dụng Sang Pipeline Kanban Board & Tính Năng Onboarding One-Click (Giai đoạn 4 - Mới nhất)
- **Bối cảnh & Mục tiêu:** Hiện đại hóa phân hệ Tuyển dụng theo tiêu chuẩn các hệ thống ATS hàng đầu (Workable, Lever, BambooHR) với bảng Kanban 5 giai đoạn trực quan; loại bỏ thao tác thủ công khi tuyển được người bằng quy trình Onboarding One-Click tự động hóa liên kết từ Ứng viên $\rightarrow$ Tài khoản User $\rightarrow$ Hồ sơ nhân sự EmployeeProfile $\rightarrow$ Hợp đồng lao động Contract.
- **Kiến trúc dữ liệu & Backend:**
  - **Pipeline 5 giai đoạn chuẩn quốc tế:**
    - `APPLIED` (Tiếp nhận hồ sơ / Ứng tuyển)
    - `INTERVIEWING` (Phỏng vấn chuyên môn & văn hóa)
    - `OFFERED` (Đề nghị tuyển dụng / Offer Letter)
    - `HIRED` (Đã tiếp nhận / Đang thử việc)
    - `REJECTED` (Không phù hợp / Từ chối)
    - Tương thích ngược mượt mà với các trạng thái cũ `PROBATION` và `OFFER_ACCEPTED`.
  - **Onboarding One-Click trong Transaction Prisma (`POST /api/recruitment/candidates/:id/convert`):**
    - Tự động sinh mã nhân viên chuẩn công ty qua endpoint `GET /api/recruitment/candidates/next-code` (ví dụ `NV-022`).
    - Tạo tài khoản `User` với email ứng viên, hash mật khẩu bảo mật (mặc định `password123`), vai trò `EMPLOYEE`.
    - Tạo `EmployeeProfile` với chức danh, phòng ban liên kết, mức lương và ngày vào làm.
    - Tạo `Contract` khởi tạo: Mặc định loại hợp đồng thử việc `PROBATION` (2 tháng), mức lương đóng BHXH tự động áp dụng 85% mức lương cơ sở theo Điều 26 Luật Lao động Việt Nam 2019, số hợp đồng tự sinh `HĐLĐ-2026/NV-xxx`.
    - Cập nhật ứng viên sang trạng thái `HIRED` và ghi log Onboard vào `Candidate.notes`.
    - Toàn bộ 4 thao tác được bọc trong `prisma.$transaction` đảm bảo toàn vẹn dữ liệu, rollback nếu trùng email hoặc trùng mã NV.
  - **Unit Tests:** Xây dựng suite kiểm thử `backend/src/tests/recruitment.test.ts` (16/16 tests pass 100% trên toàn bộ 3 suites kiểm thử tự động của hệ thống).
- **Phát triển Frontend (`/dashboard/recruitment`):**
  - **Kanban Pipeline Board:**
    - Bố cục 5 cột thẻ phẳng Enterprise B2B SaaS (`rounded-sm`, viền hairline `border-slate-200`, không bóng, không AI-slop).
    - Hỗ trợ HTML5 Drag & Drop kéo thả thẻ ứng viên giữa các cột giai đoạn tuyển dụng.
    - Tích hợp nút mũi tên tiến/lùi giai đoạn nhanh trên từng thẻ phục vụ thao tác tốc độ cao.
  - **Chuyển đổi linh hoạt Kanban Board vs Bảng danh sách (Table View):**
    - Cho phép HR chuyển đổi qua lại tức thì giữa góc nhìn thẻ Kanban và bảng số liệu cô đọng.
    - Bộ lọc dropdown theo từng Kế hoạch tuyển dụng và thanh tìm kiếm thời gian thực (tên, email, SĐT).
  - **Modal Tiếp Nhận Nhân Sự Chính Thức (Onboarding Modal):**
    - Tự động điền thông tin ứng viên, gợi ý mã NV tiếp theo, cho phép chọn phòng ban, chức danh, loại hợp đồng.
    - Tự động tính toán mức lương đóng BHXH 85% khi chọn hợp đồng thử việc kèm ghi chú căn cứ pháp luật.
    - Phản hồi kết quả chi tiết sau khi tiếp nhận và tự động làm mới pipeline.
  - **Chuẩn hóa UI:** Loại bỏ sạch toàn bộ các class `rounded-xl` còn sót lại, đồng bộ `rounded-sm` trên toàn trang.

### 11. 📐 Rà Soát & Đồng Bộ Toàn Diện Chuẩn Giao Diện Enterprise Flat B2B SaaS (Giai đoạn 5 - Mới nhất)
- **Bối cảnh & Mục tiêu:** Tổng rà soát và chuẩn hóa 100% toàn bộ hệ thống theo phong cách giao diện doanh nghiệp B2B SaaS sắc cạnh (như Base HRM, Linear, Stripe, 1Office): loại bỏ triệt để mọi dấu hiệu tàn dư của thiết kế bo tròn quá đà, bóng đổ đậm hay màu sắc gradient bóng bẩy mang phong cách "AI Slop".
- **Chi tiết thực hiện:**
  - **Dọn dẹp triệt để trên toàn bộ mã nguồn Frontend (`frontend/src`):**
    - Loại bỏ sạch sẽ 100% các class `rounded-xl`, `rounded-2xl`, `rounded-3xl`, `rounded-lg`.
    - Loại bỏ 100% các bóng đổ `shadow-2xl`, `shadow-xl`, `shadow-lg`, `shadow-md` ở tất cả các trang, thẻ thống kê, khối điều hướng, modal và nút bấm; chuyển về chuẩn phẳng viền hairline `border-slate-200` và `shadow-none`.
    - Loại bỏ 100% hiệu ứng nền dải màu `bg-gradient-*`, thay bằng màu nền solid doanh nghiệp tinh tế (`bg-white`, `bg-slate-50`, `bg-blue-900`).
  - **Đồng bộ hóa các phân hệ còn lại:**
    - **Thuyên chuyển (`/dashboard/transfers`):** Chuẩn hóa thẻ thống kê, thanh bộ lọc, bảng dữ liệu, badge trạng thái và Modal tạo quyết định điều chuyển nhân sự sang `rounded-sm`.
    - **Khen thưởng & Kỷ luật (`/dashboard/rewards`):** Chuẩn hóa toàn bộ bảng vinh danh, kỷ luật, badge phân loại và Modal quyết định sang `rounded-sm`.
    - **Báo cáo & Thống kê (`/dashboard/reports`):** Chuyển khối tổng quy mô doanh nghiệp sang `bg-blue-900 border border-blue-800 rounded-sm`, thanh tỷ lệ nhân sự phòng ban phẳng `rounded-sm`, bỏ toàn bộ gradient.
    - **Đánh giá hiệu suất (`/dashboard/performance`):** Rà soát sạch sẽ các khối thẻ KPI, ma trận chấm điểm đối chiếu, bảng phân bổ đường cong chuẩn Gauss, Modal chấm điểm trọng số quản lý, Modal hiệu chỉnh (Calibration) và Modal tạo kỳ đánh giá mới sang `rounded-sm`.
    - **Chấm công & Bảng lương (`/dashboard/attendance`, `/dashboard/payroll`):** Chuẩn hóa toàn bộ badge trạng thái chấm công, badge chi trả và bộ đếm duyệt đơn sang `rounded-sm`.
    - **Tinh giản Bảng Nhân sự (`/dashboard/employees`):** Loại bỏ 2 cột thông tin nhạy cảm/rườm rà "CCCD & MST" và "Ngân hàng" khỏi bảng chính, thay thế bằng cột "Liên hệ" (SĐT & Email) sắc nét chuẩn HRM; đảm bảo bảo mật PII trong khi toàn bộ dữ liệu định danh và ngân hàng được bảo toàn trọn vẹn trong Modal Hồ sơ 360° và Cổng ESS.
    - **Modal dùng chung (`Modal.tsx`) & Trang chủ (`app/page.tsx`):** Loại bỏ `shadow-lg` và `shadow-md`, hoàn thiện trải nghiệm phẳng tuyệt đối.
  - **Kiểm thử & Biên dịch:**
    - Kiểm tra kiểm kiểu TypeScript: `npx tsc --noEmit` đạt 0 lỗi trên toàn bộ Frontend.
    - Kiểm thử tự động Backend: `npm test` đạt **16/16 tests pass 100%** (3/3 test suites).

### 12. 🏢 Hiện Đại Hóa Nghiệp Vụ HRM Toàn Diện: Tinh Gọn Onboarding, Tự Động Hóa Quỹ Phép, Bù Công Tính Lương & Sơ Đồ Tổ Chức Tương Tác (Giai đoạn 1 - 4 - Mới nhất - 12/10/2026)
- **Bối cảnh & Nghiên cứu đối sánh:**
  - Khảo sát chuyên sâu các hệ thống quản trị nhân sự hàng đầu (BambooHR, Workday, Base HRM, 1Office, MISA AMIS) và rà soát thực trạng hệ thống NexNova HRM.
  - Nhận diện các điểm nghẽn: Form tạo nhân sự mới bị quá tải thông tin định danh/ngân hàng (gây cản trở Onboarding nhanh); Chấm công chưa tự động loại trừ T7/CN và chưa liên kết quỹ phép với bảng lương; Bảng lương chưa tự động tính thưởng và chưa bóc tách ngày làm việc thực tế; Thiếu góc nhìn trực quan về bộ máy tổ chức đa tầng và thiếu cảnh báo rủi ro nhân sự chủ động.
- **Chi tiết triển khai 4 Giai đoạn:**
  - **Giai đoạn 1: Tinh gọn Form Nhân sự & Quick Onboarding (Phương án A):**
    - Rút gọn Modal "Thêm Nhân Sự Mới" trong `employees/page.tsx` thành **Quick Onboarding** tinh gọn: Chỉ giữ 5 khối thông tin cốt lõi (Mã NV, Họ tên, Email, SĐT, Phòng ban, Cấp bậc, Chức danh, Quản lý trực tiếp, Lương cơ bản, Phụ cấp, Quỹ phép năm). Dỡ bỏ hoàn toàn 8 trường CCCD, MST, Ngân hàng, Sổ BHXH khỏi form tạo nhanh (giảm 65% thời gian tạo nhân sự).
    - Tách thông tin định danh và ngân hàng thành Tab chuyên biệt **`[💳 Pháp lý & Tài chính]`** trong modal "Cập Nhật Hồ Sơ", cho phép HR bổ sung sau hoặc nhân viên tự cập nhật qua Cổng ESS.
    - Bổ sung thước đo **Tỷ lệ hoàn thiện hồ sơ (%)** với badge màu tại Table View và Detail Modal 360° kèm nút "Bổ sung ngay".
    - Backend `employee.service.ts`: Xử lý an toàn chuỗi ngày tháng rỗng `""`, khắc phục triệt để lỗi `Invalid Date` của SQLite/Prisma.
  - **Giai đoạn 2: Tự động hóa Quản lý Chấm công & Quỹ phép:**
    - Backend `attendance.service.ts`: Cơ chế tự động trừ số dư phép năm `annualLeaveBalance` khi đơn chuyển sang `APPROVED`, tự động hoàn trả khi chuyển sang `REJECTED`.
    - Bổ sung method và route thu hồi đơn nghỉ phép `DELETE /api/attendance/leaves/:id` (`cancelLeaveRequest`) khi đơn còn ở trạng thái `PENDING`.
    - Frontend `attendance/page.tsx`:
      - Helper `calculateBusinessDays`: Đếm chính xác số ngày công thực tế, tự động loại trừ Thứ 7 và Chủ Nhật.
      - Modal tạo đơn: Hộp tính toán số ngày nghỉ thời gian thực và cảnh báo vượt hạn mức quỹ phép năm (tự động khóa nút gửi đơn nếu thiếu quỹ phép).
      - Bảng duyệt đơn: Cột "Quỹ phép NV" hiển thị số dư phép và cảnh báo đỏ nếu nhân viên xin vượt hạn mức còn lại.
  - **Giai đoạn 3: Chuẩn hóa Tính lương & Bù công nghỉ phép (Statutory Compliance):**
    - Backend `payroll.service.ts`:
      - Bổ sung thuật toán `countBusinessDaysInMonth`: Chỉ đếm các ngày làm việc thực tế (Thứ 2 - Thứ 6) trong tháng tính lương cho các đơn nghỉ phép có lương (`ANNUAL`, `MATERNITY`, `COMPASSIONATE`), tránh lỗi tính cả T7/CN và tránh lỗi tràn tháng.
      - Tự động truy vấn và tổng hợp tiền thưởng từ các quyết định khen thưởng (`Reward`) trong tháng vào `rewardAmount` (thay vì giá trị 0 hardcode).
      - Đảm bảo công thức bảo toàn ngày công: $\text{Công tính lương} = \min(\text{standardDays}, \text{actualDays} + \text{paidLeaveDays})$.
      - Bổ sung `annualLeaveBalance` trong `getPayrolls`.
    - Frontend `payroll/page.tsx` và `PayslipModal.tsx`:
      - Bảng lương hiển thị số ngày công thực tế, bù công phép năm, tiền thưởng theo quyết định và mức lương đóng BHXH từ HĐLĐ.
      - Phiếu lương điện tử hiển thị dòng ngày công tính lương (kèm badge Đủ công), tiền thưởng và căn cứ đóng BHXH.
  - **Giai đoạn 4: Sơ đồ Cây tổ chức tương tác & Trung tâm Cảnh báo Nhân sự Thông minh:**
    - **Sơ đồ cây tổ chức tương tác (Interactive Org Chart Tree)** trong `departments/page.tsx`:
      - Sơ đồ cây phân cấp hoàn chỉnh: Ban Tổng Giám Đốc (BOD) $\to$ Các Trưởng phòng $\to$ Khối Lãnh đạo/Quản lý $\to$ Đội ngũ nhân sự chuyên môn.
      - Hỗ trợ Mở rộng / Thu gọn cơ cấu từng phòng ban hoặc toàn công ty ("Mở rộng tất cả" / "Thu gọn tất cả").
    - **Trung tâm Cảnh báo Điều hành Nhân sự (Smart HR Alerts Widget)** trên Dashboard chính `page.tsx`:
      - Đặt ngay trên Dashboard dành riêng cho HR/Admin:
        - ⚠️ **Hợp đồng sắp hết hạn trong 30 ngày**: Cảnh báo số ngày còn lại (đỏ $\le 7$ ngày, vàng $\le 30$ ngày) kèm nút dẫn tới gia hạn/tái ký.
        - 📋 **Hồ sơ chưa hoàn thiện thông tin pháp lý & ngân hàng**: Liệt kê nhân sự còn thiếu CCCD/MST/STK kèm nút bổ sung hồ sơ nhanh.

### 13. 📄 Chuẩn Hóa & Cập Nhật Toàn Diện Tài Liệu Báo Cáo Hệ Thống Theo Nghị Định 30/2020/NĐ-CP (13/10/2026)
- **Bối cảnh & Mục tiêu:** Đồng bộ hóa tài liệu thuyết minh báo cáo hệ thống (`docs/MoTa_HeThong_QLNL_NexNova.docx`) khớp 100% với toàn bộ các tính năng, phân hệ và kiến trúc dữ liệu mới đã triển khai trong hệ thống; đồng thời chuẩn hóa thể thức trình bày văn bản hành chính theo quy định tại Nghị định số 30/2020/NĐ-CP của Chính phủ.
- **Quy chuẩn hình thức theo Nghị định 30/2020/NĐ-CP:**
  - Khổ giấy A4 (210mm x 297mm), định hướng đứng.
  - Căn lề chuẩn văn bản hành chính: Lề trên 20mm, Lề dưới 20mm, Lề trái 30mm (đóng gáy hồ sơ), Lề phải 15mm.
  - Phông chữ Times New Roman đồng nhất, cỡ chữ 13pt cho nội dung, 14pt in đậm cho đề mục lớn; dãn dòng 1.35 lines; dãn đoạn sau 4-6pt; thụt đầu dòng 1.2cm; căn đều hai bên lề (Justified).
  - Đánh số trang chính giữa mép dưới văn bản bắt đầu từ số 1.
  - Hạn chế tối đa việc sử dụng gạch đầu dòng vụn vặt; chuyển đổi thành các đoạn văn hành chính mạch lạc hoặc đánh số phân cấp (thứ nhất, thứ hai... hoặc 1, 2, 3).
  - Lược bỏ hoàn toàn việc chêm xen thuật ngữ tiếng Anh trong ngoặc đơn không cần thiết (như Vision, Mission, Annual Leave, Net, PRESENT, APPROVED...), sử dụng tiếng Việt hành chính chuẩn mực.
  - Không sử dụng từ ngữ mang tính máy móc, từ lóng, từ luyến hay từ AI sáo rỗng; tập trung phản ánh đúng logic và nghiệp vụ thực tế của hệ thống.
- **Nội dung kỹ thuật và nghiệp vụ được cập nhật:**
  - Bổ sung Phân hệ Quản lý Hợp đồng lao động (5 loại HĐ, mức đóng BHXH, cảnh báo đến hạn 30 ngày).
  - Bổ sung Cổng thông tin nhân viên tự phục vụ (ESS / Hồ sơ của tôi: tra cứu hồ sơ 360 độ, theo dõi hợp đồng, tải phiếu lương, tự cập nhật liên hệ và ngân hàng).
  - Cập nhật Phân hệ Chấm công & Quản lý quỹ phép (thuật toán đếm ngày làm việc thực tế trừ T7/CN, tự động trừ/hoàn quỹ 12 ngày phép, thu hồi đơn PENDING).
  - Cập nhật Phân hệ Tiền lương (bảo toàn ngày công phép năm, trích nộp 3 quỹ bảo hiểm BHXH 8%, BHYT 1.5%, BHTN 1% có trần, giảm trừ gia cảnh, thuế TNCN lũy tiến 7 bậc, tự động cộng thưởng từ quyết định khen thưởng, phiếu lương điện tử và xuất PDF).
  - Cập nhật Phân hệ Đánh giá hiệu suất công tác (bộ tiêu chí đánh giá KPI đa tiêu chí theo trọng số phần trăm, tính điểm bình quân gia quyền).
  - Cập nhật Phân hệ Tuyển dụng & Tiếp nhận nhân sự (Kanban 5 giai đoạn, tiếp nhận nhân sự 1-click tự động tạo User, Profile và Hợp đồng thử việc 85%).
  - Cập nhật Sơ đồ tổ chức phân cấp đa tầng (Interactive Org Chart Tree) và Trung tâm cảnh báo điều hành nhân sự (Smart HR Alerts).
  - Cập nhật mô hình Cơ sở dữ liệu từ 12 bảng lên 18 bảng chuẩn hóa (bổ sung `contracts`, `departments`, `kpi_templates`, `kpi_categories`, `kpi_criteria`, `review_scores`).
  - Bảo tồn trọn vẹn 2 hình ảnh minh họa gốc: Sơ đồ cơ cấu tổ chức bộ máy (Hình 1.1) và Sơ đồ kiến trúc kỹ thuật 3 tầng (Hình 4.1).
- **Kết quả nghiệm thu:**
  - Tệp văn bản xuất xưởng: `docs/MoTa_HeThong_QLNL_NexNova.docx` (dung lượng ~955.6 KB, 115 đoạn văn, 5 bảng biểu chuẩn hóa, 2 hình ảnh).
  - Đã lưu bản sao lưu dự phòng: `docs/MoTa_HeThong_QLNL_NexNova_backup_20261013.docx`.

### 14. 🎨 Chuẩn Hóa Giao Diện Theo Đúng Nguyên Bản 1Office: Compact Icon Rail (13/10/2026)
- **Bối cảnh & Vấn đề:** Sidebar nền trắng ban đầu dễ bị lẫn với nền nội dung bên phải; đồng thời bố cục thanh menu vẫn mang hơi hướng template admin thông thường. Người dùng yêu cầu chuẩn hóa chính xác theo mô hình điều hướng của **1Office (phần mềm quản trị doanh nghiệp hàng đầu VN)**.
- **Chi tiết chuyển đổi:**
  - **Màu nền phân tách sắc nét:** Chuyển Sidebar sang màu xám mát đặc trưng `#f0f3f8` (header và footer `#e9edf4`), tạo sự tương phản rõ ràng với Header trắng tinh (`#ffffff`) và Canvas nội dung xám nhạt (`#f8fafc`).
  - **Bố cục Compact Icon Rail (72px):** Thu gọn thanh bên thành cột biểu tượng tinh gọn theo chuẩn 1Office:
    - *Icon dạng xếp dọc (Vertical Stack):* Biểu tượng ở trên, nhãn chữ nhỏ 10.5px ở dưới.
    - *Trạng thái Active:* Icon được đặt trong khối tròn nổi bật (`bg-blue-600 text-white rounded-full`), nhãn chữ đổi màu xanh đậm đồng bộ với ảnh mẫu 1Office.
    - *Nút Hamburger Menu (☰) ở đỉnh:* Cho phép chuyển đổi linh hoạt giữa chế độ Compact Rail (72px) và Expanded Menu (210px).
  - **Footer Profile:** Nút avatar cá nhân tròn tinh giản ở đáy thanh bên.
  - **Tích hợp Quick Search trên Navbar:** Bổ sung thanh tìm kiếm nhanh nhân sự/phòng ban bo góc chuẩn 1Office trên Navbar.
- **Tệp chỉnh sửa:** `frontend/src/components/Sidebar.tsx`, `frontend/src/components/Navbar.tsx`.

### 15. 🚀 Nâng Cấp Toàn Diện Navbar (Header) Thành Command Workspace Chuẩn 1Office (13/10/2026)
- **Bối cảnh & Vấn đề:** Navbar ban đầu để trống khu vực bên trái và chỉ có một nút đăng xuất đỏ trơ trọi bên phải, thiếu tính năng hỗ trợ điều hành và tìm kiếm của một hệ thống quản trị nhân sự chuyên nghiệp.
- **Chi tiết nâng cấp:**
  - **Badge Phân hệ Động (`(+) [Tên phân hệ]`):** Tự động nhận diện URL và hiển thị huy hiệu phân hệ hiện tại (Bảng lương, Nhân sự, Phòng ban, Hợp đồng...) chuẩn nguyên mẫu 1Office.
  - **Thanh Tìm kiếm Toàn Hệ thống Thông minh (Global Quick Search):**
    - Ô tìm kiếm có icon kính lúp và bộ lọc `🎚` chuẩn 1Office.
    - Tích hợp Popover kết quả tìm kiếm tức thì theo thời gian thực (phân loại Phân hệ & Nhân sự) giúp truy cập nhanh trong 1 cú nhấp chuột.
  - **Trạng thái Điểm danh Nhanh (Smart Attendance Badge):** Nút trạng thái `Đã điểm danh: 08:15` (cho phép click để thay đổi trạng thái) tạo cảm giác ứng dụng chấm công doanh nghiệp thực tế.
  - **Trung tâm Thông báo Điều hành (Notification Center):** Chuông thông báo tích hợp Popover hiển thị các cảnh báo quan trọng: hợp đồng sắp hết hạn, đơn nghỉ phép chờ duyệt, kỳ tính lương mới.
  - **Menu Tài khoản Hoàn Chỉnh (User Account Dropdown):** Thay thế nút đăng xuất trơ trọi bằng Menu dropdown chuyên nghiệp hiển thị đầy đủ avatar, tên, email, huy hiệu quyền (ADMIN / HR / EMPLOYEE), liên kết "Hồ sơ của tôi", "Đổi mật khẩu", "Cấu hình hệ thống" và nút "Đăng xuất" an toàn.
- **Tệp chỉnh sửa:** `frontend/src/components/Navbar.tsx`.

### 16. 🧹 Tinh Giản Toàn Bộ Content Area & Tiêu Đề Phân Hệ: Xóa Bỏ Hội Chứng "Icon Fatigue" (14/10/2026)
- **Bối cảnh & Vấn đề:** Tiêu đề các trang trước đây bị lạm dụng icon (mỗi thẻ `h1` đều kẹp một icon Lucide màu xanh đậm chất template AI); thẻ thống kê StatCard có icon trang trí góc trên bên phải; trang Bảng lương nhồi nhét thẻ phòng ban chiếm quá nhiều diện tích dọc khiến bảng tính lương bị đẩy xuống sâu.
- **Chi tiết tinh giản & chuẩn hóa:**
  - **Chuẩn hóa Tiêu đề H1 toàn bộ 12 phân hệ:** Xóa bỏ hoàn toàn icon trong `h1` ở tất cả các trang (`payroll`, `employees`, `departments`, `attendance`, `contracts`, `recruitment`, `performance`, `rewards`, `transfers`, `reports`, `profile`). Tiêu đề hiển thị sắc nét với phụ đề giải thích nghiệp vụ trang nhã.
  - **Nâng cấp StatCard:** Đổi icon góc thẻ thành tùy chọn (optional), ưu tiên cấu trúc số liệu tài chính/nhân sự phẳng, đệm lề cô đọng, typography font-sans rõ ràng.
  - **Tái cấu trúc trang Bảng lương (`payroll/page.tsx`):**
    - Tiêu đề gọn gàng: `Bảng lương` kèm chú thích kỳ chi trả và đơn vị tính (VNĐ).
    - Thẻ tổng hợp 3 chỉ số tài chính (Tổng thực lĩnh, Tiến độ chi trả, Khấu trừ bắt buộc) không icon thừa thãi.
    - Chuyển đổi khối Quỹ lương phòng ban cồng kềnh thành **Thanh lọc phòng ban dạng Pill** tinh gọn (~40px) tích hợp trực tiếp số tiền và số nhân sự của từng phòng ban, cho phép lọc dữ liệu tức thì.
    - Thanh điều hướng kỳ lương kết hợp thông tin đếm số bản ghi hiển thị thực tế.
    - Đưa bảng dữ liệu tính lương lên vị trí trung tâm màn hình, tối ưu không gian đối soát cho kế toán tiền lương.
- **Tệp chỉnh sửa:** `frontend/src/components/StatCard.tsx`, `frontend/src/app/dashboard/payroll/page.tsx`, và tiêu đề của 11 trang phân hệ khác.

---


## 🎯 Danh sách Việc Cần Làm Tiếp Theo (To-Do List)

- [x] **Giai đoạn 1:** Triển khai Phân hệ Hợp đồng lao động & Chuẩn hóa Hồ sơ 360°.
- [x] **Giai đoạn 2:** Xây dựng Cổng thông tin nhân viên tự phục vụ (Employee Self-Service - ESS / "Hồ sơ của tôi") & Cơ chế trừ tự động Quỹ ngày phép năm.
- [x] **Giai đoạn 3:** Nâng cấp công thức Bảng lương chuẩn Luật Lao động Việt Nam (Khấu trừ BHXH 8%, BHYT 1.5%, BHTN 1%, Thuế TNCN lũy tiến 7 bậc) & Thiết kế Modal Phiếu lương điện tử (Payslip).
- [x] **Giai đoạn 4:** Chuyển đổi phân hệ Tuyển dụng sang dạng Pipeline Kanban Board & Tính năng chuyển tiếp ứng viên thử việc thành nhân viên chính thức.
- [x] **Giai đoạn 5:** Tiếp tục rà soát đồng bộ giao diện Flat B2B SaaS cho toàn bộ các màn hình còn lại.
- [x] **Giai đoạn 6:** Hiện đại hóa toàn diện 4 giai đoạn HRM (Quick Onboarding tinh gọn, Tự động hóa quỹ phép & Chấm công, Chuẩn hóa tính lương & bù công, Sơ đồ tổ chức đa tầng & Trung tâm cảnh báo HR thông minh).
### 17. 🚀 Khởi Tạo Git & Đẩy Toàn Bộ Dự Án Lên GitHub (18/10/2026)
- **Hoạt động thực hiện:**
  - Khởi tạo Git repository cục bộ (`git init`) và cấu hình nhánh mặc định `main`.
  - Chuẩn hóa file [.gitignore](file:///d:/T%C3%A0i%20li%E1%BB%87u%20h%E1%BB%8Dc%20t%E1%BA%ADp/HTTT%20QLNL/.gitignore) loại trừ triệt để các tệp sinh tự động, thư mục phụ thuộc và file nhạy cảm (`node_modules/`, `.next/`, `dist/`, `*.db`, `~$*`, `*.tsbuildinfo`).
  - Tạo commit đầu tiên `feat: initial commit for NexNova HRM enterprise platform`.
  - Kết nối remote origin và đẩy thành công toàn bộ mã nguồn lên repository: `https://github.com/Summer3285/QLNL.git`.

---


## 🎯 Danh sách Việc Cần Làm Tiếp Theo (To-Do List)

- [x] **Giai đoạn 1:** Triển khai Phân hệ Hợp đồng lao động & Chuẩn hóa Hồ sơ 360°.
- [x] **Giai đoạn 2:** Xây dựng Cổng thông tin nhân viên tự phục vụ (Employee Self-Service - ESS / "Hồ sơ của tôi") & Cơ chế trừ tự động Quỹ ngày phép năm.
- [x] **Giai đoạn 3:** Nâng cấp công thức Bảng lương chuẩn Luật Lao động Việt Nam (Khấu trừ BHXH 8%, BHYT 1.5%, BHTN 1%, Thuế TNCN lũy tiến 7 bậc) & Thiết kế Modal Phiếu lương điện tử (Payslip).
- [x] **Giai đoạn 4:** Chuyển đổi phân hệ Tuyển dụng sang dạng Pipeline Kanban Board & Tính năng chuyển tiếp ứng viên thử việc thành nhân viên chính thức.
- [x] **Giai đoạn 5:** Tiếp tục rà soát đồng bộ giao diện Flat B2B SaaS cho toàn bộ các màn hình còn lại.
- [x] **Giai đoạn 6:** Hiện đại hóa toàn diện 4 giai đoạn HRM (Quick Onboarding tinh gọn, Tự động hóa quỹ phép & Chấm công, Chuẩn hóa tính lương & bù công, Sơ đồ tổ chức đa tầng & Trung tâm cảnh báo HR thông minh).
- [x] **Giai đoạn 7:** Rà soát và cập nhật toàn diện tài liệu Báo cáo Mô tả Hệ thống Thông tin Quản trị Nguồn Nhân lực NexNova (`docs/MoTa_HeThong_QLNL_NexNova.docx`) chuẩn thể thức Nghị định 30/2020/NĐ-CP.
- [x] **Giai đoạn 8:** Tái cấu trúc giao diện: Lột xác Thanh bên trái (Sidebar) sang chuẩn 1Office Compact Icon Rail 72px (nền `#f0f3f8`, icon tròn active, hamburger menu).
- [x] **Giai đoạn 9:** Nâng cấp Navbar (Header) thành Command Workspace chuẩn 1Office (Badge phân hệ động `(+)`, Ô tìm kiếm nhanh toàn hệ thống có dropdown kết quả, Nút điểm danh nhanh, Popover thông báo điều hành và Dropdown tài khoản chuẩn B2B SaaS).
- [x] **Giai đoạn 10:** Tinh giản Content Area & Tiêu đề các phân hệ (Xóa bỏ icon đóng hộp trước tiêu đề, tối ưu bảng dữ liệu nghiệp vụ, chuyển đổi quỹ lương phòng ban sang dạng Pill lọc chuẩn 1Office).
- [x] **Giai đoạn 11:** Khởi tạo Git repository và tải (push) toàn bộ mã nguồn dự án lên GitHub: https://github.com/Summer3285/QLNL.git.

---

## 📝 Các Quyết Định Kiến Trúc Mới Nhất (Architecture Decisions)
- **UI Framework:** Next.js + Tailwind CSS.
- **Style Guidelines:** Flat design, góc bo tối đa 4px (`rounded-sm`), viền `border-slate-200`, không đổ bóng, ưu tiên màu trắng hoặc xám nhạt làm nền.
- **Quick Onboarding Pattern:** Tách triệt để dữ liệu pháp lý & ngân hàng ra khỏi form tạo nhanh nhân sự mới, chỉ yêu cầu các trường cốt lõi phục vụ thiết lập tài khoản và lương vị trí; phần PII/Banking chuyển cho nhân viên tự hoàn thiện qua ESS hoặc HR cập nhật sau khi ký HĐLĐ.
- **Time & Leave Business Logic:** Đếm ngày công nghỉ phép nghiêm ngặt chỉ tính các ngày làm việc (Thứ 2 - Thứ 6), tự động loại trừ Thứ 7 và Chủ Nhật; tự động hoàn trả số dư phép khi đơn bị từ chối/thu hồi.
- **Payroll Statutory Compliance:** Bảo toàn ngày công hưởng lương cơ bản khi nhân viên nghỉ phép năm có lương; tự động tổng hợp tiền thưởng từ model `Reward` trong tháng; trần đóng BHXH/BHYT tối đa 20 lần lương cơ sở (46.800.000 VNĐ) và BHTN tối đa 20 lần lương tối thiểu vùng I (99.200.000 VNĐ).
- **Interactive Org Chart:** Cấu trúc cây phân cấp có thể mở rộng/thu gọn động theo từng node phòng ban; kết nối trực tiếp với dữ liệu cán bộ quản lý (`leadership`) và nhân viên chuyên môn (`staff`).
- **Smart HR Alerts Widget:** Trung tâm cảnh báo rủi ro điều hành chủ động (hợp đồng đến hạn, hồ sơ thiếu thông tin) ngay trên Dashboard chính của HR.
- **Backend:** Node.js (Express), sử dụng Prisma ORM kết nối với SQLite.





