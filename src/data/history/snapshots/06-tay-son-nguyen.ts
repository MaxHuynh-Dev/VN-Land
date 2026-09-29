import type { Snapshot, Source } from '../types';

/*
 * Mốc 1771 → 1847 (Tây Sơn – đầu triều Nguyễn), 23 mốc: 13 mốc era tay-son, 10 mốc era nha-nguyen.
 *
 * File tự đứng một mình: mốc đầu (`1771`) có `'*': null` và gán đầy đủ, tiếp nối trạng thái cuối
 * của 05-trinh-nguyen.ts (mốc `1757`: Quảng Bình chia đôi ở sông Gianh — Bắc Bố Chính thuộc Lê –
 * Trịnh; Bình Dương, Bến Tre, Trà Vinh, Sóc Trăng thuộc Đàng Trong; Côn Đảo, Tây Ninh, Bình Phước
 * còn thuộc Campuchia). Khác `1757` duy nhất ở căn cứ Tây Sơn (An Khê – Tây Sơn, lowConfidence); Giồng
 * Riềng (Kiên Giang) giữ Campuchia như mốc 1757.
 * - Quân Xiêm đóng giữ Hà Tiên 1771–1773 chỉ ghi trong summary, không tô lên bản đồ (màu `xiem` và
 *   `dang-trong` quá gần nhau ở ngưỡng ΔE2000 15 và phạm vi đóng quân không rõ).
 * - Hà Tiên giữ `ha-tien` (họ Mạc) đến mốc `1832` (Nguyễn trực tiếp bổ nhiệm trấn thủ từ 1809, trấn
 *   bị bãi năm 1832); lowConfidence 1777–1788 vì Xiêm chi phối. Giồng Riềng giữ Campuchia như 05.
 * - Dải động biên giới nhà Mạc xin dâng năm 1540 nằm ở phía Quảng Tây của biên giới hiện đại nên
 *   không còn tô riêng: các ô biên giới Quảng Ninh, Lạng Sơn theo chủ của cả tỉnh.
 * - Hồng Kông thuộc `anh` từ mốc `1841`; Ma Cao để không chủ từ mốc `1847` (khớp 07/08).
 * - Battambang, Siem Reap, Pailin, Bantey Meanchey, Oddar Meanchey, Koh Kong, Preah Vihear thuộc
 *   Xiêm và Stung Treng thuộc Champasak từ mốc `1799` (khớp 07).
 *
 * Các điểm cần lưu ý:
 * - Khánh Hòa, Bình Thuận đổi chủ nhiều lần (1773–1777, 1793) nên các gán ở đó đều lowConfidence.
 * - `dang-trong` được dùng cho Nguyễn Ánh (polityOverrides đổi tên từ mốc `1778`, đổi lần nữa ở
 *   mốc `1801`); `tay-son` = triều Nguyễn Nhạc và toàn cõi Tây Sơn trước 1786; `tay-son-phu-xuan`
 *   = triều Nguyễn Huệ – Quang Toản từ 1786. Gia Định của Nguyễn Lữ (1786–1788) gán `tay-son`.
 * - Mốc `1783`: yearLabel mở rộng thành 1783–1784 vì Nguyễn Ánh mất Sài Gòn tháng 3/1783 và chỉ
 *   tới Băng Cốc tháng 2/1784. Mốc `1786`: yearLabel 1786–1787 vì việc chia đất ba anh em được nhiều
 *   sử liệu ghi vào khoảng giữa hai năm đó. Mốc `1832`: 1831–1832 (bỏ Bắc thành năm 1831; bỏ Gia
 *   Định thành, lập lục tỉnh Nam Kỳ, sáp nhập Panduranga và trấn Hà Tiên năm 1832). Mốc `1834`: 1834–1836 (lập
 *   Trấn Tây thành 1834, Nặc Ông Chân mất cuối 1834, sáp nhập chính thức 1835–1836). Không mốc
 *   nào phải đổi `year`.
 * - Côn Đảo (mốc `1802`), Tây Ninh, Bình Phước, Giồng Riềng (mốc `1832`) là các vùng Nam Bộ mà file 05
 *   còn để Campuchia; đây là nơi chuyển sang nhà Nguyễn (lowConfidence).
 * - Màu: đổi `tay-son` (#e0261c → #ee3b1e) và `tay-son-phu-xuan` (#c41e1e → #f59a86) trong
 *   polities.ts để đạt ΔE2000 ≥ 15 với `dang-trong`, `ha-tien` và giữa hai chính thể này.
 * - Cao nguyên miền Trung (Kon Tum, Gia Lai, Đắk Lắk, Đắk Nông, Lâm Đồng) vẫn không có chủ.
 */

const NAM_BO_NGUYEN = [
  'VNM.dong-nai',
  'VNM.ba-ria-vung-tau',
  'VNM.tp-ho-chi-minh',
  'VNM.binh-duong',
  'VNM.tien-giang',
  'VNM.long-an',
  'VNM.vinh-long',
  'VNM.ben-tre',
  'VNM.tra-vinh',
  'VNM.soc-trang',
  'VNM.an-giang',
  'VNM.dong-thap'
];
const HA_TIEN_TOAN = [
  'VNM.kien-giang',
  'VNM.ca-mau',
  'VNM.can-tho',
  'VNM.hau-giang',
  'VNM.bac-lieu'
];
const BAC_BO_DONG_BANG_TRU_NINH_BINH = [
  'VNM.ha-noi',
  'VNM.bac-ninh',
  'VNM.hung-yen',
  'VNM.hai-duong',
  'VNM.ha-nam',
  'VNM.nam-dinh',
  'VNM.thai-binh',
  'VNM.vinh-phuc',
  'VNM.phu-tho'
];
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
const NINH_BINH = ['VNM.ninh-binh'];
const CAO_BANG = ['VNM.cao-bang'];
// Bắc Bộ (kể cả Ninh Bình và Cao Bằng) — dùng liệt kê ADM1, không dùng group (xem gotcha ở
// selectorSpecificity: group luôn thắng ADM1).
const BAC_BO_TOAN = [...BAC_BO_DONG_BANG_TRU_NINH_BINH, ...NINH_BINH, ...BAC_BO_NUI, ...CAO_BANG];
const BAC_BO_TRU_NINH_BINH = [...BAC_BO_DONG_BANG_TRU_NINH_BINH, ...BAC_BO_NUI, ...CAO_BANG];
const THANH_NGHE_TINH = ['VNM.thanh-hoa', 'VNM.nghe-an', 'VNM.ha-tinh'];
const THUAN_HOA = ['VNM.quang-binh', 'VNM.quang-tri', 'VNM.thua-thien-hue'];
const QUANG_NAM_DA_NANG = ['VNM.da-nang', 'VNM.quang-nam'];
const BAC_BO_CHINH = ['group:bac-bo-chinh'];
const QUANG_NGAI = ['VNM.quang-ngai'];
const BINH_DINH = ['VNM.binh-dinh'];
const PHU_YEN = ['VNM.phu-yen'];
const BINH_THUAN = ['VNM.binh-thuan'];
const HOANG_TRUONG = ['VNM.hoang-sa', 'VNM.truong-sa'];
const KHANH_HOA_1653 = ['group:thai-khang-1653'];
const PANDURANGA_1697 = ['group:panduranga-1697'];
const KHM_XIEM_1794 = ['group:campuchia-xiem-1794'];
const TRAN_TAY_1834 = ['group:tran-tay-1834'];
const TAY_SON_CAN_CU_1771 = ['group:tay-son-can-cu-1771'];
const LAC_BIEN_1828 = ['group:lac-bien-1828'];
const TRAN_DINH_1828 = ['group:tran-dinh-1828'];
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
const XIANG_KHOUANG = ['LAO.xiangkhouang'];

