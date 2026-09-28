import type { Snapshot, Source } from '../types';

/*
 * Task C2 — mốc cổ đại (~700 TCN → 931), 29 mốc, các thời kỳ hong-bang → tu-chu.
 *
 * File này tự đứng một mình: mốc đầu (`tcn700`) có `'*': null` và gán đầy đủ, không phụ thuộc
 * delta của file 01-tien-su.ts (theo quy ước chung cho các task C2–C5).
 *
 * Quy ước viết tắt vùng dùng nhiều lần:
 * - GIAO_CHAU: lõi lãnh thổ Việt (đồng bằng Bắc Bộ + Bắc Trung Bộ + miền núi Bắc Bộ), tương ứng
 *   Giao Chỉ + Cửu Chân thời Hán rồi Giao Châu/An Nam đô hộ phủ các đời sau.
 * - LINH_NAM: Quảng Đông + Quảng Tây (+ Hồng Kông, Ma Cao) thuộc Trung Hoa thời Bắc thuộc.
 * - NHAT_NAM: nhóm quan-nhat-nam (Quảng Bình → Bình Định), xấp xỉ quận Nhật Nam thời Hán, sau là
 *   lõi Lâm Ấp/Chăm Pa.
 * - KAUTHARA_PANDURANGA: nhóm kauthara (Phú Yên, Khánh Hòa) + panduranga (Ninh Thuận, Bình
 *   Thuận), hai tiểu quốc Chăm phía nam, gán cho Chăm Pa từ mốc `722` (fix round 1 của task C3 —
 *   xem báo cáo task C3 để biết chi tiết nguồn; trước đó hai nhóm này không được gán ở bất cứ mốc
 *   nào, để trống `null` là một lỗ hổng so với lịch sử).
 *
 * Năm sửa so với bảng gốc trong brief: không có mốc nào phải sửa year/yearLabel — bảng đã dùng
 * niên đại được giới sử học hiện nay chấp nhận rộng rãi hơn (ví dụ tcn204 thay vì 207 TCN theo
 * Toàn Thư; tcn179 thay vì 208 TCN theo Toàn Thư). Xem báo cáo để biết chi tiết các điểm cân nhắc
 * khác (Tượng Quận, Đa Bút, Lâm Ấp mở rộng dần, v.v.).
 */

const TOAN_THU: Source = { title: 'Đại Việt sử ký toàn thư', note: 'Ngoại kỷ, Bản kỷ' };
const CUONG_MUC: Source = { title: 'Khâm định Việt sử thông giám cương mục' };
const LSVN1: Source = {
  title: 'Lịch sử Việt Nam, tập 1 (từ khởi thủy đến thế kỷ X)',
  author: 'Viện Sử học',
  note: 'NXB Khoa học xã hội, 2017'
};
const KCH2: Source = {
  title: 'Khảo cổ học Việt Nam, tập II: Thời đại kim khí Việt Nam',
  author: 'Hà Văn Tấn (chủ biên)',
  note: 'NXB Khoa học xã hội, 1999'
};
const TAYLOR: Source = { title: 'The Birth of Vietnam', author: 'Keith W. Taylor', note: '1983' };
const SU_KY = (thien: string): Source => ({ title: `Sử ký — ${thien}`, author: 'Tư Mã Thiên' });
const HAU_HAN_THU = (thien: string): Source => ({ title: `Hậu Hán thư — ${thien}` });
const TAM_QUOC_CHI = (thien: string): Source => ({
  title: `Tam quốc chí — ${thien}`,
  author: 'Trần Thọ'
});
const VICKERY_CHAMPA: Source = {
  title: 'Champa Revised',
  author: 'Michael Vickery',
  note: 'ARI Working Paper 37, 2005'
};
const MASPERO: Source = { title: 'Le royaume de Champa', author: 'Georges Maspero', note: '1928' };
const VICKERY_KHMER: Source = {
  title: 'Society, Economics, and Politics in Pre-Angkor Cambodia',
  author: 'Michael Vickery',
  note: '1998'
};
const COEDES: Source = {
  title: 'The Indianized States of Southeast Asia',
  author: 'George Cœdès',
  note: '1968'
};
const CHANDLER: Source = { title: 'A History of Cambodia', author: 'David Chandler' };

const GIAO_CHAU = ['group:dong-bang-bac-bo', 'group:bac-bo-nui'];
const LINH_NAM = ['group:linh-nam-trung-hoa', 'CHN.hai-nam'];
const NHAT_NAM = ['group:quan-nhat-nam'];
const KAUTHARA_PANDURANGA = ['group:kauthara', 'group:panduranga'];
const CAMPUCHIA_NAM_BO = ['KHM', 'group:nam-bo'];

