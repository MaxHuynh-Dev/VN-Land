import type { Snapshot, Source } from '../types';

/*
 * Task C4 — mốc Hồ, Minh thuộc, Hậu Trần, Lam Sơn, Lê sơ, Mạc, Nam – Bắc triều (1400 → 1592),
 * 15 mốc, các thời kỳ ho-minh → le-so → mac.
 *
 * File này tự đứng một mình: mốc đầu (`1400`) có `'*': null` và gán đầy đủ, tiếp nối đúng trạng
 * thái cuối của file 03-ngo-ly-tran.ts (mốc `1371`, yearLabel 1371–1390): Bắc Bộ + Thanh – Nghệ –
 * Tĩnh + Cao Bằng + Lạng Sơn cùng nhóm ba-chau-1069, chau-o, chau-ly thuộc nhà Trần (ở đây kế
 * thừa sang nhà Hồ); Đà Nẵng, Quảng Nam, Quảng Ngãi, Bình Định cùng nhóm kauthara, panduranga
 * thuộc Chăm Pa; Nam Bộ + Campuchia thuộc Đế quốc Khmer (Angkor); Lào thuộc Lan Xang; Quảng Đông –
 * Quảng Tây – Hải Nam thuộc nhà Minh.
 *
 * Khác với 03-ngo-ly-tran.ts: file này tách riêng xứ Bồn Man (nhóm `bon-man` mới, xấp xỉ tỉnh
 * Xiengkhouang của Lào ngày nay) ra khỏi Lan Xang ngay từ mốc đầu, vì mốc `1479` của brief mô tả
 * rõ đây là một xứ thần phục luân phiên Đại Việt/Lan Xang, bị Đại Việt chinh phục và lập phủ Trấn
 * Ninh — nếu gộp chung vào Lan Xang từ đầu sẽ không thể hiện được sự kiện này.
 *
 * Quy ước viết tắt vùng dùng nhiều lần trong file này:
 * - BAC_BO_DONG_BANG: 10 tỉnh đồng bằng sông Hồng (không gồm Thanh – Nghệ – Tĩnh).
 * - BAC_BO_NUI: các tỉnh miền núi, trung du Bắc Bộ + Quảng Ninh, Hải Phòng, Bắc Giang (nội dung
 *   giống nhóm bac-bo-nui, nhưng liệt kê trực tiếp bằng selector ADM1 thay vì dùng 'group:
 *   bac-bo-nui' — xem chú thích tại hằng số này trong file để biết lý do).
 * - BAC_BO = BAC_BO_DONG_BANG + BAC_BO_NUI.
 * - THANH_HOA, NGHE_HA (Nghệ An + Hà Tĩnh), THANH_NGHE_TINH = THANH_HOA + NGHE_HA.
 * - THUAN_HOA: nhóm ba-chau-1069 + chau-o + chau-ly (Quảng Bình, Quảng Trị, Thừa Thiên Huế).
 * - QUANG_NAM_QUANG_NGAI_DA_NANG: Đà Nẵng, Quảng Nam, Quảng Ngãi (lộ Thăng Hoa cũ 1402–1407).
 * - QUANG_NAM_THUA_TUYEN = QUANG_NAM_QUANG_NGAI_DA_NANG + Bình Định (thừa tuyên Quảng Nam 1471).
 * - KAUTHARA_PANDURANGA: nhóm kauthara + panduranga (Phú Yên – Khánh Hòa, Ninh Thuận – Bình
 *   Thuận), vẫn thuộc Chăm Pa trong suốt thời kỳ này.
 * - CAO_BANG: chọn riêng để có thể tách khỏi BAC_BO_NUI khi cần (mốc `1592`).
 * - BON_MAN: nhóm bon-man mới (xấp xỉ Xiengkhouang, Lào).
 * - MAC_BIEN_GIOI_1540: nhóm mac-cat-dat-1540 mới (dải động biên giới nhà Mạc xin dâng nhà Minh).
 * - LINH_NAM: nhóm linh-nam-trung-hoa + CHN.hai-nam (Quảng Đông, Quảng Tây, Hải Nam).
 * - CAMPUCHIA_NAM_BO: KHM + nhóm nam-bo.
 *
 * Nhóm mới khai báo trong groups.ts cho task này:
 * - bon-man: LAO.xiangkhouang, xấp xỉ xứ Bồn Man/phủ Trấn Ninh.
 * - mac-cat-dat-1540: 5 huyện biên giới Quảng Ninh (Móng Cái, Hải Hà, Bình Liêu) và Lạng Sơn
 *   (Tràng Định, Văn Lãng), xấp xỉ khu vực "hai đô, bốn động" nhà Mạc xin dâng nhà Minh năm 1540;
 *   vị trí chính xác gây tranh cãi trong giới nghiên cứu (xem ghi chú mốc `1540`).
 *
 * Sửa altName trong polities.ts (theo yêu cầu review C1b): id `bon-man` có altName
 * "Trấn Ninh (từ 1756)" không rõ nguồn; sửa thành "Trấn Ninh (từ 1479)" theo Đại Việt sử ký toàn
 * thư/Khâm định Việt sử thông giám cương mục về chiến dịch Lê Thánh Tông bình Bồn Man, lập phủ
 * Trấn Ninh năm 1479 (xem báo cáo task để biết chi tiết đối chiếu nguồn).
 *
 * Không có mốc nào trong bảng gốc của brief phải sửa year/yearLabel — toàn bộ 15 mốc đối chiếu với
 * Đại Việt sử ký toàn thư, Khâm định Việt sử thông giám cương mục và Lịch sử Việt Nam tập 3 đều
 * khớp với bảng.
 *
 * Các điểm cân nhắc khác (xem báo cáo task để biết chi tiết nguồn):
 * - Mốc `1407` (Minh thuộc): Chiêm Thành nhiều lần đánh chiếm lại một phần Thăng Hoa – Tư Nghĩa
 *   trong 20 năm Minh thuộc nên vùng này đánh dấu lowConfidence xuyên suốt 1407–1425.
 * - Mốc `1409` (Hậu Trần) chỉ gán Nghệ An – Hà Tĩnh và Thuận Hóa theo đúng phạm vi nêu trong brief,
 *   không gồm Thanh Hóa (căn cứ ban đầu của Giản Định Đế ở Ninh Bình, không phải Thanh Hóa).
 * - Mốc `1418`: nhà Hậu Trần đã sụp đổ từ cuối 1413 – đầu 1414 nên vùng Nghệ An – Hà Tĩnh – Thuận
 *   Hóa trở lại tay nhà Minh trước khi Lê Lợi dựng cờ khởi nghĩa; giai đoạn đầu khởi nghĩa (1418–
 *   1423) chỉ là du kích trong rừng núi Thanh Hóa, chưa làm chủ vùng đất nào ổn định nên không
 *   tách riêng trên bản đồ.
 * - Mốc `1425` gộp cả việc Chiêm Thành chiếm lại Thăng Hoa – Tư Nghĩa (lowConfidence) diễn ra
 *   cùng giai đoạn hỗn loạn cuối thời Minh thuộc.
 * - Mốc `1428`: kèm việc đổi nhãn Khmer từ `khmer` (Angkor) sang `campuchia-hau-angkor`, vì kinh đô
 *   Angkor bị bỏ khoảng năm 1431 — mốc gần nhất trên dòng thời gian của file này là `1428`.
 * - Mốc `1471`: ranh giới Chăm Pa sau chiến dịch Vijaya được hedge giữa đèo Cù Mông (ranh giới
 *   hành chính thực tế của thừa tuyên Quảng Nam, dừng ở Bình Định) và núi Đá Bia/đèo Cả (bia đá
 *   đánh dấu cực nam cuộc chinh phạt, ranh giới Phú Yên – Khánh Hòa ngày nay); bản đồ chỉ sáp nhập
 *   tới Bình Định, Phú Yên vẫn thuộc Kauthara của Chăm Pa.
 * - Mốc `1533`: triều đình Lê Trang Tông được lập tại Sầm Châu (Ai Lao, nay thuộc Lào), ngoài
 *   phạm vi các ô bản đồ Việt Nam, nên đây là mốc chỉ có sự kiện, `assign: {}`.
 * - Mốc `1540`: nhiều nhà nghiên cứu hiện đại (đối chiếu sử liệu Minh với Đại Việt sử ký toàn thư)
 *   nghi ngờ việc "cắt đất" phần lớn chỉ là thủ đoạn ngoại giao, không có chuyển giao lãnh thổ thực
 *   chất; nhóm `mac-cat-dat-1540` chỉ mang tính minh họa, đánh dấu lowConfidence toàn bộ.
 * - Mốc `1558`: gộp cả việc Nam triều (Trịnh Kiểm) thu hồi Thanh Hóa – Nghệ An – Hà Tĩnh từ năm
 *   1543 (không có mốc riêng) và phủ Trấn Ninh theo về Nam triều cùng giai đoạn, đều lowConfidence
 *   vì không có niên đại chính xác.
 * - Mốc `1570`: việc gộp thừa tuyên Quảng Nam vào quyền trấn thủ của Nguyễn Hoàng chỉ là một thay
 *   đổi nhân sự trong nội bộ Nam triều; thời điểm Quảng Nam thực sự thoát khỏi tay nhà Mạc để về
 *   Nam triều không rõ ràng nên bản đồ đánh dấu đổi chủ đúng vào năm 1570, kèm lowConfidence.
 * - Nhóm `mac-cat-dat-1540` không được trả lại nhà Minh — hay đúng hơn không được xác nhận trả lại
 *   Đại Việt — trong phạm vi 15 mốc của file này nên vẫn giữ nguyên `nha-minh` tới hết mốc `1592`
 *   (ghi đè lên các tỉnh Quảng Ninh, Lạng Sơn trong BAC_BO_NUI ở mốc đó, đúng theo độ cụ thể của
 *   selector 'group:').
 * - Fix trong lúc kiểm tra bằng mắt: bản nháp đầu của mốc `1592` dùng selector `'group:bac-bo-nui'`
 *   cho phần lớn Bắc Bộ rồi ghi đè riêng Cao Bằng bằng `'VNM.cao-bang'` — nhưng vì engine luôn coi
 *   mọi selector `'group:'` có độ cụ thể cao hơn selector ADM1 (xem `selectorSpecificity` trong
 *   `src/modules/HistoryMap/lib/resolve.ts`), nhóm rộng hơn ghi đè ngược lại lên Cao Bằng, khiến ô
 *   này hiện sai thành `le-trung-hung` thay vì `mac-cao-bang` (phát hiện qua việc mở `/?y=1592` và
 *   thấy "Nhà Mạc ở Cao Bằng" không xuất hiện trong danh sách chính thể). Đã sửa bằng cách liệt kê
 *   trực tiếp các tỉnh của BAC_BO_NUI thay vì dùng selector nhóm (xem chú thích tại hằng số đó).
 */

