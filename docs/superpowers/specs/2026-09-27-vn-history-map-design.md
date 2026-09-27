# Bản đồ 3D lịch sử mở mang bờ cõi Việt Nam — Design Spec

- **Ngày:** 2026-09-27
- **Trạng thái:** Chờ duyệt
- **Repo:** VN-Land (Next.js 16, React 19, Tailwind 4)
- **Tham khảo kỹ thuật:** [holetexvn/vietnam-3d-map](https://github.com/holetexvn/vietnam-3d-map) — đặc biệt `main.js` (đùn khối GeoJSON, biển, ánh sáng) và `film1975.js` (đổi màu vùng theo thời gian, cờ trên bản đồ)

## 1. Mục tiêu

Một **công cụ khám phá** dạng bản đồ 3D, cho người xem tự kéo dòng thời gian từ thời đồ đá (~20.000 TCN) đến nay (2025) và thấy lãnh thổ các chính thể trên dải đất Việt Nam cùng vùng lân cận thay đổi ra sao. Thay vì hiển thị từng tỉnh, mỗi vùng được tô màu và cắm **cờ của chính thể đang cai quản** ở thời điểm đó.

**Người dùng:** người học và người tra cứu lịch sử (mục đích giáo dục). Độ chính xác lịch sử và việc minh bạch nguồn quan trọng hơn hiệu ứng.

**Tiêu chí thành công:**
1. Đủ ~59 mốc (mục 6). Mỗi mốc có tóm tắt, bảng gán lãnh thổ và ≥2 nguồn.
2. Người xem nhận ra ngay quá trình Nam tiến: Đại Việt lớn dần, Chăm Pa và Chân Lạp thu hẹp.
3. Mọi lá cờ đều có nhãn loại (quốc kỳ, cờ hiệu, cờ phục dựng, biểu tượng) và ghi nguồn.
4. Đạt 60 fps trên laptop phổ thông, ≥30 fps trên điện thoại tầm trung.
5. Có thể chia sẻ link mở đúng một mốc (`?y=1471`).

## 2. Các quyết định đã chốt

| Chủ đề | Quyết định |
|---|---|
| Hình thức | Công cụ khám phá: người xem tự điều khiển, có thêm nút tự chạy |
| Chính thể không phải người Việt | Hiện **tất cả**: Chăm Pa, Phù Nam, Chân Lạp, Khmer, Lan Xang, các triều đại Trung Hoa…, mỗi chính thể có cờ và màu riêng |
| Cờ thời chưa có quốc kỳ | Dùng **cờ hiệu hoặc cờ phục dựng, có nhãn và nguồn**. Thời chưa có nhà nước thì dùng biểu tượng (rìu đá, mặt trống Đông Sơn) |
| Bắc thuộc, Pháp thuộc, 1945–1975 | **Đầy đủ, trung lập**: hiện mọi chính quyền thực tế kiểm soát lãnh thổ (Hán, Đường, Minh, Pháp, VNDCCH, QGVN, VNCH, CPCMLT), giọng văn sách giáo khoa, không bình luận |
| Phạm vi bản đồ | **Việt Nam, Lào, Campuchia, Quảng Tây, Quảng Đông, Hải Nam**, kèm Hoàng Sa và Trường Sa |
| Độ chi tiết thời gian | **~59 mốc then chốt**. Thanh thời gian nhảy theo mốc, bản đồ chuyển màu mượt |
| Kỹ thuật | **Next.js + React Three Fiber**, cùng một pipeline dữ liệu dựng sẵn các "ô nguyên tử" |
| Vị trí | **Thay trang Home** |
| Hoàng Sa, Trường Sa | Theo quan điểm chính thức của Việt Nam. Hai quần đảo thuộc chúa Nguyễn và nhà Nguyễn từ khi có đội Hoàng Sa. Có chú thích "bị chiếm đóng" từ 1974 (Hoàng Sa) và 1988 (một phần Trường Sa) |
| Ngôn ngữ | Tiếng Việt. Chuỗi văn bản nằm trong file dữ liệu, không hardcode trong JSX |

## 3. Kiến trúc

### 3.1 Cây thư mục

```
scripts/geo/                          # chạy tay lúc dev, không vào bundle
  fetch-boundaries.ts                 # tải geoBoundaries (CC-BY) về scripts/geo/raw/ (gitignored)
  build-cells.ts                      # gộp, đơn giản hóa (mapshaper), xuất public/data/cells.topo.json
  validate-history.ts                 # kiểm tra tính toàn vẹn dữ liệu lịch sử
public/data/cells.topo.json           # hình học các ô nguyên tử (commit vào repo)
public/flags/*.svg                    # cờ và biểu tượng
src/data/history/
  types.ts                            # Polity, Snapshot, CellGroup, Source…
  polities.ts                         # danh mục chính thể
  groups.ts                           # nhóm ô có tên lịch sử
  snapshots/                          # mỗi thời kỳ lớn một file, ví dụ 01-tien-su.ts, 05-nam-tien.ts
  index.ts                            # gom snapshots theo thứ tự thời gian
src/modules/HistoryMap/
  index.tsx                           # next/dynamic, ssr:false, fallback loader
  HistoryMap.tsx                      # Canvas + lớp UI
  scene/
    Terrain.tsx                       # mesh các ô, màu theo chính thể, animation đổi chủ
    Sea.tsx  Lights.tsx
    FlagPole.tsx                      # cột và cờ vải (shader gợn sóng), hoặc đĩa biểu tượng
    Flags.tsx                         # đặt cờ tại tâm lãnh thổ từng chính thể
    CameraRig.tsx                     # OrbitControls + bay tới focus bằng GSAP
  ui/
    Timeline.tsx  EraBand.tsx
    InfoCard.tsx  CellTooltip.tsx  PolityDetail.tsx
    SourceList.tsx  CreditsDialog.tsx  NoWebGLFallback.tsx
  state/timeline.ts                   # signals
  lib/
    projection.ts                     # kinh/vĩ độ → mặt phẳng (theo repo tham khảo)
    resolveSnapshot.ts                # áp delta → Map<cellId, polityId>
    polityCentroid.ts
    loadCells.ts                      # fetch + topojson-client → hình học
app/(frontend)/(withoutFooter)/page.tsx   # trang Home mới, render <HistoryMap/>
```

`app/(frontend)/(withFooter)/page.tsx` và `src/modules/HomePage/` sẽ bị gỡ. Route `/` chuyển sang nhóm `(withoutFooter)`.

**Xung đột với layout hiện có:** `MainLayout` đang bọc toàn trang bằng `SmoothScroll` (Lenis, chặn sự kiện wheel nên làm hỏng thao tác zoom trên canvas) và `Header` (menu neo tới các section About/Projects của trang portfolio sẽ bị gỡ). Cách xử lý: **bỏ `SmoothScroll` và `Header` khỏi `MainLayout`**, giữ nguyên file component để dùng lại sau. Tiêu đề trang (masthead) do `HistoryMap` tự vẽ. `body` của trang bản đồ đặt `overflow: hidden` và canvas phủ toàn màn hình.

**Thư viện mới:** `three`, `@react-three/fiber` (bản hỗ trợ React 19), `@react-three/drei`, `topojson-client`. Dev: `mapshaper`, `vitest`, `@playwright/test`, `@types/three`, `@types/topojson-client`. Trước khi viết code, đọc hướng dẫn trong `node_modules/next/dist/docs/` như `AGENTS.md` yêu cầu.

### 3.2 Mô hình dữ liệu

```ts
type PolityId = string;           // 'dai-viet', 'champa', 'khmer', 'han'…
type CellId = string;             // 'VNM.44.3', 'KHM.12.1', 'CHN.GX.05'…

interface Source { title: string; author?: string; url?: string; note?: string }

interface Polity {
  id: PolityId;
  name: string;                   // 'Đại Việt'
  altNames?: string[];
  color: string;                  // màu đất
  flag: string;                   // '/flags/dai-viet-ly.svg'
  flagKind: 'national' | 'banner' | 'reconstructed' | 'symbol';
  flagNote: string;               // giải thích nguồn gốc lá cờ
  capital?: string;
  period: string;                 // '1054–1400' (văn bản hiển thị)
  sources: Source[];
}

interface CellGroup { id: string; name: string; cells: CellId[] }  // 'chau-o', 'kauthara'…

interface Snapshot {
  id: string;                     // 'y1471'
  year: number;                   // âm = TCN
  yearLabel: string;              // '1471', '~700 TCN', '3/1945'
  era: EraId;                     // dải màu thời kỳ lớn
  title: string;
  summary: string;                // 2–4 câu
  assign: Record<CellId | string, PolityId | null>;  // delta so với mốc trước; khóa có thể là groupId
  polityOverrides?: Partial<Record<PolityId, Partial<Polity>>>; // ví dụ đổi cờ khi đổi triều trong cùng một chính thể
  confidence?: Record<CellId | string, 'low'>;
  focus?: { lon: number; lat: number; zoom?: number };
  sources: Source[];              // ≥2
}
```

Mốc đầu tiên gán đầy đủ. Các mốc sau chỉ ghi phần thay đổi. `null` nghĩa là "không có nhà nước hoặc chưa rõ" và được tô màu đá trung tính. Một chính thể đổi triều (ví dụ Đại Việt từ Lý sang Trần) dùng `polityOverrides` để đổi cờ và tên hiển thị, nhưng vẫn giữ nguyên id để cờ trượt liền mạch.

### 3.3 Pipeline địa lý

1. **Nguồn:** geoBoundaries (CC-BY 4.0)
   - Việt Nam, Lào, Campuchia: cấp ADM2
   - Trung Quốc: cấp ADM2, chỉ lấy Quảng Tây, Quảng Đông, Hải Nam
   - Hoàng Sa và Trường Sa: lấy từ dữ liệu repo tham khảo hoặc Free-GIS-Data nếu geoBoundaries thiếu
2. **Xử lý:**
   - Lọc theo bbox (lon 97–118, lat 7–26).
   - Đơn giản hóa bằng mapshaper, giữ topology. Mục tiêu file dưới 1,5 MB (gzip dưới 400 KB), khoảng 1.000–1.300 ô.
   - Gộp các ô quá nhỏ ở thành thị vào ô bên cạnh nếu cần.
3. **Đầu ra:** TopoJSON, mỗi ô có thuộc tính `{ id, name, country, adm1 }`.
4. Ranh giới hiện đại chỉ **xấp xỉ** biên giới thời xưa. Điều này được ghi rõ trong trang ghi công.

### 3.4 Luồng chạy

1. `loadCells()` fetch TopoJSON một lần, dùng Suspense, rồi dựng một `ExtrudeGeometry` cho mỗi ô (tương tự `main.js` tham khảo) cùng lớp proxy tĩnh để raycast.
2. `currentSnapshotIndex` (signal) thay đổi, `resolveSnapshot(i)` được gọi. Hàm này áp delta từ mốc 0 đến mốc i và memo kết quả theo i, trả về `Map<CellId, PolityId|null>`.
3. `Terrain` là **một mesh gộp** cho mọi ô. Màu và độ nổi từng ô được đọc từ một `DataTexture` trong shader. Khi đổi mốc, các ô đổi chủ chuyển màu trong khoảng 0,8 giây, trễ dần theo khoảng cách tới lãnh thổ cũ để tạo hiệu ứng lãnh thổ **loang ra**, kèm một nhịp nổi nhẹ. Khi đứng yên, cả lãnh thổ là một khối đồng màu.
4. `Flags` tính `polityCentroid` cho mỗi chính thể đang có. Cách tính: lấy cụm ô liền kề lớn nhất, rồi tìm điểm nằm trong đa giác gần tâm diện tích nhất. Cờ mới mọc lên, cờ mất đi thì hạ xuống, cờ còn lại trượt tới vị trí mới.
5. URL `?y=<year>` đồng bộ hai chiều bằng `history.replaceState`, không gây điều hướng.

## 4. Hiển thị và tương tác

- **Không khí:** biển đêm, ánh sáng ấm, đổ bóng mềm, tone mapping ACES, sương mù (theo repo tham khảo). Đất liền là khối đùn thấp.
- **Chỉ hiện lãnh thổ, không hiện tỉnh/huyện:** các ô là đơn vị dữ liệu ẩn. Mọi ô cùng chính thể có **cùng một màu** và cùng độ cao, nên mặt trên liền thành một khối lãnh thổ. Không vẽ ranh giới tỉnh hay huyện. Chỉ vẽ **đường biên giữa các chính thể** (sáng nhẹ) và đường bờ biển. Ô `null` dùng màu đá xám.
- **Không hiện tên địa danh hiện đại** trên bản đồ, tooltip hay thẻ thông tin. Tên tỉnh và huyện chỉ dùng nội bộ để soạn dữ liệu.
- **Cờ:**
  - Cột cờ với lá cờ vải `PlaneGeometry`, gợn sóng bằng vertex shader, texture từ SVG.
  - Lãnh thổ nhỏ trên màn hình chỉ hiện huy hiệu.
  - `flagKind: 'symbol'` thì hiện đĩa biểu tượng xoay chậm.
- **Dòng thời gian (đáy màn hình):**
  - Các mốc cách đều nhau (trục không tuyến tính), kèm nhãn năm.
  - Dải thời kỳ lớn phía trên: Tiền sử, Hồng Bàng, Bắc thuộc, Độc lập tự chủ, Nam tiến và phân tranh, Nhà Nguyễn, Pháp thuộc, Kháng chiến và chia cắt, Thống nhất.
  - Điều khiển: kéo, bấm, phím ←/→, nút ▶ tự chạy (mỗi mốc khoảng 4 giây, bấm vào bản đồ thì dừng).
- **Thẻ thông tin (bên phải; trên mobile là bottom sheet):**
  - Năm, tiêu đề, tóm tắt, danh sách chính thể đang tồn tại (cờ nhỏ, tên, kinh đô), nguồn.
  - Nếu mốc có ô `confidence: low` thì hiện ghi chú "Một phần ranh giới ở mốc này là ước đoán".
- **Rê vào lãnh thổ:**
  - **Toàn bộ lãnh thổ** của chính thể đó nổi lên và sáng nhẹ.
  - Tooltip hiện cờ nhỏ, tên chính thể và nhãn loại cờ.
- **Bấm vào lãnh thổ:**
  - Camera bay tới ô neo của chính thể (vị trí cắm cờ).
  - `PolityDetail` hiện thời gian tồn tại, kinh đô, ghi chú về lá cờ và nguồn.
  - Esc hoặc bấm ra biển để quay về.
- **Camera:** mốc có `focus` thì camera trượt tới khi đang tự chạy. Khi người xem tự điều khiển thì chỉ đổi dữ liệu, không bay.
- **Trang "Nguồn & ghi công":** geoBoundaries, nguồn cờ (Wikimedia Commons và giấy phép từng file), tài liệu sử học, ghi chú về tính xấp xỉ của ranh giới.
- **Khả năng truy cập:**
  - `prefers-reduced-motion` tắt gợn sóng cờ, nhấp nhô và bay camera.
  - Timeline dùng bàn phím được và có `aria-valuetext`.
  - Thẻ thông tin dùng `aria-live="polite"`.

## 5. Xử lý lỗi

| Tình huống | Hành vi |
|---|---|
| Trình duyệt không hỗ trợ WebGL | `NoWebGLFallback`: danh sách mốc dạng văn bản, vẫn đọc được toàn bộ nội dung |
| Fetch `cells.topo.json` lỗi | Màn hình lỗi có nút "Thử lại" |
| `?y=` không khớp mốc nào | Chọn mốc gần nhất ≤ năm đó, không có thì chọn mốc đầu |
| Dữ liệu tham chiếu tới ô hoặc chính thể không tồn tại, mốc thiếu nguồn, năm không tăng dần | `validate-history` báo lỗi. Script này chạy trong `prebuild` và trong test |
| Texture cờ lỗi | Hiện cờ màu trơn theo `polity.color` kèm tên |

## 6. Danh sách mốc (bản nháp — agent nghiên cứu hiệu chỉnh, người dùng duyệt)

1. ~20.000 TCN — Văn hóa Sơn Vi
2. ~10.000 TCN — Văn hóa Hòa Bình
3. ~5.000 TCN — Bắc Sơn, Quỳnh Văn, Đa Bút
4. ~2.000 TCN — Phùng Nguyên, Sa Huỳnh sớm, Đồng Nai
5. ~700 TCN — Văn Lang, văn hóa Đông Sơn
6. 257 TCN — Âu Lạc
7. 179 TCN — Nam Việt thôn tính Âu Lạc
8. 111 TCN — Nhà Hán: Giao Chỉ, Cửu Chân, Nhật Nam
9. 40 — Hai Bà Trưng
10. 43 — Mã Viện, Đông Hán trở lại
11. 192 — Lâm Ấp; Phù Nam ở phía Nam
12. 544 — Vạn Xuân (Lý Nam Đế)
13. 602 — Nhà Tùy
14. 679 — An Nam đô hộ phủ (Đường); Chân Lạp thay Phù Nam
15. 802 — Đế quốc Khmer (Angkor)
16. 939 — Ngô Quyền xưng vương
17. 968 — Đại Cồ Việt (Đinh)
18. 980 — Tiền Lê
19. 1009 — Nhà Lý
20. 1054 — Quốc hiệu Đại Việt
21. 1069 — Bố Chính, Địa Lý, Ma Linh
22. 1225 — Nhà Trần
23. 1306 — Châu Ô, Châu Lý
24. 1353 — Lan Xang
25. 1400–1402 — Nhà Hồ, Đại Ngu; Thăng Hoa, Tư Nghĩa
26. 1407 — Minh thuộc
27. 1428 — Hậu Lê
28. 1471 — Chinh phạt Vijaya; Quảng Nam thừa tuyên
29. 1527 — Nhà Mạc
30. 1533 — Nam – Bắc triều
31. 1558 — Nguyễn Hoàng trấn Thuận Hóa
32. 1592 — Mạc rút lên Cao Bằng
33. 1611 — Phú Yên
34. 1627 — Trịnh – Nguyễn phân tranh
35. 1653 — Thái Khang, Diên Ninh (Khánh Hòa)
36. 1697 — Thuận Thành trấn (Panduranga)
37. 1698 — Phủ Gia Định
38. 1708 — Hà Tiên (Mạc Cửu)
39. 1732 — Dinh Long Hồ
40. 1757 — Tầm Phong Long; hoàn tất vùng Tây Nam Bộ
41. 1778 — Tây Sơn
42. 1788 — Quang Trung
43. 1802 — Nhà Nguyễn
44. 1816 — Gia Long cắm mốc Hoàng Sa
45. 1834 — Trấn Tây thành
46. 1841 — Rút khỏi Chân Lạp
47. 1862 — Hòa ước Nhâm Tuất
48. 1867 — Pháp chiếm toàn Nam Kỳ
49. 1887 — Liên bang Đông Dương
50. 3/1945 — Đế quốc Việt Nam
51. 9/1945 — Việt Nam Dân chủ Cộng hòa
52. 1949 — Quốc gia Việt Nam
53. 1954 — Hiệp định Genève, vĩ tuyến 17
54. 1955 — Việt Nam Cộng hòa
55. 1969 — Chính phủ Cách mạng lâm thời Cộng hòa miền Nam Việt Nam
56. 1974 — Hoàng Sa bị chiếm
57. 1975 — 30/4
58. 1976 — Cộng hòa Xã hội chủ nghĩa Việt Nam
59. 2025 — Ngày nay

Mỗi mốc cũng cập nhật các chính thể láng giềng khi có thay đổi:
- Hoa Nam: Tần, Hán, Ngô, Tấn, Nam triều, Tùy, Đường, Nam Hán, Tống, Nguyên, Minh, Thanh, Trung Hoa Dân quốc, CHND Trung Hoa
- Lào: Lan Xang, rồi Luang Prabang, Vientiane, Champasak, Lào thuộc Pháp, Vương quốc Lào, CHDCND Lào
- Campuchia: Phù Nam, Chân Lạp, Khmer, hậu Angkor, bảo hộ Pháp, Vương quốc Campuchia, Campuchia Dân chủ, CHND Campuchia, Vương quốc Campuchia
- Xiêm: khi có can thiệp

**Quy trình nội dung:**
1. Agent nghiên cứu soạn `polities`, `groups` và `snapshots`. Mỗi mốc có ≥2 nguồn, ưu tiên theo thứ tự:
   1. Đại Việt sử ký toàn thư, Đại Nam thực lục, Đại Nam nhất thống chí
   2. *Lịch sử Việt Nam* (Viện Sử học)
   3. Wikipedia tiếng Việt và tiếng Anh, chỉ để đối chiếu
2. Ô không chắc chắn được gắn `confidence: 'low'`.
3. Cờ lấy từ Wikimedia Commons, ghi rõ giấy phép từng file.
4. Xuất bảng tóm tắt (`docs/history-review.md`) để **người dùng duyệt nội dung trước khi phát hành**.

## 7. Kiểm thử

- **Vitest (unit):**
  - `resolveSnapshot`: áp delta đúng thứ tự, `null` đúng, khóa nhóm được bung đúng
  - `polityCentroid`: điểm luôn nằm trong đa giác
  - `projection`
  - `validate-history` chạy trên dữ liệu thật
- **Playwright (e2e smoke):**
  - `/` render được canvas
  - Bấm 3 mốc thì tiêu đề thẻ thông tin đổi đúng
  - `?y=1471` mở đúng mốc
  - Phím ←/→ chuyển mốc
  - Chụp ảnh màn hình desktop (1440×900) và mobile (375×812)
- **Chất lượng:** chạy `biome lint`, `next build`, và đo fps thủ công bằng r3f-perf lúc dev.

## 8. Giai đoạn triển khai

| Giai đoạn | Nội dung | Chạy song song? |
|---|---|---|
| P1 | Pipeline địa lý, dựng cảnh 3D các ô, 3 mốc mẫu, thay trang Home, tắt Lenis | — |
| P2 | Timeline, thẻ thông tin, tooltip, cờ vải, camera, đồng bộ URL, xử lý lỗi | sau P1 |
| P3 | Toàn bộ `polities`, `groups`, 59 `snapshots`, cờ SVG, `history-review.md` | **song song với P1–P2** (chỉ phụ thuộc vào danh sách id ô của P1) |
| P4 | Mobile, hiệu năng, a11y, trang ghi công, code review, người dùng duyệt nội dung | cuối cùng |

## 9. Ngoài phạm vi

- Thanh thời gian theo từng năm hoặc nội suy giữa các mốc
- Đa ngôn ngữ (chỉ để sẵn cấu trúc dữ liệu cho việc này)
- Quay video, chế độ phim tự động có dựng cảnh
- Mũi tên chiến dịch quân sự, địa danh 3D dạng diorama
- Backend hoặc CMS (dữ liệu là file tĩnh)