const assignAll = (selectors: string[], polity: string) =>
  Object.fromEntries(selectors.map((s) => [s, polity]));

const THUC_LUC_CHINH_BIEN_1: Source = {
  title: 'Đại Nam thực lục chính biên, đệ nhất kỷ (Thế tổ Cao hoàng đế)',
  author: 'Quốc sử quán triều Nguyễn'
};
const THUC_LUC_CHINH_BIEN_2: Source = {
  title: 'Đại Nam thực lục chính biên, đệ nhị kỷ (Thánh tổ Nhân hoàng đế)',
  author: 'Quốc sử quán triều Nguyễn'
};
const THUC_LUC_CHINH_BIEN_3: Source = {
  title: 'Đại Nam thực lục chính biên, đệ tam kỷ (Hiến tổ Chương hoàng đế)',
  author: 'Quốc sử quán triều Nguyễn'
};
const THUC_LUC_TIEN_BIEN: Source = {
  title: 'Đại Nam thực lục tiền biên',
  author: 'Quốc sử quán triều Nguyễn'
};
const LIET_TRUYEN_NGUY_TAY: Source = {
  title: 'Đại Nam chính biên liệt truyện — Ngụy Tây liệt truyện',
  author: 'Quốc sử quán triều Nguyễn'
};
const NHAT_THONG_CHI: Source = {
  title: 'Đại Nam nhất thống chí',
  author: 'Quốc sử quán triều Nguyễn'
};
const CUONG_MUC: Source = { title: 'Khâm định Việt sử thông giám cương mục' };
const GIA_DINH_THANH_THONG_CHI: Source = {
  title: 'Gia Định thành thông chí',
  author: 'Trịnh Hoài Đức'
};
const LSVN4: Source = {
  title: 'Lịch sử Việt Nam, tập 4 (từ thế kỷ XVII đến thế kỷ XVIII)',
  author: 'Viện Sử học',
  note: 'NXB Khoa học xã hội, 2017'
};
const LSVN5: Source = {
  title: 'Lịch sử Việt Nam, tập 5 (1802–1858)',
  author: 'Viện Sử học',
  note: 'NXB Khoa học xã hội, 2017'
};
const DUTTON: Source = { title: 'The Tây Sơn Uprising', author: 'George Dutton', note: '2006' };
const TA_CHI_DAI_TRUONG: Source = {
  title: 'Lịch sử nội chiến ở Việt Nam từ 1771 đến 1802',
  author: 'Tạ Chí Đại Trường'
};
const PHAN_KHOANG: Source = {
  title: 'Việt sử xứ Đàng Trong',
  author: 'Phan Khoang',
  note: '1967'
};
const LI_TANA: Source = { title: 'Nguyễn Cochinchina', author: 'Li Tana', note: '1998' };
const CHOI_BYUNG_WOOK: Source = {
  title: 'Southern Vietnam under the Reign of Minh Mạng (1820–1841)',
  author: 'Choi Byung Wook',
  note: 'Cornell SEAP, 2004',
  url: 'https://www.cornellpress.cornell.edu/book/9780877271383/southern-vietnam-under-the-reign-of-minh-mang-18201841/'
};
const TRAN_TRONG_KIM: Source = {
  title: 'Việt Nam sử lược',
  author: 'Trần Trọng Kim',
  note: '1920'
};
const PO_DHARMA: Source = {
  title: 'Le Pāṇḍuraṅga (Campā) 1802–1835',
  author: 'Po Dharma',
  note: 'EFEO, 1987'
};
const CHANDLER: Source = { title: 'A History of Cambodia', author: 'David Chandler' };
const STUART_FOX: Source = {
  title: 'A History of Laos',
  author: 'Martin Stuart-Fox',
  note: '1997'
};
const BAKER_PASUK: Source = {
  title: 'A History of Thailand',
  author: 'Chris Baker, Pasuk Phongpaichit'
};
const WYATT: Source = { title: 'Thailand: A Short History', author: 'David K. Wyatt' };
const MOC_BAN: Source = {
  title: 'Mộc bản triều Nguyễn — Hoàng Sa, Trường Sa: biển đảo thiêng liêng',
  author: 'Trung tâm Lưu trữ quốc gia IV',
  url: 'https://mocban.vn/hoang-sa-truong-sa-bien-dao-thieng-lieng/'
};
const PHU_BIEN_TAP_LUC: Source = { title: 'Phủ biên tạp lục', author: 'Lê Quý Đôn', note: '1776' };
const FAIRBANK: Source = {
  title: 'China: A New History',
  author: 'John King Fairbank, Merle Goldman',
  note: 'bản mở rộng, 2006'
};

