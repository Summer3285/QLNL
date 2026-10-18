# BÁO CÁO MÔN HỌC: HỆ THỐNG THÔNG TIN QUẢN LÝ NHÂN LỰC
**Đề tài:** Phân tích, thiết kế và xây dựng phần mềm quản lý nhân lực (HRM)

---

## I. Giới thiệu về cơ quan, tổ chức (Đơn vị khảo sát)
**Tên công ty ví dụ:** Công ty Cổ phần Công nghệ phần mềm ABC (ABC Tech)
**Lĩnh vực hoạt động:** Phát triển phần mềm, gia công CNTT và cung cấp các giải pháp chuyển đổi số.
**Mô tả hiện trạng:** Công ty ABC Tech hiện có quy mô khoảng 300 nhân sự. Trước đây, công ty quản lý nhân sự chủ yếu qua Excel và giấy tờ thủ công, dẫn đến tình trạng thất lạc hồ sơ, khó khăn trong việc tra cứu, và tính toán lương thưởng, bảo hiểm mất nhiều thời gian. Do đó, công ty đang chuẩn bị xây dựng một Hệ thống thông tin Quản lý Nhân lực (HRM) để số hóa toàn bộ quy trình từ lúc tuyển dụng, quản lý hồ sơ cho đến khi nhân viên nghỉ việc.

## II. Cơ cấu tổ chức và chức năng
Mỗi cơ quan, đơn vị đều có một cơ cấu chức năng riêng biệt nhằm đảm bảo bộ máy hoạt động trơn tru. Tại ABC Tech, cơ cấu tổ chức được chia thành các bộ phận với chức năng rõ ràng:
1. **Ban Giám đốc:** Điều hành, ra quyết định chiến lược và phê duyệt các đề xuất (bao gồm cả đề xuất tuyển dụng, ngân sách lương).
2. **Ban Tổ chức cán bộ (Phòng Nhân sự - HR):** Chịu trách nhiệm tuyển dụng, quản lý hồ sơ, đào tạo, chấm công, tính lương, và xử lý các vấn đề liên quan đến phúc lợi, khen thưởng, kỷ luật.
3. **Phòng Kế toán:** Phối hợp với HR để chi trả lương, thưởng và giải quyết các vấn đề tài chính, thuế.
4. **Các phòng ban chuyên môn (Phòng Kỹ thuật, Dự án, Kinh doanh, Marketing...):** Thực hiện công việc chuyên môn; đề xuất nhu cầu nhân sự khi thiếu hụt vị trí việc làm.

---

## III. Phân tích thiết kế và xây dựng phần mềm Quản lý Nhân lực (Các Phân Hệ)

Phần mềm được chia thành các phân hệ riêng biệt nhưng liên kết chặt chẽ với nhau để tạo thành một hệ thống đồng nhất.

### 1. Phân hệ Cơ cấu chức năng & Tuyển dụng
Phân hệ này giải quyết bài toán tìm kiếm và thu hút nhân tài cho công ty.
**Quy trình tuyển dụng diễn ra trên hệ thống như sau:**
- **Bước 1: Đề xuất nhu cầu.** Các phòng ban chuyên môn (VD: Phòng Kỹ thuật) phát hiện thiếu vị trí việc làm sẽ lập *Phiếu yêu cầu nhân sự* và gửi lên Ban Tổ chức cán bộ qua hệ thống.
- **Bước 2: Phê duyệt.** Ban Tổ chức cán bộ xem xét, tổng hợp và đề xuất lên Ban Giám đốc. Nếu Ban Giám đốc đồng ý (nhấn duyệt trên phần mềm), quá trình tuyển dụng chính thức bắt đầu.
- **Bước 3: Đăng tuyển & Thu nhận hồ sơ.** HR đăng thông báo tuyển dụng qua nhiều hình thức (đài, báo, các trang tuyển dụng, MXH). Phần mềm hỗ trợ thu nhận hồ sơ ứng viên online (qua form/email) hoặc nhập liệu hồ sơ offline.
- **Bước 4: Sơ loại và Phỏng vấn.** Lọc hồ sơ trên hệ thống, lên lịch phỏng vấn. 
- **Bước 5: Thông báo kết quả.** Nếu phỏng vấn thành công (OK), hệ thống tự động gửi email thông báo trúng tuyển (Offer letter).
- **Bước 6: Xếp lương ban đầu.** Nếu ứng viên đồng ý nhận việc, HR tiến hành xếp mức lương thỏa thuận trên hệ thống và chuyển ứng viên sang trạng thái "Nhân viên mới/Thử việc".

