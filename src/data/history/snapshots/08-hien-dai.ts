import type { Snapshot, Source } from '../types';

/*
 * Task C8 — mốc hiện đại (9/1945 → 2025), 27 mốc, era khang-chien → chia-cat → thong-nhat.
 *
 * File tự đứng một mình: mốc đầu (`1945-09`) có `'*': null` và gán đầy đủ. Trạng thái xuất phát
 * dựng theo nghiên cứu (file 07-phap-thuoc.ts chưa có khi soạn): Việt Nam (cả ba miền) thuộc
 * Việt Nam Dân chủ Cộng hòa; Lào và Campuchia thuộc `phap` (xứ bảo hộ đang chờ khôi phục sau cuộc
 * đảo chính của Nhật 3/1945); Lưỡng Quảng + Hải Nam thuộc Trung Hoa Dân quốc; vùng Campuchia
 * (Battambang, Siem Reap, Preah Vihear...) và Lào (Xaignabouli, tây Champasak) Thái Lan chiếm
 * từ 1941 thuộc `thai-lan`.
 *
 * Quy ước tô bản đồ (chỉ ghi ở đây và trong summary, vì ranh giới cấp tỉnh không thể hiện hết):
 * - 1945–1954: DRV giữ nông thôn Bắc Bộ và Trung Bộ; tô riêng những vùng có văn bản thành lập rõ
 *   ràng (Cộng hòa tự trị Nam Kỳ 1946, Xứ Thượng Nam Đông Dương 1946, Xứ Thái 1948, sáp nhập vào
 *   Quốc gia Việt Nam 1949) và các quận nội thành Hà Nội, Hải Phòng, Huế, Đà Nẵng do Pháp (từ 1946)
 *   rồi Quốc gia Việt Nam (từ 1949) giữ, tất cả lowConfidence. Trục giao thông không tô.
 * - Quân Trung Hoa Dân quốc (phía bắc vĩ tuyến 16) và quân Anh (phía nam) năm 1945 chỉ nêu trong
 *   summary. Mặt trận DTGP 1960, CPCMLT 1969 và Hiệp định Paris 1973: không tô vùng kiểm soát.
 * - Ngoại lệ có chủ đích: mốc `1972` (tuyến giằng co ổn định ở Quảng Trị, dùng id huyện,
 *   lowConfidence) và `1975-03`/`1975` (vùng VNCH mất kiểm soát gán `cpcmlt`).
 * - Hoàng Sa, Trường Sa luôn gán cho chính thể Việt Nam đương thời (kể cả sau 1974, 1988); summary
 *   ghi rõ thực tế chiếm đóng.
 * - Hồng Kông thuộc `anh` từ 1945-09 đến mốc `1999` (trao trả 1/7/1997); Ma Cao không chủ (không có
 *   chính thể Bồ Đào Nha) đến mốc `1999` (trao trả 20/12/1999); cả hai sang `chnd-trung-hoa` ở `1999`.
 *
 * Năm sửa so với bảng: không có. Lệch so với brief: Tây Nguyên (Xứ Thượng Nam Đông Dương) gán cho
 * Quốc gia Việt Nam ngay từ mốc `1949` (Pháp trao 30/5/1949), mốc `1950` chỉ xác nhận thêm sắc
 * lệnh Hoàng triều Cương thổ; Hải Nam chuyển sang CHND Trung Hoa ở mốc `1950` (chiến dịch tháng
 * 4–5/1950), Lưỡng Quảng ở mốc `1949`.
 */

const assignAll = (selectors: string[], polity: string) =>
  Object.fromEntries(selectors.map((s) => [s, polity]));

const ISLANDS = ['VNM.hoang-sa', 'VNM.truong-sa'];
const NAM_BO = 'group:nam-bo';
const TAY_NGUYEN = 'group:hd-tay-nguyen';
const XU_THAI = 'group:hd-xu-thai-1948';
const THAI_CHIEM = 'group:hd-thai-chiem-1941';
/** Trung Bộ phía nam sông Bến Hải, không kể Quảng Trị và Tây Nguyên. */
const TRUNG_NAM = [
  'VNM.thua-thien-hue',
  'VNM.da-nang',
  'VNM.quang-nam',
  'VNM.quang-ngai',
  'VNM.binh-dinh',
  'VNM.phu-yen',
  'VNM.khanh-hoa',
  'VNM.ninh-thuan',
  'VNM.binh-thuan'
];
/** Quận nội thành Hà Nội và Hải Phòng (Pháp giữ từ 1946; Hà Nội trao lại 10/1954, Hải Phòng 5/1955). */
const HN_DO_THI = [
  'VNM.ha-noi.hoan-kiem',
  'VNM.ha-noi.ba-dinh',
  'VNM.ha-noi.hai-ba-trung',
  'VNM.ha-noi.dong-da',
  'VNM.ha-noi.tay-ho'
];
const HP_DO_THI = ['VNM.hai-phong.hong-bang', 'VNM.hai-phong.ngo-quyen', 'VNM.hai-phong.le-chan'];
/** Huế và Đà Nẵng (Tourane) đô thị. */
const HUE_DN_DO_THI = [
  'VNM.thua-thien-hue.hue',
  'VNM.da-nang.hai-chau',
  'VNM.da-nang.thanh-khe',
  'VNM.da-nang.son-tra'
];
const DO_THI_PHAP = [...HN_DO_THI, ...HP_DO_THI, ...HUE_DN_DO_THI];
/** Phần Quảng Trị phía bắc sông Bến Hải (luôn thuộc miền Bắc từ 1954). */
const QT_BAC = ['VNM.quang-tri.vinh-linh', 'VNM.quang-tri.con-co'];
/** Các huyện Quảng Trị cuối 1972 nằm phía bắc và tây tuyến Thạch Hãn. */
const QT_1972 = [
  'VNM.quang-tri.gio-linh',
  'VNM.quang-tri.cam-lo',
  'VNM.quang-tri.dong-ha',
  'VNM.quang-tri.huong-hoa',
  'VNM.quang-tri.da-krong'
];