export const TAY_SON_NGUYEN: Snapshot[] = [
  {
    id: '1771',
    year: 1771,
    yearLabel: '1771',
    era: 'tay-son',
    title: 'Khởi nghĩa Tây Sơn; Xiêm đánh Hà Tiên',
    summary:
      'Năm 1771, ba anh em Nguyễn Nhạc, Nguyễn Lữ và Nguyễn Huệ khởi binh ở ấp Tây Sơn (huyện Phù Ly, phủ Quy Nhơn), dựng căn cứ ở vùng thượng đạo An Khê, lấy danh nghĩa trừ quyền thần Trương Phúc Loan của triều chúa Nguyễn Phúc Thuần. Cũng năm này vua Xiêm Taksin đem quân đánh Hà Tiên (tháng 11), Mạc Thiên Tứ bỏ thành chạy vào đất Trấn Giang; tướng Xiêm Trần Liên đóng giữ cảng này đến năm 1773, nhưng phạm vi đóng quân không rõ nên bản đồ vẫn ghi Hà Tiên thuộc họ Mạc. Lúc này Đàng Ngoài (Lê – Trịnh) trải từ Cao Bằng đến Hà Tĩnh và bắc Quảng Bình, Đàng Trong (chúa Nguyễn) từ Quảng Bình đến Nam Bộ, Chăm Pa còn Panduranga, nhà Thanh giữ Lưỡng Quảng và Hải Nam, Lào chia thành ba vương quốc. Phạm vi căn cứ Tây Sơn ở An Khê chỉ là xấp xỉ.',
    assign: {
      '*': null,
      ...assignAll(BAC_BO_TOAN, 'le-trung-hung'),
      ...assignAll(THANH_NGHE_TINH, 'le-trung-hung'),
      ...assignAll(XIANG_KHOUANG, 'le-trung-hung'),
      ...assignAll(THUAN_HOA, 'dang-trong'),
      ...assignAll(BAC_BO_CHINH, 'le-trung-hung'),
      ...assignAll(QUANG_NAM_DA_NANG, 'dang-trong'),
      ...assignAll(QUANG_NGAI, 'dang-trong'),
      ...assignAll(BINH_DINH, 'dang-trong'),
      ...assignAll(PHU_YEN, 'dang-trong'),
      ...assignAll(BINH_THUAN, 'dang-trong'),
      ...assignAll(KHANH_HOA_1653, 'dang-trong'),
      ...assignAll(PANDURANGA_1697, 'panduranga'),
      ...assignAll(NAM_BO_NGUYEN, 'dang-trong'),
      ...assignAll(HA_TIEN_TOAN, 'ha-tien'),
      'VNM.kien-giang.giong-rieng': 'campuchia-hau-angkor',
      ...assignAll(HOANG_TRUONG, 'dang-trong'),
      ...assignAll(
        ['KHM', 'VNM.tay-ninh', 'VNM.binh-phuoc', 'VNM.con-dao'],
        'campuchia-hau-angkor'
      ),
      CHN: 'nha-thanh',
      ...assignAll(LUANG_PRABANG_LAOS, 'luang-prabang'),
      ...assignAll(VIENTIANE_LAOS, 'vieng-chan'),
      ...assignAll(CHAMPASAK_LAOS, 'champasak'),
      ...assignAll(TAY_SON_CAN_CU_1771, 'tay-son')
    },
    polityOverrides: {
      'tay-son': { name: 'Phong trào Tây Sơn (An Khê)', capital: 'Tây Sơn thượng (An Khê)' }
    },
    lowConfidence: [...TAY_SON_CAN_CU_1771, ...XIANG_KHOUANG],
    focus: { lon: 108.75, lat: 13.95 },
    sources: [LIET_TRUYEN_NGUY_TAY, DUTTON, TA_CHI_DAI_TRUONG, BAKER_PASUK, LI_TANA]
  },
  {
    id: '1773',
    year: 1773,
    yearLabel: '1773',
    era: 'tay-son',
    title: 'Tây Sơn chiếm thành Quy Nhơn',
    summary:
      'Mùa thu năm 1773, Nguyễn Nhạc dùng mưu đánh chiếm thành Quy Nhơn (Đồ Bàn), rồi trong cuối năm đưa quân lấy Quảng Ngãi và Phú Yên, lập vùng đất Tây Sơn đầu tiên liền một dải Quảng Ngãi – Bình Định – Phú Yên. Quân Tây Sơn cũng tiến xuống Khánh Hòa, Bình Thuận nhưng quân chúa Nguyễn còn giành lại các nơi này (tướng Tống Phước Hiệp đánh lấy lại năm 1774), nên bản đồ chưa tính. Cùng năm 1773 vua Taksin giảng hòa và trao lại Hà Tiên cho họ Mạc, Mạc Tử Hoàng thay cha coi trấn. Phạm vi Quảng Ngãi, Phú Yên còn giằng co nên chỉ vẽ ở mức xấp xỉ.',
    assign: {
      ...assignAll(BINH_DINH, 'tay-son'),
      ...assignAll(QUANG_NGAI, 'tay-son'),
      ...assignAll(PHU_YEN, 'tay-son'),
      // Vạn Ninh nằm nam đèo Cả (thuộc Khánh Hòa, dữ liệu ranh giới xếp nhầm vào Phú Yên): còn thuộc chúa Nguyễn.
      'VNM.phu-yen.van-ninh': 'dang-trong'
    },
    lowConfidence: [...QUANG_NGAI, ...PHU_YEN],
    focus: { lon: 109.1, lat: 13.8 },
    sources: [LIET_TRUYEN_NGUY_TAY, DUTTON, TA_CHI_DAI_TRUONG, THUC_LUC_TIEN_BIEN]
  },
  {
    id: '1775',
    year: 1775,
    yearLabel: '1775',
    era: 'tay-son',
    title: 'Quân Trịnh chiếm Phú Xuân',
    summary:
      'Nhân triều đình Phú Xuân suy yếu, chúa Trịnh Sâm sai Hoàng Ngũ Phúc đem quân vượt sông Gianh cuối năm 1774; đầu năm 1775 quân Trịnh chiếm Phú Xuân, chúa Nguyễn Phúc Thuần cùng triều đình chạy vào Quảng Nam rồi Gia Định. Quân Trịnh đặt quan cai trị Thuận Hóa (Quảng Bình – Quảng Trị – Huế), tiến vào Quảng Nam nhưng vì dịch bệnh và xa căn cứ nên rút về Thuận Hóa vào cuối năm. Nguyễn Nhạc hòa với Trịnh, nhận chức Tiên phong tướng quân, được cho trấn giữ Quảng Nam và đem quân chiếm vùng này từ tay quân Nguyễn còn lại; việc Quảng Nam thuộc Tây Sơn ở thời điểm này chỉ ở mức xấp xỉ.',
    assign: {
      ...assignAll(THUAN_HOA, 'le-trung-hung'),
      ...assignAll(QUANG_NAM_DA_NANG, 'tay-son')
    },
    lowConfidence: [...QUANG_NAM_DA_NANG],
    focus: { lon: 107.3, lat: 16.5 },
    sources: [CUONG_MUC, LIET_TRUYEN_NGUY_TAY, DUTTON, LSVN4]
  },
  {
    id: '1777',
    year: 1777,
    yearLabel: '1777',
    era: 'tay-son',
    title: 'Tây Sơn chiếm Gia Định, chúa Nguyễn mất',
    summary:
      'Đầu năm 1777, Nguyễn Huệ đem quân vào Gia Định, đánh tan lực lượng còn lại của chúa Nguyễn; Nguyễn Phúc Thuần bị bắt và bị giết ở Long Xuyên (tháng 9), chấm dứt chế độ chúa Nguyễn ở Đàng Trong kéo dài từ năm 1558. Tây Sơn nắm toàn bộ vùng Gia Định – Long Hồ – Định Tường và các vùng Khánh Hòa, Bình Thuận, đồng thời quản lý dải ven biển có đội Hoàng Sa gắn với Quảng Ngãi. Cháu chúa là Nguyễn Phúc Ánh thoát được, ẩn náu ở miền tây Nam Bộ; Mạc Thiên Tứ chạy sang Xiêm và bị Taksin giam giữ (1780), nên trong nhiều năm sau Hà Tiên chịu ảnh hưởng của Xiêm và vẫn ghi là trấn Hà Tiên ở mức xấp xỉ. Khánh Hòa, Bình Thuận và Hoàng Sa, Trường Sa được tô thuộc Tây Sơn ở mức xấp xỉ.',
    assign: {
      ...assignAll(NAM_BO_NGUYEN, 'tay-son'),
      ...assignAll(KHANH_HOA_1653, 'tay-son'),
      ...assignAll(BINH_THUAN, 'tay-son'),
      ...assignAll(HOANG_TRUONG, 'tay-son')
    },
    lowConfidence: [...KHANH_HOA_1653, ...BINH_THUAN, ...HOANG_TRUONG, ...HA_TIEN_TOAN],
    focus: { lon: 106.7, lat: 10.6 },
    sources: [THUC_LUC_TIEN_BIEN, LIET_TRUYEN_NGUY_TAY, DUTTON, LSVN4, PHAN_KHOANG]
  },
  {
    id: '1778',
    year: 1778,
    yearLabel: '1778',
    era: 'tay-son',
    title: 'Nguyễn Nhạc xưng đế (Thái Đức)',
    summary:
      'Năm 1778, Nguyễn Nhạc lên ngôi hoàng đế, đặt niên hiệu Thái Đức, đóng đô ở thành Đồ Bàn (Quy Nhơn) và đổi tên là Hoàng Đế thành. Trong lúc lực lượng chính của Tây Sơn rút về Quy Nhơn, Nguyễn Ánh cùng Đỗ Thanh Nhân, Châu Văn Tiếp đánh lấy lại Sài Gòn (cuối năm 1777 âm lịch) rồi được tướng sĩ tôn làm Đại nguyên súy Nhiếp quốc chính, giữ toàn bộ Gia Định. Cũng khoảng 1778–1779 các vương quốc Viêng Chăn, Luang Prabang và Champasak bị quân Xiêm đánh bại, trở thành chư hầu của Xiêm, nhưng vẫn giữ triều đình riêng.',
    assign: assignAll(NAM_BO_NGUYEN, 'dang-trong'),
    lowConfidence: [...HA_TIEN_TOAN],
    polityOverrides: {
      'dang-trong': { name: 'Nguyễn Ánh ở Gia Định', capital: 'Sài Gòn (Gia Định)' },
      'tay-son': { name: 'Nhà Tây Sơn (Thái Đức, Quy Nhơn)', capital: 'Quy Nhơn (thành Hoàng Đế)' }
    },
    focus: { lon: 109.0, lat: 13.8 },
    sources: [LIET_TRUYEN_NGUY_TAY, THUC_LUC_CHINH_BIEN_1, DUTTON, STUART_FOX]
  },
  {
    id: '1783',
    year: 1783,
    yearLabel: '1783–1784',
    era: 'tay-son',
    title: 'Nguyễn Ánh chạy sang Xiêm',
    summary:
      'Tháng 10/1782 Nguyễn Ánh chiếm lại Sài Gòn, nhưng tháng 3/1783 quân Tây Sơn do Nguyễn Huệ chỉ huy đánh bại ông và lấy lại toàn bộ Gia Định. Nguyễn Ánh trốn ra Phú Quốc, Côn Đảo, thiếu lương thực, rồi sang Xiêm và đến Băng Cốc tháng 2/1784, nhờ vua Rama I giúp binh. Từ đây Gia Định do Nguyễn Lữ và các tướng Tây Sơn cai quản; Nguyễn Ánh không còn nắm vùng đất nào ở Việt Nam cho tới năm 1788.',
    assign: assignAll(NAM_BO_NGUYEN, 'tay-son'),
    lowConfidence: [...HA_TIEN_TOAN],
    focus: { lon: 106.75, lat: 10.4 },
    sources: [THUC_LUC_CHINH_BIEN_1, DUTTON, TA_CHI_DAI_TRUONG, WYATT]
  },
  {
    id: '1785',
    year: 1785,
    yearLabel: '1785',
    era: 'tay-son',
    title: 'Trận Rạch Gầm – Xoài Mút',
    summary:
      'Đầu năm 1785, một đạo quân Xiêm từ 20.000 đến 30.000 người cùng hàng trăm chiến thuyền sang giúp Nguyễn Ánh tiến vào đồng bằng sông Cửu Long. Nguyễn Huệ từ Quy Nhơn vào Gia Định, mai phục trên sông Tiền, đoạn giữa Rạch Gầm và Xoài Mút (Tiền Giang ngày nay) và tiêu diệt gần hết quân Xiêm. Lãnh thổ không thay đổi: Gia Định vẫn thuộc Tây Sơn, còn Nguyễn Ánh lại sang Xiêm.',
    assign: {},
    lowConfidence: [...HA_TIEN_TOAN],
    focus: { lon: 106.35, lat: 10.4 },
    sources: [THUC_LUC_CHINH_BIEN_1, LIET_TRUYEN_NGUY_TAY, DUTTON, BAKER_PASUK]
  },
  {
    id: '1786',
    year: 1786,
    yearLabel: '1786–1787',
    era: 'tay-son',
    title: 'Tây Sơn diệt họ Trịnh; ba anh em chia đất',
    summary:
      'Tháng 6/1786, Nguyễn Huệ chiếm Phú Xuân rồi tiến ra Thăng Long với danh nghĩa phù Lê diệt Trịnh, chấm dứt quyền chúa Trịnh (Trịnh Khải bị bắt và tự tử); triều Lê (Lê Hiển Tông, sau là Lê Chiêu Thống) vẫn giữ ngôi ở Bắc Hà. Ngay sau đó, ba anh em Tây Sơn chia phần: Nguyễn Nhạc xưng Trung ương hoàng đế ở Quy Nhơn, cai quản từ Quảng Ngãi trở vào; Nguyễn Huệ xưng Bắc Bình Vương, cai quản từ Điện Bàn (Quảng Nam) trở ra Thuận Hóa; Nguyễn Lữ xưng Đông Định Vương ở Gia Định. Bản đồ tô Gia Định của Nguyễn Lữ chung với triều Quy Nhơn (Tây Sơn) và ranh giới Quảng Nam – Quảng Ngãi ở mức xấp xỉ; thời điểm chia đất được sử liệu ghi vào khoảng cuối 1786 đến 1787.',
    assign: {
      ...assignAll(THUAN_HOA, 'tay-son-phu-xuan'),
      ...assignAll(QUANG_NAM_DA_NANG, 'tay-son-phu-xuan'),
      ...assignAll(NAM_BO_NGUYEN, 'tay-son')
    },
    polityOverrides: {
      'le-trung-hung': { name: 'Đại Việt (nhà Lê, sau họ Trịnh)', capital: 'Thăng Long' }
    },
    lowConfidence: [...QUANG_NAM_DA_NANG, ...NAM_BO_NGUYEN, ...HA_TIEN_TOAN],
    focus: { lon: 107.6, lat: 16.1 },
    sources: [LIET_TRUYEN_NGUY_TAY, CUONG_MUC, DUTTON, TA_CHI_DAI_TRUONG, LSVN4]
  },
  {
    id: '1788',
    year: 1788,
    yearLabel: '1788',
    era: 'tay-son',
    title: 'Quang Trung lên ngôi; Nguyễn Ánh lấy lại Gia Định',
    summary:
      'Tháng 9/1788, Nguyễn Ánh từ Xiêm trở về, đánh chiếm Sài Gòn và làm chủ Gia Định, lấy Sài Gòn làm căn cứ chống Tây Sơn. Cuối năm, Lê Chiêu Thống cầu viện nhà Thanh; quân Thanh của Tôn Sĩ Nghị vào Thăng Long, quân Tây Sơn ở Bắc Hà lui về Tam Điệp (Ninh Bình – Thanh Hóa). Ngày 25 tháng 11 âm lịch (22/12/1788), Nguyễn Huệ lên ngôi hoàng đế ở Phú Xuân, niên hiệu Quang Trung, rồi hành quân ra Bắc. Bản đồ giữ tình hình cuối năm 1788: Tây Sơn ở Phú Xuân giữ từ Thanh – Nghệ – Tĩnh trở vào, phần Bắc Bộ từ Hà Nội trở ra do vua Lê dưới sự có mặt của quân Thanh (xấp xỉ), còn Hà Tiên vẫn ở dưới quyền họ Mạc do Xiêm nâng đỡ (theo một số nguồn, Mạc Tử Sinh cai quản 1785–1788).',
    assign: {
      ...assignAll(NAM_BO_NGUYEN, 'dang-trong'),
      ...assignAll(THANH_NGHE_TINH, 'tay-son-phu-xuan'),
      ...assignAll(NINH_BINH, 'tay-son-phu-xuan')
    },
    lowConfidence: [...NINH_BINH, ...BAC_BO_TRU_NINH_BINH, ...HA_TIEN_TOAN],
    focus: { lon: 106.2, lat: 18.9 },
    sources: [THUC_LUC_CHINH_BIEN_1, LIET_TRUYEN_NGUY_TAY, DUTTON, LSVN4, FAIRBANK]
  },
  {
    id: '1789',
    year: 1789,
    yearLabel: '1789',
    era: 'tay-son',
    title: 'Trận Ngọc Hồi – Đống Đa, nhà Lê chấm dứt',
    summary:
      'Đêm mùng 3 đến mùng 5 Tết Kỷ Dậu (tháng 1/1789), Quang Trung đánh tan quân Thanh ở Hà Hồi, Ngọc Hồi và Đống Đa, quân Thanh rút khỏi Thăng Long; Lê Chiêu Thống chạy sang Trung Quốc, nhà Lê trung hưng chấm dứt. Toàn bộ Bắc Hà, kể cả Cao Bằng, về tay Tây Sơn ở Phú Xuân; nhà Thanh sau đó phong Nguyễn Huệ làm An Nam quốc vương. Khi không còn triều đình Lê làm chủ danh nghĩa, xứ Bồn Man (Xiêng Khoảng) được ghi như một xứ tự trị.',
    assign: {
      ...assignAll(BAC_BO_TOAN, 'tay-son-phu-xuan'),
      ...assignAll(XIANG_KHOUANG, 'bon-man')
    },
    lowConfidence: [...XIANG_KHOUANG],
    focus: { lon: 105.85, lat: 21.0 },
    sources: [CUONG_MUC, LIET_TRUYEN_NGUY_TAY, DUTTON, FAIRBANK, LSVN4]
  },
  {
    id: '1793',
    year: 1793,
    yearLabel: '1793',
    era: 'tay-son',
    title: 'Nguyễn Ánh giữ Diên Khánh; Nguyễn Nhạc mất',
    summary:
      'Năm 1793, Nguyễn Ánh đem quân từ Gia Định đánh lấy Nha Trang, Diên Khánh (Khánh Hòa) rồi tiến sát thành Quy Nhơn; khi quân Tây Sơn ở Phú Xuân do Quang Toản sai đến cứu, ông rút về giữ Diên Khánh, cho Võ Tánh trấn thủ thành mới xây. Cũng năm đó Nguyễn Nhạc mất; Quang Toản giáng con ông là Nguyễn Bảo xuống làm tiểu triều ở đất Phù Ly và cử quan của Phú Xuân giữ Quy Nhơn (Bảo bị xử tử năm 1798 sau một cuộc nổi loạn), nên triều Thái Đức riêng ở Quy Nhơn chấm dứt và toàn bộ đất Tây Sơn còn lại thuộc triều Phú Xuân. Từ đây Khánh Hòa và Bình Thuận (vốn đã chịu ảnh hưởng của Nguyễn Ánh) là căn cứ tiến ra Bắc của Nguyễn Ánh; việc tô hai vùng này thuộc Nguyễn Ánh chỉ là xấp xỉ.',
    assign: {
      ...assignAll(KHANH_HOA_1653, 'dang-trong'),
      ...assignAll(BINH_THUAN, 'dang-trong'),
      ...assignAll(BINH_DINH, 'tay-son-phu-xuan'),
      ...assignAll(PHU_YEN, 'tay-son-phu-xuan'),
      ...assignAll(QUANG_NGAI, 'tay-son-phu-xuan'),
      ...assignAll(TAY_SON_CAN_CU_1771, 'tay-son-phu-xuan'),
      ...assignAll(HOANG_TRUONG, 'tay-son-phu-xuan')
    },
    lowConfidence: [...BINH_THUAN, ...KHANH_HOA_1653, ...BINH_DINH, ...PHU_YEN, ...QUANG_NGAI],
    focus: { lon: 109.1, lat: 12.25 },
    sources: [THUC_LUC_CHINH_BIEN_1, LIET_TRUYEN_NGUY_TAY, DUTTON, TA_CHI_DAI_TRUONG]
  },
  {
    id: '1799',
    year: 1799,
    yearLabel: '1799',
    era: 'tay-son',
    title: 'Nguyễn Ánh lấy thành Quy Nhơn',
    summary:
      'Tháng 3/1799, quân Nguyễn Ánh chiếm thành Quy Nhơn (đổi tên thành Bình Định) và Phú Yên, vốn do quan của triều Cảnh Thịnh giữ từ sau khi Nguyễn Nhạc mất; Ánh giao Võ Tánh và Ngô Tùng Châu ở lại giữ thành, còn Trần Quang Diệu, Bùi Thị Xuân lập tức vây thành suốt hơn một năm. Quảng Ngãi cùng Hoàng Sa, Trường Sa vẫn thuộc triều Phú Xuân. Cùng thời gian (từ năm 1794), vua Xiêm cai quản trực tiếp Battambang, Siem Reap và các vùng Koh Kong, Preah Vihear của Chân Lạp, còn Stung Treng thuộc quyền Champasak; đây là mốc gần nhất trên dòng thời gian để ghi lại những thay đổi đó, vẽ ở mức xấp xỉ.',
    assign: {
      ...assignAll(BINH_DINH, 'dang-trong'),
      ...assignAll(PHU_YEN, 'dang-trong'),
      ...assignAll(TAY_SON_CAN_CU_1771, 'dang-trong'),
      ...assignAll(KHM_XIEM_1794, 'xiem'),
      'KHM.stung-treng': 'champasak'
    },
    lowConfidence: [...PHU_YEN, ...TAY_SON_CAN_CU_1771, ...KHM_XIEM_1794, 'KHM.stung-treng'],
    focus: { lon: 109.1, lat: 13.8 },
    sources: [THUC_LUC_CHINH_BIEN_1, LIET_TRUYEN_NGUY_TAY, DUTTON, CHANDLER, WYATT]
  },
  {
    id: '1801',
    year: 1801,
    yearLabel: '1801',
    era: 'tay-son',
    title: 'Nguyễn Ánh lấy Phú Xuân',
    summary:
      'Đầu tháng 6/1801, hạm đội của Nguyễn Ánh đánh vào cửa Thuận An, quân Cảnh Thịnh bỏ Phú Xuân chạy ra Bắc. Nguyễn Ánh làm chủ Thuận Hóa (Thừa Thiên Huế, Quảng Trị), Quảng Nam, Quảng Ngãi; tướng Tây Sơn còn giữ Quảng Bình và Bắc Hà. Thành Bình Định (Quy Nhơn) do Võ Tánh giữ đến giữa năm 1801 rồi lọt vào tay Trần Quang Diệu, sau đó vùng này còn bị giằng co giữa hai bên, nên bản đồ giữ Bình Định thuộc Nguyễn Ánh ở mức xấp xỉ.',
    assign: {
      'VNM.thua-thien-hue': 'dang-trong',
      'VNM.quang-tri': 'dang-trong',
      ...assignAll(QUANG_NAM_DA_NANG, 'dang-trong'),
      ...assignAll(QUANG_NGAI, 'dang-trong')
    },
    polityOverrides: {
      'dang-trong': { name: 'Nguyễn Ánh (Gia Định – Phú Xuân)', capital: 'Phú Xuân (từ 1801)' }
    },
    lowConfidence: [...BINH_DINH, ...QUANG_NGAI, 'VNM.quang-tri'],
    focus: { lon: 107.6, lat: 16.4 },
    sources: [THUC_LUC_CHINH_BIEN_1, LIET_TRUYEN_NGUY_TAY, DUTTON, TA_CHI_DAI_TRUONG]
  },
  {
    id: '1802',
    year: 1802,
    yearLabel: '1802',
    era: 'nha-nguyen',
    title: 'Nhà Nguyễn thống nhất đất nước',
    summary:
      'Ngày 1/6/1802 Nguyễn Ánh lên ngôi ở Phú Xuân, niên hiệu Gia Long, rồi đem quân ra Bắc, vào Thăng Long tháng 7/1802, bắt vua Cảnh Thịnh (Quang Toản) và chấm dứt nhà Tây Sơn. Đất nước từ ải Nam Quan đến Hà Tiên lại nằm dưới một triều đình: Bắc thành, trấn Gia Định (từ 1808 là Gia Định thành) và trực lệ quanh Huế, cùng Hoàng Sa, Trường Sa; Chăm Pa (Panduranga) vẫn là phiên trấn tự trị, Bồn Man vẫn tự trị. Hà Tiên tiếp tục do họ Mạc cai quản như một phiên trấn thần phục (triều Nguyễn trực tiếp bổ nhiệm trấn thủ từ năm 1809), còn Côn Đảo được tô thuộc nhà Nguyễn ở mức xấp xỉ.',
    assign: {
      ...assignAll(BAC_BO_TOAN, 'nha-nguyen'),
      ...assignAll(THANH_NGHE_TINH, 'nha-nguyen'),
      ...assignAll(THUAN_HOA, 'nha-nguyen'),
      ...assignAll(QUANG_NAM_DA_NANG, 'nha-nguyen'),
      ...assignAll(QUANG_NGAI, 'nha-nguyen'),
      ...assignAll(BINH_DINH, 'nha-nguyen'),
      ...assignAll(PHU_YEN, 'nha-nguyen'),
      ...assignAll(BINH_THUAN, 'nha-nguyen'),
      ...assignAll(KHANH_HOA_1653, 'nha-nguyen'),
      ...assignAll(NAM_BO_NGUYEN, 'nha-nguyen'),
      ...assignAll(['VNM.con-dao'], 'nha-nguyen'),
      ...assignAll(TAY_SON_CAN_CU_1771, 'nha-nguyen'),
      ...assignAll(HOANG_TRUONG, 'nha-nguyen')
    },
    polityOverrides: {
      'nha-nguyen': { name: 'Nhà Nguyễn (Gia Long)', capital: 'Phú Xuân (Huế)' }
    },
    lowConfidence: ['VNM.con-dao'],
    focus: { lon: 106.5, lat: 17.0 },
    sources: [THUC_LUC_CHINH_BIEN_1, NHAT_THONG_CHI, DUTTON, TRAN_TRONG_KIM, LSVN5]
  },
  {
    id: '1804',
    year: 1804,
    yearLabel: '1804',
    era: 'nha-nguyen',
    title: 'Quốc hiệu Việt Nam',
    summary:
      'Năm 1803, Gia Long cử sứ sang nhà Thanh xin phong vương và xin quốc hiệu Nam Việt; triều Thanh cho rằng tên đó gợi lại nước Nam Việt cổ bao gồm cả Lưỡng Quảng nên đề nghị đổi thành Việt Nam. Năm 1804 sứ nhà Thanh sang phong Gia Long làm Việt Nam quốc vương, từ đó quốc hiệu Việt Nam được dùng chính thức trong quan hệ với Trung Hoa. Mốc này là sự kiện ngoại giao, không làm đổi biên giới trên bản đồ.',
    assign: {},
    polityOverrides: {
      'nha-nguyen': { name: 'Việt Nam (nhà Nguyễn)', capital: 'Phú Xuân (Huế)' }
    },
    focus: { lon: 105.85, lat: 21.0 },
    sources: [THUC_LUC_CHINH_BIEN_1, TRAN_TRONG_KIM, LSVN5, FAIRBANK]
  },
  {
    id: '1813',
    year: 1813,
    yearLabel: '1813',
    era: 'nha-nguyen',
    title: 'Bảo hộ Chân Lạp, đưa Nặc Ông Chân về nước',
    summary:
      'Nặc Ông Chân (Ang Chan II), vua Chân Lạp từng phải nhờ Xiêm dựng lên, bị anh em trong hoàng tộc làm phản và cầu cứu triều Nguyễn. Năm 1813, Gia Long sai Nguyễn Văn Thoại và Lê Văn Duyệt đem quân từ Gia Định đưa ông về Oudong và dựng đồn Nam Vang (Phnom Penh) đóng quân bảo hộ, cùng lúc giữ quan hệ triều cống với cả Xiêm. Chủ quyền lãnh thổ của Campuchia không đổi, nhưng ảnh hưởng của Gia Định thành tăng mạnh trong vùng.',
    assign: {},
    focus: { lon: 104.9, lat: 11.55 },
    sources: [THUC_LUC_CHINH_BIEN_1, GIA_DINH_THANH_THONG_CHI, CHANDLER, CHOI_BYUNG_WOOK]
  },
  {
    id: '1816',
    year: 1816,
    yearLabel: '1816',
    era: 'nha-nguyen',
    title: 'Gia Long sai đo đạc Hoàng Sa',
    summary:
      'Đại Nam thực lục chép năm 1815 (Gia Long thứ 14) vua sai đội Hoàng Sa do Phạm Quang Ảnh chỉ huy ra Hoàng Sa đo đạc thủy trình, và năm 1816 tiếp tục sai thủy quân cùng đội Hoàng Sa ra xem xét, đo đạc thủy trình. Nhiều nghiên cứu Việt Nam coi đây là việc cắm cờ, cắm mốc khẳng định chủ quyền của nhà Nguyễn, trong khi văn bản gốc chỉ nói đến khảo sát. Đội Hoàng Sa đã được lập từ thời chúa Nguyễn và duy trì qua thời Tây Sơn; mốc này không đổi lãnh thổ trên bản đồ vì Hoàng Sa, Trường Sa đã thuộc nhà Nguyễn từ 1802.',
    assign: {},
    focus: { lon: 112.3, lat: 16.5 },
    sources: [THUC_LUC_CHINH_BIEN_1, MOC_BAN, PHU_BIEN_TAP_LUC, NHAT_THONG_CHI]
  },
  {
    id: '1828',
    year: 1828,
    yearLabel: '1828',
    era: 'nha-nguyen',
    title: 'Sáp nhập Trấn Ninh, Cam Lộ sau chiến tranh với Vạn Tượng',
    summary:
      'Sau khi cuộc khởi binh chống Xiêm của vua Anouvong (Chiêu A Nỗ) thất bại, quân Xiêm san bằng kinh đô Viêng Chăn năm 1828. Cũng năm này chúa Trấn Ninh là Chiêu Nội dâng sổ dân xin nội thuộc Đại Nam, nhưng sau đó bị Minh Mạng kết tội chết vì chỉ điểm nơi ẩn náu của Anouvong cho quân Xiêm (cuối năm 1828), và Trấn Ninh được đặt quan cai trị trực tiếp. Trong những năm sau, triều Nguyễn lập thêm các phủ Lạc Biên (chín châu vùng Cam Lộ, phía tây Quảng Trị), Trấn Định (Cam Cát, Cam Môn, Cam Linh), Trấn Biên và Trấn Man (Sầm Nứa) để giữ phên giậu phía tây; các nguồn hiện có không nêu rõ năm lập từng phủ nên bản đồ gộp vào mốc này và chỉ xấp xỉ theo huyện Lào hiện đại, còn Viêng Chăn được tô thuộc Xiêm.',
    assign: {
      ...assignAll(XIANG_KHOUANG, 'nha-nguyen'),
      ...assignAll(LAC_BIEN_1828, 'nha-nguyen'),
      ...assignAll(TRAN_DINH_1828, 'nha-nguyen'),
      'LAO.houaphan': 'nha-nguyen',
      ...assignAll(VIENTIANE_LAOS, 'xiem')
    },
    lowConfidence: [
      ...XIANG_KHOUANG,
      ...LAC_BIEN_1828,
      ...TRAN_DINH_1828,
      'LAO.houaphan',
      ...VIENTIANE_LAOS
    ],
    focus: { lon: 104.3, lat: 19.4 },
    sources: [THUC_LUC_CHINH_BIEN_2, NHAT_THONG_CHI, STUART_FOX, WYATT, LSVN5]
  },
  {
    id: '1832',
    year: 1832,
    yearLabel: '1831–1832',
    era: 'nha-nguyen',
    title: 'Minh Mạng lập các tỉnh, bỏ Gia Định thành, Bắc thành',
    summary:
      'Năm 1831 Minh Mạng bỏ Bắc thành, chia các trấn phía bắc thành tỉnh; sau khi Tả quân Lê Văn Duyệt mất (30/7/1832), nhà vua bỏ Gia Định thành và chia Nam Kỳ thành sáu tỉnh, cả nước có khoảng 30 tỉnh trực thuộc triều đình. Cũng năm 1832 nhà vua bãi bỏ trấn Thuận Thành, phế bỏ vương hiệu của người Chăm và sáp nhập Panduranga vào tỉnh Bình Thuận, chấm dứt phiên quốc Chăm cuối cùng; trấn Hà Tiên do họ Mạc cai quản (triều Nguyễn trực tiếp bổ nhiệm từ 1809) cũng bị bãi và đổi thành tỉnh Hà Tiên. Tây Ninh, Bình Phước và huyện Giồng Riềng (Kiên Giang) được tính vào Nam Kỳ trong đợt tổ chức này, ở mức xấp xỉ.',
    assign: {
      ...assignAll(PANDURANGA_1697, 'nha-nguyen'),
      ...assignAll(HA_TIEN_TOAN, 'nha-nguyen'),
      ...assignAll(['VNM.tay-ninh', 'VNM.binh-phuoc'], 'nha-nguyen')
    },
    lowConfidence: ['VNM.tay-ninh', 'VNM.binh-phuoc', 'VNM.kien-giang.giong-rieng'],
    focus: { lon: 108.95, lat: 11.55 },
    sources: [THUC_LUC_CHINH_BIEN_2, CHOI_BYUNG_WOOK, PO_DHARMA, LSVN5]
  },
  {
    id: '1834',
    year: 1834,
    yearLabel: '1834–1836',
    era: 'nha-nguyen',
    title: 'Lập Trấn Tây thành ở Chân Lạp',
    summary:
      'Sau khi đẩy lui quân Xiêm khỏi Chân Lạp (1833–1834), Đại Nam đặt Trấn Tây thành ở Nam Vang, giao Trương Minh Giảng làm Bảo hộ. Cuối năm 1834 vua Nặc Ông Chân mất mà không có con trai; năm 1835 Minh Mạng lập công chúa Ngọc Vân (Ang Mey) làm quận chúa, và năm 1836 chính thức đổi đất Chân Lạp thành Trấn Tây thành, chia thành 33 phủ và 2 huyện theo hệ thống hành chính Đại Nam. Bản đồ tô phần Campuchia hiện đại trừ các vùng Xiêm giữ (Battambang, Siem Reap, Koh Kong, Preah Vihear) và Stung Treng (thuộc Champasak) cho Đại Nam ở mức xấp xỉ, vì quyền lực thực tế của quan lại người Việt không đồng đều trên toàn vùng.',
    assign: assignAll(TRAN_TAY_1834, 'nha-nguyen'),
    lowConfidence: [...TRAN_TAY_1834],
    focus: { lon: 104.9, lat: 11.55 },
    sources: [THUC_LUC_CHINH_BIEN_2, CHANDLER, CHOI_BYUNG_WOOK, LSVN5]
  },
  {
    id: '1838',
    year: 1838,
    yearLabel: '1838',
    era: 'nha-nguyen',
    title: 'Quốc hiệu Đại Nam',
    summary:
      'Năm 1838 (Minh Mạng thứ 19), Minh Mạng đổi quốc hiệu từ Việt Nam thành Đại Nam. Mốc này là sự kiện chính trị, không đổi biên giới trên bản đồ; lãnh thổ Đại Nam lúc này gồm cả Trấn Tây thành và các phủ phên giậu ở miền tây Trường Sơn, và từ đây tên hiển thị của chính thể là Đại Nam.',
    assign: {},
    polityOverrides: {
      'nha-nguyen': { name: 'Đại Nam', capital: 'Phú Xuân (Huế)' }
    },
    focus: { lon: 107.6, lat: 16.45 },
    sources: [THUC_LUC_CHINH_BIEN_2, LSVN5, TRAN_TRONG_KIM]
  },
  {
    id: '1841',
    year: 1841,
    yearLabel: '1841',
    era: 'nha-nguyen',
    title: 'Rút khỏi Trấn Tây thành',
    summary:
      'Minh Mạng mất tháng 1/1841, Thiệu Trị nối ngôi. Trước các cuộc nổi dậy của người Khmer chống quan lại Đại Nam và áp lực quân Xiêm, tháng 9/1841 Thiệu Trị chấp thuận cho Trương Minh Giảng bỏ Trấn Tây thành, rút quân về An Giang. Cũng trong thời gian này, quân Anh chiếm đảo Hồng Kông (tháng 1/1841, nhượng chính thức theo Hòa ước Nam Kinh 1842), nên bản đồ ghi Hồng Kông thuộc Anh từ mốc này. Campuchia trở lại tình trạng một vương quốc riêng dưới ảnh hưởng của Xiêm, trong khi Battambang và Siem Reap tiếp tục nằm dưới Xiêm.',
    assign: {
      ...assignAll(TRAN_TAY_1834, 'campuchia-hau-angkor'),
      'CHN.hong-kong': 'anh'
    },
    lowConfidence: [...TRAN_TAY_1834],
    focus: { lon: 104.9, lat: 11.55 },
    sources: [THUC_LUC_CHINH_BIEN_3, CHANDLER, CHOI_BYUNG_WOOK, LSVN5, FAIRBANK]
  },
  {
    id: '1847',
    year: 1847,
    yearLabel: '1847',
    era: 'nha-nguyen',
    title: 'Hòa ước Xiêm – Việt, Chân Lạp thần phục cả hai',
    summary:
      'Sau cuộc chiến tranh Xiêm – Việt (1841–1845), hai bên thỏa thuận cùng bảo hộ Chân Lạp; đến năm 1847 việc dàn xếp được chính thức hóa: hoàng tử Ang Duong, người từng ở Băng Cốc, được công nhận làm vua và phải triều cống cả Xiêm lẫn Đại Nam (lễ đăng quang tổ chức năm 1848). Battambang và Siem Reap tiếp tục thuộc Xiêm; phần Campuchia còn lại là vùng đệm giữa hai nước. Trên bản đồ, Đại Nam giữ phần lớn lãnh thổ Việt Nam ngày nay cùng phủ Trấn Ninh và một số vùng phên giậu ở Lào; Campuchia lệ thuộc cả hai nước. Ma Cao do người Bồ Đào Nha quản lý trên thực tế nên bản đồ để trống vùng này từ mốc này.',
    assign: { 'CHN.ma-cao': null },
    focus: { lon: 104.9, lat: 12.0 },
    sources: [THUC_LUC_CHINH_BIEN_3, CHANDLER, WYATT, BAKER_PASUK, LSVN5]
  }
];
