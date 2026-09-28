import type { Snapshot, Source } from '../types';

/*
 * Task C3 — mốc Ngô, Đinh, Tiền Lê, Lý, Trần (939 → 1371–1390), 18 mốc, các thời kỳ
 * ngo-dinh-le → nha-tran.
 *
 * File này tự đứng một mình: mốc đầu (`939`) có `'*': null` và gán đầy đủ, tiếp nối đúng trạng
 * thái cuối của file 02-co-dai.ts (mốc `931`, sau fix round 1): Giao Châu cũ (Bắc Bộ + Thanh –
 * Nghệ – Tĩnh) thuộc Tĩnh Hải quân tự chủ, Lĩnh Nam (Quảng Đông, Quảng Tây, Hải Nam) thuộc Nam
 * Hán, dải bờ biển Quảng Bình → Bình Thuận (gồm cả Kauthara, Panduranga từ mốc `722`) thuộc Chăm
 * Pa, Nam Bộ + Campuchia thuộc Đế quốc Khmer.
 *
 * Quy ước viết tắt vùng dùng nhiều lần (giữ nguyên từ 02-co-dai.ts):
 * - GIAO_CHAU: đồng bằng Bắc Bộ + Bắc Trung Bộ + miền núi Bắc Bộ.
 * - LINH_NAM: Quảng Đông + Quảng Tây (+ Hồng Kông, Ma Cao) + Hải Nam.
 * - NHAT_NAM: nhóm quan-nhat-nam (Quảng Bình → Bình Định).
 * - CAMPUCHIA_NAM_BO: Campuchia + Nam Bộ.
 * Vùng mới khai báo trong groups.ts cho task này:
 * - ba-chau-1069: ba châu Bố Chính, Địa Lý, Ma Linh (Quảng Bình + các huyện phía bắc sông Thạch
 *   Hãn của Quảng Trị: Vĩnh Linh, Gio Linh, Cam Lộ, Đông Hà, Cồn Cỏ, Hướng Hóa, Đa Krông).
 * - chau-o, chau-ly: châu Ô (sau đổi Thuận Châu) và châu Lý (sau đổi Hóa Châu) năm 1306, gộp lại
 *   vừa đúng phần còn lại của Quảng Trị (huyện Quảng Trị, Triệu Phong, Hải Lăng) và toàn bộ Thừa
 *   Thiên Huế; ranh giới cụ thể theo huyện hiện đại chỉ mang tính ước lệ.
 * - bien-gioi-ly-tong-1077: dải châu động biên giới Cao Bằng mà Tống chiếm giữ 1076–1084 (Quảng
 *   Nguyên ≈ huyện Quảng Uyên + Phục Hòa; Tư Lang ≈ Trùng Khánh + Hạ Lang; Môn châu ≈ Thạch An).
 *   Xem "Fix round 1" trong báo cáo task để biết chi tiết đối chiếu nguồn cấp huyện.
 * - kauthara, panduranga: dải nam Trung Bộ (Phú Yên–Khánh Hòa, Ninh Thuận–Bình Thuận) thuộc Chăm
 *   Pa, dùng để gán từ mốc `939` (kế thừa quyết định bổ sung tại mốc `722` của 02-co-dai.ts).
 *
 * Năm sửa so với bảng gốc trong brief: không có mốc nào phải sửa year/yearLabel — toàn bộ 18 mốc
 * đối chiếu với Đại Việt sử ký toàn thư, Khâm định Việt sử thông giám cương mục và Lịch sử Việt
 * Nam (Viện Sử học) đều khớp với bảng. Riêng mốc `1069` trong bản mẫu (brief) dùng id `dai-viet`
 * đã bị loại sau ruling C1; mốc này dùng `nha-ly` theo đúng ghi chú của task.
 *
 * Các điểm cân nhắc khác (xem báo cáo task để biết chi tiết nguồn):
 * - Mốc `982` (Lê Hoàn đánh Chiêm Thành) chỉ là một cuộc tập kích phá kinh đô Indrapura, không
 *   sáp nhập lãnh thổ; ranh giới Đại Cồ Việt – Chăm Pa ở Quảng Bình không đổi cho tới 1069.
 * - Mốc `1077`–`1084`: theo Toàn thư và các khảo cứu về vấn đề biên giới thời Lý, sau khi rút
 *   quân khỏi cuộc phản công 1076–1077, nhà Tống vẫn giữ lại một dải châu động vùng mỏ vàng bạc ở
 *   Cao Bằng (nhóm `bien-gioi-ly-tong-1077`: Quảng Uyên, Phục Hòa, Trùng Khánh, Hạ Lang, Thạch
 *   An) và chỉ trả lại phần lớn tại hội nghị Vĩnh Bình năm 1084; hai vùng nhỏ Vật Dương, Vật Ác
 *   bị Tống giữ hẳn dù Đại Việt nhiều lần đòi lại, nhưng vị trí quy về địa giới hành chính hiện
 *   đại của hai vùng này chưa có sự thống nhất trong giới nghiên cứu nên không tách riêng trên
 *   bản đồ (đánh dấu lowConfidence cho cả nhóm ở cả hai mốc). Lạng Sơn (tuyến hành quân chính của
 *   Tống, do thủ lĩnh địa phương Thân Cảnh Phúc — trung thành với Đại Việt — trấn giữ ở châu
 *   Quang Lang/vùng Chi Lăng) không thuộc dải châu động bị giữ lại lâu dài nên không đổi chủ ở
 *   hai mốc này (fix round 1, xem báo cáo task).
 * - Mốc `1371`: Chế Bồng Nga từng cử sứ đòi lại Hóa Châu nhưng bị nhà Trần từ chối, nên bản đồ
 *   không đổi chủ vùng này; tuy vậy quyền kiểm soát thực tế của nhà Trần ở đây suy yếu rõ rệt
 *   trong giai đoạn 1371–1390 nên đánh dấu lowConfidence cho châu Ô, châu Lý.
 */