const TOAN_THU: Source = { title: 'Đại Việt sử ký toàn thư', note: 'Bản kỷ' };
const CUONG_MUC: Source = { title: 'Khâm định Việt sử thông giám cương mục' };
const LSVN3: Source = {
  title: 'Lịch sử Việt Nam, tập 3 (từ thế kỷ XV đến thế kỷ XVI)',
  author: 'Viện Sử học',
  note: 'NXB Khoa học xã hội, 2017'
};
const LSVN4: Source = {
  title: 'Lịch sử Việt Nam, tập 4 (từ thế kỷ XVII đến thế kỷ XVIII)',
  author: 'Viện Sử học',
  note: 'NXB Khoa học xã hội, 2017'
};
const MINH_SU: Source = { title: 'Minh sử' };
const VICKERY_CHAMPA: Source = {
  title: 'Champa Revised',
  author: 'Michael Vickery',
  note: 'ARI Working Paper 37, 2005'
};
const CHANDLER: Source = { title: 'A History of Cambodia', author: 'David Chandler' };
const STUART_FOX: Source = {
  title: 'A History of Laos',
  author: 'Martin Stuart-Fox',
  note: '1997'
};
const PHAN_KHOANG: Source = {
  title: 'Việt sử xứ Đàng Trong',
  author: 'Phan Khoang',
  note: '1967'
};
const LI_TANA: Source = { title: 'Nguyễn Cochinchina', author: 'Li Tana', note: '1998' };

