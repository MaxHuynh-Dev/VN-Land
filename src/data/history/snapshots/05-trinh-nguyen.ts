import type { Snapshot, Source } from '../types';

/*
 * Task C5 — mốc Trịnh – Nguyễn phân tranh và Nam tiến (1600 → 1757), 19 mốc, era trinh-nguyen.
 *
 * File này tự đứng một mình: mốc đầu (`1600`) có `'*': null` và gán đầy đủ, tiếp nối đúng trạng
 * thái cuối của file 04-ho-le-mac.ts (mốc `1592`): Bắc Bộ (trừ Cao Bằng) + Thanh – Nghệ – Tĩnh +
 * xứ Bồn Man (Xiêng Khoảng) thuộc Lê trung hưng; Cao Bằng thuộc nhà Mạc; Lưỡng Quảng – Hải Nam thuộc nhà Minh; Quảng Bình → Bình Định (Nguyễn Hoàng
 * trấn thủ dưới danh nghĩa Lê) cùng Phú Yên – Khánh Hòa – Ninh Thuận – Bình Thuận (nhóm kauthara,
 * panduranga) thuộc Chăm Pa; Nam Bộ + Campuchia thuộc Campuchia thời hậu Angkor; Lào thuộc Lan
 * Xang. Khác với 04-ho-le-mac.ts: mốc `1600` chuyển hẳn Quảng Bình → Bình Định từ le-trung-hung
 * sang dang-trong, đánh dấu điểm chia Đàng Trong – Đàng Ngoài trên bản đồ (xem ghi chú mốc đó).
 *
 * Không có mốc nào trong bảng gốc của brief phải sửa year/yearLabel — toàn bộ 19 mốc đối chiếu với
 * Đại Nam thực lục tiền biên, Khâm định Việt sử thông giám cương mục, Việt sử xứ Đàng Trong (Phan
 * Khoang) và Nguyễn Cochinchina (Li Tana) đều khớp với bảng.
 *
 * Nhóm mới khai báo trong groups.ts cho task này (đều là vùng lịch sử có tên riêng, xấp xỉ vì
 * ranh giới huyện thế kỷ XVII–XVIII không trùng địa giới hành chính hiện đại):
 * - thai-khang-1653: phủ Thái Khang – Diên Ninh (Khánh Hòa, Vạn Ninh và phần Ninh Thuận phía bắc
 *   sông Phan Rang) chiếm được năm 1653.
 * - panduranga-1697: phần còn lại của trấn Thuận Thành sau khi tách phủ Bình Thuận năm 1697 (nam
 *   sông Phan Rang: Ninh Phước, Phan Rang – Tháp Chàm, Thuận Nam ngày nay).
 * - gia-dinh-1698: phủ Gia Định (dinh Trấn Biên + dinh Phiên Trấn, gồm Bình Dương và Mỹ Tho — không gồm vùng
 *   Gò Công, xem ghi chú mốc `1756`).
 * - ha-tien-1708 / ha-tien-1739: trấn Hà Tiên buổi đầu (vùng Mang Khảm) và bốn đạo mở thêm năm
 *   1739 (Long Xuyên, Kiên Giang, Trấn Giang, Trấn Di).
 * - long-ho-1732: dinh Long Hồ / châu Định Viễn (Vĩnh Long).
 * - tra-vang-ba-thac-1757: Trà Vang và Ba Thắc (Bến Tre, Trà Vinh, Sóc Trăng), đặt vào dinh Long
 *   Hồ khoảng năm 1757.
 * - bac-bo-chinh: Bắc Bố Chính (bắc sông Gianh; Quảng Trạch, Ba Đồn, Tuyên Hóa, Minh Hóa ngày nay),
 *   ở Đàng Ngoài suốt 1600–1655, bị quân Nguyễn chiếm 1655–1660.
 * - tam-bon-loi-lap-1756, tam-phong-long-1757: hai đợt đất Chân Lạp dâng cuối cùng trong phạm vi
 *   task này (Long An – Gò Công; An Giang – Đồng Tháp).
 *
 * Các điểm cân nhắc khác (xem báo cáo task để biết chi tiết nguồn):
 * - Mốc `1600`: đổi tên hiển thị của le-trung-hung thành "Đàng Ngoài (Lê – Trịnh)" bằng
 *   polityOverrides (đúng quy định ở polities.ts: "override sau 1600"); Quảng Bình → Bình Định
 *   chuyển sang dang-trong đánh dấu lowConfidence vì đây là một ranh giới trên thực tế (Nguyễn
 *   Hoàng vẫn danh nghĩa là trấn thủ của triều Lê), không phải một sự kiện cắt đất chính thức.
 * - Mốc `1623`: chỉ gán Hoàng Sa, Trường Sa cho dang-trong (lowConfidence) — trạm thu thuế ở Prey
 *   Nokor/Kas Krobei chỉ nêu trong summary theo đúng yêu cầu brief, chưa phải lãnh thổ Đàng Trong
 *   (đất Sài Gòn – Bến Nghé khi đó vẫn thuộc chủ quyền Chân Lạp, chỉ cho phép đặt trạm thu thuế).
 *   Đội Hoàng Sa được nhiều nghiên cứu hiện đại xác định thành lập dưới thời chúa Nguyễn Phúc
 *   Nguyên (1613–1635) nhưng không rõ năm chính xác; mốc `1623` là mốc gần nhất trên dòng thời
 *   gian của file này còn nằm trong đời chúa này.
 * - Mốc `1655` (yearLabel 1655–1660): vùng chiếm được (Hà Tĩnh ngày nay + huyện Thanh Chương của
 *   Nghệ An) bị quân Trịnh chiếm lại vào cuối năm 1660, nhưng file không có mốc riêng cho năm
 *   1660; việc trả lại vùng này cho le-trung-hung được gộp vào mốc `1672` (xem ghi chú mốc đó).
 * - Mốc `1672`: quân Trịnh trên thực tế đã lấy lại Hà Tĩnh – Thanh Chương từ cuối năm 1660; mốc
 *   này chỉ là mốc gần nhất trên dòng thời gian để thể hiện việc đó trên bản đồ, đồng thời đúng là
 *   năm hai bên ngừng chiến và mặc nhiên công nhận sông Gianh làm ranh giới.
 * - Mốc `1653`: cùng lúc với việc lập dinh Thái Khang, đây cũng là mốc gần nhất trên dòng thời
 *   gian để đánh dấu việc nhà Thanh thay nhà Minh làm chủ Lưỡng Quảng – Hải Nam (Quảng Châu thất
 *   thủ 1650, tàn dư Nam Minh bị dẹp ở Quảng Tây khoảng 1652), lowConfidence.
 * - Mốc `1692`–`1697`: theo quy định period của polity `panduranga` (1697–1832) đã chốt ở
 *   Task C1, vùng Panduranga vẫn giữ nhãn `champa` cho tới mốc `1697` dù quân Nguyễn đã đánh bại
 *   và bắt vua Bà Tranh từ đầu năm 1693 — giai đoạn 1693–1694 từng đặt trấn Thuận Thành rồi phủ
 *   Bình Thuận, bị hủy sau một cuộc nổi dậy, trước khi tái lập ổn định năm 1697; mốc `1692` vì vậy
 *   chỉ có sự kiện (assign: {}), toàn bộ thay đổi lãnh thổ dồn vào mốc `1697`.
 * - Mốc `1708`: cũng là mốc gần nhất trên dòng thời gian cho việc Lan Xang phân liệt năm 1707
 *   thành Luang Prabang, Vientiane và Champasak; vương quốc Champasak trên thực tế tách khỏi
 *   Vientiane muộn hơn, năm 1713, nên toàn bộ việc chia ba Lan Xang ở mốc này đánh dấu
 *   lowConfidence. Ranh giới ba vương quốc chỉ là xấp xỉ theo tỉnh Lào hiện đại.
 * - Mốc `1698`: phủ Gia Định gồm cả phần đất Mỹ Tho đã có lưu dân người Hoa từ 1679, nhưng KHÔNG
 *   gồm vùng Gò Công (nay cũng thuộc tỉnh Tiền Giang) — Gò Công cùng Tân An chỉ về tay chúa Nguyễn
 *   năm 1756 (Tầm Bôn – Lôi Lạp), nên nhóm gia-dinh-1698 loại trừ 3 xã/huyện Gò Công của Tiền
 *   Giang ngày nay.
 * - Cuối file (mốc `1757`): Tây Ninh, Bình Phước (rừng núi thưa dân, quyền quản lý chưa rõ) và Côn
 *   Đảo không có mốc nào trong bảng 19 mốc nên vẫn giữ nguyên campuchia-hau-angkor từ file
 *   04-ho-le-mac.ts (xem báo cáo task); Bình Dương thuộc phủ Gia Định từ 1698, Sóc Trăng cùng Bến
 *   Tre, Trà Vinh vào dinh Long Hồ khoảng 1757 (lowConfidence).
 * - Mốc `1600`: Bắc Bố Chính (Quảng Trạch, Ba Đồn, Tuyên Hóa, Minh Hóa) ở Đàng Ngoài, phần Quảng
 *   Bình còn lại (nam sông Gianh) ở Đàng Trong; sông Gianh chỉ thành giới tuyến rõ từ khoảng 1630.
 */

