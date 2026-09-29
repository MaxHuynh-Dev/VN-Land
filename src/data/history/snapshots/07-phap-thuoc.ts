import type { Snapshot, Source } from '../types';

/*
 * Task C7 — mốc Pháp thuộc (1858 → 3/1945), 16 mốc, era phap-thuoc.
 *
 * File này tự đứng một mình: mốc đầu (`1858`) có `'*': null` và gán đầy đủ mọi vùng có chủ. Trạng
 * thái xuất phát khớp mốc `1847` của 06-tay-son-nguyen.ts (đã đối chiếu từng ô), trừ các khác biệt
 * có chủ ý ghi dưới đây:
 * - Đại Nam giữ Bắc Bộ, Trung Bộ, Nam Kỳ lục tỉnh (kể cả Sóc Trăng, Tây Ninh, Bình Dương, Bình
 *   Phước, Côn Đảo), Panduranga cũ, Trấn Ninh (Xiêng Khoảng), Sầm Nứa (Houaphan), các huyện Lạc
 *   Biên (đông Savannakhet) và Trấn Định (đông Khammouane), Hoàng Sa, Trường Sa. Tây Nguyên (Kon
 *   Tum, Gia Lai, Đắk Lắk, Đắk Nông, Lâm Đồng) không có chủ như ở 06 (quyền của triều Nguyễn ở đó
 *   chỉ là danh nghĩa, triều cống); ô An Khê (Gia Lai) thuộc Đại Nam như ở 06. Tây Nguyên chuyển
 *   sang Pháp ở mốc `1899` (mốc gần nhất trong khoảng 1893–1905).
 * - Campuchia (Ang Duong, thần phục Xiêm): Battambang, Siem Reap, Sisophon, Oddar Meanchey, Pailin
 *   do Xiêm cai quản trực tiếp từ 1794–1795 (như 06). Khác 06: Koh Kong và Preah Vihear (Mlu Prey)
 *   cũng thuộc Xiêm (Xiêm nhượng năm 1904), Stung Treng thuộc quyền Champasak (Pháp chiếm 1893).
 * - Lào: Luang Prabang (kể cả Phongsaly, Xaignabouli) và Champasak (kể cả 11 huyện Savannakhet
 *   ngoài Lạc Biên) là chư hầu Xiêm; Viêng Chăn, Bolikhamsai, Xaisomboun, nửa tây Khammouane do
 *   Xiêm cai quản trực tiếp sau 1828 (như 06). Hai huyện Nhot Ou, Boun Neua (Phongsaly) chuyển sang
 *   Vân Nam ở mốc `1887`.
 * - Khác 06 có chủ ý: đảo Hồng Kông thuộc Anh từ 1842 (06 để nhà Thanh); Đà Nẵng (Sơn Trà, Hải
 *   Châu) thuộc Pháp do cuộc tấn công 1858.
 * - Ma Cao (thuộc Bồ Đào Nha từ 1557, không có chính thể riêng trong danh mục) để không chủ (null)
 *   suốt file, khớp 08-hien-dai.ts (null đến 1999).
 *
 * Khác biệt so với bảng mốc: không có năm nào phải sửa (id, year, yearLabel giữ nguyên).
 *
 * Hoàng Sa, Trường Sa: theo quy tắc, luôn gán cho chính thể Việt đang kiểm soát miền Trung (nhà
 * Nguyễn / Trung Kỳ, rồi Đế quốc Việt Nam). Việc Pháp sáp nhập Trường Sa vào tỉnh Bà Rịa (1933) chỉ
 * nêu trong summary, không đổi chủ ô.
 *
 * Nhóm mới (trong groups.ts): `dong-nam-ky-1862` — ba tỉnh miền Đông và Côn Lôn.
 *
 * Ghi chú dữ liệu ô: ô Zhanjiang (Trạm Giang, vùng Quảng Châu Loan) nằm dưới ADM1 `CHN.hai-nam`
 * trong bộ dữ liệu (id `CHN.hai-nam.zhanjianghsi`), không dưới `CHN.quang-dong`.
 */

