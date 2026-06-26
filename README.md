# LOTTE × CMC Global - EVD File Management Module

Technical test Frontend xây dựng mô-đun Quản lý tài liệu EVD thuộc hệ thống quản trị SYS Admin Console. Hệ thống được thiết kế với giao diện hiện đại, tối ưu trải nghiệm người dùng, khả năng phân quyền và xử lý dữ liệu tải lớn không gây đơ giao diện.

---

## 🚀 Hướng dẫn chạy dự án

### 1. Cài đặt Dependencies
Dự án sử dụng **React 19** và **Vite** làm build tool. Hãy cài đặt các gói thư viện bằng lệnh:
```bash
npm install
```

### 2. Chạy Môi trường Phát triển (Local Dev)
Khởi chạy local dev server với Hot Module Replacement (HMR):
```bash
npm run dev
```
Mở trình duyệt theo địa chỉ mặc định được cung cấp (thường là `http://localhost:5173`).

### 3. Build Production
Biên dịch TypeScript và đóng gói tối ưu sản phẩm:
```bash
npm run build
```

### 4. Kiểm tra Linting
Chạy công cụ kiểm tra chất lượng code:
```bash
npm run lint
```

---

## 🎨 Giao diện & Trải nghiệm Người dùng (UI/UX)
- **Thiết kế Premium**: Tông màu phối hợp hài hòa giữa màu Đỏ thương hiệu LOTTE (`#e30613`) và Xanh CMC Global (`#0054a6`) trên nền xám Slate cao cấp. Hỗ trợ hiển thị tương thích **Dark Mode** tự động theo cấu hình hệ thống máy chủ của người dùng.
- **Typography & Spacing**: Độ cao hàng (Row height) 68px thoải mái, font chữ Inter hiện đại, dễ đọc, cấu trúc phân cấp rõ ràng.
- **Trạng thái Trực quan**: Hỗ trợ đầy đủ các trạng thái Loading (Spinner xoay mượt mà), Empty state sinh động, Alert báo lỗi và Toast tự động ẩn sau 4 giây.

---

## 🛠️ Kiến trúc Dự án (Folder Structure)

```text
src/
├── assets/             # Logo và các tệp tĩnh mặc định của Vite
├── components/         # Các UI component có khả năng tái sử dụng cao
│   ├── BulkImportModal.tsx   # Panel upload và xử lý file CSV lớn
│   ├── ConfirmDialog.tsx     # Hộp thoại xác nhận xóa tài liệu EVD
│   ├── DocumentModal.tsx     # Form thêm/sửa tài liệu EVD
│   ├── DocumentTable.tsx     # Bảng tài liệu, phân trang và chỉnh sửa inline
│   ├── Header.tsx            # Metadata hệ thống và chuyển đổi ngôn ngữ
│   ├── Icons.tsx             # Bộ sưu tập các SVG Icons tự thiết kế
│   ├── Sidebar.tsx           # Sidebar thương hiệu và bảng phân quyền Demo
│   ├── StatsBanner.tsx       # 4 thẻ thống kê số liệu tổng quan (KPIs)
│   └── VirtualTable.tsx      # Bộ ảo hóa viewport (virtualization) cho dữ liệu lớn
├── context/
│   └── AppContext.tsx  # Quản lý Global State (Role, Toast, Đa ngôn ngữ i18n)
├── services/
│   └── mockApi.ts      # Giả lập REST API Client (CRUD, Search, Sort, Delay 400ms)
├── types/
│   └── index.ts        # Định nghĩa các TypeScript interfaces toàn dự án
├── index.css           # Design system tokens và vanilla CSS của hệ thống SYS
└── main.tsx            # Điểm khởi chạy của ứng dụng
```

---

## 🌟 Điểm nhấn Kỹ thuật Nổi bật

### 1. Chỉnh sửa Trực tiếp trên Bảng (Inline Cell Editing & Dirty Tracking)
- Kích hoạt bằng cách **Double-click vào một dòng** hoặc bấm nút **Edit (Bút chì)** ở cột hành động.
- **Dirty Tracking**: Khi người dùng thay đổi giá trị trong các ô nhập (`code`, `title`, `category`, `status`), hệ thống sẽ kích hoạt tính năng theo dõi thay đổi và hiển thị một **chấm tròn cam nhỏ** ở góc phải của ô để biểu thị giá trị chưa được lưu.
- **Cell Validation**: Kiểm tra dữ liệu ngay khi người dùng nhập. Nếu ô vi phạm ràng buộc (ví dụ: Code trống hoặc chứa ký tự đặc biệt, Title ngắn hơn 5 ký tự), ô sẽ chuyển viền đỏ và hiển thị **tooltip cảnh báo tuyệt đối (absolute positioned tooltip)** ngay bên dưới ô nhập mà **không làm đẩy dòng hay vỡ giao diện bảng**.

### 2. Nhập Hàng loạt Không nghẽn Giao diện (Non-blocking Bulk Import CSV)
- Cho phép upload tệp CSV chứa hàng ngàn bản ghi. Hệ thống cung cấp sẵn nút tải **CSV Template mẫu** và tệp **giả lập 5.000 dòng dữ liệu** để kiểm thử.
- **Xử lý theo Chunk**: Thay vì duyệt toàn bộ tệp tin trong một luồng đồng bộ gây đơ trình duyệt, ứng dụng phân tách dữ liệu thành từng **chunk 500 bản ghi** và xử lý bất đồng bộ thông qua `setTimeout(..., 0)` / `requestAnimationFrame` giúp trả lại quyền điều khiển cho UI thread. Nhờ đó, thanh tiến trình (progress bar) và spinner vẫn cập nhật mượt mà.
- **Báo cáo Lỗi & Xem trước Ảo hóa (Virtualized Preview)**:
  - Thống kê chi tiết: Tổng số dòng, Số dòng hợp lệ, Số dòng lỗi.
  - Tab lỗi liệt kê cụ thể các dòng vi phạm kèm chi tiết lỗi (ví dụ: `Trùng code hệ thống`, `Thiếu tiêu đề`).
  - Tab xem trước sử dụng **VirtualTable (Row Virtualization / Windowing)** tự thiết kế. Chỉ render các dòng xuất hiện trong viewport scroll container, đảm bảo tải 5.000 dòng cực kỳ mượt mà mà không lo quá tải DOM.

### 3. Hệ thống Phân quyền (Permission-based UI)
- Có thể chuyển đổi qua lại giữa 2 Role ngay tại góc dưới của Sidebar:
  - **ADMIN**: Quyền hạn tối cao, xem toàn bộ tài liệu hệ thống, thực hiện CRUD đầy đủ (thêm, sửa, xóa, nhập csv).
  - **STAFF**: Bị giới hạn phạm vi. Hệ thống **tự động ẩn các nút Xóa (Delete)** và chỉ lọc hiển thị các tài liệu do chính Staff Member tạo ra (dựa trên trường `createdBy === 'Staff Member'`).

### 4. Đa ngôn ngữ Tiếng Anh / Tiếng Việt (Lightweight i18n)
- Hỗ trợ nút chuyển đổi nhanh giữa `EN` và `VI` tại thanh Header điều khiển, tự động biên dịch toàn bộ nhãn biểu mẫu, bảng, trạng thái và cảnh báo của hệ thống.