const BAC_BO_DONG_BANG = [
  'VNM.ha-noi',
  'VNM.bac-ninh',
  'VNM.hung-yen',
  'VNM.hai-duong',
  'VNM.ha-nam',
  'VNM.nam-dinh',
  'VNM.thai-binh',
  'VNM.ninh-binh',
  'VNM.vinh-phuc',
  'VNM.phu-tho'
];
// Liệt kê trực tiếp các tỉnh của nhóm bac-bo-nui (không dùng selector 'group:bac-bo-nui') vì
// engine coi mọi selector 'group:' có độ cụ thể cao hơn selector ADM1 (xem selectorSpecificity
// trong src/modules/HistoryMap/lib/resolve.ts: group = 3, ADM1 = 2) bất kể nhóm đó bao trùm cả
// tỉnh Cao Bằng; nếu dùng 'group:bac-bo-nui' thì ở mốc `1592`, việc gán riêng Cao Bằng cho
// mac-cao-bang bằng selector VNM.cao-bang (độ cụ thể 2) sẽ bị nhóm rộng hơn (độ cụ thể 3) ghi đè
// ngược lại thành le-trung-hung. Liệt kê trực tiếp giữ các selector ở cùng độ cụ thể ADM1, để
// selector VNM.cao-bang trùng khóa và ghi đè đúng theo thứ tự khai báo trong object.
const BAC_BO_NUI = [
  'VNM.ha-giang',
  'VNM.cao-bang',
  'VNM.bac-kan',
  'VNM.lang-son',
  'VNM.tuyen-quang',
  'VNM.thai-nguyen',
  'VNM.yen-bai',
  'VNM.lao-cai',
  'VNM.lai-chau',
  'VNM.dien-bien',
  'VNM.son-la',
  'VNM.hoa-binh',
  'VNM.quang-ninh',
  'VNM.bac-giang',
  'VNM.hai-phong'
];
const BAC_BO = [...BAC_BO_DONG_BANG, ...BAC_BO_NUI];
const THANH_HOA = ['VNM.thanh-hoa'];
const NGHE_HA = ['VNM.nghe-an', 'VNM.ha-tinh'];
const THANH_NGHE_TINH = [...THANH_HOA, ...NGHE_HA];
const THUAN_HOA = ['group:ba-chau-1069', 'group:chau-o', 'group:chau-ly'];
const QUANG_NAM_QUANG_NGAI_DA_NANG = ['VNM.da-nang', 'VNM.quang-nam', 'VNM.quang-ngai'];
const BINH_DINH = ['VNM.binh-dinh'];
const QUANG_NAM_THUA_TUYEN = [...QUANG_NAM_QUANG_NGAI_DA_NANG, ...BINH_DINH];
const KAUTHARA_PANDURANGA = ['group:kauthara', 'group:panduranga'];
const CAO_BANG = ['VNM.cao-bang'];
const BON_MAN = ['group:bon-man'];
const MAC_BIEN_GIOI_1540 = ['group:mac-cat-dat-1540'];
const LINH_NAM = ['group:linh-nam-trung-hoa', 'CHN.hai-nam'];
const CAMPUCHIA_NAM_BO = ['KHM', 'group:nam-bo'];