const LSVN6: Source = {
  title: 'Lịch sử Việt Nam, tập 6 (từ năm 1858 đến năm 1896)',
  author: 'Viện Sử học',
  note: 'NXB Khoa học xã hội'
};
const LSVN7: Source = {
  title: 'Lịch sử Việt Nam, tập 7 (từ năm 1897 đến năm 1918)',
  author: 'Viện Sử học',
  note: 'NXB Khoa học xã hội'
};
const LSVN9: Source = {
  title: 'Lịch sử Việt Nam, tập 9 (từ năm 1930 đến năm 1945)',
  author: 'Viện Sử học',
  note: 'NXB Khoa học xã hội'
};
const THUC_LUC_4: Source = {
  title: 'Đại Nam thực lục chính biên, đệ tứ kỷ (Tự Đức)',
  author: 'Quốc sử quán triều Nguyễn'
};
const THUC_LUC_5: Source = {
  title: 'Đại Nam thực lục chính biên, đệ ngũ kỷ',
  author: 'Quốc sử quán triều Nguyễn'
};
const THUC_LUC_6: Source = {
  title: 'Đại Nam thực lục chính biên, đệ lục kỷ (Hàm Nghi, Đồng Khánh)',
  author: 'Quốc sử quán triều Nguyễn'
};
const TRAN_TRONG_KIM: Source = {
  title: 'Việt Nam sử lược',
  author: 'Trần Trọng Kim',
  note: '1920'
};
const BROCHEUX_HEMERY: Source = {
  title: 'Indochina: An Ambiguous Colonization, 1858–1954',
  author: 'Pierre Brocheux, Daniel Hémery',
  note: 'University of California Press, 2009'
};
const FOURNIAU: Source = {
  title: 'Vietnam: domination coloniale et résistance nationale, 1858–1914',
  author: 'Charles Fourniau',
  note: 'Les Indes savantes, 2002'
};
const OSBORNE: Source = {
  title: 'The French Presence in Cochinchina and Cambodia: Rule and Response (1859–1905)',
  author: 'Milton Osborne',
  note: 'Cornell University Press, 1969'
};
const CHANDLER: Source = {
  title: 'A History of Cambodia',
  author: 'David Chandler',
  note: 'Westview Press, 4th ed., 2008'
};
const STUART_FOX: Source = {
  title: 'A History of Laos',
  author: 'Martin Stuart-Fox',
  note: 'Cambridge University Press, 1997'
};
const HOA_UOC_1862: Source = {
  title: 'Hòa ước Nhâm Tuất (Traité de Saïgon), ngày 5 tháng 6 năm 1862',
  note: 'Văn bản hòa ước'
};
const HOA_UOC_1874: Source = {
  title: 'Hòa ước Giáp Tuất (Traité de Saïgon), ngày 15 tháng 3 năm 1874',
  note: 'Văn bản hòa ước'
};
const HOA_UOC_1884: Source = {
  title: 'Hòa ước Giáp Thân (Hòa ước Patenôtre), ngày 6 tháng 6 năm 1884',
  note: 'Văn bản hòa ước'
};
const THIEN_TAN_1885: Source = {
  title: 'Hòa ước Thiên Tân (Li Hongzhang – Patenôtre), ngày 9 tháng 6 năm 1885',
  note: 'Văn bản hòa ước'
};
const CONG_UOC_1887: Source = {
  title:
    'Công ước Pháp – Thanh về việc phân định biên giới giữa Trung Quốc và Bắc Kỳ, ngày 26 tháng 6 năm 1887',
  note: 'Văn bản công ước'
};
const CONG_UOC_1895: Source = {
  title: 'Công ước bổ sung Pháp – Thanh về biên giới, ngày 20 tháng 6 năm 1895',
  note: 'Văn bản công ước'
};
const HIEP_UOC_1893: Source = {
  title: 'Hiệp ước Pháp – Xiêm, ngày 3 tháng 10 năm 1893',
  note: 'Văn bản hiệp ước'
};
const HIEP_UOC_1904_1907: Source = {
  title: 'Hiệp ước Pháp – Xiêm ngày 13 tháng 2 năm 1904 và ngày 23 tháng 3 năm 1907',
  note: 'Văn bản hiệp ước'
};
const CONG_UOC_QUANG_CHAU_LOAN: Source = {
  title: 'Công ước Pháp – Thanh về việc Pháp thuê Quảng Châu Loan, 1898–1899',
  note: 'Văn bản công ước'
};
const CHEMILLIER: Source = {
  title: 'Sovereignty over the Paracel and Spratly Islands',
  author: 'Monique Chemillier-Gendreau',
  note: 'Kluwer Law International, 2000'
};
const REYNOLDS: Source = {
  title: "Thailand and Japan's Southern Advance, 1940–1945",
  author: 'E. Bruce Reynolds',
  note: "St. Martin's Press, 1994"
};
const DEVILLERS: Source = {
  title: 'Histoire du Viêt-Nam de 1940 à 1952',
  author: 'Philippe Devillers',
  note: 'Éditions du Seuil, 1952'
};
const MARR: Source = {
  title: 'Vietnam 1945: The Quest for Power',
  author: 'David G. Marr',
  note: 'University of California Press, 1995'
};
const TRAN_TRONG_KIM_GIO_BUI: Source = {
  title: 'Một cơn gió bụi',
  author: 'Trần Trọng Kim',
  note: '1969'
};