const TOAN_THU: Source = { title: 'Đại Việt sử ký toàn thư', note: 'Bản kỷ' };
const CUONG_MUC: Source = { title: 'Khâm định Việt sử thông giám cương mục' };
const LSVN2: Source = {
  title: 'Lịch sử Việt Nam, tập 2 (từ thế kỷ X đến thế kỷ XIV)',
  author: 'Viện Sử học',
  note: 'NXB Khoa học xã hội, 2017'
};
const TAYLOR2013: Source = {
  title: 'A History of the Vietnamese',
  author: 'Keith W. Taylor',
  note: '2013'
};
const VICKERY_CHAMPA: Source = {
  title: 'Champa Revised',
  author: 'Michael Vickery',
  note: 'ARI Working Paper 37, 2005'
};
const MASPERO: Source = { title: 'Le royaume de Champa', author: 'Georges Maspero', note: '1928' };
const STUART_FOX: Source = {
  title: 'A History of Laos',
  author: 'Martin Stuart-Fox',
  note: '1997'
};
const STUART_FOX_LX: Source = {
  title: 'The Lao Kingdom of Lān Xāng: Rise and Decline',
  author: 'Martin Stuart-Fox',
  note: '1998'
};
const TONG_SU: Source = { title: 'Tống sử' };
const NGUYEN_SU: Source = { title: 'Nguyên sử' };
const MINH_SU: Source = { title: 'Minh sử' };

const GIAO_CHAU = ['group:dong-bang-bac-bo', 'group:bac-bo-nui'];
const LINH_NAM = ['group:linh-nam-trung-hoa', 'CHN.hai-nam'];
const NHAT_NAM = ['group:quan-nhat-nam'];
const KAUTHARA_PANDURANGA = ['group:kauthara', 'group:panduranga'];
const CAMPUCHIA_NAM_BO = ['KHM', 'group:nam-bo'];
const BA_CHAU = ['group:ba-chau-1069'];
const CHAU_O_LY = ['group:chau-o', 'group:chau-ly'];
const BIEN_GIOI_1077 = ['group:bien-gioi-ly-tong-1077'];

