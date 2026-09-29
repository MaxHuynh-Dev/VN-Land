# VN-Land

## Bản đồ lịch sử 3D

Trang chủ là bản đồ 3D lịch sử lãnh thổ Việt Nam "Từ thời đồ đá đến nay": 152 mốc, 21 thời kỳ, từ
~20.000 TCN tới nay. Mỗi mốc tô lãnh thổ các chính thể (Việt Nam, Lào, Campuchia, phần nam Trung
Quốc) bằng màu trơn, có nhãn tên kèm cờ nhỏ, tóm tắt và nguồn tham khảo; khi đổi mốc, vùng đổi chủ
loang dần theo một mặt trận sáng, kèm thẻ tiêu đề thời kỳ và bộ đếm năm.

Công nghệ: Next.js 16 (App Router) · React 19 · React Three Fiber v9 + drei v10 · three.js ·
`@preact/signals-react` · Tailwind CSS v4 · Biome · Vitest · Playwright.

### Chạy

```bash
yarn install
yarn dev            # http://localhost:3000
```

### Tham số URL

| Tham số | Ý nghĩa |
| --- | --- |
| `?y=<id>` | Mở đúng mốc có `id` đó (ví dụ `?y=1471`, `?y=tcn700`, `?y=1945-09`). Giá trị rác → mốc đầu; năm không khớp mốc nào → mốc gần nhất trước nó. URL tự cập nhật khi đổi mốc. |
| `?perf` | Hiện bảng đo fps (`<Stats />` của drei) để gỡ lỗi hiệu năng. Kết hợp được: `?perf=1&y=1757`. |

Phím tắt: `←`/`→` đổi mốc, `Space` tự chạy/tạm dừng, `Esc` bỏ chọn chính thể.

### Pipeline dữ liệu địa lý

```bash
yarn geo:fetch && yarn geo:build
```