const THUC_LUC_TIEN_BIEN: Source = {
  title: 'Đại Nam thực lục tiền biên',
  author: 'Quốc sử quán triều Nguyễn'
};
const GIA_DINH_THANH_THONG_CHI: Source = {
  title: 'Gia Định thành thông chí',
  author: 'Trịnh Hoài Đức'
};
const PHU_BIEN_TAP_LUC: Source = {
  title: 'Phủ biên tạp lục',
  author: 'Lê Quý Đôn',
  note: '1776'
};
const TOAN_THU: Source = { title: 'Đại Việt sử ký toàn thư', note: 'Bản kỷ tục biên' };
const CUONG_MUC: Source = { title: 'Khâm định Việt sử thông giám cương mục' };
const LSVN4: Source = {
  title: 'Lịch sử Việt Nam, tập 4 (từ thế kỷ XVII đến thế kỷ XVIII)',
  author: 'Viện Sử học',
  note: 'NXB Khoa học xã hội, 2017'
};
const PHAN_KHOANG: Source = {
  title: 'Việt sử xứ Đàng Trong',
  author: 'Phan Khoang',
  note: '1967'
};
const LI_TANA: Source = { title: 'Nguyễn Cochinchina', author: 'Li Tana', note: '1998' };
const PO_DHARMA: Source = {
  title: 'Le Pāṇḍuraṅga (Campā) 1802–1835',
  author: 'Po Dharma',
  note: 'EFEO, 1987'
};
const STUART_FOX_LX: Source = {
  title: 'The Lao Kingdom of Lān Xāng: Rise and Decline',
  author: 'Martin Stuart-Fox',
  note: '1998'
};
const STUART_FOX: Source = {
  title: 'A History of Laos',
  author: 'Martin Stuart-Fox',
  note: '1997'
};
const FAIRBANK: Source = {
  title: 'China: A New History',
  author: 'John King Fairbank, Merle Goldman',
  note: 'bản mở rộng, 2006'
};
const THANH_SU_CAO: Source = { title: 'Thanh sử cảo' };

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
// Liệt kê trực tiếp các tỉnh (không dùng 'group:bac-bo-nui') vì selector 'group:' luôn có độ cụ
// thể cao hơn selector ADM1 (xem selectorSpecificity trong src/modules/HistoryMap/lib/resolve.ts)
// — phát hiện từ task C4. Ở đây không thực sự cần thiết (không có mốc nào trong file này tách một
// tỉnh nhỏ hơn ra khỏi nhóm này), nhưng giữ nguyên quy ước để nhất quán và an toàn nếu cần sau này.
const BAC_BO_NUI = [
  'VNM.ha-giang',
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
const THANH_NGHE_TINH = ['VNM.thanh-hoa', 'VNM.nghe-an', 'VNM.ha-tinh'];
const CAO_BANG = ['VNM.cao-bang'];
const THUAN_HOA = ['group:ba-chau-1069', 'group:chau-o', 'group:chau-ly'];
const QUANG_NAM_THUA_TUYEN = ['VNM.da-nang', 'VNM.quang-nam', 'VNM.quang-ngai', 'VNM.binh-dinh'];
const KAUTHARA_PANDURANGA = ['group:kauthara', 'group:panduranga'];
const LINH_NAM = ['group:linh-nam-trung-hoa', 'CHN.hai-nam'];
const CAMPUCHIA_NAM_BO = ['KHM', 'group:nam-bo'];
const SONG_LAM_NAM = ['VNM.ha-tinh', 'VNM.nghe-an.thanh-chuong'];
// Bắc Bố Chính (bắc sông Gianh): nhóm bac-bo-chinh. Ở mốc 1600 phải liệt kê từng huyện (độ cụ thể
// 4) để thắng selector 'group:ba-chau-1069' (độ cụ thể 3) đang gán cả Quảng Bình cho dang-trong.
const BAC_BO_CHINH = ['group:bac-bo-chinh'];
const BAC_BO_CHINH_HUYEN = [
  'VNM.quang-binh.quang-trach',
  'VNM.quang-binh.ba-don',
  'VNM.quang-binh.tuyen-hoa',
  'VNM.quang-binh.minh-hoa'
];
const THAI_KHANG_1653 = ['group:thai-khang-1653'];
const PANDURANGA_1697 = ['group:panduranga-1697'];
const GIA_DINH_1698 = ['group:gia-dinh-1698'];
const HA_TIEN_1708 = ['group:ha-tien-1708'];
const HA_TIEN_1739 = ['group:ha-tien-1739'];
const LONG_HO_1732 = ['group:long-ho-1732'];
const TAM_BON_LOI_LAP_1756 = ['group:tam-bon-loi-lap-1756'];
const TAM_PHONG_LONG_1757 = ['group:tam-phong-long-1757'];
const TRA_VANG_BA_THAC_1757 = ['group:tra-vang-ba-thac-1757'];
const LUANG_PRABANG_LAOS = [
  'LAO.luang-prabang',
  'LAO.xaignabouli',
  'LAO.oudomxay',
  'LAO.phongsaly',
  'LAO.luang-namtha',
  'LAO.bokeo',
  'LAO.houaphan'
];
const VIENTIANE_LAOS = [
  'LAO.vientiane',
  'LAO.vientiane-capital',
  'LAO.bolikhamsai',
  'LAO.khammouane',
  'LAO.xaisomboun'
];
const CHAMPASAK_LAOS = [
  'LAO.champasak',
  'LAO.salavan',
  'LAO.xekong',
  'LAO.attapeu',
  'LAO.savannakhet'
];

const assignAll = (selectors: string[], polity: string) =>
  Object.fromEntries(selectors.map((s) => [s, polity]));

export const TRINH_NGUYEN: Snapshot[] = [
  {
    id: '1600',
    year: 1600,
    yearLabel: '1600',
    era: 'trinh-nguyen',
    title: 'Nguyễn Hoàng về hẳn Thuận Quảng',
    summary:
      'Sau bảy năm bị chúa Trịnh Tùng giữ lại ở Đông Đô kể từ chuyến ra yết kiến vua Lê năm 1593, Nguyễn Hoàng mượn cớ đi dẹp loạn ở cửa Đại An (Ninh Bình) rồi theo đường biển trở về hẳn Thuận Hóa năm 1600, không ra Bắc nữa. Từ đây trên thực tế ông cai quản độc lập dải đất từ nam sông Gianh (Quảng Bình) đến Bình Định — tuy trên danh nghĩa vẫn là một trấn thủ của triều Lê trung hưng — đặt nền móng cho cơ nghiệp chúa Nguyễn ở Đàng Trong, đối lập với Đàng Ngoài do vua Lê – chúa Trịnh cai quản từ vùng bắc sông Gianh (Bắc Bố Chính) trở ra. Phần lãnh thổ còn lại của Đại Việt (Bắc Bộ, Thanh – Nghệ – Tĩnh, Bắc Bố Chính, xứ Bồn Man) tiếp tục thuộc quyền Lê – Trịnh; Cao Bằng vẫn thuộc nhà Mạc, Chăm Pa vẫn giữ Kauthara và Panduranga, Nam Bộ – Campuchia vẫn thuộc Campuchia thời hậu Angkor, Lào vẫn thuộc Lan Xang.',
    assign: {
      '*': null,
      ...assignAll(BAC_BO, 'le-trung-hung'),
      ...assignAll(THANH_NGHE_TINH, 'le-trung-hung'),
      LAO: 'lan-xang',
      ...assignAll(CAO_BANG, 'mac-cao-bang'),
      ...assignAll(LINH_NAM, 'nha-minh'),
      ...assignAll(THUAN_HOA, 'dang-trong'),
      ...assignAll(QUANG_NAM_THUA_TUYEN, 'dang-trong'),
      ...assignAll(BAC_BO_CHINH_HUYEN, 'le-trung-hung'),
      ...assignAll(KAUTHARA_PANDURANGA, 'champa'),
      ...assignAll(CAMPUCHIA_NAM_BO, 'campuchia-hau-angkor'),
      'LAO.xiangkhouang': 'le-trung-hung'
    },
    polityOverrides: { 'le-trung-hung': { name: 'Đàng Ngoài (Lê – Trịnh)' } },
    lowConfidence: [...THUAN_HOA, ...QUANG_NAM_THUA_TUYEN, ...BAC_BO_CHINH, 'LAO.xiangkhouang'],
    focus: { lon: 107.3, lat: 16.8 },
    sources: [THUC_LUC_TIEN_BIEN, PHAN_KHOANG, LI_TANA, CUONG_MUC]
  },
  {
    id: '1611',
    year: 1611,
    yearLabel: '1611',
    era: 'trinh-nguyen',
    title: 'Lập phủ Phú Yên',
    summary:
      'Nhân việc quân Chiêm Thành quấy nhiễu vùng biên, năm 1611 Nguyễn Hoàng sai chủ sự Văn Phong đem quân đánh chiếm dải đất từ nam đèo Cù Mông đến bắc đèo Cả, lập thành một phủ mới gồm hai huyện Đồng Xuân và Tuy Hòa, đặt tên là phủ Phú Yên, cho lệ thuộc dinh Quảng Nam và cử Văn Phong làm lưu thủ. Đây là bước Nam tiến đầu tiên của chúa Nguyễn kể từ khi Nguyễn Hoàng trở về Thuận Quảng năm 1600, tách phần bắc của xứ Kauthara ra khỏi Chăm Pa; vùng Vạn Ninh, nằm phía nam đèo Cả, vẫn thuộc Chăm Pa.',
    assign: { 'VNM.phu-yen': 'dang-trong', 'VNM.phu-yen.van-ninh': 'champa' },
    focus: { lon: 109.2, lat: 13.1 },
    sources: [THUC_LUC_TIEN_BIEN, PHAN_KHOANG, LI_TANA]
  },
  {
    id: '1623',
    year: 1623,
    yearLabel: '1623',
    era: 'trinh-nguyen',
    title: 'Đặt trạm thu thuế ở Prey Nokor (Sài Gòn)',
    summary:
      'Theo sử liệu Việt, năm 1623 chúa Nguyễn Phúc Nguyên cử sứ bộ mang quốc thư và lễ vật sang xin vua Chân Lạp Chey Chettha II cho lập hai trạm thu thuế ở Prey Nokor (Sài Gòn) và Kas Krobei (Bến Nghé); được chấp thuận, lưu dân Việt vốn đã khai khẩn rải rác trong vùng từ trước càng thêm đông. Đây mới là một nhượng bộ thương mại, đất Prey Nokor khi đó vẫn thuộc chủ quyền Chân Lạp, chưa phải lãnh thổ Đàng Trong. Cùng thời kỳ này, họ Nguyễn lập đội Hoàng Sa (theo Phủ biên tạp lục, 1776, gồm 70 suất) ra khai thác và tuần phòng vùng biển Hoàng Sa; nhiều nhà nghiên cứu đặt việc này vào đầu thế kỷ XVII, đời chúa Nguyễn Phúc Nguyên (1613–1635), nhưng không có năm chính xác, và các ghi chép định niên rõ ràng chỉ có từ thế kỷ XVIII. Bản đồ tô cả Hoàng Sa lẫn Trường Sa từ mốc gần nhất trên dòng thời gian còn nằm trong đời chúa này; riêng Trường Sa thường được gắn với đội Bắc Hải, ghi chép rõ về sau hơn, nên việc đánh dấu là chưa chắc chắn.',
    assign: { 'VNM.hoang-sa': 'dang-trong', 'VNM.truong-sa': 'dang-trong' },
    lowConfidence: ['VNM.hoang-sa', 'VNM.truong-sa'],
    focus: { lon: 106.7, lat: 10.8 },
    sources: [PHU_BIEN_TAP_LUC, THUC_LUC_TIEN_BIEN, LI_TANA]
  },
  {
    id: '1627',
    year: 1627,
    yearLabel: '1627',
    era: 'trinh-nguyen',
    title: 'Trịnh – Nguyễn phân tranh bắt đầu',
    summary:
      'Lấy cớ Nguyễn Phúc Nguyên không chịu nộp thuế cống ra Đông Đô, năm 1627 chúa Trịnh Tráng đem đại quân vào đánh Đàng Trong nhưng không thắng được, phải rút về; đây là trận đầu trong bảy lần giao tranh lớn giữa hai họ Trịnh, Nguyễn kéo dài đến năm 1672. Giới tuyến giữa hai bên lúc này chưa cố định ở sông Gianh — sông Gianh chỉ thành ranh giới rõ rệt từ khoảng năm 1630, khi Nam Bố Chính thuộc Đàng Trong còn Bắc Bố Chính ở Đàng Ngoài — nên bản đồ, vốn đã đặt Bắc Bố Chính ở Đàng Ngoài, không thay đổi ở mốc này.',
    assign: {},
    focus: { lon: 106.4, lat: 17.7 },
    sources: [TOAN_THU, CUONG_MUC, LSVN4, PHAN_KHOANG]
  },
  {
    id: '1653',
    year: 1653,
    yearLabel: '1653',
    era: 'trinh-nguyen',
    title: 'Lập dinh Thái Khang (Khánh Hòa)',
    summary:
      'Năm 1653, vua Chiêm Bà Tấm đem quân quấy phá vùng biên giới Phú Yên; chúa Nguyễn Phúc Tần sai cai đội Hùng Lộc đem 3.000 quân đánh dẹp, đuổi quân Chiêm đến tận bờ đông sông Phan Rang. Bà Tấm sai con là Xác Bà Ân dâng thư xin hàng; chúa Nguyễn nhân đó lấy sông Phan Rang làm giới, đặt phần đất từ đó ra đến giáp Phú Yên thành hai phủ Thái Khang và Diên Ninh, đại thể tương ứng Khánh Hòa và phần Ninh Thuận phía bắc sông ngày nay, Chăm Pa chỉ còn giữ dải đất phía nam sông. Cùng giai đoạn này ở phương Bắc, nhà Thanh đã dứt điểm tàn dư Nam Minh, làm chủ hẳn Lưỡng Quảng và Hải Nam từ khoảng năm 1650–1652; đây là mốc gần nhất trên dòng thời gian để đánh dấu thay đổi đó.',
    assign: {
      ...assignAll(THAI_KHANG_1653, 'dang-trong'),
      ...assignAll(LINH_NAM, 'nha-thanh')
    },
    lowConfidence: [...THAI_KHANG_1653, ...LINH_NAM],
    focus: { lon: 109.1, lat: 12.25 },
    sources: [THUC_LUC_TIEN_BIEN, PHAN_KHOANG, FAIRBANK, THANH_SU_CAO]
  },
  {
    id: '1655',
    year: 1655,
    yearLabel: '1655–1660',
    era: 'trinh-nguyen',
    title: 'Quân Nguyễn vượt sông Gianh, chiếm nam Nghệ An',
    summary:
      'Tháng 4/1655, chúa Nguyễn Phúc Tần sai Nguyễn Hữu Tiến, Nguyễn Hữu Dật đem quân vượt sông Gianh chiếm Bắc Bố Chính, mở đầu lần duy nhất quân Đàng Trong chủ động tiến công ra Đàng Ngoài. Đến năm 1657–1658, Nguyễn Hữu Tiến đẩy lui quân Trịnh đến tận sông Lam, chiếm giữ bảy huyện phía nam sông (Kỳ Hoa, Thạch Hà, Thiên Lộc, Nghi Xuân, La Sơn, Hương Sơn, Thanh Chương) — đại thể tương ứng tỉnh Hà Tĩnh ngày nay cùng huyện Thanh Chương của Nghệ An. Đây là lần duy nhất lãnh thổ Đàng Trong vượt quá sông Gianh trong suốt cuộc phân tranh; quân Trịnh giành lại toàn bộ vùng này vào cuối năm 1660 (xem mốc năm 1672).',
    assign: assignAll([...SONG_LAM_NAM, ...BAC_BO_CHINH], 'dang-trong'),
    lowConfidence: [...SONG_LAM_NAM, ...BAC_BO_CHINH],
    focus: { lon: 105.9, lat: 18.3 },
    sources: [TOAN_THU, CUONG_MUC, LSVN4, PHAN_KHOANG]
  },
  {
    id: '1658',
    year: 1658,
    yearLabel: '1658',
    era: 'trinh-nguyen',
    title: 'Chân Lạp thần phục chúa Nguyễn (Mô Xoài)',
    summary:
      'Năm 1658, vua Chân Lạp Nặc Ông Chân — người vừa theo đạo Hồi và lấy công chúa Mã Lai, gây bất bình trong hoàng tộc và dân chúng Khmer theo Phật giáo — xâm phạm vùng biên giới phía nam Đàng Trong. Chúa Nguyễn Phúc Tần sai phó tướng Yến Vũ hầu đem 3.000 quân đến thành Mô Xoài (Bà Rịa ngày nay), đánh bại và bắt sống Nặc Ông Chân đưa về giam ở Quảng Bình; năm sau ông qua đời, chúa Nguyễn lập Ang So (So Đế) làm vua mới, Chân Lạp từ đó thần phục và triều cống Đàng Trong. Đây là lần đầu quân Đàng Trong đánh sang Chân Lạp, nhưng chưa sáp nhập đất đai — Nam Bộ vẫn thuộc chủ quyền Chân Lạp, nay ở vị thế phiên thuộc.',
    assign: {},
    focus: { lon: 107.15, lat: 10.5 },
    sources: [THUC_LUC_TIEN_BIEN, GIA_DINH_THANH_THONG_CHI, PHAN_KHOANG]
  },
  {
    id: '1672',
    year: 1672,
    yearLabel: '1672',
    era: 'trinh-nguyen',
    title: 'Hưu chiến, sông Gianh làm ranh giới',
    summary:
      'Cuối năm 1660, quân Trịnh dốc toàn lực vượt sông Lam, đánh bật quân Nguyễn khỏi bảy huyện Nghệ An và vùng Bắc Bố Chính chiếm được từ 1655, đẩy Đàng Trong lui trở lại sông Gianh. Sau đó hai bên còn giao tranh thêm hai lần nữa (1661–1662, 1672) mà không phân thắng bại; năm Nhâm Tý 1672, chúa Trịnh Tạc tự rút quân, kết thúc bảy lần đại chiến kéo dài từ 1627. Từ đây sông Gianh (Linh Giang) mặc nhiên trở thành ranh giới không thành văn, chia Đại Việt thành Đàng Ngoài (Lê – Trịnh, từ sông Gianh trở ra) và Đàng Trong (chúa Nguyễn, từ sông Gianh trở vào), giữ nguyên trạng hơn một trăm năm sau.',
    assign: assignAll([...SONG_LAM_NAM, ...BAC_BO_CHINH], 'le-trung-hung'),
    focus: { lon: 106.42, lat: 17.6 },
    sources: [TOAN_THU, CUONG_MUC, LSVN4]
  },
  {
    id: '1674',
    year: 1674,
    yearLabel: '1674',
    era: 'trinh-nguyen',
    title: 'Chân Lạp chia hai vua, phó vương ở Prey Nokor',
    summary:
      'Năm 1674, tông thất Chân Lạp Nặc Ông Đài mưu chiếm ngôi, dựng lũy chống lại Nặc Nộn (người được chúa Nguyễn bảo hộ) và cầu viện Xiêm; chúa Nguyễn Phúc Tần sai Nguyễn Dương Lâm, Nguyễn Đình Phái đem quân can thiệp, Nặc Ông Đài thua chạy vào rừng và bị chính thuộc hạ giết chết. Em ông là Nặc Ông Thu ra hàng, được chúa Nguyễn lập làm chính vương đóng ở thành Long Úc (Oudong); Nặc Nộn được phong làm phó vương, đóng ở thành Sài Gòn (Prey Nokor) — nơi lưu dân Việt đã cư trú đông từ nhiều thập niên trước. Đây là một biến động nội bộ triều đình Chân Lạp dưới sự dàn xếp của chúa Nguyễn, chưa làm thay đổi chủ quyền lãnh thổ trên bản đồ: Nam Bộ vẫn thuộc Campuchia thời hậu Angkor, nay lệ thuộc chặt hơn vào Đàng Trong.',
    assign: {},
    focus: { lon: 105.9, lat: 11.6 },
    sources: [THUC_LUC_TIEN_BIEN, PHAN_KHOANG, LI_TANA]
  },
  {
    id: '1677',
    year: 1677,
    yearLabel: '1677',
    era: 'trinh-nguyen',
    title: 'Họ Trịnh dứt nhà Mạc ở Cao Bằng',
    summary:
      'Sau khi nhà Minh mất hẳn năm 1662, họ Mạc ở Cao Bằng phải dựa vào nhà Thanh; quân Trịnh đánh lên Cao Bằng các năm 1662, 1666, 1667, và khi Trịnh chiếm được Cao Bằng, Mạc Kính Vũ sang Trung Quốc cầu cứu, năm 1669 sứ nhà Thanh buộc họ Trịnh trả lại bốn huyện cho họ Mạc. Năm 1677, sử sách chép Mạc Kính Vũ liên kết với Ngô Tam Quế (đang khởi binh chống nhà Thanh từ 1673) nên nhà Thanh thôi che chở; chúa Trịnh Tạc sai Đinh Văn Tả đem quân đánh Cao Bằng vào tháng 8/1677, Kính Vũ bỏ chạy sang Long Châu. Cao Bằng trở về tay triều đình Lê trung hưng sau 85 năm họ Mạc cát cứ tại đây kể từ 1592.',
    assign: assignAll(CAO_BANG, 'le-trung-hung'),
    focus: { lon: 106.25, lat: 22.66 },
    sources: [TOAN_THU, CUONG_MUC, LSVN4]
  },
  {
    id: '1679',
    year: 1679,
    yearLabel: '1679',
    era: 'trinh-nguyen',
    title: 'Di thần nhà Minh vào Biên Hòa, Mỹ Tho',
    summary:
      'Năm 1679, hai tướng nhà Minh không chịu thần phục nhà Thanh là Trần Thượng Xuyên và Dương Ngạn Địch đem hơn 3.000 quân cùng hơn 50 chiến thuyền sang xin thần phục chúa Nguyễn Phúc Tần. Chúa Nguyễn nhận cho vào khai khẩn đất Đông Phố (vùng Đồng Nai – Sài Gòn) còn thưa dân của Chân Lạp: nhóm Trần Thượng Xuyên (phần đông người Quảng Đông) theo cửa Cần Giờ vào đóng ở Bàn Lân (Biên Hòa), nhóm Dương Ngạn Địch (phần đông người Triều Châu) theo cửa Soài Rạp vào đóng ở Mỹ Tho, lập nên hai phố chợ người Hoa sầm uất là Cù Lao Phố và Mỹ Tho đại phố. Đây là một cuộc di dân và khai khẩn được phép của cả chúa Nguyễn lẫn triều đình Chân Lạp, đất đai khi đó về danh nghĩa vẫn thuộc chủ quyền Chân Lạp nên bản đồ chưa đổi chủ.',
    assign: {},
    focus: { lon: 106.85, lat: 10.55 },
    sources: [THUC_LUC_TIEN_BIEN, GIA_DINH_THANH_THONG_CHI, LI_TANA]
  },
  {
    id: '1692',
    year: 1692,
    yearLabel: '1692',
    era: 'trinh-nguyen',
    title: 'Chúa Nguyễn đánh Chiêm Thành (Bà Tranh)',
    summary:
      'Tháng 8/1692, vua Chiêm là Bà Tranh (Po Saot) đem quân cướp phá phủ Diên Ninh (đất Thái Khang – Diên Ninh, chiếm được từ Chăm Pa năm 1653); chúa Nguyễn Phúc Chu sai Nguyễn Hữu Cảnh đem quân dẹp loạn rồi thừa thắng tiến đánh luôn phần lãnh thổ Chăm Pa còn lại (Panduranga). Đầu năm 1693, quân Nguyễn đánh tan quân Chiêm, Bà Tranh bỏ thành chạy rồi bị bắt; vùng đất được đặt làm trấn Thuận Thành, đến tháng 8/1693 đổi thành phủ Bình Thuận. Việc tổ chức hành chính vùng đất mới còn biến động mấy năm sau (xem mốc năm 1697) nên bản đồ chưa ghi nhận thay đổi chủ ở mốc này.',
    assign: {},
    focus: { lon: 108.9, lat: 11.35 },
    sources: [THUC_LUC_TIEN_BIEN, PHAN_KHOANG, PO_DHARMA]
  },
  {
    id: '1697',
    year: 1697,
    yearLabel: '1697',
    era: 'trinh-nguyen',
    title: 'Lập phủ Bình Thuận, trấn Thuận Thành',
    summary:
      'Sau khi bắt được Bà Tranh đầu năm 1693, chúa Nguyễn đổi đất Panduranga thành trấn Thuận Thành rồi phủ Bình Thuận (tháng 8/1693), nhưng người Chăm nổi dậy chống đối khiến phủ Bình Thuận bị bãi bỏ năm 1694, tái lập trấn Thuận Thành với Kế Bà Tử (em Bà Tranh) làm phiên vương, giữ lệ triều cống. Năm 1697, tình hình ổn định trở lại, chúa Nguyễn Phúc Chu đặt lại phủ Bình Thuận lâu dài, chia làm hai huyện An Phước và Hòa Đa do quan lại Đàng Trong trực tiếp cai quản (bản đồ vẽ xấp xỉ theo tỉnh Bình Thuận ngày nay, còn trên thực tế đất Việt xen kẽ đất Chăm quanh Phan Rang); phần đất còn lại (đại thể tương ứng nam Ninh Thuận ngày nay) vẫn giữ tên trấn Thuận Thành, do vương công người Chăm cai quản với luật lệ, quân đội riêng dưới quyền bảo hộ của chúa Nguyễn, kéo dài tự trị một phần cho tới cuộc cải cách hành chính năm 1832.',
    assign: {
      'VNM.binh-thuan': 'dang-trong',
      ...assignAll(PANDURANGA_1697, 'panduranga')
    },
    lowConfidence: ['VNM.binh-thuan', ...PANDURANGA_1697],
    focus: { lon: 108.6, lat: 11.2 },
    sources: [THUC_LUC_TIEN_BIEN, PHAN_KHOANG, PO_DHARMA]
  },
  {
    id: '1698',
    year: 1698,
    yearLabel: '1698',
    era: 'trinh-nguyen',
    title: 'Nguyễn Hữu Cảnh lập phủ Gia Định',
    summary:
      'Tháng 2/1698, chúa Nguyễn Phúc Chu sai Thống suất Nguyễn Hữu Cảnh vào kinh lược vùng Đồng Nai – Sài Gòn, chính thức lập phủ Gia Định gồm hai huyện: Phước Long (đặt dinh Trấn Biên, đại thể Đồng Nai – Bà Rịa ngày nay) và Tân Bình (đặt dinh Phiên Trấn, đại thể Sài Gòn và Bình Dương ngày nay), lấy sông Đồng Nai và sông Sài Gòn làm ranh giới hai dinh; vùng Mỹ Tho, nơi lưu dân người Hoa của Dương Ngạn Địch khai khẩn từ 1679, cũng được đặt vào dinh Phiên Trấn. Hơn bốn vạn hộ dân đã ở đây từ trước được biên chế vào sổ đinh, hoàn tất việc xác lập chủ quyền hành chính của Đàng Trong trên vùng đất mà Chân Lạp — lúc này suy yếu vì nội chiến — không còn thực quyền kiểm soát.',
    assign: assignAll(GIA_DINH_1698, 'dang-trong'),
    lowConfidence: ['VNM.binh-duong'],
    focus: { lon: 106.8, lat: 10.75 },
    sources: [THUC_LUC_TIEN_BIEN, GIA_DINH_THANH_THONG_CHI, LI_TANA]
  },
  {
    id: '1708',
    year: 1708,
    yearLabel: '1708',
    era: 'trinh-nguyen',
    title: 'Mạc Cửu dâng đất Hà Tiên',
    summary:
      'Mạc Cửu, một di thần nhà Minh gốc Quảng Đông, đến vùng Mang Khảm (Hà Tiên) khai khẩn và dựng thành thương cảng sầm uất từ cuối thế kỷ XVII; năm 1708, trước sức ép của Xiêm La, ông xin dâng đất thần phục chúa Nguyễn Phúc Chu. Chúa Nguyễn nhận cho, phong Mạc Cửu làm Tổng binh trấn Hà Tiên, tước Cửu Ngọc hầu, cho cai quản vùng đất như một phiên trấn cha truyền con nối, thần phục Đàng Trong nhưng vẫn khá tự chủ trong nội trị. Cùng khoảng thời gian này ở Lào, vương triều Lan Xang tan rã năm 1707 do tranh chấp trong hoàng tộc, chia thành ba vương quốc kình địch: Luang Prabang (bắc), Vientiane (trung) và về sau Champasak (nam, tách khỏi Vientiane năm 1713) — mốc năm 1708 là mốc gần nhất trên dòng thời gian để ghi nhận sự chia tách đó.',
    assign: {
      ...assignAll(HA_TIEN_1708, 'ha-tien'),
      ...assignAll(LUANG_PRABANG_LAOS, 'luang-prabang'),
      ...assignAll(VIENTIANE_LAOS, 'vieng-chan'),
      ...assignAll(CHAMPASAK_LAOS, 'champasak')
    },
    lowConfidence: [...HA_TIEN_1708, ...LUANG_PRABANG_LAOS, ...VIENTIANE_LAOS, ...CHAMPASAK_LAOS],
    focus: { lon: 104.5, lat: 10.4 },
    sources: [GIA_DINH_THANH_THONG_CHI, LI_TANA, STUART_FOX_LX, STUART_FOX]
  },
  {
    id: '1732',
    year: 1732,
    yearLabel: '1732',
    era: 'trinh-nguyen',
    title: 'Lập dinh Long Hồ',
    summary:
      'Năm 1732, chúa Nguyễn Phúc Trú lập châu Định Viễn và dựng dinh Long Hồ trên phần đất Chân Lạp nhượng lại (vùng Mésa và Long Hồ), lỵ sở đặt tại thôn An Bình Đông, huyện Kiến Đăng (Cái Bè ngày nay). Dinh Long Hồ quản lãnh dải đất châu thổ sông Tiền quanh Vĩnh Long ngày nay, mở rộng phạm vi khai khẩn của Đàng Trong xuống phía nam vùng Gia Định đã lập từ 1698; vùng Trà Vang (Trà Vinh, Bến Tre) mãi khoảng năm 1757 mới được đặt vào dinh (xem mốc năm 1757).',
    assign: assignAll(LONG_HO_1732, 'dang-trong'),
    lowConfidence: [...LONG_HO_1732],
    focus: { lon: 106.0, lat: 10.2 },
    sources: [THUC_LUC_TIEN_BIEN, GIA_DINH_THANH_THONG_CHI, PHAN_KHOANG]
  },
  {
    id: '1739',
    year: 1739,
    yearLabel: '1739',
    era: 'trinh-nguyen',
    title: 'Hà Tiên mở các đạo Long Xuyên, Kiên Giang',
    summary:
      'Mạc Thiên Tứ, con Mạc Cửu, nối quyền cai quản Hà Tiên từ năm 1735 sau khi cha mất; năm 1739 ông cho lập thêm bốn đạo mới trực thuộc trấn Hà Tiên: Long Xuyên (vùng Cà Mau), Kiên Giang (vùng Rạch Giá), Trấn Giang (vùng Cần Thơ) và Trấn Di (bắc Bạc Liêu). Nhờ đó phạm vi trấn Hà Tiên — vẫn là một phiên trấn tự trị thần phục chúa Nguyễn — mở rộng bao trùm gần hết bán đảo Cà Mau, bổ khuyết phần đất phía tây nam Nam Bộ mà dinh Gia Định và Long Hồ chưa vươn tới.',
    assign: assignAll(HA_TIEN_1739, 'ha-tien'),
    lowConfidence: [...HA_TIEN_1739],
    focus: { lon: 105.0, lat: 9.6 },
    sources: [GIA_DINH_THANH_THONG_CHI, LI_TANA, THUC_LUC_TIEN_BIEN]
  },
  {
    id: '1756',
    year: 1756,
    yearLabel: '1756',
    era: 'trinh-nguyen',
    title: 'Chân Lạp dâng Tầm Bôn, Lôi Lạp',
    summary:
      'Sau khi quân của vua Chân Lạp Nặc Nguyên giết hại một bộ phận người Côn Man (gốc Chăm, theo về chúa Nguyễn) đang lánh nạn, năm 1756 Nặc Nguyên xin dâng hai phủ Tầm Bôn và Lôi Lạp — đại thể tương ứng Tân An (Long An) và Gò Công ngày nay — để tạ tội, thông qua trung gian là Mạc Thiên Tứ ở Hà Tiên. Chúa Nguyễn Phúc Khoát nhận đất, sai quan xem xét địa thế, lập đồn dinh, chia đất cho binh dân khai khẩn, đặt vào châu Định Viễn thuộc dinh Long Hồ. Đây là lần đầu áp dụng kế sách "tằm thực" (lấn đất dần như tằm ăn dâu) do Nguyễn Cư Trinh đề ra, kết hợp vừa dùng binh vừa nhận đất Chân Lạp dâng để mở mang bờ cõi.',
    assign: assignAll(TAM_BON_LOI_LAP_1756, 'dang-trong'),
    lowConfidence: [...TAM_BON_LOI_LAP_1756],
    focus: { lon: 106.35, lat: 10.55 },
    sources: [THUC_LUC_TIEN_BIEN, PHAN_KHOANG, GIA_DINH_THANH_THONG_CHI]
  },
  {
    id: '1757',
    year: 1757,
    yearLabel: '1757',
    era: 'trinh-nguyen',
    title: 'Nhận Tầm Phong Long, hoàn tất vùng Tây Nam Bộ',
    summary:
      'Năm 1757, vua Chân Lạp Nặc Tôn — vừa được chúa Nguyễn Phúc Khoát giúp khôi phục ngôi báu — dâng đất Tầm Phong Long để tạ ơn. Chúa Nguyễn sai Nguyễn Cư Trinh vào tiếp nhận, đặt ba đạo Châu Đốc, Tân Châu và Đông Khẩu (Sa Đéc), đại thể tương ứng An Giang và Đồng Tháp ngày nay, đặt dưới quyền dinh Long Hồ; cùng khoảng thời gian này vùng Trà Vang (Trà Vinh, Bến Tre) và Ba Thắc (Sóc Trăng) cũng được đặt vào dinh Long Hồ, còn Nặc Tôn dâng thêm một số phủ ven vịnh Thái Lan cho Mạc Thiên Tứ để chuyển lên chúa Nguyễn; các phủ này nằm ven biển thuộc Campuchia ngày nay (khoảng Kampot – Kampong Som) nên bản đồ không vẽ. Cùng với phần đất Hà Tiên đã mở rộng năm 1739, việc này khép lại một chặng Nam tiến trên vùng đồng bằng Tây Nam Bộ kéo dài từ đầu thế kỷ XVII; bản đồ vẫn để Tây Ninh, Bình Phước (vùng rừng núi thưa dân, chưa rõ quyền quản lý) và Côn Đảo như trước.',
    assign: assignAll([...TAM_PHONG_LONG_1757, ...TRA_VANG_BA_THAC_1757], 'dang-trong'),
    lowConfidence: [...TAM_PHONG_LONG_1757, ...TRA_VANG_BA_THAC_1757],
    focus: { lon: 105.15, lat: 10.5 },
    sources: [THUC_LUC_TIEN_BIEN, PHAN_KHOANG, GIA_DINH_THANH_THONG_CHI]
  }
];
