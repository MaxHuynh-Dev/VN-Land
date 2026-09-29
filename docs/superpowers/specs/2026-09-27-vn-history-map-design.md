# Bản đồ 3D lịch sử mở mang bờ cõi Việt Nam — Design Spec

- **Ngày:** 2026-09-27
- **Trạng thái:** Chờ duyệt
- **Repo:** VN-Land (Next.js 16, React 19, Tailwind 4)
- **Tham khảo kỹ thuật:** [holetexvn/vietnam-3d-map](https://github.com/holetexvn/vietnam-3d-map) — đặc biệt `main.js` (đùn khối GeoJSON, biển, ánh sáng) và `film1975.js` (đổi màu vùng theo thời gian, cờ trên bản đồ)

## 1. Mục tiêu

Một **công cụ khám phá** dạng bản đồ 3D, cho người xem tự kéo dòng thời gian từ thời đồ đá (~20.000 TCN) đến nay (2025) và thấy lãnh thổ các chính thể trên dải đất Việt Nam cùng vùng lân cận thay đổi ra sao. Thay vì hiển thị từng tỉnh, mỗi vùng được tô màu và cắm **cờ của chính thể đang cai quản** ở thời điểm đó.

**Người dùng:** người học và người tra cứu lịch sử (mục đích giáo dục). Độ chính xác lịch sử và việc minh bạch nguồn quan trọng hơn hiệu ứng.

**Tiêu chí thành công:**
1. Đủ 152 mốc (mục 6). Mỗi mốc có tóm tắt, bảng gán lãnh thổ và ≥2 nguồn.
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
| Độ chi tiết thời gian | **152 mốc, chia 21 thời kỳ** (mở rộng ngày 2026-09-28 theo yêu cầu người dùng: chi tiết từng triều đại như Tây Sơn, nhà Nguyễn, Việt Nam Cộng hòa; bản đầu có 59 mốc). Thanh thời gian nhảy theo mốc, bản đồ chuyển màu mượt |
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
    colorDistance.ts (lib)            # ΔE2000 giữa màu các lãnh thổ giáp nhau
    Labels.tsx                        # nhãn tên chính thể tại điểm neo
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

Mốc đầu tiên gán đầy đủ. Các mốc sau chỉ ghi phần thay đổi. `null` nghĩa là "không có nhà nước hoặc chưa rõ" và được tô màu đá trung tính. Một chính thể đổi triều (ví dụ Đại Việt từ Lý sang Trần) nếu có cờ riêng thì dùng id chính thể riêng (cờ trên đất chỉ lấy `Polity.flag`); `polityOverrides` chỉ dùng để đổi tên hiển thị hoặc kinh đô.

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
4. Với mỗi chính thể, tính cụm ô liền kề lớn nhất: ô neo (cho nhãn tên và camera). Shader mặt trên tô màu trơn `polity.color` theo chủ của ô. Nhãn mới hiện dần, nhãn cũ mờ dần.
5. URL `?y=<year>` đồng bộ hai chiều bằng `history.replaceState`, không gây điều hướng.

## 4. Hiển thị và tương tác

- **Không khí:** biển đêm, ánh sáng ấm, đổ bóng mềm, tone mapping ACES, sương mù (theo repo tham khảo). Đất liền là khối đùn thấp.
- **Chỉ hiện lãnh thổ, không hiện tỉnh/huyện:** các ô là đơn vị dữ liệu ẩn. Mọi ô cùng chính thể có **cùng một màu** và cùng độ cao, nên mặt trên liền thành một khối lãnh thổ. Không vẽ ranh giới tỉnh hay huyện. Chỉ vẽ **đường biên giữa các chính thể** (sáng nhẹ) và đường bờ biển. Ô `null` dùng màu đá xám.
- **Không hiện tên địa danh hiện đại** trên bản đồ, tooltip hay thẻ thông tin. Tên tỉnh và huyện chỉ dùng nội bộ để soạn dữ liệu.
- **Màu lãnh thổ và cờ ở nhãn (cập nhật 2026-09-29 theo yêu cầu người dùng — thay cho cờ phủ kín lãnh thổ, vốn khó nhìn):**
  - Mặt trên lãnh thổ của mỗi chính thể tô **màu trơn** `polity.color` (theo họ màu: Việt đỏ/vàng cam, Chăm xanh ngọc, Khmer xanh lam, Lào tím, Trung Hoa nâu vàng, Pháp xanh xám). Tường bên cùng màu, tối hơn, để giữ cảm giác khối 3D. Ô `null` màu đá xám lạnh `#707a80`.
  - Hai chính thể giáp nhau ở cùng một mốc (kể cả với ô `null`) phải lệch màu **≥ ΔE2000 15**; test quét mọi mốc.
  - Khi đổi mốc, mặt trận loang phát sáng chuyển ô từ màu chủ cũ sang màu chủ mới, kèm nhịp nổi như cũ.
  - **Nhãn tên nhỏ** (viên nhãn cao khoảng 22px trên màn hình, kích thước không đổi theo khoảng cách camera) đặt ở điểm neo của mỗi lãnh thổ, có **cờ nhỏ** bên trái tên (viền kem mảnh). Nếu hai nhãn chồng nhau thì ẩn nhãn của chính thể có diện tích nhỏ hơn.
  - Danh sách chính thể ở thẻ thông tin và tooltip có vạch màu lãnh thổ bên cạnh cờ (chú giải).
  - Ảnh cờ lỗi hoặc đang tải: ô cờ trong nhãn dùng màu trơn `polity.color`.
- **Dòng thời gian (đáy màn hình):**
  - Các mốc cách đều nhau (trục không tuyến tính), kèm nhãn năm.
  - Dải thời kỳ phía trên, 21 thời kỳ: Tiền sử; Hồng Bàng – Âu Lạc; Bắc thuộc lần I; Hai Bà Trưng; Bắc thuộc lần II; Vạn Xuân; Bắc thuộc lần III; Tự chủ (Khúc – Dương); Ngô – Đinh – Tiền Lê; Nhà Lý; Nhà Trần; Nhà Hồ & Minh thuộc; Lê sơ; Mạc & Nam – Bắc triều; Trịnh – Nguyễn phân tranh; Tây Sơn; Nhà Nguyễn; Pháp thuộc; Chiến tranh Đông Dương; Chia cắt hai miền; Thống nhất.
  - Bấm vào một thời kỳ trên dải thì nhảy tới mốc đầu tiên của thời kỳ đó. Thời kỳ đang xem luôn hiện đủ tên; tên các thời kỳ khác chỉ hiện khi đủ chỗ (không cắt chữ thành "…"), luôn có tooltip.
  - Với 152 mốc, vạch mốc trên thanh kéo là các vạch mảnh, không tràn ngang trên màn hình 375px. Vạch đầu mỗi thời kỳ cao hơn các vạch khác.
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
| Ảnh cờ lỗi | Ô cờ (nhãn, tooltip, thẻ thông tin) hiện màu trơn `polity.color` |

## 6. Danh sách mốc (bản mở rộng 152 mốc — agent nghiên cứu hiệu chỉnh, người dùng duyệt)

Các mốc đánh dấu *(mới)* được thêm ở bản mở rộng. Mốc chỉ ghi sự kiện mà không đổi lãnh thổ (ví dụ 1010, 1288) vẫn được giữ: thẻ thông tin đổi, bản đồ đứng yên.

1. ~20.000 TCN — Văn hóa Sơn Vi
2. ~10.000 TCN — Văn hóa Hòa Bình
3. ~8.000 TCN — Văn hóa Bắc Sơn *(mới)*
4. ~5.000 TCN — Quỳnh Văn, Đa Bút – cư dân ven biển
5. ~2.000 TCN — Phùng Nguyên, Sa Huỳnh sớm, Đồng Nai
6. ~700 TCN — Văn Lang, văn hóa Đông Sơn
7. 257 TCN — Âu Lạc của An Dương Vương
8. 214 TCN — Nhà Tần lập Nam Hải, Quế Lâm, Tượng quận *(mới)*
9. ~204 TCN — Triệu Đà lập nước Nam Việt *(mới)*
10. 179 TCN — Nam Việt thôn tính Âu Lạc
11. 111 TCN — Nhà Hán lập Giao Chỉ, Cửu Chân, Nhật Nam
12. 40 — Khởi nghĩa Hai Bà Trưng
13. 43 — Mã Viện, Đông Hán trở lại
14. 192 — Khu Liên lập Lâm Ấp; Phù Nam ở phía Nam
15. 203 — Giao Chỉ bộ đổi thành Giao Châu (thời Sĩ Nhiếp) *(mới)*
16. 226 — Đông Ngô tách Quảng Châu khỏi Giao Châu *(mới)*
17. 248 — Khởi nghĩa Bà Triệu ở Cửu Chân *(mới)*
18. 280 — Nhà Tấn thống nhất, Giao Châu thuộc Tấn *(mới)*
19. 420 — Nam triều (Lưu Tống) cai quản Giao Châu *(mới)*
20. 544 — Lý Bí lập nước Vạn Xuân
21. 550 — Triệu Việt Vương; Chân Lạp lấn Phù Nam *(mới)*
22. 571 — Hậu Lý Nam Đế (Lý Phật Tử) *(mới)*
23. 602 — Nhà Tùy chiếm Vạn Xuân
24. 622 — Nhà Đường lập Giao Châu tổng quản phủ *(mới)*
25. 679 — An Nam đô hộ phủ; Chân Lạp thay Phù Nam
26. 722 — Khởi nghĩa Mai Thúc Loan *(mới)*
27. 791 — Khởi nghĩa Phùng Hưng *(mới)*
28. 802 — Đế quốc Khmer (Angkor)
29. 863 — Nam Chiếu chiếm Giao Chỉ *(mới)*
30. 866 — Cao Biền lập Tĩnh Hải quân *(mới)*
31. 905 — Khúc Thừa Dụ giành quyền tự chủ *(mới)*
32. 917 — Nhà Nam Hán ở Lĩnh Nam *(mới)*
33. 930 — Nam Hán chiếm Giao Châu *(mới)*
34. 931 — Dương Đình Nghệ giành lại Giao Châu *(mới)*
35. 939 — Ngô Quyền xưng vương sau trận Bạch Đằng
36. 965–967 — Loạn 12 sứ quân *(mới)*
37. 968 — Đinh Bộ Lĩnh lập Đại Cồ Việt
38. 980 — Nhà Tiền Lê
39. 982 — Lê Hoàn đánh Chiêm Thành *(mới)*
40. 1009 — Nhà Lý
41. 1010 — Dời đô về Thăng Long *(mới)*
42. 1054 — Quốc hiệu Đại Việt
43. 1069 — Nhận ba châu Bố Chính, Địa Lý, Ma Linh
44. 1075–1077 — Chiến tranh Tống – Việt, phòng tuyến Như Nguyệt *(mới)*
45. 1084 — Hội nghị biên giới: Tống trả các châu động *(mới)*
46. 1225 — Nhà Trần
47. 1279 — Nhà Nguyên diệt Nam Tống, chiếm Hoa Nam *(mới)*
48. 1258–1288 — Ba lần kháng chiến chống Mông – Nguyên *(mới)*
49. 1306 — Châu Ô, châu Lý (sính lễ Huyền Trân)
50. 1353 — Pha Ngừm lập Lan Xang
51. 1368 — Nhà Minh thay nhà Nguyên *(mới)*
52. 1371–1390 — Chế Bồng Nga đánh ra Bắc *(mới)*
53. 1400 — Nhà Hồ, quốc hiệu Đại Ngu
54. 1402 — Chiêm Thành dâng Chiêm Động, Cổ Lũy (Thăng Hoa) *(mới)*
55. 1407 — Minh thuộc
56. 1409–1413 — Nhà Hậu Trần kháng Minh *(mới)*
57. 1418 — Khởi nghĩa Lam Sơn *(mới)*
58. 1425–1426 — Lam Sơn làm chủ Nghệ An đến Thuận Hóa *(mới)*
59. 1428 — Lê Lợi lập nhà Hậu Lê
60. 1471 — Chinh phạt Vijaya; lập thừa tuyên Quảng Nam
61. 1479 — Đánh Bồn Man, lập phủ Trấn Ninh *(mới)*
62. 1527 — Mạc Đăng Dung lập nhà Mạc
63. 1533 — Nam – Bắc triều
64. 1540 — Nhà Mạc cắt đất vùng biên cho nhà Minh *(mới)*
65. 1558 — Nguyễn Hoàng trấn thủ Thuận Hóa
66. 1570 — Nguyễn Hoàng kiêm trấn Quảng Nam *(mới)*
67. 1592 — Nhà Mạc rút lên Cao Bằng
68. 1600 — Nguyễn Hoàng về hẳn Thuận Quảng *(mới)*
69. 1611 — Lập phủ Phú Yên
70. 1623 — Đặt trạm thu thuế ở Prey Nokor (Sài Gòn) *(mới)*
71. 1627 — Trịnh – Nguyễn phân tranh bắt đầu
72. 1653 — Lập dinh Thái Khang (Khánh Hòa)
73. 1655–1660 — Quân Nguyễn vượt sông Gianh, chiếm nam Nghệ An *(mới)*
74. 1658 — Chân Lạp thần phục chúa Nguyễn (Mô Xoài) *(mới)*
75. 1672 — Hưu chiến, sông Gianh làm ranh giới *(mới)*
76. 1674 — Chân Lạp chia hai vua, phó vương ở Prey Nokor *(mới)*
77. 1677 — Họ Trịnh dứt nhà Mạc ở Cao Bằng *(mới)*
78. 1679 — Di thần nhà Minh vào Biên Hòa, Mỹ Tho *(mới)*
79. 1692 — Chúa Nguyễn đánh Chiêm Thành (Bà Tranh) *(mới)*
80. 1697 — Lập phủ Bình Thuận, trấn Thuận Thành
81. 1698 — Nguyễn Hữu Cảnh lập phủ Gia Định
82. 1708 — Mạc Cửu dâng đất Hà Tiên
83. 1732 — Lập dinh Long Hồ
84. 1739 — Hà Tiên mở các đạo Long Xuyên, Kiên Giang *(mới)*
85. 1756 — Chân Lạp dâng Tầm Bôn, Lôi Lạp *(mới)*
86. 1757 — Nhận Tầm Phong Long, hoàn tất vùng Tây Nam Bộ
87. 1771 — Khởi nghĩa Tây Sơn; Xiêm đánh Hà Tiên *(mới)*
88. 1773 — Tây Sơn chiếm thành Quy Nhơn *(mới)*
89. 1775 — Quân Trịnh chiếm Phú Xuân *(mới)*
90. 1777 — Tây Sơn chiếm Gia Định, chúa Nguyễn mất *(mới)*
91. 1778 — Nguyễn Nhạc xưng đế (Thái Đức)
92. 1783 — Nguyễn Ánh chạy sang Xiêm *(mới)*
93. 1785 — Trận Rạch Gầm – Xoài Mút *(mới)*
94. 1786 — Tây Sơn diệt họ Trịnh; ba anh em chia đất *(mới)*
95. 1788 — Quang Trung lên ngôi; Nguyễn Ánh lấy lại Gia Định
96. 1789 — Trận Ngọc Hồi – Đống Đa, nhà Lê chấm dứt *(mới)*
97. 1793 — Nguyễn Ánh giữ Diên Khánh; Nguyễn Nhạc mất *(mới)*
98. 1799 — Nguyễn Ánh lấy thành Quy Nhơn *(mới)*
99. 1801 — Nguyễn Ánh lấy Phú Xuân *(mới)*
100. 1802 — Nhà Nguyễn thống nhất đất nước
101. 1804 — Quốc hiệu Việt Nam *(mới)*
102. 1813 — Bảo hộ Chân Lạp, đưa Nặc Ông Chân về nước *(mới)*
103. 1816 — Gia Long cho cắm mốc ở Hoàng Sa
104. 1828 — Sáp nhập Trấn Ninh, Cam Lộ sau chiến tranh với Vạn Tượng *(mới)*
105. 1832 — Minh Mạng lập các tỉnh, bỏ Gia Định thành, Bắc thành *(mới)*
106. 1834 — Lập Trấn Tây thành ở Chân Lạp
107. 1838 — Quốc hiệu Đại Nam *(mới)*
108. 1841 — Rút khỏi Trấn Tây thành
109. 1847 — Hòa ước Xiêm – Việt, Chân Lạp thần phục cả hai *(mới)*
110. 1858 — Liên quân Pháp – Tây Ban Nha đánh Đà Nẵng *(mới)*
111. 1859 — Pháp chiếm thành Gia Định *(mới)*
112. 1862 — Hòa ước Nhâm Tuất: mất ba tỉnh miền Đông
113. 1863 — Pháp bảo hộ Campuchia *(mới)*
114. 1867 — Pháp chiếm ba tỉnh miền Tây Nam Kỳ
115. 1874 — Hòa ước Giáp Tuất *(mới)*
116. 1884 — Hòa ước Giáp Thân: Pháp bảo hộ Bắc Kỳ, Trung Kỳ *(mới)*
117. 1885 — Hòa ước Thiên Tân; phong trào Cần Vương *(mới)*
118. 1887 — Liên bang Đông Dương; Công ước Pháp – Thanh
119. 1893 — Xiêm nhượng tả ngạn Mê Kông, Lào vào Đông Dương *(mới)*
120. 1895 — Công ước bổ sung về biên giới Pháp – Thanh *(mới)*
121. 1899 — Pháp thuê Quảng Châu Loan *(mới)*
122. 1907 — Xiêm trả Battambang, Siem Reap cho Campuchia *(mới)*
123. 1933 — Pháp sáp nhập Trường Sa vào tỉnh Bà Rịa *(mới)*
124. 1940–1941 — Nhật vào Đông Dương; Thái Lan chiếm đất Lào, Campuchia *(mới)*
125. 3/1945 — Nhật đảo chính Pháp; Đế quốc Việt Nam
126. 9/1945 — Việt Nam Dân chủ Cộng hòa
127. 1946 — Cộng hòa tự trị Nam Kỳ; Thái Lan trả đất *(mới)*
128. 1948 — Xứ Thái tự trị *(mới)*
129. 1949 — Quốc gia Việt Nam
130. 1950 — Hoàng triều Cương thổ *(mới)*
131. 1953 — Campuchia và Lào độc lập hoàn toàn *(mới)*
132. 1954 — Hiệp định Genève, vĩ tuyến 17
133. 1955 — Việt Nam Cộng hòa
134. 1956 — Trung Quốc chiếm nhóm An Vĩnh (Hoàng Sa) *(mới)*
135. 1960 — Mặt trận Dân tộc Giải phóng miền Nam *(mới)*
136. 11/1963 — Đảo chính 1/11/1963, kết thúc Đệ nhất Cộng hòa *(mới)*
137. 1965 — Quân đội Mỹ trực tiếp tham chiến *(mới)*
138. 1967 — Hiến pháp 1967, Đệ nhị Cộng hòa *(mới)*
139. 1968 — Sự kiện Tết Mậu Thân *(mới)*
140. 1969 — Chính phủ Cách mạng lâm thời CHMNVN
141. 1970 — Cộng hòa Khmer thành lập; chiến sự lan sang Campuchia *(mới)*
142. 1972 — Chiến sự Quảng Trị năm 1972 *(mới)*
143. 1973 — Hiệp định Paris *(mới)*
144. 1974 — Hoàng Sa bị chiếm
145. 3/1975 — Chiến dịch Tây Nguyên, Huế – Đà Nẵng *(mới)*
146. 30/4/1975 — Kết thúc chiến tranh
147. 1976 — Cộng hòa Xã hội chủ nghĩa Việt Nam
148. 1979 — CHND Campuchia; chiến tranh biên giới phía Bắc *(mới)*
149. 1988 — Sự kiện Gạc Ma (Trường Sa) *(mới)*
150. 1993 — Vương quốc Campuchia tái lập *(mới)*
151. 1999 — Hiệp ước biên giới trên đất liền Việt – Trung *(mới)*
152. 2025 — Ngày nay

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
   Danh mục nguồn chi tiết theo từng thời kỳ nằm ở mục 6a.
2. Ô không chắc chắn được gắn `confidence: 'low'`.
3. Cờ lấy từ Wikimedia Commons, ghi rõ giấy phép từng file.
4. Xuất bảng tóm tắt (`docs/history-review.md`) để **người dùng duyệt nội dung trước khi phát hành**.

## 6a. Nguồn tham khảo theo thời kỳ

Agent nghiên cứu ưu tiên các nguồn dưới đây. Mỗi mốc vẫn cần ≥2 nguồn, Wikipedia không được là một trong hai nguồn bắt buộc.

| Thời kỳ | Chính sử, văn bản gốc | Chuyên khảo |
|---|---|---|
| Tiền sử → Bắc thuộc | *Đại Việt sử ký toàn thư* (Ngoại kỷ); *Khâm định Việt sử thông giám cương mục* | *Lịch sử Việt Nam*, tập 1–2 (Viện Sử học); Keith W. Taylor, *The Birth of Vietnam* (1983); Hà Văn Tấn (chủ biên), *Khảo cổ học Việt Nam* |
| Lâm Ấp, Chăm Pa, Phù Nam, Chân Lạp | — | Michael Vickery, *Champa Revised* (2005); Georges Maspero, *Le royaume de Champa* (1928); David Chandler, *A History of Cambodia* |
| Ngô → Lê sơ | *Đại Việt sử ký toàn thư* (Bản kỷ); *An Nam chí lược* (Lê Tắc) | *Lịch sử Việt Nam*, tập 2–3; Keith W. Taylor, *A History of the Vietnamese* (2013) |
| Mạc, Trịnh – Nguyễn, Nam tiến | *Đại Nam thực lục tiền biên*; *Phủ biên tạp lục* (Lê Quý Đôn, 1776); *Gia Định thành thông chí* (Trịnh Hoài Đức) | Phan Khoang, *Việt sử xứ Đàng Trong* (1969); Li Tana, *Nguyễn Cochinchina* (1998); [Khoa Lịch sử ĐH Khoa học Thái Nguyên — Lịch sử mở rộng lãnh thổ về phía Nam (1009–1847)](https://lichsu.tnus.edu.vn/chi-tiet/712-Lich-su-mo-rong-lanh-tho-ve-phia-Nam-cua-Viet-Nam--1009-1847) |
| Tây Sơn | *Đại Nam thực lục chính biên* (kỷ thứ nhất); *Hoàng Lê nhất thống chí* (tham khảo, là tiểu thuyết lịch sử) | George Dutton, *The Tây Sơn Uprising* (2006); Tạ Chí Đại Trường, *Lịch sử nội chiến ở Việt Nam 1771–1802* |
| Nhà Nguyễn | *Đại Nam thực lục chính biên*; *Đại Nam nhất thống chí*; [Mộc bản triều Nguyễn](https://mocban.vn/hoang-sa-truong-sa-bien-dao-thieng-lieng/) | Choi Byung Wook, [*Southern Vietnam under the Reign of Minh Mạng*](https://www.cornellpress.cornell.edu/book/9780877271383/southern-vietnam-under-the-reign-of-minh-mang-18201841/) (2004); Trần Trọng Kim, *Việt Nam sử lược* (1920) |
| Pháp thuộc | Văn bản các hòa ước 1862, 1874, 1884, Công ước Pháp – Thanh 1887 và 1895 | Pierre Brocheux & Daniel Hémery, *Indochina: An Ambiguous Colonization*; Martin Stuart-Fox, *A History of Laos* |
| 1945 – nay | Văn bản Hiệp định Genève 1954, Hiệp định Paris 1973, [Hiệp ước biên giới trên đất liền Việt – Trung 1999](https://mofa.gov.vn/tin-chi-tiet/chi-tiet/hoan-thanh-phan-gioi-cam-moc-bien-gioi-dat-lien-viet-nam-trung-quoc-su-kien-lich-su-trong-dai--589.html) | *Lịch sử Việt Nam*, tập 10–15; tư liệu của Ủy ban Biên giới quốc gia và [Bộ đội Biên phòng](http://bienphongvietnam.gov.vn/tong-quan-ve-bien-gioi-tren-dat-lien-viet-nam-trung-quoc.html) |
| Hoàng Sa, Trường Sa | *Phủ biên tạp lục*; *Đại Nam thực lục*; châu bản triều Nguyễn | Tư liệu của Bộ Ngoại giao và Ủy ban Biên giới quốc gia |

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
| P3 | Toàn bộ `polities`, `groups`, 152 `snapshots`, cờ SVG, `history-review.md` | **song song với P1–P2** (chỉ phụ thuộc vào danh sách id ô của P1) |
| P4 | Mobile, hiệu năng, a11y, trang ghi công, code review, người dùng duyệt nội dung | cuối cùng |

## 9. Ngoài phạm vi

- Thanh thời gian theo từng năm hoặc nội suy giữa các mốc
- Đa ngôn ngữ (chỉ để sẵn cấu trúc dữ liệu cho việc này)
- Quay video, chế độ phim tự động có dựng cảnh
- Mũi tên chiến dịch quân sự, địa danh 3D dạng diorama
- Backend hoặc CMS (dữ liệu là file tĩnh)