// ——— Nguồn ———
const LSVN = (tap: number, range: string): Source => ({
  title: `Lịch sử Việt Nam, tập ${tap} (${range})`,
  author: 'Viện Sử học',
  note: 'NXB Khoa học xã hội, 2017'
});
const GOSCHA: Source = {
  title: 'Vietnam: A New History',
  author: 'Christopher Goscha',
  note: '2016'
};
const MARR: Source = {
  title: 'Vietnam 1945: The Quest for Power',
  author: 'David G. Marr',
  note: '1995'
};
const MARR_STATE: Source = {
  title: 'Vietnam: State, War, and Revolution (1945–1946)',
  author: 'David G. Marr',
  note: '2013'
};
const LOGEVALL: Source = {
  title: 'Embers of War: The Fall of an Empire and the Making of America’s Vietnam',
  author: 'Fredrik Logevall',
  note: '2012'
};
const KARNOW: Source = { title: 'Vietnam: A History', author: 'Stanley Karnow', note: '1983' };
const YOUNG: Source = {
  title: 'The Vietnam Wars 1945–1990',
  author: 'Marilyn B. Young',
  note: '1991'
};
const MILLER: Source = {
  title: 'Misalliance: Ngo Dinh Diem, the United States, and the Fate of South Vietnam',
  author: 'Edward Miller',
  note: '2013'
};
const OBERDORFER: Source = { title: 'Tet!', author: 'Don Oberdorfer', note: '1971' };
const ANDRADE: Source = {
  title: 'America’s Last Vietnam Battle: Halting Hanoi’s 1972 Easter Offensive',
  author: 'Dale Andradé',
  note: '2001'
};
const HICKEY: Source = {
  title: 'Sons of the Mountains: Ethnohistory of the Vietnamese Central Highlands to 1954',
  author: 'Gerald C. Hickey',
  note: '1982'
};
const CHANDLER: Source = { title: 'A History of Cambodia', author: 'David Chandler' };
const OSBORNE: Source = {
  title: 'Sihanouk: Prince of Light, Prince of Darkness',
  author: 'Milton Osborne',
  note: '1994'
};
const SHAWCROSS: Source = {
  title: 'Sideshow: Kissinger, Nixon, and the Destruction of Cambodia',
  author: 'William Shawcross',
  note: '1979'
};
const STUART_FOX: Source = {
  title: 'A History of Laos',
  author: 'Martin Stuart-Fox',
  note: '1997'
};
const CHANDA: Source = {
  title: 'Brother Enemy: The War after the War',
  author: 'Nayan Chanda',
  note: '1986'
};
const ZHANG: Source = {
  title: 'Deng Xiaoping’s Long War: The Military Conflict between China and Vietnam, 1979–1991',
  author: 'Xiaoming Zhang',
  note: '2015'
};
const HAYTON: Source = {
  title: 'The South China Sea: The Struggle for Power in Asia',
  author: 'Bill Hayton',
  note: '2014'
};
const SAMUELS: Source = {
  title: 'Contest for the South China Sea',
  author: 'Marwyn S. Samuels',
  note: '1982'
};
const MOC_BAN: Source = {
  title: 'Hoàng Sa, Trường Sa – biên đảo thiêng liêng',
  author: 'Trung tâm Lưu trữ Quốc gia IV (Mộc bản triều Nguyễn)',
  url: 'https://mocban.vn/hoang-sa-truong-sa-bien-dao-thieng-lieng/'
};
const GENEVE_DINH_CHIEN: Source = {
  title:
    'Hiệp định đình chỉ chiến sự ở Việt Nam (Genève, 20/7/1954) và Tuyên bố cuối cùng của Hội nghị Genève (21/7/1954)'
};
const PARIS_1973: Source = {
  title: 'Hiệp định về chấm dứt chiến tranh, lập lại hòa bình ở Việt Nam (Paris, 27/1/1973)'
};
const HIEP_UOC_1999: Source = {
  title:
    'Hiệp ước biên giới trên đất liền giữa nước CHXHCN Việt Nam và nước CHND Trung Hoa (30/12/1999)',
  author: 'Bộ Ngoại giao',
  url: 'https://mofa.gov.vn/tin-chi-tiet/chi-tiet/hoan-thanh-phan-gioi-cam-moc-bien-gioi-dat-lien-viet-nam-trung-quoc-su-kien-lich-su-trong-dai--589.html'
};
const BIEN_PHONG: Source = {
  title: 'Tổng quan về biên giới trên đất liền Việt Nam – Trung Quốc',
  author: 'Bộ đội Biên phòng',
  url: 'http://bienphongvietnam.gov.vn/tong-quan-ve-bien-gioi-tren-dat-lien-viet-nam-trung-quoc.html'
};
const LUAT_BIEN_2012: Source = {
  title: 'Luật Biển Việt Nam (Luật số 18/2012/QH13), Điều 1'
};
const HIEN_PHAP_2013: Source = {
  title: 'Hiến pháp nước Cộng hòa Xã hội chủ nghĩa Việt Nam (2013), Điều 1'
};