const assignAll = (selectors: string[], polity: string) =>
  Object.fromEntries(selectors.map((s) => [s, polity]));

export const CO_DAI: Snapshot[] = [
  {
    id: 'tcn700',
    year: -700,
    yearLabel: '~700 TCN',
    era: 'hong-bang',
    title: 'Văn Lang, văn hóa Đông Sơn',
    summary:
      'Từ nền tảng Phùng Nguyên, cư dân lưu vực sông Hồng – sông Mã – sông Cả tiến vào thời đại đồ sắt với văn hóa Đông Sơn, gắn liền với sự ra đời của nhà nước sơ khai đầu tiên — Văn Lang của các vua Hùng. Vùng lõi đồng bằng được ghi nhận khá chắc chắn qua di vật Đông Sơn (trống đồng, thạp đồng); các "bộ" miền núi theo truyền thuyết Hùng Vương ít chứng cứ khảo cổ trực tiếp hơn nên đánh dấu độ tin cậy thấp hơn.',
    assign: {
      '*': null,
      ...assignAll(GIAO_CHAU, 'van-lang')
    },
    lowConfidence: ['group:bac-bo-nui'],
    focus: { lon: 105.4, lat: 21.3 },
    sources: [TOAN_THU, LSVN1, KCH2]
  },
  {
    id: 'tcn257',
    year: -257,
    yearLabel: '257 TCN',
    era: 'hong-bang',
    title: 'Âu Lạc của An Dương Vương',
    summary:
      'Thục Phán, thủ lĩnh liên minh Âu Việt ở phía bắc, đánh bại vua Hùng cuối cùng, hợp nhất với Lạc Việt lập nước Âu Lạc, xưng An Dương Vương, đóng đô ở Cổ Loa. Lãnh thổ về cơ bản kế thừa nguyên vẹn vùng đất Văn Lang trước đó.',
    assign: assignAll(GIAO_CHAU, 'au-lac'),
    lowConfidence: ['group:bac-bo-nui'],
    focus: { lon: 105.87, lat: 21.13 },
    sources: [TOAN_THU, LSVN1, TAYLOR]
  },
  {
    id: 'tcn214',
    year: -214,
    yearLabel: '214 TCN',
    era: 'hong-bang',
    title: 'Nhà Tần lập Nam Hải, Quế Lâm, Tượng quận',
    summary:
      'Sau khi thống nhất Trung Hoa, Tần Thủy Hoàng đem quân xuống vùng Lĩnh Nam của người Bách Việt, lập ba quận Nam Hải, Quế Lâm và Tượng Quận (214 TCN). Vị trí chính xác của Tượng Quận còn gây tranh cãi trong giới sử học hiện đại — nhiều nghiên cứu gần đây cho rằng quận này nằm xa hơn về phía tây (ngoài phạm vi bản đồ), không trùng với đất Âu Lạc; vì vậy bản đồ chỉ thể hiện Nam Hải và Quế Lâm (Quảng Đông, Quảng Tây ngày nay), còn Âu Lạc của An Dương Vương tiếp tục tồn tại độc lập ở phía nam.',
    assign: assignAll(LINH_NAM, 'nha-tan-qin'),
    lowConfidence: ['group:linh-nam-trung-hoa'],
    focus: { lon: 112.5, lat: 23.5 },
    sources: [SU_KY('Tần Thủy Hoàng bản kỷ'), TAYLOR, LSVN1]
  },
  {
    id: 'tcn204',
    year: -204,
    yearLabel: '~204 TCN',
    era: 'hong-bang',
    title: 'Triệu Đà lập nước Nam Việt',
    summary:
      'Nhân lúc nhà Tần sụp đổ, Triệu Đà — quan úy quận Nam Hải cũ — chiếm luôn Quế Lâm, tự lập làm Nam Việt Vũ Vương, đóng đô ở Phiên Ngung (Quảng Châu). Đại Việt sử ký toàn thư chép việc này vào năm 207 TCN, nhưng khảo cứu theo Sử ký (đối chiếu với cái chết của Tần Nhị Thế và biến động ở Trung Nguyên) cho niên đại phù hợp hơn là khoảng 204–203 TCN; Âu Lạc của An Dương Vương khi đó vẫn độc lập, chưa bị Nam Việt thôn tính.',
    assign: assignAll(LINH_NAM, 'nam-viet'),
    focus: { lon: 112.5, lat: 23.5 },
    sources: [SU_KY('Nam Việt liệt truyện'), TOAN_THU, TAYLOR]
  },
  {
    id: 'tcn179',
    year: -179,
    yearLabel: '179 TCN',
    era: 'bac-thuoc-1',
    title: 'Nam Việt thôn tính Âu Lạc',
    summary:
      'Triệu Đà đem quân đánh chiếm Âu Lạc, An Dương Vương thất bại (theo truyền thuyết vì mất nỏ thần, Trọng Thủy đánh cắp lẫy nỏ). Đại Việt sử ký toàn thư đặt sự kiện vào năm 208 TCN, nhưng nhiều nhà nghiên cứu hiện đại (dựa theo trình tự sự kiện ở Nam Việt sau khi Lữ Hậu mất năm 180 TCN) xác định niên đại hợp lý hơn là khoảng 179 TCN. Toàn bộ lãnh thổ Âu Lạc sáp nhập vào Nam Việt.',
    assign: assignAll(GIAO_CHAU, 'nam-viet'),
    lowConfidence: ['group:bac-bo-nui'],
    focus: { lon: 105.87, lat: 21.13 },
    sources: [TOAN_THU, CUONG_MUC, TAYLOR]
  },
  {
    id: 'tcn111',
    year: -111,
    yearLabel: '111 TCN',
    era: 'bac-thuoc-1',
    title: 'Nhà Hán lập Giao Chỉ, Cửu Chân, Nhật Nam',
    summary:
      'Hán Vũ Đế diệt Nam Việt, chia đất Lĩnh Nam thành 9 quận, trong đó có Giao Chỉ (đồng bằng Bắc Bộ), Cửu Chân (Thanh – Nghệ - Tĩnh) và Nhật Nam — quận mới lập xa hơn về phía nam, xấp xỉ dải đất từ Quảng Bình tới Bình Định ngày nay, vượt quá ranh giới Nam Việt cũ. Đảo Hải Nam cũng lần đầu được đặt quận (Châu Nhai, Đạm Nhĩ). Ranh giới phía nam của Nhật Nam khi đó chỉ mang tính ước lượng.',
    assign: {
      ...assignAll(GIAO_CHAU, 'han'),
      ...assignAll(LINH_NAM, 'han'),
      ...assignAll(NHAT_NAM, 'han')
    },
    lowConfidence: ['group:bac-bo-nui', 'group:quan-nhat-nam'],
    focus: { lon: 106.5, lat: 19.0 },
    sources: [{ title: 'Hán thư — Địa lý chí' }, TOAN_THU, TAYLOR]
  },
  {
    id: '40',
    year: 40,
    yearLabel: '40',
    era: 'hai-ba-trung',
    title: 'Khởi nghĩa Hai Bà Trưng',
    summary:
      'Trưng Trắc cùng em là Trưng Nhị dấy binh ở Mê Linh, được hào kiệt Giao Chỉ, Cửu Chân, Nhật Nam và cả huyện Hợp Phố (nay thuộc Quảng Tây) hưởng ứng, lật đổ chính quyền đô hộ nhà Hán và lập chính quyền tự chủ. Mức độ kiểm soát thực tế ở các vùng xa (Nhật Nam, Hợp Phố) không rõ ràng bằng vùng trung tâm Mê Linh – Cổ Loa.',
    assign: {
      ...assignAll(GIAO_CHAU, 'hai-ba-trung'),
      ...assignAll(NHAT_NAM, 'hai-ba-trung'),
      'CHN.quang-tay.hepuxian': 'hai-ba-trung'
    },
    lowConfidence: ['group:bac-bo-nui', 'group:quan-nhat-nam', 'CHN.quang-tay.hepuxian'],
    focus: { lon: 105.7, lat: 21.15 },
    sources: [HAU_HAN_THU('Nam Man Tây Nam Di liệt truyện'), TOAN_THU, TAYLOR]
  },
  {
    id: '43',
    year: 43,
    yearLabel: '43',
    era: 'bac-thuoc-2',
    title: 'Mã Viện, Đông Hán trở lại',
    summary:
      'Hán Quang Vũ Đế sai Phục Ba tướng quân Mã Viện đem đại quân sang đàn áp. Hai Bà Trưng tuẫn tiết ở Cấm Khê (theo Thiên Nam ngữ lục và dã sử là gieo mình xuống sông Hát), nhà Đông Hán khôi phục quyền cai trị trên toàn bộ Giao Chỉ, Cửu Chân, Nhật Nam và Hợp Phố.',
    assign: {
      ...assignAll(GIAO_CHAU, 'han'),
      ...assignAll(NHAT_NAM, 'han'),
      'CHN.quang-tay.hepuxian': 'han'
    },
    lowConfidence: ['group:bac-bo-nui', 'group:quan-nhat-nam'],
    focus: { lon: 105.87, lat: 21.0 },
    sources: [HAU_HAN_THU('Mã Viện liệt truyện'), TOAN_THU, TAYLOR]
  },
  {
    id: '192',
    year: 192,
    yearLabel: '192',
    era: 'bac-thuoc-2',
    title: 'Khu Liên lập Lâm Ấp; Phù Nam ở phía Nam',
    summary:
      'Khu Liên (Khu Đạt) nổi dậy giết huyện lệnh Tượng Lâm — huyện cực nam quận Nhật Nam — lập nước Lâm Ấp, mở đầu quốc gia của người Chăm. Lãnh thổ ban đầu của Lâm Ấp chỉ gồm vùng Tượng Lâm (khoảng Thừa Thiên Huế – Quảng Nam ngày nay) và mở rộng dần lên phía bắc trong các thế kỷ sau, nên vùng Nhật Nam cũ trên bản đồ chỉ mang tính ước lệ cho cả quá trình đó. Cùng thời gian này ở hạ lưu Mê Kông, vương quốc Phù Nam — nhà nước có tổ chức sớm nhất Đông Nam Á lục địa được biết đến — đã kiểm soát vùng Nam Bộ và Campuchia ngày nay, tuy phạm vi cụ thể còn nhiều điểm chưa rõ.',
    assign: {
      ...assignAll(NHAT_NAM, 'lam-ap'),
      ...assignAll(CAMPUCHIA_NAM_BO, 'phu-nam')
    },
    lowConfidence: ['group:quan-nhat-nam', 'KHM', 'group:nam-bo'],
    focus: { lon: 107.6, lat: 16.3 },
    sources: [VICKERY_CHAMPA, MASPERO, VICKERY_KHMER, COEDES, LSVN1]
  },
  {
    id: '203',
    year: 203,
    yearLabel: '203',
    era: 'bac-thuoc-2',
    title: 'Giao Chỉ bộ đổi thành Giao Châu (thời Sĩ Nhiếp)',
    summary:
      'Theo đề nghị chung của Thứ sử bộ Giao Chỉ Trương Tân (giữ chức từ khoảng năm 201) và Thái thú Giao Chỉ Sĩ Nhiếp — người đã nắm thực quyền ở quận Giao Chỉ từ khoảng năm 187 nhưng khi đó chưa đứng đầu toàn vùng — nhà Hán đổi Giao Chỉ bộ (một đơn vị giám sát) thành Giao Châu, một châu thực thụ ngang hàng các châu khác của Trung Hoa. Đây thuần túy là thay đổi tên gọi hành chính; lãnh thổ và chủ quyền (vẫn thuộc Hán) không đổi.',
    assign: {},
    focus: { lon: 105.87, lat: 21.0 },
    sources: [TOAN_THU, TAM_QUOC_CHI('Sĩ Nhiếp truyện'), LSVN1]
  },
  {
    id: '226',
    year: 226,
    yearLabel: '226',
    era: 'bac-thuoc-2',
    title: 'Đông Ngô tách Quảng Châu khỏi Giao Châu',
    summary:
      'Sĩ Nhiếp — người cai quản thực chất đất Giao Châu suốt gần bốn thập niên — mất năm 226. Tôn Quyền nhân đó tách phần đất phía bắc (Nam Hải, Thương Ngô, Uất Lâm, Hợp Phố) thành Quảng Châu riêng, phần còn lại (Giao Chỉ, Cửu Chân, Nhật Nam) vẫn gọi là Giao Châu, đồng thời điều con Sĩ Nhiếp là Sĩ Huy sang làm thái thú Cửu Chân để tách quyền khỏi đất cũ của cha; Sĩ Huy không phục, nổi dậy chống lại nhưng bị tướng Ngô là Lữ Đại dẹp ngay năm sau (227). Việc tách nhập Quảng Châu – Giao Châu còn thay đổi thêm vài lần trong thập niên sau đó, song toàn vùng vẫn thuộc quyền cai trị của Đông Ngô.',
    assign: {
      ...assignAll(GIAO_CHAU, 'dong-ngo'),
      ...assignAll(LINH_NAM, 'dong-ngo')
    },
    lowConfidence: ['group:bac-bo-nui'],
    focus: { lon: 112.5, lat: 23.5 },
    sources: [TAM_QUOC_CHI('Ngô thư'), TOAN_THU, TAYLOR]
  },
  {
    id: '248',
    year: 248,
    yearLabel: '248',
    era: 'bac-thuoc-2',
    title: 'Khởi nghĩa Bà Triệu ở Cửu Chân',
    summary:
      'Triệu Thị Trinh (Bà Triệu) cùng anh là Triệu Quốc Đạt dấy binh chống chính quyền Đông Ngô ở vùng núi Nưa, Cửu Chân (Thanh Hóa). Cuộc khởi nghĩa bị tướng Ngô là Lục Dận dẹp trong cùng năm, không làm thay đổi ranh giới cai trị.',
    assign: {},
    focus: { lon: 105.6, lat: 19.75 },
    sources: [TOAN_THU, LSVN1, TAYLOR]
  },
  {
    id: '280',
    year: 280,
    yearLabel: '280',
    era: 'bac-thuoc-2',
    title: 'Nhà Tấn thống nhất, Giao Châu thuộc Tấn',
    summary:
      'Tây Tấn diệt Đông Ngô năm 280, thống nhất Trung Hoa sau thời Tam Quốc. Giao Châu (cùng Quảng Châu, Nhật Nam) chuyển sang thuộc quyền cai trị của nhà Tấn mà không có biến động lãnh thổ đáng kể.',
    assign: {
      ...assignAll(GIAO_CHAU, 'nha-tan-jin'),
      ...assignAll(LINH_NAM, 'nha-tan-jin')
    },
    lowConfidence: ['group:bac-bo-nui'],
    focus: { lon: 105.87, lat: 21.0 },
    sources: [{ title: 'Tấn thư' }, TOAN_THU, TAYLOR]
  },
  {
    id: '420',
    year: 420,
    yearLabel: '420',
    era: 'bac-thuoc-2',
    title: 'Nam triều (Lưu Tống) cai quản Giao Châu',
    summary:
      'Lưu Dụ phế Tấn, lập nhà Lưu Tống (420), mở đầu thời Nam Bắc triều ở Trung Hoa. Giao Châu tiếp tục là một châu thuộc Nam triều (lần lượt Tống, Tề, Lương, Trần) cho tới cuối thế kỷ VI, không thay đổi ranh giới so với thời Tấn.',
    assign: {
      ...assignAll(GIAO_CHAU, 'nam-trieu'),
      ...assignAll(LINH_NAM, 'nam-trieu')
    },
    lowConfidence: ['group:bac-bo-nui'],
    focus: { lon: 105.87, lat: 21.0 },
    sources: [{ title: 'Nam sử', author: 'Lý Diên Thọ' }, TOAN_THU, TAYLOR]
  },
  {
    id: '544',
    year: 544,
    yearLabel: '544',
    era: 'van-xuan',
    title: 'Lý Bí lập nước Vạn Xuân',
    summary:
      'Lý Bí khởi binh đánh đuổi thứ sử Lương là Tiêu Tư, lên ngôi hoàng đế (Lý Nam Đế), đặt quốc hiệu Vạn Xuân, đóng đô ở vùng cửa sông Tô Lịch (Hà Nội). Đây là nhà nước độc lập đầu tiên xưng đế sau hơn 600 năm Bắc thuộc, kiểm soát vùng Giao Châu cũ (Bắc Bộ và Bắc Trung Bộ); vùng Lĩnh Nam phía bắc vẫn thuộc nhà Lương.',
    assign: assignAll(GIAO_CHAU, 'van-xuan'),
    lowConfidence: ['group:bac-bo-nui'],
    focus: { lon: 105.85, lat: 21.05 },
    sources: [TOAN_THU, LSVN1, TAYLOR]
  },
  {
    id: '550',
    year: 550,
    yearLabel: '550',
    era: 'van-xuan',
    title: 'Triệu Việt Vương; Chân Lạp lấn Phù Nam',
    summary:
      'Sau khi Lý Nam Đế mất (548), Triệu Quang Phục dựa vào đầm Dạ Trạch (Hưng Yên) tiếp tục kháng chiến, đến năm 550 đánh bại quân Lương (khi tướng Lương là Trần Bá Tiên phải rút về nước vì loạn Hầu Cảnh), giành lại quyền tự chủ và xưng Triệu Việt Vương, vẫn trong quốc hiệu Vạn Xuân. Cùng thời gian này ở Campuchia, tiểu quốc Chân Lạp — với trung tâm quyền lực ở vùng Kampong Thom ngày nay — bắt đầu nổi lên thách thức Phù Nam, mở đầu quá trình suy tàn kéo dài hơn một thế kỷ của vương quốc này.',
    assign: {
      'KHM.kampong-thom': 'chan-lap'
    },
    lowConfidence: ['KHM.kampong-thom'],
    focus: { lon: 105.95, lat: 20.9 },
    sources: [TOAN_THU, TAYLOR, VICKERY_KHMER, COEDES]
  },
  {
    id: '571',
    year: 571,
    yearLabel: '571',
    era: 'van-xuan',
    title: 'Hậu Lý Nam Đế (Lý Phật Tử)',
    summary:
      'Lý Phật Tử — một thủ lĩnh cùng họ với Lý Nam Đế — đem quân đánh Triệu Việt Vương, chiếm được ngôi vua năm 571, sử cũ gọi là Hậu Lý Nam Đế. Quốc hiệu Vạn Xuân và ranh giới lãnh thổ được giữ nguyên, chỉ thay đổi người đứng đầu.',
    assign: {},
    focus: { lon: 105.85, lat: 21.05 },
    sources: [TOAN_THU, CUONG_MUC, TAYLOR]
  },
  {
    id: '602',
    year: 602,
    yearLabel: '602',
    era: 'bac-thuoc-3',
    title: 'Nhà Tùy chiếm Vạn Xuân',
    summary:
      'Nhà Tùy đã thống nhất Trung Hoa từ năm 589; đến năm 602, Tùy Văn Đế sai Lưu Phương đem quân sang đánh Vạn Xuân, Lý Phật Tử ra hàng. Vạn Xuân chấm dứt, cả vùng Giao Châu cũ và Lĩnh Nam đều thuộc quyền cai trị thống nhất của nhà Tùy.',
    assign: {
      ...assignAll(GIAO_CHAU, 'nha-tuy'),
      ...assignAll(LINH_NAM, 'nha-tuy')
    },
    lowConfidence: ['group:bac-bo-nui'],
    focus: { lon: 105.85, lat: 21.05 },
    sources: [{ title: 'Tùy thư' }, TOAN_THU, TAYLOR]
  },
  {
    id: '622',
    year: 622,
    yearLabel: '622',
    era: 'bac-thuoc-3',
    title: 'Nhà Đường lập Giao Châu tổng quản phủ',
    summary:
      'Nhà Đường thay nhà Tùy từ năm 618, nhưng ở Giao Châu, Khâu Hòa (quan lại cũ của Tùy) vẫn cát cứ thêm vài năm trước khi quy phục. Năm 622, Đường Cao Tổ đặt Giao Châu tổng quản phủ, chính thức xác lập quyền cai trị của nhà Đường trên toàn vùng.',
    assign: {
      ...assignAll(GIAO_CHAU, 'nha-duong'),
      ...assignAll(LINH_NAM, 'nha-duong')
    },
    lowConfidence: ['group:bac-bo-nui'],
    focus: { lon: 105.85, lat: 21.05 },
    sources: [{ title: 'Cựu Đường thư' }, TOAN_THU, TAYLOR]
  },
  {
    id: '679',
    year: 679,
    yearLabel: '679',
    era: 'bac-thuoc-3',
    title: 'An Nam đô hộ phủ; Chân Lạp thay Phù Nam',
    summary:
      'Năm 679, nhà Đường đổi Giao Châu đô hộ phủ thành An Nam đô hộ phủ — tên gọi hành chính, không kèm thay đổi ranh giới. Cùng thời gian này ở Campuchia, Chân Lạp đã hoàn tất quá trình thay thế Phù Nam trên danh nghĩa, dù mức độ kiểm soát thực tế của Chân Lạp với vùng châu thổ Mê Kông (Nam Bộ ngày nay) — khi đó còn thưa dân, nhiều đầm lầy theo mô tả của sứ thần Trung Hoa — vẫn là điều giới nghiên cứu còn tranh luận.',
    assign: assignAll(CAMPUCHIA_NAM_BO, 'chan-lap'),
    lowConfidence: ['group:nam-bo'],
    focus: { lon: 105.0, lat: 12.5 },
    sources: [VICKERY_KHMER, COEDES, CHANDLER]
  },
  {
    id: '722',
    year: 722,
    yearLabel: '722',
    era: 'bac-thuoc-3',
    title: 'Khởi nghĩa Mai Thúc Loan',
    summary:
      'Mai Thúc Loan dấy binh ở Hoan Châu (Nghệ An), xưng đế (Mai Hắc Đế), xây thành Vạn An. Sử cũ chép ông được nhiều châu hưởng ứng, nhưng phạm vi kiểm soát thực tế nhiều khả năng chủ yếu ở vùng Nghệ An – Hà Tĩnh; cuộc khởi nghĩa bị tướng Đường là Dương Tư Húc dẹp trong cùng năm. Thư tịch Trung Hoa bắt đầu gọi Lâm Ấp bằng tên khác — Hoàn Vương — cụ thể hơn vào khoảng năm 749–757; bản đồ đổi tên chính thể từ mốc 722 vì đây là mốc gần nhất trước thời điểm đó trên dòng thời gian, không phải năm đổi tên chính xác. Cùng giai đoạn này, các bia ký Chăm ở Kauthara (Nha Trang, từ thế kỷ VIII) và Panduranga (Phan Rang) cho thấy hai tiểu quốc phía nam cũng thuộc về khối Chăm Pa; do niên đại hợp nhất chính trị với Lâm Ấp/Chăm Pa phía bắc còn chưa rõ, bản đồ gán hai vùng này từ mốc gần nhất có bằng chứng, đánh dấu độ tin cậy thấp.',
    assign: {
      ...assignAll(GIAO_CHAU, 'mai-thuc-loan'),
      ...assignAll(NHAT_NAM, 'champa'),
      ...assignAll(KAUTHARA_PANDURANGA, 'champa')
    },
    lowConfidence: [...GIAO_CHAU, ...KAUTHARA_PANDURANGA],
    focus: { lon: 105.3, lat: 18.7 },
    sources: [TOAN_THU, CUONG_MUC, TAYLOR, VICKERY_CHAMPA]
  },
  {
    id: '791',
    year: 791,
    yearLabel: '791',
    era: 'bac-thuoc-3',
    title: 'Khởi nghĩa Phùng Hưng',
    summary:
      'Sau khi khởi nghĩa Mai Thúc Loan bị dập tắt, nhà Đường khôi phục quyền cai trị An Nam. Khoảng cuối thế kỷ VIII, Phùng Hưng (Bố Cái Đại Vương) ở Đường Lâm nổi dậy, chiếm được phủ thành Tống Bình; theo Đại Việt sử ký toàn thư, con ông là Phùng An nối nghiệp không lâu rồi ra hàng viên đô hộ Triệu Xương ngay trong năm 791, nên thời gian và phạm vi kiểm soát thực tế của họ Phùng đến nay vẫn chưa hoàn toàn rõ ràng.',
    assign: assignAll(GIAO_CHAU, 'phung-hung'),
    lowConfidence: [...GIAO_CHAU],
    focus: { lon: 105.85, lat: 21.05 },
    sources: [TOAN_THU, CUONG_MUC, TAYLOR]
  },
  {
    id: '802',
    year: 802,
    yearLabel: '802',
    era: 'bac-thuoc-3',
    title: 'Đế quốc Khmer (Angkor)',
    summary:
      'Sau khi họ Phùng ra hàng, nhà Đường tái lập quyền cai trị An Nam. Cũng năm 802, Jayavarman II làm lễ xưng vương trên núi Kulen, tự nhận là "vua của các vua" (devarāja), được xem là mốc mở đầu Đế quốc Khmer với kinh đô Angkor — kế tục và dần thống nhất các tiểu quốc Chân Lạp trước đó, dù quyền kiểm soát thực tế với vùng châu thổ Mê Kông xa kinh đô vẫn còn hạn chế trong giai đoạn đầu.',
    assign: {
      ...assignAll(GIAO_CHAU, 'nha-duong'),
      ...assignAll(CAMPUCHIA_NAM_BO, 'khmer')
    },
    lowConfidence: ['group:nam-bo'],
    focus: { lon: 104.0, lat: 13.4 },
    sources: [COEDES, CHANDLER, TOAN_THU, TAYLOR]
  },
  {
    id: '863',
    year: 863,
    yearLabel: '863',
    era: 'bac-thuoc-3',
    title: 'Nam Chiếu chiếm Giao Chỉ',
    summary:
      'Vương quốc Nam Chiếu (Vân Nam) nhiều lần đem quân đánh An Nam từ năm 860; đến năm 863, Nam Chiếu hạ được thành Đại La, giết đô hộ Sái Tập, chiếm đóng Giao Chỉ trong khoảng ba năm. Mức độ kiểm soát của Nam Chiếu với các vùng núi xa trung tâm không rõ bằng khu vực quanh phủ thành.',
    assign: assignAll(GIAO_CHAU, 'nam-chieu'),
    lowConfidence: ['group:bac-bo-nui'],
    focus: { lon: 105.85, lat: 21.05 },
    sources: [{ title: 'Tân Đường thư — Nam Chiếu truyện' }, TOAN_THU, TAYLOR]
  },
  {
    id: '866',
    year: 866,
    yearLabel: '866',
    era: 'bac-thuoc-3',
    title: 'Cao Biền lập Tĩnh Hải quân',
    summary:
      'Nhà Đường sai Cao Biền đem quân sang đánh đuổi quân Nam Chiếu, khôi phục thành Đại La (866). Cùng năm, Đường đổi tên An Nam đô hộ phủ thành Tĩnh Hải quân, nhưng đây vẫn là một đơn vị hành chính – quân sự của nhà Đường, do triều đình trung ương bổ nhiệm tiết độ sứ, không phải chính quyền tự chủ.',
    assign: assignAll(GIAO_CHAU, 'nha-duong'),
    lowConfidence: ['group:bac-bo-nui'],
    focus: { lon: 105.85, lat: 21.05 },
    sources: [{ title: 'Tân Đường thư' }, TOAN_THU, CUONG_MUC]
  },
  {
    id: '905',
    year: 905,
    yearLabel: '905',
    era: 'tu-chu',
    title: 'Khúc Thừa Dụ giành quyền tự chủ',
    summary:
      'Nhân lúc nhà Đường suy yếu, hào trưởng Khúc Thừa Dụ ở Hồng Châu được dân chúng suy tôn, tự xưng Tiết độ sứ Tĩnh Hải quân và được triều đình Đường (đã kiệt quệ) buộc phải công nhận. Tuy trên danh nghĩa vẫn là chức quan của nhà Đường, họ Khúc trên thực tế nắm quyền tự chủ hoàn toàn, mở đầu thời kỳ tự chủ trước khi bước vào kỷ nguyên độc lập.',
    assign: assignAll(GIAO_CHAU, 'tinh-hai-quan'),
    lowConfidence: ['group:bac-bo-nui'],
    focus: { lon: 105.85, lat: 21.05 },
    sources: [TOAN_THU, CUONG_MUC, LSVN1]
  },
  {
    id: '917',
    year: 917,
    yearLabel: '917',
    era: 'tu-chu',
    title: 'Nhà Nam Hán ở Lĩnh Nam',
    summary:
      'Lưu Nham (Lưu Cung), tiết độ sứ Thanh Hải cát cứ vùng Lưỡng Quảng sau khi nhà Đường sụp đổ, xưng đế năm 917, lập nước Nam Hán, đóng đô ở Quảng Châu. Giao Châu của họ Khúc khi đó vẫn giữ quyền tự chủ, chưa thuộc Nam Hán.',
    assign: assignAll(LINH_NAM, 'nam-han'),
    focus: { lon: 113.25, lat: 23.13 },
    sources: [{ title: 'Tân Ngũ Đại sử — Nam Hán thế gia', author: 'Âu Dương Tu' }, TOAN_THU, LSVN1]
  },
  {
    id: '930',
    year: 930,
    yearLabel: '930',
    era: 'tu-chu',
    title: 'Nam Hán chiếm Giao Châu',
    summary:
      'Vua Nam Hán sai Lý Khắc Chính, Lương Khắc Trinh đem quân đánh Giao Châu, bắt được Tiết độ sứ Khúc Thừa Mỹ (con Khúc Hạo) đưa về Phiên Ngung. Giao Châu tạm thời mất quyền tự chủ, thuộc về Nam Hán.',
    assign: assignAll(GIAO_CHAU, 'nam-han'),
    lowConfidence: ['group:bac-bo-nui'],
    focus: { lon: 105.85, lat: 21.05 },
    sources: [TOAN_THU, CUONG_MUC, LSVN1]
  },
  {
    id: '931',
    year: 931,
    yearLabel: '931',
    era: 'tu-chu',
    title: 'Dương Đình Nghệ giành lại Giao Châu',
    summary:
      'Dương Đình Nghệ — một tướng cũ của họ Khúc — chiêu mộ quân sĩ, đem quân vây đánh và đánh tan viện binh Nam Hán tại thành Đại La, khôi phục quyền tự chủ cho Giao Châu, tự xưng Tiết độ sứ, tiếp nối cơ nghiệp của họ Khúc.',
    assign: assignAll(GIAO_CHAU, 'tinh-hai-quan'),
    lowConfidence: ['group:bac-bo-nui'],
    focus: { lon: 105.85, lat: 21.05 },
    sources: [TOAN_THU, CUONG_MUC, LSVN1]
  }
];