- `geo:fetch` tải ranh giới ADM1/ADM2 của VNM, LAO, KHM, CHN từ [geoBoundaries](https://www.geoboundaries.org) (bản cố định theo commit) về `scripts/geo/raw/`.
- `geo:build` dựng các "ô" (đơn vị địa lý ẩn, thường là cấp huyện) thành `public/data/cells.topo.json`.
  Danh sách id ô theo tỉnh: `docs/history/cells-reference.md`.

### Kiểm tra và duyệt nội dung

```bash
yarn validate:history   # kiểm tra dữ liệu: selector trỏ đúng ô, chính thể/thời kỳ tồn tại, ≥ 2 nguồn mỗi mốc, file cờ có thật…
yarn history:review     # sinh docs/history-review.md — toàn bộ 152 mốc gom theo thời kỳ, để đọc duyệt
```

### Test

```bash
yarn test   # Vitest: logic bản đồ, dữ liệu lịch sử, độ tương phản, khoảng cách màu…
yarn e2e    # Playwright (desktop 1440×900 + mobile Pixel 7), tự khởi dev server ở cổng 3100
```

### Thêm một mốc mới

1. Mở file thời kỳ tương ứng trong `src/data/history/snapshots/` (`01-tien-su.ts` … `08-hien-dai.ts`)
   và thêm một phần tử `Snapshot` đúng thứ tự thời gian: `id` (dùng cho `?y=`), `year`, `yearLabel`,
   `era`, `title`, `summary`, `assign`, `sources` (ít nhất 2), tuỳ chọn `lowConfidence`, `focus`,
   `polityOverrides`.
2. `assign` chỉ ghi **phần thay đổi** so với mốc trước (mốc đầu tiên gán đầy đủ). Ngoại lệ theo quy
   ước: mốc đầu tiên của **mỗi file thời kỳ** mở bằng `'*': null` rồi gán lại đầy đủ để file tự đứng
   một mình (bản đồ mốc đó không phụ thuộc file trước); các mốc còn lại trong file vẫn chỉ ghi phần
   thay đổi. Khoá là selector:
   `'*'`, `'VNM'`, `'VNM.quang-nam'` (ADM1), `'VNM.quang-nam.dien-ban'` (một ô) hoặc
   `'group:<id>'`; giá trị là id chính thể hoặc `null` (không có chủ). Selector cụ thể hơn thắng.
3. Vùng lịch sử không trùng một tỉnh hiện đại → khai báo nhóm ô trong `src/data/history/groups.ts`.
   Chính thể mới → thêm vào `src/data/history/polities.ts` (tên, màu, cờ trong `public/flags/`,
   `flagKind`, ghi công cờ). Mỗi chính thể phải được gán ở ít nhất một mốc (validate báo lỗi nếu
   không).
4. Chạy `yarn validate:history`, rồi `yarn test`. Màu hai chính thể **giáp nhau** ở bất kỳ mốc nào
   phải lệch nhau ΔE2000 ≥ 15 — kiểm bởi `src/modules/HistoryMap/lib/colorDistance.test.ts`.
5. Chạy `yarn history:review` để cập nhật `docs/history-review.md`.

### Nhạc nền và ghi công

- Nhạc nền: "Five Armies" và "Heroic Age" của Kevin MacLeod (incompetech.com), giấy phép CC BY 3.0,
  lấy qua Wikimedia Commons (`public/audio/`, danh sách ở `src/modules/HistoryMap/music/tracks.ts`).
  Nhạc bắt đầu sau lần tương tác đầu tiên và có nút tắt/bật.
- Cờ: phần lớn từ Wikimedia Commons, ghi công từng lá (tác giả, giấy phép, liên kết) trong `flagCredit`
  của `polities.ts`.
- Ranh giới hành chính: geoBoundaries.
- Tất cả được liệt kê trong hộp **"Nguồn & ghi công"** trên trang.

---

## 📂 Cấu Trúc Thư Mục

Dự án áp dụng kiến trúc tách bạch rõ ràng giữa thư mục cấu hình và thư mục logic mã nguồn chính:

```text
.
├── app/                  # Nơi khai báo các routes (trang) dựa trên cấu trúc App Router của Next.js
├── public/               # Tài nguyên tĩnh: data/cells.topo.json (ô địa lý), flags/ (cờ), audio/ (nhạc nền)
├── scripts/              # geo/ (dựng dữ liệu ô), validate-history.ts, history-review.ts, flags/
├── e2e/                  # Kiểm thử Playwright (desktop + mobile)
├── src/                  # Chứa toàn bộ logic mã nguồn chính của web
│   ├── api/              # Định nghĩa các interceptors và API Endpoint client fetching
│   ├── components/       # Các UI Component sử dụng chung toàn hệ thống (Button, Input, Layout...)
│   ├── constants/        # Lưu trữ các biến hệ thống, configurations, static data
│   ├── data/history/     # Dữ liệu lịch sử: thời kỳ, chính thể, nhóm ô, các mốc (snapshots/)
│   ├── hooks/            # Các Custom Hook (tái sử dụng logic React)
│   ├── layout/           # Các cấu trúc hiển thị Layout cho Page (Header, Footer, MainLayout...)
│   ├── lib/              # Những hàm utils dùng chung của thư viện bên ngoài (tạo cn cho Tailwind...)
│   ├── modules/          # Các trang giao diện — HistoryMap/ là toàn bộ bản đồ 3D (scene/, ui/, lib/, music/)
│   ├── styles/           # CSS Settings, Variables css tổng, cấu hình cho font hoặc body
│   ├── types/            # Khai báo các đối tượng Type/Interface cho TypeScript
│   └── utils/            # Các helper function xử lý dữ liệu (parse string, date, array, math...)
├── .husky/               # Cấu hình chạy Git hooks bắt buộc khi commit code
├── biome.json            # Cấu hình rules và formatting cho Biome Linter
├── next.config.ts        # File tinh chỉnh hệ thống build và server của Next.js
├── tailwind.config.ts    # File quản lý theme (colors, fonts, animation) của Tailwind CSS
└── package.json          # Quản lý libraries, version và các câu lệnh scripts
```

---

## 🛠 Cách Cài Đặt Và Khởi Động

### Yêu cầu hệ thống
- **Node.js**: Phiên bản >= `20.x`
- **Package Manager**: Dự án sử dụng chính `yarn` (vì file `yarn.lock` có sẵn).

### Bước 1: Cài đặt các gói phụ thuộc (Dependencies)
Mở terminal tại thư mục dự án và chạy:

```bash
yarn install
```

### Bước 2: Thiết lập môi trường
Nếu dự án có file `.env.example`, hãy sao chép ra một file `.env` mới và điền các giá trị thích hợp cho việc chạy local.

### Bước 3: Chạy local Development Server
Sử dụng câu lệnh sau để mở trình giả lập development:

```bash
yarn dev
```
Trình duyệt sẽ khởi chạy server ở địa chỉ mặc định là [http://localhost:3000](http://localhost:3000). (Hỗ trợ theo dõi kết nối qua Local & Network config).

---

## 🖥 Các Lệnh Kịch Bản Hỗ Trợ (Scripts)

Tham khảo các đoạn script trong `package.json` cho từng mục đích:

- **`yarn dev`**: Chạy server cho môi trường phát triển (có hot-reload).
- **`yarn build`**: Build tối ưu mã nguồn (production build). `prebuild` tự chạy `yarn validate:history`.
- **`yarn start`**: Chạy project bằng bản build production (cần chạy `build` trước).
- **`yarn test`** / **`yarn test:watch`**: Unit test (Vitest).
- **`yarn e2e`**: Kiểm thử trình duyệt (Playwright, tự khởi dev server ở cổng 3100).
- **`yarn geo:fetch`**, **`yarn geo:build`**: Tải ranh giới hành chính và dựng `public/data/cells.topo.json`.
- **`yarn validate:history`**: Kiểm tra dữ liệu lịch sử.
- **`yarn history:review`**: Sinh `docs/history-review.md` để duyệt nội dung.
- **`yarn flags:fix`**: Chuẩn hoá kích thước SVG cờ trong `public/flags/`.
- **`yarn format`**: Sửa tự động toàn bộ chuẩn cấu trúc code với Biome.
- **`yarn lint`**: Kiểm tra toàn bộ mã nguồn bắt các lỗi sai (không tự sửa, chỉ báo lỗi).
- **`yarn lint:fix`**: Tự động sửa cấu trúc code chuẩn với tính năng linting.
- **`yarn prepare`**: Câu lệnh auto-apply husky tự động móc nối git hooks với local machine.

---

## 🌐 Môi Trường Triển Khai (Deploy)

Website sẵn sàng để deploy lên thông qua các nhà cung cấp như [Vercel](https://vercel.com) hoặc có thể sử dụng giải pháp ảo hoá truyền thống.
Dự án đã có bản Dockerize (chứa sẵn `Dockerfile` và `.dockerignore`), giúp bạn triển khai linh hoạt lên AWS, Digital Ocean, Container Registry, v.v một cách dễ dàng và mượt mà.

> **Lưu ý trong lúc Dev**: Thay vì xài các extension như ESlint hay Prettier truyền thống, dự án sử dụng môi trường linter ưu việt thông qua `Biome`. Hãy tải plugin "Biome" trong mục Extensions của VS Code để đồng bộ hóa hoàn toàn trải nghiệm viết code.