const BAC_BO = [
  'VNM.ha-noi',
  'VNM.bac-ninh',
  'VNM.hung-yen',
  'VNM.hai-duong',
  'VNM.ha-nam',
  'VNM.nam-dinh',
  'VNM.thai-binh',
  'VNM.ninh-binh',
  'VNM.vinh-phuc',
  'VNM.phu-tho',
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
const TAY_NGUYEN = ['VNM.lam-dong', 'VNM.dak-lak', 'VNM.dak-nong', 'VNM.gia-lai', 'VNM.kon-tum'];
const LAC_BIEN_1828 = [
  'LAO.savannakhet.sepone',
  'LAO.savannakhet.phine',
  'LAO.savannakhet.nong',
  'LAO.savannakhet.vilabuly'
];
const TRAN_DINH_1828 = [
  'LAO.khammouane.nakay',
  'LAO.khammouane.bualapha',
  'LAO.khammouane.mahaxay',
  'LAO.khammouane.nhommalath',
  'LAO.khammouane.hinboon'
];
const DA_NANG_1858 = ['VNM.da-nang.son-tra', 'VNM.da-nang.hai-chau'];
const SAI_GON_1859 = ['VNM.tp-ho-chi-minh.quan-1', 'VNM.tp-ho-chi-minh.quan-3'];
/** Bốn ô Lai Châu – Điện Biên do phía Vân Nam quản lý theo đường biên 1887, trả về 1895. */
const TAY_BAC_VAN_NAM = [
  'VNM.lai-chau.muong-te',
  'VNM.lai-chau.phong-tho',
  'VNM.lai-chau.sin-ho',
  'VNM.dien-bien.muong-nhe'
];
/** Hai ô Phongsaly do phía Vân Nam quản lý đến 1895. */
const PHONGSALY_VAN_NAM = ['LAO.phongsaly.nhot-ou', 'LAO.phongsaly.boon-neua'];
const PHONGSALY_KHAC = [
  'LAO.phongsaly.boontay',
  'LAO.phongsaly.khua',
  'LAO.phongsaly.may',
  'LAO.phongsaly.phongsaly',
  'LAO.phongsaly.samphanh'
];
const CHAMPASACK_HUU_NGAN = 'LAO.champasak.champasack';
const CHAMPASAK_SANASOMBOON = 'LAO.champasak.sanasomboon';
const XIEM_CAMPUCHIA = [
  'KHM.battambang',
  'KHM.pailin',
  'KHM.siem-reap',
  'KHM.bantey-meanchey',
  'KHM.oddar-meanchey'
];
const CAMPUCHIA_1863 = [
  'KHM.kampong-cham',
  'KHM.kampong-chhnang',
  'KHM.kampong-speu',
  'KHM.kampong-thom',
  'KHM.kampot',
  'KHM.kandal',
  'KHM.kep',
  'KHM.kratie',
  'KHM.mondulkiri',
  'KHM.phnom-penh',
  'KHM.preah-sihanouk',
  'KHM.prey-veng',
  'KHM.pursat',
  'KHM.ratanakiri',
  'KHM.svay-rieng',
  'KHM.takeo',
  'KHM.tbong-khmum'
];
const LAO_TA_NGAN = [
  'LAO.luang-prabang',
  'LAO.oudomxay',
  'LAO.luang-namtha',
  'LAO.bokeo',
  'LAO.houaphan',
  'LAO.xiangkhouang',
  'LAO.vientiane',
  'LAO.vientiane-capital',
  'LAO.bolikhamsai',
  'LAO.khammouane',
  'LAO.xaisomboun',
  'LAO.savannakhet',
  'LAO.salavan',
  'LAO.xekong',
  'LAO.attapeu'
];
const VIENG_CHAN_XIEM = [
  'LAO.vientiane',
  'LAO.vientiane-capital',
  'LAO.bolikhamsai',
  'LAO.khammouane',
  'LAO.xaisomboun'
];
const LUANG_PRABANG_1858 = [
  'LAO.luang-prabang',
  'LAO.xaignabouli',
  'LAO.oudomxay',
  'LAO.luang-namtha',
  'LAO.bokeo',
  'LAO.phongsaly'
];
const CHAMPASAK_1858 = [
  'LAO.champasak',
  'LAO.salavan',
  'LAO.xekong',
  'LAO.attapeu',
  'LAO.savannakhet'
];
const THAI_1941_KHM = [...XIEM_CAMPUCHIA, 'KHM.preah-vihear'];
const THAI_1941_LAO = ['LAO.xaignabouli', CHAMPASACK_HUU_NGAN, CHAMPASAK_SANASOMBOON];
const CAMPUCHIA_1945 = [...CAMPUCHIA_1863, 'KHM.koh-kong', 'KHM.stung-treng'];
const LAO_1945 = [...LAO_TA_NGAN, 'LAO.phongsaly'];
const ZHANJIANG = 'CHN.hai-nam.zhanjianghsi';

const assignAll = (selectors: string[], polity: string) =>
  Object.fromEntries(selectors.map((s) => [s, polity]));

export const PHAP_THUOC: Snapshot[] = [
  {
    id: '1858',
    year: 1858,
    yearLabel: '1858',
    era: 'phap-thuoc',
    title: 'Liên quân Pháp – Tây Ban Nha đánh Đà Nẵng',
    summary:
      'Ngày 1 tháng 9 năm 1858, hạm đội Pháp của Đô đốc Rigault de Genouilly, có kèm quân Tây Ban Nha từ Philippines, nổ súng vào cửa biển Đà Nẵng (Tourane), chiếm các pháo đài ở bán đảo Sơn Trà và cửa sông Hàn viện cớ triều Nguyễn cấm đạo Công giáo và hạn chế thông thương. Quân Pháp bị quân Nguyễn chặn ở chiến tuyến quanh Đà Nẵng, lại bị bệnh tật làm hao quân nên chỉ giữ được một vùng nhỏ ven vịnh, không tiến được đến Huế. Ngoài vùng đó, toàn cõi Đại Nam dưới triều Tự Đức vẫn thuộc nhà Nguyễn, trừ Tây Nguyên, nơi quyền của triều đình chỉ mang tính danh nghĩa nên để trống; Campuchia thần phục Xiêm, trong đó Battambang, Siem Reap và Koh Kong do Xiêm trực tiếp cai quản; ở Lào, Luang Prabang và Champasak là chư hầu Xiêm, vùng Viêng Chăn do Xiêm cai quản, còn Trấn Ninh, Sầm Nứa và các huyện phía tây Cam Lộ đã nội thuộc Đại Nam từ năm 1828; Lưỡng Quảng và Hải Nam thuộc nhà Thanh, đảo Hồng Kông thuộc Anh, còn Ma Cao là đất của Bồ Đào Nha nên để trống.',
    assign: {
      '*': null,
      VNM: 'nha-nguyen',
      ...Object.fromEntries(TAY_NGUYEN.map((t) => [t, null])),
      'VNM.gia-lai.an-khe': 'nha-nguyen',
      ...assignAll(DA_NANG_1858, 'phap'),
      CHN: 'nha-thanh',
      'CHN.hong-kong.xianggang': 'anh',
      'CHN.ma-cao': null,
      KHM: 'campuchia-hau-angkor',
      ...assignAll(XIEM_CAMPUCHIA, 'xiem'),
      'KHM.koh-kong': 'xiem',
      'KHM.preah-vihear': 'xiem',
      'KHM.stung-treng': 'champasak',
      ...assignAll(LUANG_PRABANG_1858, 'luang-prabang'),
      ...assignAll(VIENG_CHAN_XIEM, 'xiem'),
      ...assignAll(CHAMPASAK_1858, 'champasak'),
      ...assignAll(LAC_BIEN_1828, 'nha-nguyen'),
      ...assignAll(TRAN_DINH_1828, 'nha-nguyen'),
      'LAO.houaphan': 'nha-nguyen',
      'LAO.xiangkhouang': 'nha-nguyen'
    },
    polityOverrides: {
      'nha-nguyen': { name: 'Đại Nam', capital: 'Phú Xuân (Huế)' },
      phap: { name: 'Pháp (vùng chiếm đóng)' }
    },
    lowConfidence: [
      ...DA_NANG_1858,
      'LAO',
      ...XIEM_CAMPUCHIA,
      'KHM.koh-kong',
      'KHM.preah-vihear',
      'KHM.stung-treng',
      'KHM.mondulkiri',
      'KHM.ratanakiri'
    ],
    focus: { lon: 108.22, lat: 16.1 },
    sources: [THUC_LUC_4, LSVN6, TRAN_TRONG_KIM, FOURNIAU]
  },
  {
    id: '1859',
    year: 1859,
    yearLabel: '1859',
    era: 'phap-thuoc',
    title: 'Pháp chiếm thành Gia Định',
    summary:
      'Không thể tiến sâu từ Đà Nẵng, Rigault de Genouilly đem một phần hạm đội vào Nam, chiếm thành Gia Định (Sài Gòn) ngày 17 tháng 2 năm 1859 rồi phá thành và chỉ giữ một khu nhỏ quanh bến cảng. Pháp giữ đồng thời hai điểm (Đà Nẵng, Sài Gòn) trong một thời gian ngắn vì lực lượng quá mỏng; toàn bộ phần còn lại của Nam Kỳ vẫn do triều Nguyễn cai quản, cho đến khi quân Pháp mở rộng vùng chiếm đóng sau khi thắng đồn Chí Hòa năm 1861. Ranh giới vùng Pháp chiếm quanh Sài Gòn chỉ có thể ước lượng theo địa giới hành chính hiện nay.',
    assign: assignAll(SAI_GON_1859, 'phap'),
    lowConfidence: [...DA_NANG_1858, ...SAI_GON_1859],
    focus: { lon: 106.7, lat: 10.78 },
    sources: [THUC_LUC_4, LSVN6, TRAN_TRONG_KIM, OSBORNE]
  },
  {
    id: '1862',
    year: 1862,
    yearLabel: '1862',
    era: 'phap-thuoc',
    title: 'Hòa ước Nhâm Tuất: mất ba tỉnh miền Đông',
    summary:
      'Ngày 5 tháng 6 năm 1862, sau khi quân Pháp chiếm Biên Hòa, Gia Định, Định Tường và Vĩnh Long, đại diện triều Nguyễn là Phan Thanh Giản và Lâm Duy Thiệp ký với Đô đốc Bonard (kèm đại diện Tây Ban Nha) Hòa ước Nhâm Tuất. Triều Nguyễn nhường hẳn ba tỉnh Biên Hòa, Gia Định, Định Tường cùng đảo Côn Lôn cho Pháp, mở các cửa biển Đà Nẵng, Ba Lạt, Quảng Yên, chấp nhận tự do truyền đạo Công giáo và bồi thường 4 triệu đồng bạc; hòa ước được phê chuẩn tại Huế tháng 4 năm 1863. Đà Nẵng được trả lại cho triều Nguyễn vì quân Pháp đã rút từ năm 1860. Ranh giới ba tỉnh miền Đông ở đây tính xấp xỉ theo các tỉnh ngày nay, riêng vùng Tây Ninh, Bình Dương, Bình Phước còn thưa dân.',
    assign: {
      'group:dong-nam-ky-1862': 'phap',
      ...assignAll(DA_NANG_1858, 'nha-nguyen')
    },
    polityOverrides: { phap: { name: 'Nam Kỳ thuộc Pháp' } },
    lowConfidence: ['group:dong-nam-ky-1862'],
    focus: { lon: 106.7, lat: 10.9 },
    sources: [HOA_UOC_1862, THUC_LUC_4, LSVN6, BROCHEUX_HEMERY]
  },
  {
    id: '1863',
    year: 1863,
    yearLabel: '1863',
    era: 'phap-thuoc',
    title: 'Pháp bảo hộ Campuchia',
    summary:
      'Ngày 11 tháng 8 năm 1863, tại Oudong, vua Norodom ký với sĩ quan hải quân Doudart de Lagrée hiệp ước đặt Campuchia dưới quyền bảo hộ của Pháp; lễ đăng quang của Norodom do đại diện Pháp chủ trì năm 1864. Nhờ đó Pháp kiểm soát ngoại giao của Campuchia và có chỗ đứng ở sườn tây Nam Kỳ, thay cho quan hệ thần phục nhiều thế kỷ với Xiêm và Đại Nam. Battambang, Siem Reap, Sisophon và Koh Kong vẫn thuộc Xiêm; hiệp ước Pháp – Xiêm năm 1867 xác nhận cả việc này lẫn quyền bảo hộ của Pháp. Vùng Preah Vihear và Stung Treng chưa thuộc lãnh thổ Campuchia bảo hộ.',
    assign: assignAll(CAMPUCHIA_1863, 'phap'),
    polityOverrides: { phap: { name: 'Pháp (Nam Kỳ thuộc địa, Campuchia bảo hộ)' } },
    lowConfidence: ['KHM.mondulkiri', 'KHM.ratanakiri'],
    focus: { lon: 104.9, lat: 11.55 },
    sources: [OSBORNE, CHANDLER, LSVN6, BROCHEUX_HEMERY]
  },
  {
    id: '1867',
    year: 1867,
    yearLabel: '1867',
    era: 'phap-thuoc',
    title: 'Pháp chiếm ba tỉnh miền Tây Nam Kỳ',
    summary:
      'Từ ngày 20 đến 24 tháng 6 năm 1867, Đô đốc de La Grandière đem quân chiếm Vĩnh Long, An Giang (Châu Đốc) và Hà Tiên mà không gặp kháng cự đáng kể, viện cớ triều Nguyễn không ngăn được các cuộc nổi dậy chống Pháp xuất phát từ vùng này. Kinh lược sứ Phan Thanh Giản, người giữ Vĩnh Long, nhịn ăn, uống thuốc độc và mất ngày 4 tháng 8 năm 1867. Từ đó toàn bộ sáu tỉnh Nam Kỳ (bao gồm cả Cà Mau, Sóc Trăng, Bạc Liêu, Cần Thơ) thuộc Pháp, chỉ còn phần đất dưới quyền triều Nguyễn ở Trung Kỳ và Bắc Kỳ.',
    assign: { 'group:nam-bo': 'phap' },
    focus: { lon: 105.5, lat: 10.2 },
    sources: [THUC_LUC_4, LSVN6, TRAN_TRONG_KIM, OSBORNE]
  },
  {
    id: '1874',
    year: 1874,
    yearLabel: '1874',
    era: 'phap-thuoc',
    title: 'Hòa ước Giáp Tuất',
    summary:
      'Sau vụ Francis Garnier đánh Hà Nội rồi tử trận cuối năm 1873, Pháp và triều Nguyễn ký Hòa ước Giáp Tuất tại Sài Gòn ngày 15 tháng 3 năm 1874 (sách Pháp gọi là hòa ước Philastre). Triều Nguyễn chính thức thừa nhận chủ quyền của Pháp ở sáu tỉnh Nam Kỳ, mở các cửa Thị Nại (Quy Nhơn), Hải Phòng, Hà Nội và cho tàu bè Pháp đi lại trên sông Hồng; Pháp thừa nhận nền độc lập của Đại Nam đối với nước ngoài và cam kết giúp dẹp loạn. Mốc này không đổi lãnh thổ so với 1867 mà chỉ hợp thức hóa việc mất Nam Kỳ về mặt điều ước.',
    assign: {},
    focus: { lon: 106.7, lat: 10.8 },
    sources: [HOA_UOC_1874, THUC_LUC_4, LSVN6, TRAN_TRONG_KIM]
  },
  {
    id: '1884',
    year: 1884,
    yearLabel: '1884',
    era: 'phap-thuoc',
    title: 'Hòa ước Giáp Thân: Pháp bảo hộ Bắc Kỳ, Trung Kỳ',
    summary:
      'Sau các hòa ước Quý Mùi (1883, Harmand) và Giáp Thân (6 tháng 6 năm 1884, Patenôtre), Việt Nam bị chia thành ba xứ: Nam Kỳ là thuộc địa do Pháp trực tiếp cai trị (đã sáp nhập từ 1862–1867), Bắc Kỳ là xứ bảo hộ do các viên chức Pháp đứng đầu, còn Trung Kỳ do triều đình Huế cai quản dưới quyền giám sát của Khâm sứ Pháp. Hòa ước 1884 trả lại cho triều Nguyễn Bình Thuận và ba tỉnh Thanh Hóa, Nghệ An, Hà Tĩnh mà hòa ước 1883 đã tách ra; Pháp nắm ngoại giao và các dịch vụ quan trọng. Trên thực tế quân Pháp chưa làm chủ hết Bắc Kỳ, riêng miền núi Tây Bắc (Lai Châu, Điện Biên, Sơn La) chỉ đặt dưới quyền Pháp từ khoảng năm 1888, nên ranh giới ở vùng đó chưa chắc chắn.',
    assign: {
      ...assignAll(BAC_BO, 'phap')
    },
    polityOverrides: {
      'nha-nguyen': {
        name: 'Trung Kỳ (Nam triều, dưới bảo hộ Pháp)',
        capital: 'Huế'
      },
      phap: { name: 'Pháp (Nam Kỳ thuộc địa, Bắc Kỳ và Campuchia bảo hộ)' }
    },
    lowConfidence: ['VNM.lai-chau', 'VNM.dien-bien', 'VNM.son-la'],
    focus: { lon: 106.0, lat: 18.2 },
    sources: [HOA_UOC_1884, THUC_LUC_5, LSVN6, BROCHEUX_HEMERY]
  },
  {
    id: '1885',
    year: 1885,
    yearLabel: '1885',
    era: 'phap-thuoc',
    title: 'Hòa ước Thiên Tân; phong trào Cần Vương',
    summary:
      'Ngày 9 tháng 6 năm 1885, sau chiến tranh Pháp – Thanh (1884–1885), nhà Thanh ký Hòa ước Thiên Tân với Pháp, công nhận quyền bảo hộ của Pháp ở Bắc Kỳ và Trung Kỳ, rút quân khỏi Bắc Kỳ và chấp nhận sẽ phân định biên giới. Đêm 4 rạng ngày 5 tháng 7 năm 1885, Tôn Thất Thuyết tấn công quân Pháp ở Huế nhưng thất bại; vua Hàm Nghi rời kinh thành và ngày 13 tháng 7 ban chiếu Cần Vương kêu gọi kháng Pháp, khởi đầu phong trào Cần Vương kéo dài đến khoảng năm 1896. Pháp lập vua Đồng Khánh thay Hàm Nghi ngày 19 tháng 9 năm 1885; ranh giới các xứ không đổi.',
    assign: {},
    focus: { lon: 107.6, lat: 16.46 },
    sources: [THIEN_TAN_1885, THUC_LUC_6, LSVN6, TRAN_TRONG_KIM]
  },
  {
    id: '1887',
    year: 1887,
    yearLabel: '1887',
    era: 'phap-thuoc',
    title: 'Liên bang Đông Dương; Công ước Pháp – Thanh',
    summary:
      'Ngày 26 tháng 6 năm 1887, Pháp và nhà Thanh ký công ước phân định biên giới Bắc Kỳ – Trung Hoa, thi hành điều 3 Hòa ước Thiên Tân: đoạn Quảng Đông, Quảng Tây được phân định, trong đó một số điểm tranh chấp ở phía đông và đông bắc Móng Cái (khu Trúc Sơn, Vạn Vĩ) giao cho Trung Hoa; đoạn Vân Nam chưa phân định xong nên các khu Mường Tè, Phong Thổ, Sìn Hồ (Lai Châu), Mường Nhé (Điện Biên) và hai khu Nhot Ou, Boun Neua (Phongsaly) được để cho phía Vân Nam quản lý, đến khi phân định lại năm 1895; ranh giới các khu này chỉ ước lượng theo huyện ngày nay. Ngày 17 tháng 10 năm 1887, sắc lệnh của Pháp lập Liên bang Đông Dương gồm Nam Kỳ (thuộc địa), Bắc Kỳ, Trung Kỳ, Campuchia (xứ bảo hộ) dưới quyền một Toàn quyền. Việc này chỉ hợp nhất bộ máy hành chính, không đổi thêm chủ ô.',
    assign: {
      ...assignAll(TAY_BAC_VAN_NAM, 'nha-thanh'),
      ...assignAll(PHONGSALY_VAN_NAM, 'nha-thanh')
    },
    polityOverrides: { phap: { name: 'Đông Dương thuộc Pháp' } },
    lowConfidence: [...TAY_BAC_VAN_NAM, ...PHONGSALY_VAN_NAM],
    focus: { lon: 103.3, lat: 22.0 },
    sources: [CONG_UOC_1887, THIEN_TAN_1885, LSVN6, BROCHEUX_HEMERY]
  },
  {
    id: '1893',
    year: 1893,
    yearLabel: '1893',
    era: 'phap-thuoc',
    title: 'Xiêm nhượng tả ngạn Mê Kông, Lào vào Đông Dương',
    summary:
      'Sau sự kiện tàu chiến Pháp vào sông Chao Phraya (Paknam) tháng 7 năm 1893, hiệp ước Pháp – Xiêm ngày 3 tháng 10 năm 1893 buộc Xiêm từ bỏ mọi yêu sách đối với tả ngạn sông Mê Kông và các đảo trên sông, gồm cả Stung Treng ở Campuchia. Toàn bộ Lào ở tả ngạn (Luang Prabang, Viêng Chăn, Sầm Nứa, Xiêng Khoảng — vốn nội thuộc Đại Nam từ 1828 — Savannakhet và phần lớn Champasak) trở thành đất thuộc Pháp và được đặt dưới quyền Toàn quyền Đông Dương, thống nhất hành chính năm 1899. Hữu ngạn sông Mê Kông — vùng Xayabury của Luang Prabang và các huyện Champasak, Sanasomboon bên kia sông, vốn là chư hầu của Xiêm — vẫn thuộc Xiêm cho đến năm 1904. Ranh giới ở Lào chỉ ước lượng theo huyện ngày nay.',
    assign: {
      ...assignAll(LAO_TA_NGAN, 'phap'),
      'LAO.champasak': 'phap',
      [CHAMPASACK_HUU_NGAN]: 'champasak',
      [CHAMPASAK_SANASOMBOON]: 'champasak',
      ...assignAll(PHONGSALY_KHAC, 'phap'),
      'LAO.xaignabouli': 'xiem',
      'KHM.stung-treng': 'phap'
    },
    lowConfidence: ['LAO', 'KHM.stung-treng'],
    focus: { lon: 103.5, lat: 17.5 },
    sources: [HIEP_UOC_1893, STUART_FOX, LSVN6, BROCHEUX_HEMERY]
  },
  {
    id: '1895',
    year: 1895,
    yearLabel: '1895',
    era: 'phap-thuoc',
    title: 'Công ước bổ sung về biên giới Pháp – Thanh',
    summary:
      'Ngày 20 tháng 6 năm 1895, công ước bổ sung Pháp – Thanh phân định tiếp đoạn biên giới Bắc Kỳ – Vân Nam và Lào – Vân Nam. Theo đó các khu vực Mường Tè, Phong Thổ, Sìn Hồ (Lai Châu), Mường Nhé (Điện Biên) do phía Vân Nam quản lý được chuyển về Bắc Kỳ, còn các khu Nhot Ou và một phần Boun Neua (Phongsaly) được chuyển vào lãnh thổ Lào thuộc Pháp. Ranh giới các khu này chỉ ước lượng theo các huyện ngày nay.',
    assign: {
      ...assignAll(TAY_BAC_VAN_NAM, 'phap'),
      ...assignAll(PHONGSALY_VAN_NAM, 'phap')
    },
    lowConfidence: [...TAY_BAC_VAN_NAM, ...PHONGSALY_VAN_NAM],
    focus: { lon: 102.5, lat: 22.2 },
    sources: [CONG_UOC_1895, CONG_UOC_1887, LSVN6, BROCHEUX_HEMERY]
  },
  {
    id: '1899',
    year: 1899,
    yearLabel: '1899',
    era: 'phap-thuoc',
    title: 'Pháp thuê Quảng Châu Loan',
    summary:
      'Tháng 4 năm 1898, hải quân Pháp chiếm vùng Quảng Châu Loan (Kouang-Tchéou-Wan) ở bờ biển phía nam Quảng Đông, quanh khu Trạm Giang ngày nay; hai bên ký thỏa thuận thuê 99 năm ngày 27 tháng 5 năm 1898, và công ước ngày 16 tháng 11 năm 1899 quy định chi tiết việc thuê. Từ ngày 5 tháng 1 năm 1900, vùng này đặt dưới quyền Toàn quyền Đông Dương như một lãnh thổ thuê, nhằm làm căn cứ và cảng phía bắc vịnh Bắc Bộ. Cũng trong khoảng 1893–1905 Pháp lần lượt lập đồn và đặt công sứ ở cao nguyên miền Trung (Kon Tum, Gia Lai, Đắk Lắk, Lâm Đồng), nên Tây Nguyên được tô cho Pháp từ mốc này (ranh giới và thời điểm chỉ gần đúng). Vùng Quảng Châu Loan được vẽ theo địa giới Trạm Giang hiện nay, chỉ gần đúng với phạm vi thực tế của vùng thuê.',
    assign: {
      [ZHANJIANG]: 'phap',
      ...Object.fromEntries(TAY_NGUYEN.map((t) => [t, 'phap'])),
      'VNM.gia-lai.an-khe': 'nha-nguyen'
    },
    lowConfidence: [ZHANJIANG, ...TAY_NGUYEN],
    focus: { lon: 110.4, lat: 21.2 },
    sources: [CONG_UOC_QUANG_CHAU_LOAN, BROCHEUX_HEMERY, LSVN7]
  },
  {
    id: '1907',
    year: 1907,
    yearLabel: '1907',
    era: 'phap-thuoc',
    title: 'Xiêm trả Battambang, Siem Reap cho Campuchia',
    summary:
      'Ngày 23 tháng 3 năm 1907, hiệp ước Pháp – Xiêm buộc Xiêm nhượng các tỉnh Battambang, Siem Reap và Sisophon (gồm cả khu Angkor) cho Campuchia thuộc Pháp, đổi lại Pháp rút khỏi Trat và Dan Sai. Việc này tiếp nối hiệp ước tháng 2 năm 1904, trong đó Xiêm đã nhượng vùng Mlu Prey (Preah Vihear) cho Campuchia, cùng đất hữu ngạn sông Mê Kông của Champasak và của Luang Prabang (Xayabury) cho Lào, đồng thời trao Trat và Koh Kong cho Pháp (Pháp trả Trat năm 1907 nhưng giữ Koh Kong); mốc 1907 là mốc gần nhất nên ghi luôn các thay đổi năm 1904 vào đây, với ranh giới chỉ ước lượng. Từ đây Xiêm không còn lãnh thổ nào trong khu vực bản đồ, còn nhà Thanh vẫn giữ Lưỡng Quảng đến khi sụp đổ năm 1912 (xem mốc 1933).',
    assign: {
      ...assignAll(XIEM_CAMPUCHIA, 'phap'),
      'KHM.preah-vihear': 'phap',
      'KHM.koh-kong': 'phap',
      'LAO.xaignabouli': 'phap',
      [CHAMPASACK_HUU_NGAN]: 'phap',
      [CHAMPASAK_SANASOMBOON]: 'phap'
    },
    lowConfidence: [
      'KHM.preah-vihear',
      'KHM.koh-kong',
      'LAO.xaignabouli',
      CHAMPASACK_HUU_NGAN,
      CHAMPASAK_SANASOMBOON
    ],
    focus: { lon: 103.9, lat: 13.4 },
    sources: [HIEP_UOC_1904_1907, CHANDLER, STUART_FOX, LSVN7]
  },
  {
    id: '1933',
    year: 1933,
    yearLabel: '1933',
    era: 'phap-thuoc',
    title: 'Pháp sáp nhập Trường Sa vào tỉnh Bà Rịa',
    summary:
      'Từ tháng 4 năm 1933, hải quân Pháp chiếm giữ một số đảo ở Trường Sa (Trường Sa, An Bang, Ba Bình, Song Tử Đông, Song Tử Tây, Loại Ta, Thị Tứ, v.v.), thông báo trên Công báo Pháp ngày 26 tháng 7 năm 1933; ngày 21 tháng 12 năm 1933 Thống đốc Nam Kỳ ký nghị định sáp nhập quần đảo vào tỉnh Bà Rịa của Nam Kỳ thuộc Pháp. Nhật Bản phản đối việc này, còn chính phủ Trung Hoa Dân Quốc không chính thức phản đối vì khi đó chưa xác lập yêu sách đối với Trường Sa. Trường Sa vẫn thuộc phần lãnh thổ Việt Nam trên bản đồ, cùng với Hoàng Sa. Nhà Thanh sụp đổ năm 1912 (Trung Hoa Dân Quốc thay thế), nên mốc 1933 cũng là mốc gần nhất trên dòng thời gian ghi nhận vùng Lưỡng Quảng, Hải Nam thuộc Trung Hoa Dân Quốc.',
    assign: {
      CHN: 'trung-hoa-dan-quoc',
      'CHN.hong-kong.xianggang': 'anh',
      'CHN.ma-cao': null,
      [ZHANJIANG]: 'phap'
    },
    focus: { lon: 114.0, lat: 10.0 },
    sources: [CHEMILLIER, LSVN9, BROCHEUX_HEMERY]
  },
  {
    id: '1941',
    year: 1941,
    yearLabel: '1940–1941',
    era: 'phap-thuoc',
    title: 'Nhật vào Đông Dương; Thái Lan chiếm đất Lào, Campuchia',
    summary:
      'Tháng 9 năm 1940, sau thỏa thuận với chính quyền Vichy, quân Nhật vào Bắc Kỳ (giao tranh ở Lạng Sơn ngày 22–26 tháng 9) và đến tháng 7 năm 1941 đóng quân trên toàn Đông Dương, nhưng để chính quyền thuộc địa Pháp của Toàn quyền Decoux tiếp tục cai trị nên chưa đổi chủ ô. Lợi dụng tình hình, Thái Lan tấn công vùng biên giới Campuchia – Lào từ tháng 10 năm 1940, đình chiến ngày 28 tháng 1 năm 1941 và được Nhật làm trung gian tại Tokyo: công ước ngày 9 tháng 5 năm 1941 buộc Pháp nhượng các tỉnh Battambang, Siem Reap, Sisophon và Preah Vihear (Campuchia), đất hữu ngạn Mê Kông của Champasak (gồm huyện Champasak, Sanasomboon) và vùng Xayabury (Lào). Ranh giới các phần nhượng chỉ ước lượng theo tỉnh và huyện ngày nay.',
    assign: {
      ...assignAll(THAI_1941_KHM, 'thai-lan'),
      ...assignAll(THAI_1941_LAO, 'thai-lan')
    },
    lowConfidence: [...THAI_1941_KHM, ...THAI_1941_LAO],
    focus: { lon: 103.5, lat: 15.5 },
    sources: [REYNOLDS, DEVILLERS, LSVN9, STUART_FOX]
  },
  {
    id: '1945-03',
    year: 1945.2,
    yearLabel: '3/1945',
    era: 'phap-thuoc',
    title: 'Nhật đảo chính Pháp; Đế quốc Việt Nam',
    summary:
      'Đêm 9 tháng 3 năm 1945, Nhật đảo chính lật đổ chính quyền Pháp ở Đông Dương; ngày 11 tháng 3 vua Bảo Đại tuyên bố Việt Nam độc lập, hủy hòa ước bảo hộ, lập Đế quốc Việt Nam gồm Bắc Kỳ và Trung Kỳ (Trần Trọng Kim lập nội các ngày 17 tháng 4), còn Nam Kỳ do Nhật cai quản cho đến ngày 14 tháng 8 năm 1945. Ngày 13 tháng 3 Campuchia và ngày 8 tháng 4 Lào (Luang Prabang) cũng tuyên bố độc lập dưới sự kiểm soát của Nhật. Nhật cũng đã chiếm Quảng Châu Loan từ tháng 2 năm 1943; các vùng Battambang, Siem Reap, Preah Vihear, Xayabury và Champasak hữu ngạn vẫn thuộc Thái Lan; Hồng Kông bị Nhật chiếm từ tháng 12 năm 1941 nhưng vẫn tô cho Anh; Hoàng Sa và Trường Sa vẫn thuộc phần lãnh thổ Việt Nam trên bản đồ dù quân Nhật chiếm giữ từ năm 1939.',
    assign: {
      VNM: 'de-quoc-viet-nam',
      'group:nam-bo': 'nhat-ban',
      ...assignAll(CAMPUCHIA_1945, 'nhat-ban'),
      ...assignAll(LAO_1945, 'nhat-ban'),
      'LAO.champasak': 'nhat-ban',
      [CHAMPASACK_HUU_NGAN]: 'thai-lan',
      [CHAMPASAK_SANASOMBOON]: 'thai-lan',
      [ZHANJIANG]: 'nhat-ban'
    },
    lowConfidence: ['group:nam-bo', ...CAMPUCHIA_1945, ...LAO_1945, 'LAO.champasak', ZHANJIANG],
    focus: { lon: 106.0, lat: 16.5 },
    sources: [DEVILLERS, MARR, TRAN_TRONG_KIM_GIO_BUI, LSVN9]
  }
];