const assignAll = (selectors: string[], polity: string) =>
  Object.fromEntries(selectors.map((s) => [s, polity]));

export const HO_LE_MAC: Snapshot[] = [
  {
    id: '1400',
    year: 1400,
    yearLabel: '1400',
    era: 'ho-minh',
    title: 'Nhà Hồ, quốc hiệu Đại Ngu',
    summary:
      'Đầu năm 1400, sau nhiều năm nắm thực quyền dưới triều Trần, Hồ Quý Ly phế truất vua Trần Thiếu Đế, tự lên ngôi, đổi quốc hiệu từ Đại Việt thành Đại Ngu và dời đô vào thành Tây Đô mới xây ở An Tôn (Vĩnh Lộc, Thanh Hóa); cuối năm ông nhường ngôi cho con là Hồ Hán Thương, lui làm Thái thượng hoàng. Lãnh thổ được kế thừa nguyên vẹn từ nhà Trần: Bắc Bộ, Thanh – Nghệ – Tĩnh, Thuận Hóa (Quảng Bình, Quảng Trị, Thừa Thiên Huế), Cao Bằng, Lạng Sơn; phía nam từ Quảng Nam đến Bình Định cùng dải Kauthara, Panduranga xa hơn vẫn thuộc Chăm Pa. Phía tây, xứ Bồn Man (vùng Xiêng Khoảng) tiếp tục là một xứ thần phục luân phiên cả Đại Ngu lẫn Lan Xang, không thuộc hẳn bên nào.',
    assign: {
      '*': null,
      ...assignAll(BAC_BO, 'nha-ho'),
      ...assignAll(THANH_NGHE_TINH, 'nha-ho'),
      ...assignAll(THUAN_HOA, 'nha-ho'),
      LAO: 'lan-xang',
      ...assignAll(BON_MAN, 'bon-man'),
      ...assignAll(QUANG_NAM_QUANG_NGAI_DA_NANG, 'champa'),
      ...assignAll(BINH_DINH, 'champa'),
      ...assignAll(KAUTHARA_PANDURANGA, 'champa'),
      ...assignAll(LINH_NAM, 'nha-minh'),
      ...assignAll(CAMPUCHIA_NAM_BO, 'khmer')
    },
    lowConfidence: [...BON_MAN],
    focus: { lon: 105.55, lat: 19.87 },
    sources: [TOAN_THU, CUONG_MUC, LSVN3]
  },
  {
    id: '1402',
    year: 1402,
    yearLabel: '1402',
    era: 'ho-minh',
    title: 'Chiêm Thành dâng Chiêm Động, Cổ Lũy (Thăng Hoa)',
    summary:
      'Năm 1402, Hồ Hán Thương đem quân đánh Chiêm Thành; vua Chiêm là Ba Đích Lại (Jaya Simhavarman V) xin dâng đất Chiêm Động (sau chia thành châu Thăng, châu Hoa) để cầu hòa, nhưng Hồ Quý Ly không chấp thuận, buộc dâng thêm cả Cổ Lũy (sau chia thành châu Tư, châu Nghĩa). Nhà Hồ đặt lộ Thăng Hoa cai quản vùng đất mới, đại thể tương ứng Đà Nẵng, Quảng Nam và Quảng Ngãi ngày nay, cho di dân từ Bắc Bộ vào khai khẩn; ranh giới phía nam vẫn giáp Vijaya (Bình Định), còn thuộc Chăm Pa.',
    assign: assignAll(QUANG_NAM_QUANG_NGAI_DA_NANG, 'nha-ho'),
    lowConfidence: [...QUANG_NAM_QUANG_NGAI_DA_NANG],
    focus: { lon: 108.22, lat: 15.85 },
    sources: [TOAN_THU, CUONG_MUC, LSVN3]
  },
  {
    id: '1407',
    year: 1407,
    yearLabel: '1407',
    era: 'ho-minh',
    title: 'Minh thuộc',
    summary:
      'Tháng 6/1407, quân Minh do Trương Phụ, Mộc Thạnh chỉ huy bắt được cha con Hồ Quý Ly, Hồ Hán Thương ở vùng biển Hà Tĩnh, nhà Hồ sụp đổ sau đúng 7 năm tồn tại. Nhà Minh bãi bỏ quốc hiệu Đại Ngu, đặt lại thành quận Giao Chỉ, cai trị trực tiếp bằng quan lại nhà Minh trên toàn bộ lãnh thổ Đại Ngu cũ — kể cả lộ Thăng Hoa vừa lấy được từ Chiêm Thành năm 1402 — mở đầu 20 năm Minh thuộc. Trong suốt giai đoạn này, Chiêm Thành nhiều lần đem quân đánh chiếm lại một phần vùng Thăng Hoa – Tư Nghĩa, khiến quyền kiểm soát thực tế của nhà Minh ở dải đất phía nam này không liên tục.',
    assign: assignAll(
      [...BAC_BO, ...THANH_NGHE_TINH, ...THUAN_HOA, ...QUANG_NAM_QUANG_NGAI_DA_NANG],
      'nha-minh'
    ),
    lowConfidence: [...QUANG_NAM_QUANG_NGAI_DA_NANG],
    focus: { lon: 105.85, lat: 21.03 },
    sources: [TOAN_THU, CUONG_MUC, MINH_SU, LSVN3]
  },
  {
    id: '1409',
    year: 1409,
    yearLabel: '1409–1413',
    era: 'ho-minh',
    title: 'Nhà Hậu Trần kháng Minh',
    summary:
      'Tháng 10/1407, Trần Ngỗi (con vua Trần Nghệ Tông) xưng đế ở Yên Mô (Ninh Bình), hiệu Giản Định Đế, mở đầu nhà Hậu Trần kháng Minh. Năm 1409, sau khi Giản Định Đế nghe lời gièm pha giết oan hai tướng Đặng Tất và Nguyễn Cảnh Chân, con của họ là Đặng Dung và Nguyễn Cảnh Dị đem quân về Nghệ An, lập Trần Quý Khoáng lên ngôi, hiệu Trùng Quang Đế. Từ căn cứ Nghệ An, Trùng Quang Đế kiểm soát dải đất kéo xuống Thuận Hóa (Quảng Bình, Quảng Trị, Thừa Thiên Huế ngày nay) trong các năm 1409–1413, trong khi quân Minh vẫn làm chủ Đông Đô (Thăng Long), Bắc Bộ và Thanh Hóa. Cuối năm 1413 – đầu 1414, Trương Phụ đem đại quân vào nam đánh bại hoàn toàn lực lượng kháng chiến, bắt được Trùng Quang Đế, nhà Hậu Trần diệt vong.',
    assign: assignAll([...NGHE_HA, ...THUAN_HOA], 'hau-tran'),
    lowConfidence: [...THUAN_HOA],
    focus: { lon: 105.75, lat: 18.7 },
    sources: [TOAN_THU, CUONG_MUC, LSVN3]
  },
  {
    id: '1418',
    year: 1418,
    yearLabel: '1418',
    era: 'ho-minh',
    title: 'Khởi nghĩa Lam Sơn',
    summary:
      'Sau khi tiêu diệt hoàn toàn nhà Hậu Trần cuối 1413 – đầu 1414, quân Minh khôi phục quyền kiểm soát trên toàn bộ Giao Chỉ. Đầu năm 1418 (Tết Mậu Tuất), Lê Lợi — một hào trưởng ở Lam Sơn (Thọ Xuân, Thanh Hóa) — dựng cờ khởi nghĩa, xưng Bình Định Vương, mở đầu cuộc kháng chiến kéo dài 10 năm. Trong giai đoạn đầu (1418–1423), nghĩa quân Lam Sơn chủ yếu hoạt động du kích trong vùng rừng núi phía tây Thanh Hóa, nhiều lần bị vây khốn (ba lần phải rút lên núi Chí Linh) và chưa làm chủ ổn định một vùng đất nào, nên trên bản đồ hành chính khu vực Nghệ An, Hà Tĩnh và Thuận Hóa vẫn thuộc quyền nhà Minh như trước khởi nghĩa.',
    assign: assignAll([...NGHE_HA, ...THUAN_HOA], 'nha-minh'),
    lowConfidence: [...NGHE_HA, ...THUAN_HOA],
    focus: { lon: 105.5, lat: 19.95 },
    sources: [TOAN_THU, CUONG_MUC, LSVN3]
  },
  {
    id: '1425',
    year: 1425,
    yearLabel: '1425–1426',
    era: 'ho-minh',
    title: 'Lam Sơn làm chủ Nghệ An đến Thuận Hóa',
    summary:
      'Theo kế "vào Nghệ An làm đất đứng chân" của Nguyễn Chích, từ năm 1424 Lê Lợi chuyển hướng nam tiến, lần lượt hạ các thành Đa Căng, Trà Lân rồi làm chủ Nghệ An; sang năm 1425, nghĩa quân giải phóng nốt Diễn Châu, Thanh Hóa, đồng thời một cánh quân khác do Trần Nguyên Hãn, Lê Nỗ chỉ huy tiến vào bình định Tân Bình, Thuận Hóa (Quảng Bình, Quảng Trị, Thừa Thiên Huế ngày nay), tạo thành một dải căn cứ liền mạch từ Thanh Hóa tới đèo Hải Vân. Trong lúc quân Minh phải dồn sức cố thủ các thành lũy ở Nghệ An rồi Đông Quan, Chiêm Thành nhân cơ hội hỗn loạn này đem quân chiếm lại phần đất Thăng Hoa – Tư Nghĩa (Quảng Nam, Quảng Ngãi) mà nhà Minh từng quản lý; ranh giới cụ thể trong giai đoạn này không rõ ràng.',
    assign: {
      ...assignAll([...THANH_HOA, ...NGHE_HA, ...THUAN_HOA], 'lam-son'),
      ...assignAll(QUANG_NAM_QUANG_NGAI_DA_NANG, 'champa')
    },
    lowConfidence: [...QUANG_NAM_QUANG_NGAI_DA_NANG],
    focus: { lon: 106.7, lat: 17.6 },
    sources: [TOAN_THU, CUONG_MUC, LSVN3, VICKERY_CHAMPA]
  },
  {
    id: '1428',
    year: 1428,
    yearLabel: '1428',
    era: 'le-so',
    title: 'Lê Lợi lập nhà Hậu Lê',
    summary:
      'Cuối năm 1427, sau khi tiêu diệt viện binh Liễu Thăng trong trận Chi Lăng – Xương Giang, nghĩa quân Lam Sơn siết chặt vòng vây thành Đông Quan; tổng binh Minh Vương Thông xin giảng hòa, cùng Lê Lợi lập hội thề Đông Quan (tháng 12/1427) rồi rút quân về nước, chấm dứt 20 năm Minh thuộc. Đầu năm 1428, Lê Lợi lên ngôi hoàng đế, lập nhà Hậu Lê (Lê sơ), khôi phục quốc hiệu Đại Việt, đóng đô ở Đông Kinh (Thăng Long); toàn bộ Bắc Bộ, Thanh – Nghệ – Tĩnh, Thuận Hóa, Cao Bằng, Lạng Sơn quy về một mối. Cùng giai đoạn này ở phía nam, đế quốc Khmer suy yếu và bỏ kinh đô Angkor (khoảng năm 1431) trước sức ép của Ayutthaya, dần chuyển trọng tâm quyền lực xuống vùng hạ lưu Mê Kông.',
    assign: {
      ...assignAll(BAC_BO, 'hau-le'),
      ...assignAll([...THANH_NGHE_TINH, ...THUAN_HOA], 'hau-le'),
      ...assignAll(CAMPUCHIA_NAM_BO, 'campuchia-hau-angkor')
    },
    focus: { lon: 105.85, lat: 21.03 },
    sources: [TOAN_THU, CUONG_MUC, LSVN3, CHANDLER]
  },
  {
    id: '1471',
    year: 1471,
    yearLabel: '1471',
    era: 'le-so',
    title: 'Chinh phạt Vijaya; lập thừa tuyên Quảng Nam',
    summary:
      'Năm 1471, Lê Thánh Tông thân chinh đem đại quân đánh Chiêm Thành, hạ thành Vijaya (Đồ Bàn, nay thuộc An Nhơn, Bình Định), bắt sống vua Trà Toàn — đòn giáng nặng nề nhất vào Chiêm Thành, chấm dứt vai trò vương triều Vijaya. Vùng đất từ đèo Hải Vân đến đèo Cù Mông (Quảng Nam, Quảng Ngãi, Bình Định ngày nay) được sáp nhập, lập thành thừa tuyên Quảng Nam — đạo thừa tuyên thứ 13 trong cải cách hành chính Hồng Đức. Sử chép nhà vua còn cho dựng bia đá trên núi Thạch Bi (Đá Bia) ở đèo Cả, xa hơn về phía nam (ranh giới Phú Yên – Khánh Hòa ngày nay), đánh dấu cực nam cuộc chinh phạt; nhưng đất Phú Yên trên thực tế vẫn do người Chăm ở Kauthara nắm giữ cho tới khi chúa Nguyễn lập phủ Phú Yên năm 1611, nên bản đồ chỉ sáp nhập tới Bình Định. Chăm Pa co cụm về hai xứ còn lại là Kauthara và Panduranga.',
    assign: assignAll(QUANG_NAM_THUA_TUYEN, 'hau-le'),
    focus: { lon: 109.1, lat: 13.95 },
    sources: [TOAN_THU, CUONG_MUC, LSVN3, VICKERY_CHAMPA]
  },
  {
    id: '1479',
    year: 1479,
    yearLabel: '1479',
    era: 'le-so',
    title: 'Đánh Bồn Man, lập phủ Trấn Ninh',
    summary:
      'Xứ Bồn Man (Mường Phuan, vùng Xiêng Khoảng) vốn là một xứ thần phục luân phiên cả Đại Việt và Lan Xang; thổ tù Cầm Công từng thần phục Đại Việt nhưng năm 1478 nổi lên câu kết với Lan Xang, quấy nhiễu vùng biên giới phía tây Nghệ An. Tháng 6/1479, Lê Thánh Tông sai Lê Niệm đem đại quân chinh phạt, đánh tan lực lượng Cầm Công (chết trong lúc chạy trốn), nhân đà thắng còn tiến sâu sang cả đất Lan Xang. Sau chiến dịch, triều đình củng cố phủ Trấn Ninh, do các thổ quan họ Cầm cai quản nhưng thần phục trực tiếp Đại Việt; ranh giới cụ thể của vùng đất này chỉ mang tính ước lệ.',
    assign: assignAll(BON_MAN, 'hau-le'),
    lowConfidence: [...BON_MAN],
    focus: { lon: 103.4, lat: 19.4 },
    sources: [TOAN_THU, CUONG_MUC, LSVN3, STUART_FOX]
  },
  {
    id: '1527',
    year: 1527,
    yearLabel: '1527',
    era: 'mac',
    title: 'Mạc Đăng Dung lập nhà Mạc',
    summary:
      'Từ một võ quan, Mạc Đăng Dung dần thâu tóm quyền lực trong triều Lê sơ vốn đã suy yếu sau nhiều biến loạn cung đình; tháng 6/1527, ông ép vua Lê Cung Hoàng nhường ngôi, lập ra nhà Mạc, vẫn đóng đô ở Thăng Long. Việc chuyển giao diễn ra êm thấm trong nội bộ triều đình, nên toàn bộ lãnh thổ Đại Việt — kể cả phủ Trấn Ninh mới lập năm 1479 — được nhà Mạc kế thừa nguyên vẹn từ nhà Hậu Lê; xung đột vũ trang giữa các phe phái ủng hộ và chống đối nhà Mạc chỉ thực sự bùng nổ vài năm sau.',
    assign: assignAll(
      [...BAC_BO, ...THANH_NGHE_TINH, ...THUAN_HOA, ...QUANG_NAM_THUA_TUYEN, ...BON_MAN],
      'nha-mac'
    ),
    focus: { lon: 105.85, lat: 21.03 },
    sources: [TOAN_THU, CUONG_MUC, LSVN3]
  },
  {
    id: '1533',
    year: 1533,
    yearLabel: '1533',
    era: 'mac',
    title: 'Nam – Bắc triều',
    summary:
      'Năm 1529, cựu tướng nhà Lê là Nguyễn Kim không thần phục nhà Mạc, chạy sang vùng biên giới Ai Lao chiêu tập lực lượng chống đối. Năm 1533, ông tìm được Lê Duy Ninh — con vua Lê Chiêu Tông — lập làm vua tại đất Sầm Châu (vùng Sầm Nưa, nay thuộc Lào), tức Lê Trang Tông, mở đầu thời kỳ Nam – Bắc triều: nhà Mạc ở Thăng Long xưng "Bắc triều", còn triều đình Lê trung hưng lưu vong bên ngoài lãnh thổ xưng "Nam triều". Ở giai đoạn này Nam triều chưa kiểm soát được phần đất nào của Đại Việt, nên trên bản đồ toàn bộ lãnh thổ vẫn do nhà Mạc quản lý như trước.',
    assign: {},
    focus: { lon: 104.85, lat: 20.05 },
    sources: [TOAN_THU, CUONG_MUC, LSVN3]
  },
  {
    id: '1540',
    year: 1540,
    yearLabel: '1540',
    era: 'mac',
    title: 'Nhà Mạc cắt đất vùng biên cho nhà Minh',
    summary:
      'Trước áp lực quân sự và ngoại giao của nhà Minh (lấy cớ họ Mạc cướp ngôi nhà Lê để đem quân áp sát biên giới), năm 1540 Mạc Đăng Dung cùng cháu và tùy tùng tự trói mình, ra ải Nam Quan dâng biểu xin hàng, xin dâng đất hai đô Như Tích, Chiêm Lãng và bốn động Tư Lẫm, Kim Lặc, Cổ Sâm, Liễu Cát ở vùng biên giới Lạng Sơn – Quảng Ninh ngày nay để được nhà Minh phong làm An Nam đô thống sứ. Đối chiếu sử liệu hai bên cho thấy nhiều điểm mâu thuẫn về việc các động này vốn đã thuộc nhà Minh hay của Đại Việt từ trước, nên không ít nhà nghiên cứu hiện nay cho rằng đây phần lớn là một thủ đoạn ngoại giao mang tính hình thức, thực chất mất đất rất ít hoặc không đáng kể; vị trí chính xác của các động này quy về địa giới hành chính hiện đại vẫn còn nhiều tranh cãi.',
    assign: assignAll(MAC_BIEN_GIOI_1540, 'nha-minh'),
    lowConfidence: [...MAC_BIEN_GIOI_1540],
    focus: { lon: 107.6, lat: 21.55 },
    sources: [TOAN_THU, CUONG_MUC, LSVN3]
  },
  {
    id: '1558',
    year: 1558,
    yearLabel: '1558',
    era: 'mac',
    title: 'Nguyễn Hoàng trấn thủ Thuận Hóa',
    summary:
      'Từ năm 1543, dưới sự chỉ huy của Trịnh Kiểm (con rể Nguyễn Kim), quân Nam triều đánh chiếm lại Tây Đô (Thanh Hóa), dần làm chủ Thanh Hóa, Nghệ An, Hà Tĩnh rồi mở xuống Thuận Hóa (Quảng Bình, Quảng Trị, Thừa Thiên Huế), đẩy nhà Mạc lui về cố thủ Bắc Bộ; xứ Trấn Ninh ở phía tây Nghệ An cũng theo về Nam triều trong giai đoạn này. Năm 1558, theo lời khuyên của Trạng Trình Nguyễn Bỉnh Khiêm ("Hoành Sơn nhất đái, vạn đại dung thân"), Nguyễn Hoàng — con thứ của Nguyễn Kim — xin vào trấn thủ Thuận Hóa để tránh bị anh rể Trịnh Kiểm sát hại, mở đầu cơ nghiệp chúa Nguyễn ở Đàng Trong; về danh nghĩa ông vẫn chỉ là một trấn thủ của triều đình Lê trung hưng, hằng năm phải nộp thuế và quân lương ra Thanh Hóa.',
    assign: assignAll([...THANH_NGHE_TINH, ...THUAN_HOA, ...BON_MAN], 'le-trung-hung'),
    lowConfidence: [...THANH_NGHE_TINH, ...BON_MAN],
    focus: { lon: 107.1, lat: 16.75 },
    sources: [TOAN_THU, CUONG_MUC, PHAN_KHOANG, LI_TANA]
  },
  {
    id: '1570',
    year: 1570,
    yearLabel: '1570',
    era: 'mac',
    title: 'Nguyễn Hoàng kiêm trấn Quảng Nam',
    summary:
      'Cuối năm 1569, Nguyễn Hoàng ra Thanh Hóa yết kiến; Trịnh Kiểm — lúc này đã nắm quyền chính trong triều đình Lê trung hưng — trao thêm cho ông ấn tín trấn thủ xứ Quảng Nam (Quảng Nam, Quảng Ngãi, Bình Định ngày nay) từ đầu năm 1570, gộp chung với Thuận Hóa dưới quyền cai quản của Nguyễn Hoàng, thường gọi là "trấn thủ Thuận Quảng". Đây chủ yếu là một thay đổi nhân sự trong nội bộ chính quyền Lê – Trịnh chứ không phải một cuộc chinh phục lãnh thổ mới; thời điểm cụ thể Quảng Nam thoát khỏi tay nhà Mạc để về tay Nam triều trước đó không rõ ràng, nên bản đồ đánh dấu đổi chủ đúng vào năm nhận ấn tín chính thức, 1570.',
    assign: assignAll(QUANG_NAM_THUA_TUYEN, 'le-trung-hung'),
    lowConfidence: [...QUANG_NAM_THUA_TUYEN],
    focus: { lon: 108.1, lat: 15.9 },
    sources: [TOAN_THU, CUONG_MUC, PHAN_KHOANG, LI_TANA]
  },
  {
    id: '1592',
    year: 1592,
    yearLabel: '1592',
    era: 'mac',
    title: 'Nhà Mạc rút lên Cao Bằng',
    summary:
      'Từ năm 1591, Tiết chế Trịnh Tùng (con Trịnh Kiểm) đem đại quân Nam triều ra Bắc, liên tiếp đánh bại quân Mạc; đầu năm 1592 hạ được thành Thăng Long, vua Mạc Mậu Hợp bị bắt và xử tử, nhà Mạc mất quyền cai trị trên phần lớn đất nước sau 65 năm. Con cháu họ Mạc do Mạc Kính Cung, Mạc Toàn cầm đầu chạy lên Cao Bằng, dựa vào thế hiểm trở và sự dung túng ngầm của nhà Minh, tiếp tục xưng vương cát cứ ở đây thêm nhiều thập kỷ nữa. Phần còn lại của Bắc Bộ trở về dưới quyền triều đình Lê trung hưng do họ Trịnh phò tá, hợp nhất với vùng Thanh Hóa – Thuận Quảng đã kiểm soát từ trước; riêng dải đất biên giới Mạc từng xin dâng năm 1540 không có ghi chép về việc được trả lại trong giai đoạn này.',
    assign: {
      ...assignAll(BAC_BO_DONG_BANG, 'le-trung-hung'),
      ...assignAll(BAC_BO_NUI, 'le-trung-hung'),
      ...assignAll(CAO_BANG, 'mac-cao-bang'),
      ...assignAll(MAC_BIEN_GIOI_1540, 'nha-minh')
    },
    focus: { lon: 105.85, lat: 21.03 },
    sources: [TOAN_THU, CUONG_MUC, LSVN4]
  }
];