### 2. Phân hệ Quản lý Hồ sơ
Đây là phân hệ cốt lõi, theo dõi toàn bộ "vòng đời" của nhân viên từ khi vào công ty đến khi nghỉ việc.
**Quy trình quản lý hồ sơ trên hệ thống:**
- **Bước 1: Tiếp nhận và Số hóa hồ sơ.** Ngày đầu đi làm, nhân viên mang hồ sơ cứng (sơ yếu lý lịch, CMND/CCCD, bằng cấp, chứng chỉ) đến công ty. Nhân viên HR tiến hành scan các giấy tờ này.
- **Bước 2: Cập nhật dữ liệu.** Các file scan và thông tin chi tiết (Họ tên, Ngày tháng năm sinh, Quê quán, Trình độ học vấn, Văn bằng chứng chỉ...) được upload và lưu trữ vào *Hồ sơ điện tử* của nhân viên trên phần mềm. Hồ sơ gốc (giấy) có thể được công ty lưu trữ trong tủ hồ sơ, hoặc chỉ đối chiếu rồi trả lại cho nhân viên (tùy quy định).
- **Bước 3: Lưu trữ và Tra cứu.** Hệ thống lưu trữ hồ sơ số hóa tập trung, an toàn. Khi cần tìm kiếm thông tin của bất kỳ cá nhân nào, HR chỉ cần gõ tên hoặc mã nhân viên, hệ thống sẽ trích xuất hồ sơ ngay lập tức.
- **Bước 4: Cập nhật biến động.** Xuyên suốt quá trình làm việc, mọi thay đổi (có thêm bằng cấp mới, thay đổi chỗ ở, tình trạng hôn nhân...) đều được cập nhật vào hồ sơ này.

### 3. Phân hệ Đánh giá & Phát triển (Thử việc và Xếp lương)
- **Quản lý thử việc:** Hệ thống ghi nhận thời gian thử việc của nhân viên (1, 2, hoặc 3 tháng tùy theo vị trí và quy định của công ty ABC Tech). Hệ thống sẽ có tính năng "Nhắc nhở" khi sắp đến hạn kết thúc thử việc.
- **Xếp lương chính thức:** Sau khi có đánh giá hoàn thành thử việc, HR thực hiện nghiệp vụ xếp lương chính thức trên hệ thống, ký hợp đồng lao động mới.
- **Tăng lương:** Hệ thống quản lý lịch sử lương. Sau một thời gian làm việc (đến kỳ xét tăng lương), dựa trên đánh giá hiệu suất, hệ thống hỗ trợ quy trình đề xuất và phê duyệt tăng lương cho nhân viên.

### 4. Phân hệ Quản lý Thời gian (Chấm công)
- Hàng ngày, hệ thống kết nối với máy chấm công (vân tay, khuôn mặt hoặc thẻ) để ghi nhận giờ vào/ra của nhân viên.
- Quản lý các đơn từ nghỉ phép, nghỉ ốm, đi trễ, về sớm.
- Tổng hợp ngày công thực tế cuối tháng để làm cơ sở tính lương.

### 5. Phân hệ Quản lý Lương, Khen thưởng, Kỷ luật và Các nghiệp vụ khác
- **Tính lương:** Tự động tính toán lương dựa trên: Mức lương cơ bản (đã xếp) + Ngày công (từ phân hệ chấm công) + Phụ cấp - Các khoản khấu trừ (Bảo hiểm, Thuế TNCN).
- **Khen thưởng, Kỷ luật:** 
  - Khi nhân viên có thành tích xuất sắc, quản lý lập đề xuất khen thưởng trên hệ thống. 
  - Nếu vi phạm nội quy, tiến hành lập biên bản và ra quyết định kỷ luật. 
  - Các quyết định khen thưởng/kỷ luật này được gắn trực tiếp vào Hồ sơ nhân sự và liên kết với bảng lương tháng đó (thưởng thêm tiền hoặc trừ tiền phạt).
- **Thuyên chuyển, Công tác:** Quản lý quy trình điều động nhân sự từ phòng ban này sang phòng ban khác, hoặc cử đi công tác. Hệ thống ghi nhận quyết định, thời gian công tác và tính toán công tác phí.
- **Thống kê báo cáo:** Hệ thống cung cấp các dashboard và báo cáo động cho Ban Giám đốc và HR:
  - Báo cáo biến động nhân sự (số lượng tuyển mới, số lượng nghỉ việc).
  - Báo cáo cơ cấu nhân sự (theo độ tuổi, giới tính, trình độ).
  - Báo cáo quỹ lương hàng tháng, quý, năm.
  - Thống kê khen thưởng, kỷ luật toàn công ty.

---
**Kết luận:** 
Việc xây dựng phần mềm quản lý nhân lực giúp công ty chuẩn hóa toàn bộ quy trình nghiệp vụ: từ lúc nhận đề xuất tuyển dụng, phỏng vấn, tiếp nhận hồ sơ, chấm công tính lương đến khi kết thúc quá trình làm việc. Hệ thống giúp giảm thiểu sai sót, tiết kiệm không gian lưu trữ hồ sơ, tra cứu nhanh chóng và hỗ trợ đắc lực cho Ban Lãnh đạo trong việc ra quyết định chiến lược về nguồn nhân lực.