const assignAll = (selectors: string[], polity: string) =>
  Object.fromEntries(selectors.map((s) => [s, polity]));

export const NGO_LY_TRAN: Snapshot[] = [
  {
    id: '939',
    year: 939,
    yearLabel: '939',
    era: 'ngo-dinh-le',
    title: 'Ngô Quyền xưng vương sau trận Bạch Đằng',
    summary:
      'Năm 938, Ngô Quyền đánh tan quân Nam Hán trên sông Bạch Đằng, giết thái tử Hoằng Tháo. Năm 939, ông xưng vương, đóng đô ở Cổ Loa, chấm dứt hơn nghìn năm Bắc thuộc và mở đầu thời kỳ độc lập lâu dài của người Việt. Lãnh thổ kế thừa nguyên vẹn vùng Giao Châu cũ (đồng bằng và miền núi Bắc Bộ, Thanh – Nghệ – Tĩnh); phía bắc, Lĩnh Nam vẫn thuộc Nam Hán, còn dải bờ biển Quảng Bình tới Bình Thuận vẫn thuộc Chăm Pa, gồm cả hai tiểu quốc phía nam Kauthara (Phú Yên, Khánh Hòa) và Panduranga (Ninh Thuận, Bình Thuận).',
    assign: {
      '*': null,
      ...assignAll(GIAO_CHAU, 'nha-ngo'),
      ...assignAll(LINH_NAM, 'nam-han'),
      ...assignAll(NHAT_NAM, 'champa'),
      ...assignAll(KAUTHARA_PANDURANGA, 'champa'),
      ...assignAll(CAMPUCHIA_NAM_BO, 'khmer')
    },
    lowConfidence: ['group:bac-bo-nui', 'group:quan-nhat-nam', ...KAUTHARA_PANDURANGA],
    focus: { lon: 105.87, lat: 21.13 },
    sources: [TOAN_THU, LSVN2, CUONG_MUC, VICKERY_CHAMPA]
  },
  {
    id: '966',
    year: 966,
    yearLabel: '965–967',
    era: 'ngo-dinh-le',
    title: 'Loạn 12 sứ quân',
    summary:
      'Sau khi Ngô Quyền mất (944), triều đình suy yếu dần vì các cuộc tranh giành quyền lực; đến khi Ngô Xương Văn tử trận năm 965, đất nước không còn chính quyền trung ương thống nhất, rơi vào cảnh 12 sứ quân cát cứ khắp vùng đồng bằng và trung du Bắc Bộ. Không sứ quân nào kiểm soát trọn vẹn lãnh thổ cũ của nhà Ngô nên phạm vi từng vùng chỉ mang tính ước lệ.',
    assign: assignAll(GIAO_CHAU, 'thap-nhi-su-quan'),
    lowConfidence: [...GIAO_CHAU],
    focus: { lon: 105.9, lat: 20.5 },
    sources: [TOAN_THU, CUONG_MUC, LSVN2]
  },
  {
    id: '968',
    year: 968,
    yearLabel: '968',
    era: 'ngo-dinh-le',
    title: 'Đinh Bộ Lĩnh lập Đại Cồ Việt',
    summary:
      'Đinh Bộ Lĩnh, sứ quân đóng ở Hoa Lư, lần lượt dẹp yên các sứ quân khác, thống nhất đất nước, lên ngôi hoàng đế năm 968, đặt quốc hiệu Đại Cồ Việt — quốc hiệu đầu tiên của nhà nước độc lập — và đóng đô ở Hoa Lư (Ninh Bình). Sự kiện này chấm dứt loạn 12 sứ quân, khôi phục quyền cai trị thống nhất trên toàn vùng Giao Châu cũ.',
    assign: assignAll(GIAO_CHAU, 'nha-dinh'),
    focus: { lon: 105.92, lat: 20.25 },
    sources: [TOAN_THU, CUONG_MUC, LSVN2]
  },
  {
    id: '980',
    year: 980,
    yearLabel: '980',
    era: 'ngo-dinh-le',
    title: 'Nhà Tiền Lê',
    summary:
      'Đinh Toàn lên ngôi khi còn nhỏ tuổi sau khi Đinh Tiên Hoàng bị sát hại (979); trước nguy cơ nhà Tống đem quân xâm lược, thái hậu Dương Vân Nga cùng triều thần suy tôn thập đạo tướng quân Lê Hoàn lên ngôi năm 980, lập nhà Tiền Lê, vẫn giữ quốc hiệu Đại Cồ Việt và kinh đô Hoa Lư. Cùng giai đoạn này ở phương bắc, nhà Tống đã diệt Nam Hán (971) và về cơ bản thống nhất Trung Hoa, nên từ đây trực tiếp giáp giới Đại Cồ Việt ở vùng Lĩnh Nam thay cho Nam Hán trước đó.',
    assign: {
      ...assignAll(GIAO_CHAU, 'tien-le'),
      ...assignAll(LINH_NAM, 'nha-tong')
    },
    lowConfidence: ['group:bac-bo-nui'],
    focus: { lon: 105.92, lat: 20.25 },
    sources: [TOAN_THU, CUONG_MUC, LSVN2, TONG_SU]
  },
  {
    id: '982',
    year: 982,
    yearLabel: '982',
    era: 'ngo-dinh-le',
    title: 'Lê Hoàn đánh Chiêm Thành',
    summary:
      'Sau khi vua Chiêm Thành bắt giữ sứ giả Đại Cồ Việt, Lê Hoàn thân chinh đem quân đánh Chiêm Thành năm 982, giết vua Parameshvaravarman và phá hủy kinh đô Indrapura (nay thuộc Đồng Dương, Thăng Bình, Quảng Nam). Người Chăm sau đó dời đô về Vijaya (Chà Bàn, Bình Định), xa hơn về phía nam; đây được xem là mốc mở đầu cho các cuộc Nam tiến sau này, nhưng ranh giới hai nước ở vùng Quảng Bình khi đó chưa thay đổi.',
    assign: {},
    focus: { lon: 108.28, lat: 15.72 },
    sources: [TOAN_THU, VICKERY_CHAMPA, MASPERO, LSVN2]
  },
  {
    id: '1009',
    year: 1009,
    yearLabel: '1009',
    era: 'nha-ly',
    title: 'Nhà Lý',
    summary:
      'Vua Lê Long Đĩnh mất năm 1009; triều thần cùng các tăng sư (trong đó có thiền sư Vạn Hạnh) suy tôn Điện tiền chỉ huy sứ Lý Công Uẩn lên ngôi, mở đầu nhà Lý. Quốc hiệu Đại Cồ Việt và kinh đô Hoa Lư được giữ nguyên trong năm đầu tiên của triều đại mới; lãnh thổ không thay đổi so với thời Tiền Lê.',
    assign: assignAll(GIAO_CHAU, 'nha-ly'),
    polityOverrides: { 'nha-ly': { name: 'Đại Cồ Việt' } },
    focus: { lon: 105.92, lat: 20.25 },
    sources: [TOAN_THU, CUONG_MUC, LSVN2]
  },
  {
    id: '1010',
    year: 1010,
    yearLabel: '1010',
    era: 'nha-ly',
    title: 'Dời đô về Thăng Long',
    summary:
      'Năm 1010, Lý Công Uẩn ban Chiếu dời đô, chuyển kinh đô từ Hoa Lư ra thành Đại La bên sông Hồng và đổi tên là Thăng Long. Đây là bước mở đầu cho sự phát triển lâu dài của Thăng Long — Hà Nội như trung tâm chính trị của đất nước; sự kiện thuần túy về hành chính, không làm thay đổi ranh giới lãnh thổ.',
    assign: {},
    focus: { lon: 105.85, lat: 21.03 },
    sources: [TOAN_THU, CUONG_MUC, LSVN2]
  },
  {
    id: '1054',
    year: 1054,
    yearLabel: '1054',
    era: 'nha-ly',
    title: 'Quốc hiệu Đại Việt',
    summary:
      'Năm 1054, Lý Thánh Tông lên ngôi, đổi quốc hiệu từ Đại Cồ Việt thành Đại Việt — quốc hiệu được các triều đại sau tiếp tục sử dụng trong nhiều thế kỷ (trừ giai đoạn ngắn Đại Ngu thời nhà Hồ). Đây thuần túy là việc đổi quốc hiệu, không kèm theo biến động lãnh thổ.',
    assign: {},
    polityOverrides: { 'nha-ly': { name: 'Đại Việt (nhà Lý)' } },
    focus: { lon: 105.85, lat: 21.03 },
    sources: [TOAN_THU, CUONG_MUC, LSVN2]
  },
  {
    id: '1069',
    year: 1069,
    yearLabel: '1069',
    era: 'nha-ly',
    title: 'Nhận ba châu Bố Chính, Địa Lý, Ma Linh',
    summary:
      'Năm 1069, Lý Thánh Tông cùng Lý Thường Kiệt đem quân đánh Chăm Pa, bắt được vua Chế Củ (Rudravarman III) đưa về Thăng Long. Để được tha, Chế Củ dâng ba châu Bố Chính, Địa Lý và Ma Linh, tương ứng tỉnh Quảng Bình cùng các huyện phía bắc sông Thạch Hãn của Quảng Trị ngày nay (Vĩnh Linh, Gio Linh, Cam Lộ, Đông Hà, Hướng Hóa, Đa Krông); ranh giới cụ thể giữa ba châu thời Lý không hoàn toàn trùng khớp địa giới huyện hiện đại.',
    assign: { 'group:ba-chau-1069': 'nha-ly' },
    lowConfidence: [...BA_CHAU],
    focus: { lon: 106.6, lat: 17.3 },
    sources: [TOAN_THU, LSVN2, CUONG_MUC]
  },
  {
    id: '1077',
    year: 1077,
    yearLabel: '1075–1077',
    era: 'nha-ly',
    title: 'Chiến tranh Tống – Việt, phòng tuyến Như Nguyệt',
    summary:
      'Trước nguy cơ nhà Tống chuẩn bị xâm lược, năm 1075 Lý Thường Kiệt đem quân đánh sang đất Tống, hạ các thành Ung Châu, Khâm Châu, Liêm Châu rồi rút về nước. Năm 1076–1077, quân Tống do Quách Quỳ chỉ huy tiến sang trả đũa, hành quân qua ngả Lạng Sơn (nơi thủ lĩnh địa phương Thân Cảnh Phúc, trung thành với Đại Việt, tổ chức đánh chặn) nhưng bị ngăn đứng tại phòng tuyến sông Như Nguyệt (sông Cầu), phải rút quân. Riêng vùng mỏ vàng bạc Quảng Nguyên và các châu lân cận ở Cao Bằng bị Tống giữ lại, chưa trả ngay cho Đại Việt.',
    assign: assignAll(BIEN_GIOI_1077, 'nha-tong'),
    lowConfidence: [...BIEN_GIOI_1077],
    focus: { lon: 106.5, lat: 22.68 },
    sources: [TOAN_THU, CUONG_MUC, LSVN2]
  },
  {
    id: '1084',
    year: 1084,
    yearLabel: '1084',
    era: 'nha-ly',
    title: 'Hội nghị biên giới: Tống trả các châu động',
    summary:
      'Sau nhiều lần cử sứ bộ thương thuyết, năm 1084 Lý Thường Kiệt cử Binh bộ Thị lang Lê Văn Thịnh đến trại Vĩnh Bình hội đàm với sứ Tống là Thành Trạc; nhà Tống đồng ý trả lại phần lớn số châu động đã chiếm giữ ở vùng Quảng Nguyên (Cao Bằng), trong đó có mỏ vàng bạc. Tuy vậy, hai vùng nhỏ Vật Dương, Vật Ác vẫn bị Tống giữ lại dù Đại Việt nhiều lần đòi lại trong hơn mười năm sau đó; vị trí quy về địa giới hành chính hiện đại của hai vùng này chưa có sự thống nhất trong giới nghiên cứu nên không được tách riêng trên bản đồ, bản đồ coi cả dải châu động này đã về tay Đại Việt.',
    assign: assignAll(BIEN_GIOI_1077, 'nha-ly'),
    lowConfidence: [...BIEN_GIOI_1077],
    focus: { lon: 106.5, lat: 22.68 },
    sources: [TOAN_THU, CUONG_MUC, LSVN2]
  },
  {
    id: '1225',
    year: 1225,
    yearLabel: '1225',
    era: 'nha-tran',
    title: 'Nhà Trần',
    summary:
      'Năm 1225, Lý Chiêu Hoàng — nữ hoàng cuối cùng của nhà Lý — nhường ngôi cho chồng là Trần Cảnh, mở đầu nhà Trần. Việc chuyển giao quyền lực diễn ra êm thấm trong nội bộ triều đình; lãnh thổ Đại Việt được giữ nguyên vẹn từ thời Lý, gồm cả vùng ba châu Bố Chính, Địa Lý, Ma Linh và dải biên giới phía bắc đã thu hồi năm 1084.',
    assign: {
      ...assignAll(GIAO_CHAU, 'nha-tran'),
      ...assignAll(BA_CHAU, 'nha-tran')
    },
    focus: { lon: 105.85, lat: 21.03 },
    sources: [TOAN_THU, CUONG_MUC, LSVN2]
  },
  {
    id: '1279',
    year: 1279,
    yearLabel: '1279',
    era: 'nha-tran',
    title: 'Nhà Nguyên diệt Nam Tống, chiếm Hoa Nam',
    summary:
      'Sau nhiều năm giao tranh, thủy quân Nguyên đánh tan lực lượng kháng cự cuối cùng của Nam Tống tại trận Nhai Sơn (Quảng Đông) năm 1279; tể tướng Lục Tú Phu ôm ấu chúa Triệu Bính nhảy xuống biển, nhà Nam Tống diệt vong. Toàn bộ Hoa Nam, trong đó có vùng Lưỡng Quảng giáp Đại Việt, chuyển sang thuộc quyền cai trị của nhà Nguyên (Mông Cổ), mở đầu áp lực xâm lược Đại Việt trong các năm sau đó.',
    assign: assignAll(LINH_NAM, 'nha-nguyen-mong'),
    focus: { lon: 113.0, lat: 22.5 },
    sources: [NGUYEN_SU, TOAN_THU, LSVN2]
  },
  {
    id: '1288',
    year: 1288,
    yearLabel: '1258–1288',
    era: 'nha-tran',
    title: 'Ba lần kháng chiến chống Mông – Nguyên',
    summary:
      'Trong ba lần xâm lược (1258, 1285 và 1287–1288), quân Mông Cổ – Nguyên đều bị nhà Trần đánh bại, đỉnh điểm là chiến thắng Bạch Đằng năm 1288 khi Trần Hưng Đạo dùng lại kế đóng cọc gỗ, tiêu diệt đoàn thuyền của Ô Mã Nhi. Cả ba lần xâm lược đều không để lại thay đổi lãnh thổ lâu dài cho Đại Việt.',
    assign: {},
    focus: { lon: 106.77, lat: 20.9 },
    sources: [TOAN_THU, CUONG_MUC, LSVN2]
  },
  {
    id: '1306',
    year: 1306,
    yearLabel: '1306',
    era: 'nha-tran',
    title: 'Châu Ô, châu Lý (sính lễ Huyền Trân)',
    summary:
      'Năm 1306, vua Chăm Pa Chế Mân (Jaya Simhavarman III) dâng hai châu Ô và Lý làm sính lễ cầu hôn công chúa Huyền Trân của nhà Trần. Năm sau (1307), Trần Anh Tông đổi châu Ô thành Thuận Châu, châu Lý thành Hóa Châu, tương ứng đại thể phần còn lại của Quảng Trị (nam sông Thạch Hãn) và toàn bộ Thừa Thiên Huế ngày nay, với ranh giới phía nam đến đèo Hải Vân. Việc phân định cụ thể hai châu theo địa giới huyện hiện đại chỉ mang tính ước lệ.',
    assign: assignAll(CHAU_O_LY, 'nha-tran'),
    lowConfidence: [...CHAU_O_LY],
    focus: { lon: 107.6, lat: 16.5 },
    sources: [TOAN_THU, CUONG_MUC, LSVN2]
  },
  {
    id: '1353',
    year: 1353,
    yearLabel: '1353',
    era: 'nha-tran',
    title: 'Pha Ngừm lập Lan Xang',
    summary:
      'Được triều đình Chân Lạp (Angkor) hỗ trợ, hoàng tử lưu vong Pha Ngừm thống nhất các mường Lào ở lưu vực sông Mê Kông, lên ngôi năm 1353, lập vương quốc Lan Xang ("Triệu Voi"), đóng đô ở Xiang Dong Xiang Thong (sau là Luang Prabang). Đây là nhà nước thống nhất đầu tiên của người Lào, trải rộng từ biên giới Vân Nam tới vùng hạ Lào giáp Chân Lạp; ranh giới cụ thể ở vùng núi giáp Đại Việt (Bồn Man) còn chưa rõ ràng trong giai đoạn đầu.',
    assign: { LAO: 'lan-xang' },
    lowConfidence: ['LAO'],
    focus: { lon: 102.13, lat: 19.89 },
    sources: [STUART_FOX_LX, STUART_FOX]
  },
  {
    id: '1368',
    year: 1368,
    yearLabel: '1368',
    era: 'nha-tran',
    title: 'Nhà Minh thay nhà Nguyên',
    summary:
      'Chu Nguyên Chương lật đổ ách cai trị của nhà Nguyên (Mông Cổ), lập nhà Minh, xưng đế ở Nam Kinh năm 1368; cùng năm, quân Minh chiếm được Đại Đô (Bắc Kinh), buộc triều đình Nguyên phải rút lên thảo nguyên phương bắc. Vùng Lưỡng Quảng giáp Đại Việt theo đó chuyển sang thuộc quyền cai trị của nhà Minh.',
    assign: assignAll(LINH_NAM, 'nha-minh'),
    focus: { lon: 113.0, lat: 22.5 },
    sources: [MINH_SU, TOAN_THU, LSVN2]
  },
  {
    id: '1371',
    year: 1371,
    yearLabel: '1371–1390',
    era: 'nha-tran',
    title: 'Chế Bồng Nga đánh ra Bắc',
    summary:
      'Từ khi nhà Trần suy yếu sau các cuộc kháng chiến chống Mông – Nguyên, vua Chăm Pa Chế Bồng Nga liên tục đem quân đánh ra Bắc, bốn lần tiến vào đốt phá kinh thành Thăng Long (1371, 1377, 1378, 1383) khiến vua Trần phải bỏ chạy; vua Trần Duệ Tông tử trận khi đem quân đánh Vijaya năm 1377. Chiêm Thành từng cử sứ đòi lại Hóa Châu nhưng bị nhà Trần từ chối, nên ranh giới hai nước về danh nghĩa không đổi, dù quyền kiểm soát thực tế của nhà Trần ở vùng biên viễn phía nam suy yếu rõ rệt trong giai đoạn này. Năm 1390, Chế Bồng Nga tử trận trong lần tiến quân thứ tư, quân Chiêm Thành rút hẳn về nam.',
    assign: {},
    lowConfidence: [...CHAU_O_LY],
    focus: { lon: 105.85, lat: 21.03 },
    sources: [TOAN_THU, CUONG_MUC, TAYLOR2013]
  }
];