export const HIEN_DAI: Snapshot[] = [
  {
    id: '1945-09',
    year: 1945.7,
    yearLabel: '9/1945',
    era: 'khang-chien',
    title: 'Việt Nam Dân chủ Cộng hòa',
    summary:
      'Ngày 2/9/1945, Hồ Chí Minh đọc Tuyên ngôn Độc lập tại Hà Nội, nước Việt Nam Dân chủ Cộng hòa ra đời sau Cách mạng tháng Tám và tuyên bố quyền trên cả ba miền Bắc, Trung, Nam. Ngay sau đó, theo quyết định của phe Đồng minh, quân Trung Hoa Dân quốc vào giải giáp quân Nhật ở phía bắc vĩ tuyến 16 và quân Anh – Ấn vào phía nam vĩ tuyến này (Sài Gòn từ 12/9), rồi Pháp quay lại Sài Gòn ngày 23/9. Lào và Campuchia, vốn do Pháp bảo hộ và bị Nhật đảo chính năm 3/1945, đang ở tình trạng chưa ổn định; các vùng Battambang, Siem Reap, Xaignabouli và tây Champasak vẫn do Thái Lan chiếm từ 1941. Hoàng Sa và Trường Sa được tô theo chính thể Việt Nam đương thời sau khi Nhật rút khỏi các đảo.',
    assign: {
      '*': null,
      VNM: 'vndcch',
      LAO: 'phap',
      KHM: 'phap',
      CHN: 'trung-hoa-dan-quoc',
      'CHN.hong-kong': 'anh',
      'CHN.ma-cao': null,
      [THAI_CHIEM]: 'thai-lan'
    },
    lowConfidence: ['LAO', 'KHM', NAM_BO, ...ISLANDS],
    focus: { lon: 106.0, lat: 16.0 },
    sources: [MARR, LSVN(9, '1930–1945'), LSVN(10, '1945–1950'), GOSCHA]
  },
  {
    id: '1946',
    year: 1946,
    yearLabel: '1946',
    era: 'khang-chien',
    title: 'Cộng hòa tự trị Nam Kỳ; Thái Lan trả đất',
    summary:
      'Ngày 1/6/1946, sau Hiệp định Sơ bộ 6/3, chính quyền Pháp lập Cộng hòa tự trị Nam Kỳ với Nguyễn Văn Thinh làm chủ tịch, tách Nam Bộ khỏi Việt Nam Dân chủ Cộng hòa; phía Việt Nam không công nhận và kháng chiến ở Nam Bộ vẫn tiếp diễn. Ngày 27/5/1946, Pháp lập Xứ Thượng Nam Đông Dương ở Tây Nguyên, tách khỏi Trung Kỳ và đặt dưới quyền cai trị trực tiếp của Pháp. Cuối năm 1946, theo thỏa ước ký tại Washington, Thái Lan trao trả cho Pháp các vùng Campuchia và Lào đã chiếm từ 1941 (Battambang, Siem Reap, Xaignabouli, tây Champasak). Chiến tranh Pháp – Việt bùng nổ ngày 19/12/1946; Pháp đã trở lại Hà Nội, Hải Phòng (từ 3/1946) cùng Huế, Đà Nẵng (đến đầu 1947), nên các quận nội thành này được tô cho Pháp trong khi nông thôn Bắc và Trung Bộ vẫn do Việt Nam Dân chủ Cộng hòa kiểm soát; trong năm này Pháp cũng đưa lực lượng trở lại Hoàng Sa và Trường Sa.',
    assign: {
      [NAM_BO]: 'nam-ky-tu-tri',
      [TAY_NGUYEN]: 'phap',
      [THAI_CHIEM]: 'phap',
      ...assignAll(ISLANDS, 'phap'),
      ...assignAll(DO_THI_PHAP, 'phap')
    },
    lowConfidence: [NAM_BO, TAY_NGUYEN, THAI_CHIEM, ...ISLANDS, ...DO_THI_PHAP],
    focus: { lon: 106.7, lat: 11.5 },
    sources: [MARR_STATE, LSVN(10, '1945–1950'), GOSCHA, HICKEY]
  },
  {
    id: '1948',
    year: 1948,
    yearLabel: '1948',
    era: 'khang-chien',
    title: 'Xứ Thái tự trị',
    summary:
      'Năm 1948, Pháp lập Liên bang Thái tự trị (Xứ Thái) ở Tây Bắc, tách khỏi Bắc Kỳ, gồm các vùng Lai Châu, Sơn La và Phong Thổ dưới quyền các chúa Thái họ Đèo, đặt trong Liên hiệp Pháp và đối lập với Việt Minh. Trên bản đồ, vùng này xấp xỉ ba tỉnh Lai Châu, Điện Biên và Sơn La ngày nay. Việt Nam Dân chủ Cộng hòa vẫn giữ phần lớn Bắc Bộ và Trung Bộ, còn Pháp kiểm soát các đô thị và trục giao thông chính.',
    assign: { [XU_THAI]: 'xu-thai' },
    lowConfidence: [XU_THAI],
    focus: { lon: 103.5, lat: 21.5 },
    sources: [LSVN(10, '1945–1950'), GOSCHA, HICKEY]
  },
  {
    id: '1949',
    year: 1949,
    yearLabel: '1949',
    era: 'khang-chien',
    title: 'Quốc gia Việt Nam',
    summary:
      'Sau Hiệp ước Élysée ngày 8/3/1949 giữa Tổng thống Pháp Vincent Auriol và Bảo Đại, Pháp công nhận Quốc gia Việt Nam thuộc Liên hiệp Pháp, do Bảo Đại đứng đầu và tuyên bố quyền trên cả ba kỳ; cùng năm Lào (19/7) và Campuchia (8/11) trở thành quốc gia liên kết trong Liên hiệp Pháp. Cộng hòa tự trị Nam Kỳ được sáp nhập vào Quốc gia Việt Nam trong năm này, và ngày 30/5/1949 Pháp trao quyền quản lý Xứ Thượng Nam Đông Dương (Tây Nguyên). Việt Nam Dân chủ Cộng hòa vẫn kiểm soát nhiều vùng nông thôn ở Bắc Bộ và Trung Bộ, còn các đô thị do Pháp và Quốc gia Việt Nam giữ (Hà Nội, Hải Phòng, Huế, Đà Nẵng) được tô cho Quốc gia Việt Nam theo quận nội thành hiện nay, các trục giao thông không tô. Ngày 1/10/1949, Cộng hòa Nhân dân Trung Hoa tuyên bố thành lập; đến cuối năm, Quảng Đông và Quảng Tây do Quân Giải phóng Nhân dân kiểm soát, còn Hồng Kông thuộc Anh và Ma Cao thuộc Bồ Đào Nha nằm ngoài phạm vi này.',
    assign: {
      [NAM_BO]: 'quoc-gia-viet-nam',
      [TAY_NGUYEN]: 'quoc-gia-viet-nam',
      'CHN.quang-dong': 'chnd-trung-hoa',
      'CHN.quang-tay': 'chnd-trung-hoa',
      ...assignAll(DO_THI_PHAP, 'quoc-gia-viet-nam')
    },
    lowConfidence: [NAM_BO, TAY_NGUYEN, ...DO_THI_PHAP],
    focus: { lon: 107.0, lat: 12.5 },
    sources: [LSVN(10, '1945–1950'), GOSCHA, LOGEVALL, HICKEY]
  },
  {
    id: '1950',
    year: 1950,
    yearLabel: '1950',
    era: 'khang-chien',
    title: 'Hoàng triều Cương thổ',
    summary:
      'Ngày 15/4/1950, Bảo Đại ban hành sắc lệnh lập chế độ hành chính đặc biệt Hoàng triều Cương thổ cho các vùng dân tộc thiểu số, gồm các tỉnh Tây Nguyên và một số vùng miền núi phía Bắc. Bản đồ tô Tây Nguyên theo Quốc gia Việt Nam, vùng Tây Bắc vẫn ghi là Xứ Thái, và các quận nội thành Hà Nội, Hải Phòng, Huế, Đà Nẵng vẫn tô theo Quốc gia Việt Nam trong khi nông thôn Bắc và Trung Bộ do Việt Minh kiểm soát. Ngày 1/5/1950, Quân Giải phóng Nhân dân hoàn tất chiến dịch đảo Hải Nam, Hải Nam chuyển sang Cộng hòa Nhân dân Trung Hoa. Tháng 10/1950, Pháp chính thức trao quyền quản lý Hoàng Sa cho chính phủ Bảo Đại.',
    assign: {
      [TAY_NGUYEN]: 'quoc-gia-viet-nam',
      'CHN.hai-nam': 'chnd-trung-hoa',
      ...assignAll(ISLANDS, 'quoc-gia-viet-nam')
    },
    lowConfidence: [TAY_NGUYEN, ...ISLANDS],
    focus: { lon: 108.0, lat: 13.5 },
    sources: [LSVN(10, '1945–1950'), HICKEY, GOSCHA, MOC_BAN]
  },
  {
    id: '1953',
    year: 1953,
    yearLabel: '1953',
    era: 'khang-chien',
    title: 'Campuchia và Lào độc lập hoàn toàn',
    summary:
      'Ngày 22/10/1953, Pháp và Lào ký hiệp ước trao trả hoàn toàn nền độc lập cho Vương quốc Lào. Ngày 9/11/1953, Pháp trao nốt quyền quân sự và tư pháp cho Campuchia sau chiến dịch vận động độc lập của quốc vương Norodom Sihanouk, và ngày này được Campuchia coi là ngày độc lập. Từ đây bản đồ tô Lào và Campuchia là quốc gia độc lập (trước đó tô theo Pháp); theo hiệp ước năm 1953, Lào vẫn là thành viên Liên hiệp Pháp. Ở Việt Nam, bản đồ vẫn tô các quận nội thành lớn cho Quốc gia Việt Nam (nước này tuyên bố quyền trên cả ba kỳ) và nông thôn Bắc, Trung Bộ cho Việt Nam Dân chủ Cộng hòa.',
    assign: { LAO: 'vuong-quoc-lao', KHM: 'vuong-quoc-campuchia' },
    focus: { lon: 104.5, lat: 15.5 },
    sources: [STUART_FOX, CHANDLER, OSBORNE, LSVN(11, '1951–1954')]
  },
  {
    id: '1954',
    year: 1954,
    yearLabel: '1954',
    era: 'chia-cat',
    title: 'Hiệp định Genève, vĩ tuyến 17',
    summary:
      'Hiệp định Genève ký ngày 20/7/1954 chấm dứt chiến tranh Đông Dương, chia Việt Nam tạm thời ở vĩ tuyến 17 (sông Bến Hải, Quảng Trị): phía bắc thuộc Việt Nam Dân chủ Cộng hòa, phía nam thuộc Quốc gia Việt Nam do thủ tướng Ngô Đình Diệm đứng đầu chính phủ, và dự kiến tổng tuyển cử năm 1956. Sau chiến thắng Điện Biên Phủ ngày 7/5/1954, Tây Bắc (Xứ Thái) thuộc về Việt Nam Dân chủ Cộng hòa, và Pháp trao lại Hà Nội (10/1954) nên các quận nội thành Hà Nội được tô lại cho Việt Nam Dân chủ Cộng hòa, còn Hải Phòng do Pháp giữ đến 5/1955. Từ mốc này bản đồ tô theo phân chia của Hiệp định Genève thay cho vùng kiểm soát thực tế: vùng nông thôn do Việt Minh giữ ở nam vĩ tuyến 17 (Liên khu V) được tô cho Quốc gia Việt Nam vì Việt Minh tập kết ra Bắc dần trong thời hạn 300 ngày. Ở Lào, Pathet Lào tập kết ở hai tỉnh Sầm Nưa (Houaphan) và Phongsaly; ranh giới ở Quảng Trị được tô theo địa giới huyện hiện nay (Vĩnh Linh và Cồn Cỏ ở phía bắc), nên chỉ mang tính xấp xỉ.',
    assign: {
      'VNM.quang-tri': 'quoc-gia-viet-nam',
      ...assignAll(QT_BAC, 'vndcch'),
      ...assignAll(TRUNG_NAM, 'quoc-gia-viet-nam'),
      [XU_THAI]: 'vndcch',
      ...assignAll(HN_DO_THI, 'vndcch'),
      'LAO.houaphan': 'pathet-lao',
      'LAO.phongsaly': 'pathet-lao'
    },
    lowConfidence: [
      'VNM.quang-tri',
      ...TRUNG_NAM,
      XU_THAI,
      ...HN_DO_THI,
      ...HP_DO_THI,
      'LAO.houaphan',
      'LAO.phongsaly'
    ],
    focus: { lon: 107.1, lat: 16.8 },
    sources: [GENEVE_DINH_CHIEN, LSVN(11, '1951–1954'), LOGEVALL, STUART_FOX]
  },
  {
    id: '1955',
    year: 1955,
    yearLabel: '1955',
    era: 'chia-cat',
    title: 'Việt Nam Cộng hòa',
    summary:
      'Sau cuộc trưng cầu dân ý ngày 23/10/1955, Thủ tướng Ngô Đình Diệm truất phế Bảo Đại và tuyên bố thành lập Việt Nam Cộng hòa ngày 26/10/1955, thủ đô Sài Gòn, do ông làm tổng thống (Đệ nhất Cộng hòa). Chính quyền này kiểm soát phần lãnh thổ phía nam vĩ tuyến 17 và không tổ chức cuộc tổng tuyển cử dự kiến năm 1956 theo Hiệp định Genève, vì phía Sài Gòn (Quốc gia Việt Nam không ký Hiệp định) cùng Hoa Kỳ không chấp nhận các cuộc tham vấn về tổng tuyển cử, còn Việt Nam Dân chủ Cộng hòa cho rằng đó là vi phạm Hiệp định. Ở miền Bắc, Việt Nam Dân chủ Cộng hòa tiếp quản Hà Nội (10/1954) và Hải Phòng (5/1955).',
    assign: {
      'VNM.quang-tri': 'vnch',
      ...assignAll(QT_BAC, 'vndcch'),
      ...assignAll(HP_DO_THI, 'vndcch'),
      ...assignAll(TRUNG_NAM, 'vnch'),
      [TAY_NGUYEN]: 'vnch',
      [NAM_BO]: 'vnch',
      ...assignAll(ISLANDS, 'vnch')
    },
    lowConfidence: [...ISLANDS],
    focus: { lon: 107.0, lat: 14.0 },
    sources: [LSVN(12, '1954–1965'), MILLER, KARNOW, GOSCHA]
  },
  {
    id: '1956',
    year: 1956,
    yearLabel: '1956',
    era: 'chia-cat',
    title: 'Trung Quốc chiếm nhóm An Vĩnh (Hoàng Sa)',
    summary:
      'Năm 1956, khi quân Pháp rút khỏi Việt Nam, lực lượng Trung Quốc đóng trên nhóm đảo An Vĩnh (Amphitrite) phía đông quần đảo Hoàng Sa, còn Việt Nam Cộng hòa đưa lực lượng ra đóng ở nhóm Trăng Khuyết (Lưỡi Liềm) phía tây; tháng 8/1956, Hải quân Việt Nam Cộng hòa cũng cắm cờ trên một số đảo ở Trường Sa. Việt Nam, Trung Quốc và Đài Loan đều tuyên bố chủ quyền quần đảo Hoàng Sa. Bản đồ vẫn tô Hoàng Sa cho chính thể Việt Nam đương thời, và ghi nhận nhóm An Vĩnh bị chiếm giữ.',
    assign: {},
    lowConfidence: ['VNM.hoang-sa'],
    focus: { lon: 112.0, lat: 16.5 },
    sources: [MOC_BAN, SAMUELS, HAYTON]
  },
  {
    id: '1960',
    year: 1960,
    yearLabel: '1960',
    era: 'chia-cat',
    title: 'Mặt trận Dân tộc Giải phóng miền Nam',
    summary:
      'Sau phong trào Đồng Khởi (1959–1960), ngày 20/12/1960, Mặt trận Dân tộc Giải phóng miền Nam Việt Nam thành lập ở Tây Ninh, tập hợp các lực lượng chống chính quyền Ngô Đình Diệm và được Việt Nam Dân chủ Cộng hòa ủng hộ. Việt Nam Cộng hòa không công nhận Mặt trận và gọi lực lượng này là "Việt Cộng". Vùng nông thôn miền Nam trở thành chiến trường có ranh giới kiểm soát thay đổi liên tục nên bản đồ chưa tô vùng của Mặt trận và vẫn giữ Việt Nam Cộng hòa cho phần lãnh thổ phía nam vĩ tuyến 17.',
    assign: {},
    focus: { lon: 106.2, lat: 11.3 },
    sources: [LSVN(12, '1954–1965'), KARNOW, YOUNG]
  },
  {
    id: '1963',
    year: 1963,
    yearLabel: '11/1963',
    era: 'chia-cat',
    title: 'Đảo chính 1/11/1963, kết thúc Đệ nhất Cộng hòa',
    summary:
      'Sau cuộc khủng hoảng Phật giáo mùa hè 1963, ngày 1/11/1963, một nhóm tướng lĩnh Quân lực Việt Nam Cộng hòa do Dương Văn Minh cầm đầu làm đảo chính; Tổng thống Ngô Đình Diệm và cố vấn Ngô Đình Nhu bị bắt và bị giết ngày 2/11. Đệ nhất Cộng hòa kết thúc, quyền lực chuyển cho Hội đồng Quân nhân Cách mạng. Ranh giới lãnh thổ không thay đổi.',
    assign: {},
    focus: { lon: 106.7, lat: 10.8 },
    sources: [LSVN(12, '1954–1965'), KARNOW, MILLER]
  },
  {
    id: '1965',
    year: 1965,
    yearLabel: '1965',
    era: 'chia-cat',
    title: 'Quân đội Mỹ trực tiếp tham chiến',
    summary:
      'Từ tháng 2/1965, Mỹ bắt đầu ném bom miền Bắc (chiến dịch Sấm Rền, từ 2/3), và ngày 8/3/1965 lính thủy đánh bộ Mỹ đổ bộ Đà Nẵng, mở đầu việc đưa quân chiến đấu Mỹ vào miền Nam; đến giữa năm, tổng thống Lyndon Johnson quyết định tăng quân số lên hàng trăm nghìn. Ở Sài Gòn, chính quyền do Nguyễn Văn Thiệu và Nguyễn Cao Kỳ đứng đầu từ 6/1965. Việt Nam Dân chủ Cộng hòa cũng đưa quân chính quy vào chiến trường miền Nam. Ranh giới hành chính không đổi.',
    assign: {},
    focus: { lon: 108.2, lat: 16.1 },
    sources: [LSVN(13, '1965–1975'), KARNOW, YOUNG]
  },
  {
    id: '1967',
    year: 1967,
    yearLabel: '1967',
    era: 'chia-cat',
    title: 'Hiến pháp 1967, Đệ nhị Cộng hòa',
    summary:
      'Ngày 1/4/1967, Việt Nam Cộng hòa ban hành Hiến pháp mới do Quốc hội Lập hiến soạn, theo thể chế tổng thống với quốc hội hai viện. Tháng 9/1967 diễn ra bầu cử tổng thống; liên danh Nguyễn Văn Thiệu – Nguyễn Cao Kỳ thắng cử và nhậm chức cuối tháng 10, mở đầu Đệ nhị Cộng hòa. Ranh giới lãnh thổ không thay đổi.',
    assign: {},
    focus: { lon: 106.7, lat: 10.8 },
    sources: [LSVN(13, '1965–1975'), KARNOW, GOSCHA]
  },
  {
    id: '1968',
    year: 1968,
    yearLabel: '1968',
    era: 'chia-cat',
    title: 'Sự kiện Tết Mậu Thân',
    summary:
      'Đêm 30 rạng 31/1/1968, Quân giải phóng và quân đội Việt Nam Dân chủ Cộng hòa mở cuộc tấn công đồng loạt vào hơn một trăm đô thị và căn cứ ở miền Nam, gồm Sài Gòn, Huế và Đà Nẵng. Các đợt giao tranh kéo dài nhiều tuần (ở Huế tới cuối tháng 2), sau đó Việt Nam Cộng hòa và quân Mỹ giữ lại được các đô thị. Sự kiện này khiến Mỹ điều chỉnh chiến lược; ngày 31/3/1968 Tổng thống Johnson tuyên bố hạn chế ném bom miền Bắc và mở đường cho đàm phán ở Paris.',
    assign: {},
    focus: { lon: 107.6, lat: 16.4 },
    sources: [OBERDORFER, LSVN(13, '1965–1975'), KARNOW]
  },
  {
    id: '1969',
    year: 1969,
    yearLabel: '1969',
    era: 'chia-cat',
    title: 'Chính phủ Cách mạng lâm thời CHMNVN',
    summary:
      'Ngày 6/6/1969, Đại hội đại biểu quốc dân miền Nam họp ở vùng do Mặt trận kiểm soát và tuyên bố thành lập Chính phủ Cách mạng lâm thời Cộng hòa miền Nam Việt Nam, do Huỳnh Tấn Phát làm chủ tịch; chính phủ này được Việt Nam Dân chủ Cộng hòa, các nước xã hội chủ nghĩa và một số nước khác công nhận, còn Việt Nam Cộng hòa không công nhận. Cùng năm, Mỹ bắt đầu "Việt Nam hóa chiến tranh" và rút dần quân. Vùng do chính phủ này kiểm soát xen kẽ, thay đổi theo từng thời điểm và mùa vụ nên bản đồ không tô riêng.',
    assign: {},
    focus: { lon: 106.2, lat: 11.5 },
    sources: [LSVN(13, '1965–1975'), KARNOW, GOSCHA]
  },
  {
    id: '1970',
    year: 1970,
    yearLabel: '1970',
    era: 'chia-cat',
    title: 'Cộng hòa Khmer thành lập; chiến sự lan sang Campuchia',
    summary:
      'Ngày 18/3/1970, Quốc hội Campuchia bỏ phiếu phế truất Quốc trưởng Norodom Sihanouk khi ông ở nước ngoài; Thủ tướng Lon Nol nắm quyền, và ngày 9/10/1970 nước Cộng hòa Khmer được tuyên bố. Từ 29/4/1970 (quân đội Việt Nam Cộng hòa) và 30/4/1970 (quân đội Mỹ), các lực lượng này tiến vào miền đông Campuchia, chiến sự lan rộng sang nước này và nội chiến Campuchia bùng nổ với sự tham gia của Khmer Đỏ. Bản đồ tô Campuchia theo Cộng hòa Khmer, không tô riêng vùng do lực lượng đối lập kiểm soát.',
    assign: { KHM: 'cong-hoa-khmer' },
    lowConfidence: ['KHM'],
    focus: { lon: 105.0, lat: 12.0 },
    sources: [OSBORNE, SHAWCROSS, CHANDLER, LSVN(13, '1965–1975')]
  },
  {
    id: '1972',
    year: 1972,
    yearLabel: '1972',
    era: 'chia-cat',
    title: 'Chiến sự Quảng Trị năm 1972',
    summary:
      'Từ 30/3/1972, quân đội Việt Nam Dân chủ Cộng hòa mở cuộc tấn công lớn (chiến dịch Nguyễn Huệ, còn gọi là Tấn công Mùa Phục sinh) vào Quảng Trị; Đông Hà thất thủ đầu tháng 4 và thị xã Quảng Trị bị chiếm ngày 1/5. Từ 28/6, quân đội Việt Nam Cộng hòa mở phản công, tái chiếm Cổ thành Quảng Trị ngày 16/9/1972. Cuối năm, tuyến giao tranh ổn định ở sông Thạch Hãn: các huyện phía bắc và tây tỉnh (Gio Linh, Cam Lộ, Đông Hà, Hướng Hóa, Đakrông) do lực lượng miền Bắc và Chính phủ Cách mạng lâm thời kiểm soát, phần phía nam sông vẫn thuộc Việt Nam Cộng hòa. Ranh giới được tô theo địa giới huyện hiện nay nên chỉ mang tính xấp xỉ.',
    assign: assignAll(QT_1972, 'cpcmlt'),
    lowConfidence: [...QT_1972],
    focus: { lon: 107.05, lat: 16.75 },
    sources: [ANDRADE, LSVN(13, '1965–1975'), KARNOW]
  },
  {
    id: '1973',
    year: 1973,
    yearLabel: '1973',
    era: 'chia-cat',
    title: 'Hiệp định Paris',
    summary:
      'Ngày 27/1/1973, các bên ký Hiệp định Paris về chấm dứt chiến tranh, lập lại hòa bình ở Việt Nam: ngừng bắn tại chỗ, Mỹ rút hết quân trong 60 ngày (hoàn tất 29/3/1973), trao trả tù binh, và ở miền Nam tồn tại hai chính quyền là Việt Nam Cộng hòa và Chính phủ Cách mạng lâm thời. Hiệp định coi vĩ tuyến 17 là giới tuyến quân sự tạm thời, không phải ranh giới chính trị hay lãnh thổ. Vùng kiểm soát của hai bên xen kẽ không thể hiện được ở cấp tỉnh nên bản đồ giữ nguyên; ở Lào, hiệp định Viêng Chăn (21/2/1973) cũng ngừng bắn và quy định việc lập chính phủ liên hiệp (thành lập tháng 4/1974).',
    assign: {},
    focus: { lon: 106.0, lat: 16.0 },
    sources: [PARIS_1973, LSVN(13, '1965–1975'), KARNOW, STUART_FOX]
  },
  {
    id: '1974',
    year: 1974,
    yearLabel: '1974',
    era: 'chia-cat',
    title: 'Hoàng Sa bị chiếm',
    summary:
      'Từ ngày 15/1/1974, xung đột nổ ra ở Hoàng Sa khi hải quân Việt Nam Cộng hòa và Trung Quốc đối đầu quanh nhóm đảo Trăng Khuyết; ngày 19 và 20/1/1974 xảy ra hải chiến, sau đó Trung Quốc đưa quân chiếm toàn bộ quần đảo mà từ 1956 họ đã kiểm soát nhóm An Vĩnh. Việt Nam Cộng hòa tuyên bố phản đối và yêu cầu Hội đồng Bảo an Liên Hợp Quốc xem xét, nhưng không tái chiếm được. Bản đồ vẫn tô Hoàng Sa cho chính thể Việt Nam đương thời và ghi nhận thực tế quần đảo bị Trung Quốc chiếm đóng.',
    assign: {},
    lowConfidence: ['VNM.hoang-sa'],
    focus: { lon: 112.0, lat: 16.5 },
    sources: [MOC_BAN, HAYTON, SAMUELS, LSVN(13, '1965–1975')]
  },
  {
    id: '1975-03',
    year: 1975.2,
    yearLabel: '3/1975',
    era: 'chia-cat',
    title: 'Chiến dịch Tây Nguyên, Huế – Đà Nẵng',
    summary:
      'Từ 10/3/1975, chiến dịch Tây Nguyên mở đầu bằng trận Buôn Ma Thuột; sau khi Tổng thống Nguyễn Văn Thiệu ra lệnh rút bỏ Kon Tum và Pleiku (giữa tháng 3), cuộc rút quân lan rộng dọc miền Trung. Quảng Trị mất ngày 19/3, Huế ngày 26/3 và Đà Nẵng ngày 29/3/1975; Quảng Nam và Quảng Ngãi mất từ 24/3. Bản đồ chuyển các tỉnh này và ba tỉnh Tây Nguyên phía bắc (Kon Tum, Gia Lai, Đắk Lắk) sang chính quyền cách mạng miền Nam (Cộng hòa miền Nam Việt Nam), tính đến cuối tháng 3.',
    assign: {
      'VNM.quang-tri': 'cpcmlt',
      ...assignAll(QT_BAC, 'vndcch'),
      'VNM.thua-thien-hue': 'cpcmlt',
      'VNM.da-nang': 'cpcmlt',
      'VNM.quang-nam': 'cpcmlt',
      'VNM.quang-ngai': 'cpcmlt',
      'VNM.kon-tum': 'cpcmlt',
      'VNM.gia-lai': 'cpcmlt',
      'VNM.dak-lak': 'cpcmlt'
    },
    lowConfidence: ['VNM.quang-tri', 'VNM.dak-lak', 'VNM.kon-tum', 'VNM.gia-lai'],
    focus: { lon: 108.0, lat: 15.0 },
    sources: [LSVN(13, '1965–1975'), KARNOW, GOSCHA]
  },
  {
    id: '1975',
    year: 1975.33,
    yearLabel: '30/4/1975',
    era: 'thong-nhat',
    title: 'Kết thúc chiến tranh',
    summary:
      'Ngày 30/4/1975, sau chiến dịch Hồ Chí Minh (26–30/4), Tổng thống Dương Văn Minh tuyên bố Việt Nam Cộng hòa đầu hàng vô điều kiện, chiến tranh Việt Nam kết thúc. Phần lãnh thổ còn lại của Việt Nam Cộng hòa, gồm Sài Gòn, Nam Bộ, các tỉnh duyên hải Nam Trung Bộ và Trường Sa (quân đội tiếp quản các đảo trong tháng 4), được đặt dưới chính quyền cách mạng miền Nam (Cộng hòa miền Nam Việt Nam). Ở Campuchia, Khmer Đỏ chiếm Phnom Penh ngày 17/4/1975, chấm dứt Cộng hòa Khmer; Khmer Đỏ nắm quyền, và tên nước chính thức là Campuchia Dân chủ từ 1/1976. Ở Lào, Vương quốc Lào còn tồn tại đến 12/1975.',
    assign: {
      'VNM.quang-tri': 'cpcmlt',
      ...assignAll(QT_BAC, 'vndcch'),
      ...assignAll(TRUNG_NAM, 'cpcmlt'),
      [TAY_NGUYEN]: 'cpcmlt',
      [NAM_BO]: 'cpcmlt',
      ...assignAll(ISLANDS, 'cpcmlt'),
      KHM: 'campuchia-dan-chu'
    },
    lowConfidence: ['VNM.hoang-sa'],
    focus: { lon: 106.7, lat: 10.8 },
    sources: [LSVN(14, '1975–1986'), KARNOW, GOSCHA, CHANDLER]
  },
  {
    id: '1976',
    year: 1976,
    yearLabel: '1976',
    era: 'thong-nhat',
    title: 'Cộng hòa Xã hội chủ nghĩa Việt Nam',
    summary:
      'Sau tổng tuyển cử toàn quốc ngày 25/4/1976, Quốc hội khóa VI họp tại Hà Nội và ngày 2/7/1976 tuyên bố thống nhất đất nước, quốc hiệu Cộng hòa Xã hội chủ nghĩa Việt Nam, thủ đô Hà Nội; Sài Gòn được đổi tên thành Thành phố Hồ Chí Minh. Việt Nam Dân chủ Cộng hòa và Cộng hòa miền Nam Việt Nam chấm dứt tồn tại. Ở Lào, ngày 2/12/1975 chế độ quân chủ bị bãi bỏ và Cộng hòa Dân chủ Nhân dân Lào ra đời, bản đồ ghi nhận ở mốc này.',
    assign: { VNM: 'chxhcnvn', LAO: 'chdcnd-lao' },
    lowConfidence: ['VNM.hoang-sa'],
    focus: { lon: 105.85, lat: 21.0 },
    sources: [LSVN(14, '1975–1986'), GOSCHA, STUART_FOX]
  },
  {
    id: '1979',
    year: 1979,
    yearLabel: '1979',
    era: 'thong-nhat',
    title: 'CHND Campuchia; chiến tranh biên giới phía Bắc',
    summary:
      'Sau các cuộc xung đột biên giới với Campuchia Dân chủ, quân đội Việt Nam cùng lực lượng Mặt trận Đoàn kết Dân tộc Cứu nước Campuchia tiến vào Phnom Penh ngày 7/1/1979, lật đổ chế độ Pol Pot và lập Cộng hòa Nhân dân Campuchia; Khmer Đỏ rút về vùng biên giới phía tây. Ngày 17/2/1979, Trung Quốc mở cuộc tấn công dọc biên giới phía Bắc Việt Nam và rút quân ngày 16/3/1979. Lãnh thổ Việt Nam không đổi.',
    assign: { KHM: 'chnd-campuchia' },
    lowConfidence: ['KHM'],
    focus: { lon: 105.0, lat: 20.5 },
    sources: [CHANDA, ZHANG, CHANDLER, LSVN(14, '1975–1986')]
  },
  {
    id: '1988',
    year: 1988,
    yearLabel: '1988',
    era: 'thong-nhat',
    title: 'Sự kiện Gạc Ma (Trường Sa)',
    summary:
      'Ngày 14/3/1988, hải quân Việt Nam và Trung Quốc xung đột ở đá Gạc Ma (Johnson South) thuộc quần đảo Trường Sa; 64 quân nhân Việt Nam hy sinh, và Trung Quốc chiếm giữ Gạc Ma cùng một số đá khác (Cô Lin, Len Đao). Việt Nam tiếp tục kiểm soát nhiều thực thể ở Trường Sa, còn quần đảo được nhiều bên (Việt Nam, Trung Quốc, Đài Loan, Philippines, Malaysia) cùng tuyên bố chủ quyền một phần hay toàn bộ. Bản đồ vẫn tô Trường Sa cho Việt Nam và ghi nhận một phần quần đảo bị chiếm đóng.',
    assign: {},
    lowConfidence: ['VNM.truong-sa'],
    focus: { lon: 114.0, lat: 9.7 },
    sources: [HAYTON, MOC_BAN, LSVN(15, '1986–2000')]
  },
  {
    id: '1993',
    year: 1993,
    yearLabel: '1993',
    era: 'thong-nhat',
    title: 'Vương quốc Campuchia tái lập',
    summary:
      'Sau Hiệp định Paris 23/10/1991, Cơ quan Quyền lực Chuyển tiếp của Liên Hợp Quốc (UNTAC) tổ chức tổng tuyển cử tháng 5/1993; ngày 24/9/1993, hiến pháp mới được ban hành, khôi phục chế độ quân chủ và Norodom Sihanouk trở lại làm quốc vương. Nhà nước Campuchia (tên gọi của chính quyền Phnôm Pênh từ tháng 4/1989) chấm dứt; quân đội Việt Nam đã rút hết khỏi Campuchia từ tháng 9/1989. Từ đây nước này là Vương quốc Campuchia.',
    assign: { KHM: 'vuong-quoc-campuchia' },
    focus: { lon: 105.0, lat: 12.5 },
    sources: [CHANDLER, OSBORNE, LSVN(15, '1986–2000')]
  },
  {
    id: '1999',
    year: 1999,
    yearLabel: '1999',
    era: 'thong-nhat',
    title: 'Hiệp ước biên giới trên đất liền Việt – Trung',
    summary:
      'Ngày 30/12/1999, Việt Nam và Trung Quốc ký Hiệp ước biên giới trên đất liền tại Hà Nội, có hiệu lực từ 2000, xác định đường biên giới dài hơn 1.400 km giữa hai nước dựa trên các công ước Pháp – Thanh 1887 và 1895. Sau đó hai bên phân giới cắm mốc trên thực địa, hoàn tất năm 2008. Cùng mốc này bản đồ chuyển Hồng Kông (thuộc Anh đến khi trao trả ngày 1/7/1997) và Ma Cao (thuộc Bồ Đào Nha đến khi trao trả ngày 20/12/1999) sang Cộng hòa Nhân dân Trung Hoa.',
    assign: { 'CHN.hong-kong': 'chnd-trung-hoa', 'CHN.ma-cao': 'chnd-trung-hoa' },
    focus: { lon: 106.5, lat: 22.5 },
    sources: [HIEP_UOC_1999, BIEN_PHONG, LSVN(15, '1986–2000')]
  },
  {
    id: '2025',
    year: 2025,
    yearLabel: '2025',
    era: 'thong-nhat',
    title: 'Ngày nay',
    summary:
      'Việt Nam là Cộng hòa Xã hội chủ nghĩa Việt Nam; Lào là Cộng hòa Dân chủ Nhân dân Lào, Campuchia là Vương quốc Campuchia, và phía bắc là Cộng hòa Nhân dân Trung Hoa. Ngày 12/6/2025, Quốc hội thông qua Nghị quyết 202/2025/QH15 sắp xếp lại đơn vị hành chính cấp tỉnh, đưa cả nước từ 63 xuống 34 tỉnh, thành phố; bản đồ vẫn dùng ranh giới 63 tỉnh, thành cũ. Hoàng Sa do Trung Quốc kiểm soát từ 1974 và Trường Sa do nhiều bên đóng giữ các thực thể khác nhau; các bên tuyên bố chủ quyền vẫn chưa thống nhất, và Việt Nam khẳng định chủ quyền cả hai quần đảo (Luật Biển Việt Nam 2012).',
    assign: {},
    lowConfidence: [...ISLANDS],
    focus: { lon: 106.0, lat: 16.0 },
    sources: [
      {
        title:
          'Nghị quyết số 202/2025/QH15 ngày 12/6/2025 của Quốc hội về việc sắp xếp đơn vị hành chính cấp tỉnh'
      },
      LUAT_BIEN_2012,
      HIEN_PHAP_2013
    ]
  }
];
