import type { FlagCredit, Polity, Source } from './types';

/*
 * DANH MỤC CHÍNH THỂ (Task C1). Các task C2–C5 chỉ dùng đúng các id dưới đây; cần thêm id thì
 * bổ sung vào file này trong cùng commit.
 *
 * Cờ được phủ lên mặt đất qua atlas (`flagAtlas.ts`) và atlas CHỈ chứa `flag` gốc của từng
 * Polity — `polityOverrides.flag` không hiện trên đất. Vì vậy mỗi triều đại có cờ riêng là một id
 * riêng; `polityOverrides` chỉ dùng để đổi tên/kinh đô trong cùng một chính thể.
 *
 * Tiền sử (biểu tượng): van-hoa-son-vi, van-hoa-hoa-binh, van-hoa-bac-son, van-hoa-quynh-van,
 *   van-hoa-phung-nguyen, van-hoa-sa-huynh, van-hoa-dong-nai, van-hoa-dong-son
 * Việt: van-lang, au-lac, hai-ba-trung, van-xuan, nha-ngo, nha-dinh, tien-le, nha-ly
 *   (override tên "Đại Cồ Việt" cho 1009–1054), nha-tran, nha-ho, hau-le, nha-mac, mac-cao-bang,
 *   le-trung-hung (override "Đàng Ngoài (Lê – Trịnh)" sau 1600), dang-trong (override cho
 *   Nguyễn Ánh ở Gia Định 1778–1802), ha-tien, tay-son, nha-nguyen (override "Đại Nam" từ 1838),
 *   de-quoc-viet-nam, vndcch, quoc-gia-viet-nam, vnch, cpcmlt, chxhcnvn
 * Chăm: lam-ap, champa (override "Hoàn Vương", "Chiêm Thành"), panduranga
 * Khmer: phu-nam, chan-lap, khmer (Angkor), campuchia-hau-angkor, vuong-quoc-campuchia,
 *   cong-hoa-khmer, campuchia-dan-chu, chnd-campuchia
 * Lào, Xiêm: lan-xang, luang-prabang, vieng-chan, champasak, vuong-quoc-lao, chdcnd-lao, xiem
 * Trung Hoa: nam-viet, han, dong-ngo, nha-tan-jin, nam-trieu, nha-tuy, nha-duong, nam-han,
 *   nha-tong, nha-nguyen-mong, nha-minh, nha-thanh, trung-hoa-dan-quoc, chnd-trung-hoa
 * Thuộc địa: phap
 *
 * Khác với bảng id trong brief: `dai-viet` (939–1527) được tách thành nha-ngo, nha-dinh,
 * tien-le, nha-ly, nha-tran, nha-ho, hau-le vì mỗi triều có cờ phục dựng riêng; thêm
 * `cong-hoa-khmer` (1970–1975) cho mốc 1974.
 *
 * `color`: màu chủ đạo của cờ, điều chỉnh theo họ màu (Việt đỏ/vàng cam, Chăm xanh ngọc, Khmer
 * xanh lam, Lào tím, Trung Hoa nâu vàng, Pháp xanh xám) để các chính thể cùng thời phân biệt được.
 */

const COMMONS = 'https://commons.wikimedia.org/wiki/File:';
const commons = (file: string, license: string, author?: string): FlagCredit => ({
  ...(author ? { author } : {}),
  license,
  url: COMMONS + file.replace(/ /g, '_')
});

const SYMBOL_NOTE = 'Biểu tượng tự thiết kế cho dự án, không phải cờ lịch sử.';
const HAN_GLYPH_NOTE =
  'Chữ Hán vẽ theo phông Noto Serif TC (giấy phép SIL OFL 1.1). Không có tư liệu về một lá cờ chung của nhà nước này.';
const NAMVANHOIQUAN =
  'Cờ phục dựng hiện đại do người dùng 南文會館 vẽ trên Wikimedia Commons, phỏng theo lệ cờ hiệu đề chữ họ nhà vua. Không có hiện vật hay mô tả gốc về một lá cờ quốc gia thời này; dùng để nhận diện triều đại.';

// ——— Nguồn dùng chung ———
const TOAN_THU: Source = { title: 'Đại Việt sử ký toàn thư' };
const CUONG_MUC: Source = { title: 'Khâm định Việt sử thông giám cương mục' };
const THUC_LUC: Source = { title: 'Đại Nam thực lục', author: 'Quốc sử quán triều Nguyễn' };
const LSVN = (tap: number, range: string): Source => ({
  title: `Lịch sử Việt Nam, tập ${tap} (${range})`,
  author: 'Viện Sử học',
  note: 'NXB Khoa học xã hội, 2017'
});
const KCH1: Source = {
  title: 'Khảo cổ học Việt Nam, tập I: Thời đại đá Việt Nam',
  author: 'Hà Văn Tấn (chủ biên)',
  note: 'NXB Khoa học xã hội, 1998'
};
const KCH2: Source = {
  title: 'Khảo cổ học Việt Nam, tập II: Thời đại kim khí Việt Nam',
  author: 'Hà Văn Tấn (chủ biên)',
  note: 'NXB Khoa học xã hội, 1999'
};
const TAYLOR: Source = { title: 'The Birth of Vietnam', author: 'Keith W. Taylor', note: '1983' };
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
const EVANS_SHORT: Source = {
  title: 'A Short History of Laos: The Land in Between',
  author: 'Grant Evans',
  note: '2002'
};
const EVANS_RITUAL: Source = {
  title: 'The Politics of Ritual and Remembrance: Laos since 1975',
  author: 'Grant Evans',
  note: '1998'
};
const FAIRBANK: Source = {
  title: 'China: A New History',
  author: 'John King Fairbank, Merle Goldman',
  note: 'bản mở rộng, 2006'
};

export const POLITIES: Polity[] = [
  // ——————————————————— Tiền sử (biểu tượng tự thiết kế) ———————————————————
  {
    id: 'van-hoa-son-vi',
    name: 'Văn hóa Sơn Vi',
    color: '#8c6d46',
    flag: '/flags/van-hoa-son-vi.svg',
    flagKind: 'symbol',
    flagNote: `Hòn cuội ghè đẽo một rìa, công cụ tiêu biểu của văn hóa Sơn Vi. ${SYMBOL_NOTE}`,
    flagCredit: null,
    period:
      'Hậu kỳ đá cũ, khoảng 20.000–11.000 năm trước (niên đại còn khác nhau giữa các nghiên cứu)',
    sources: [KCH1, LSVN(1, 'từ khởi thủy đến thế kỷ X')]
  },
  {
    id: 'van-hoa-hoa-binh',
    name: 'Văn hóa Hòa Bình',
    color: '#6f8a4a',
    flag: '/flags/van-hoa-hoa-binh.svg',
    flagKind: 'symbol',
    flagNote: `Công cụ cuội ghè hai mặt hình bầu dục (kiểu Sumatralith), đặc trưng văn hóa Hòa Bình. ${SYMBOL_NOTE}`,
    flagCredit: null,
    period: 'Khoảng 18.000–7.500 năm trước',
    sources: [KCH1, LSVN(1, 'từ khởi thủy đến thế kỷ X')]
  },
  {
    id: 'van-hoa-bac-son',
    name: 'Văn hóa Bắc Sơn',
    color: '#4f7a6a',
    flag: '/flags/van-hoa-bac-son.svg',
    flagKind: 'symbol',
    flagNote: `Rìu mài lưỡi và "dấu Bắc Sơn" (các rãnh mài trên đá), dấu hiệu tiêu biểu của văn hóa Bắc Sơn. ${SYMBOL_NOTE}`,
    flagCredit: null,
    period: 'Sơ kỳ đá mới, khoảng 11.000–7.000 năm trước',
    sources: [KCH1, LSVN(1, 'từ khởi thủy đến thế kỷ X')]
  },
  {
    id: 'van-hoa-quynh-van',
    name: 'Văn hóa Quỳnh Văn',
    color: '#d1b07a',
    flag: '/flags/van-hoa-quynh-van.svg',
    flagKind: 'symbol',
    flagNote: `Nồi gốm đáy nhọn, loại hiện vật đặc trưng ở các cồn sò điệp Quỳnh Văn (Nghệ An). ${SYMBOL_NOTE}`,
    flagCredit: null,
    period: 'Trung kỳ đá mới, khoảng thiên niên kỷ V–III TCN',
    sources: [KCH1, LSVN(1, 'từ khởi thủy đến thế kỷ X')]
  },
  {
    id: 'van-hoa-da-but',
    name: 'Văn hóa Đa Bút',
    color: '#9c8256',
    flag: '/flags/van-hoa-da-but.svg',
    flagKind: 'symbol',
    flagNote: `Nồi gốm đáy tròn có văn thừng (dấu vặn thừng trên thân), loại hiện vật đặc trưng tại các di chỉ cồn vỏ sò văn hóa Đa Bút (Vĩnh Lộc, Thanh Hóa), phân biệt với nồi đáy nhọn Quỳnh Văn. ${SYMBOL_NOTE}`,
    flagCredit: null,
    period: 'Trung kỳ đá mới, khoảng 6.000–4.000 năm trước',
    sources: [KCH1, LSVN(1, 'từ khởi thủy đến thế kỷ X')]
  },
  {
    id: 'van-hoa-phung-nguyen',
    name: 'Văn hóa Phùng Nguyên',
    color: '#a0603c',
    flag: '/flags/van-hoa-phung-nguyen.svg',
    flagKind: 'symbol',
    flagNote: `Vòng trang sức bằng đá, loại hiện vật phổ biến trong văn hóa Phùng Nguyên. ${SYMBOL_NOTE}`,
    flagCredit: null,
    period: 'Khoảng 2000–1500 TCN (sơ kỳ thời đại đồng thau)',
    sources: [KCH2, LSVN(1, 'từ khởi thủy đến thế kỷ X')]
  },
  {
    id: 'van-hoa-sa-huynh',
    name: 'Văn hóa Sa Huỳnh',
    color: '#c2873a',
    flag: '/flags/van-hoa-sa-huynh.svg',
    flagKind: 'symbol',
    flagNote: `Mộ chum có nắp hình nón, kiểu táng tiêu biểu của văn hóa Sa Huỳnh. ${SYMBOL_NOTE}`,
    flagCredit: null,
    period: 'Khoảng thiên niên kỷ I TCN – thế kỷ I–II',
    sources: [KCH2, LSVN(1, 'từ khởi thủy đến thế kỷ X')]
  },
  {
    id: 'van-hoa-dong-nai',
    name: 'Văn hóa Đồng Nai',
    color: '#7d8f3a',
    flag: '/flags/van-hoa-dong-nai.svg',
    flagKind: 'symbol',
    flagNote: `Rìu đá có vai, loại công cụ phổ biến ở lưu vực sông Đồng Nai thời tiền sử. ${SYMBOL_NOTE}`,
    flagCredit: null,
    period: 'Khoảng thiên niên kỷ II TCN – đầu Công nguyên',
    sources: [KCH2, LSVN(1, 'từ khởi thủy đến thế kỷ X')]
  },
  {
    id: 'van-hoa-dong-son',
    name: 'Văn hóa Đông Sơn',
    color: '#b08a3a',
    flag: '/flags/van-hoa-dong-son.svg',
    flagKind: 'symbol',
    flagNote: `Hình dáng trống đồng nhìn nghiêng, hiện vật tiêu biểu nhất của văn hóa Đông Sơn. ${SYMBOL_NOTE}`,
    flagCredit: null,
    period: 'Khoảng thế kỷ VII TCN – thế kỷ I–II',
    sources: [KCH2, LSVN(1, 'từ khởi thủy đến thế kỷ X')]
  },

  // ——————————————————— Việt ———————————————————
  {
    id: 'van-lang',
    name: 'Văn Lang',
    altNames: ['Nhà nước của các vua Hùng'],
    color: '#a8442a',
    flag: '/flags/van-lang.svg',
    flagKind: 'symbol',
    flagNote: `Mặt trống đồng Đông Sơn giản lược (ngôi sao giữa, các vành hoa văn, chim bay). Thời Văn Lang không có tư liệu về cờ. ${SYMBOL_NOTE}`,
    flagCredit: null,
    capital: 'Phong Châu',
    period: 'Khoảng thế kỷ VII – 258 TCN (theo truyền thuyết từ 2879 TCN)',
    sources: [TOAN_THU, LSVN(1, 'từ khởi thủy đến thế kỷ X')]
  },
  {
    id: 'au-lac',
    name: 'Âu Lạc',
    color: '#b84a2e',
    flag: '/flags/au-lac.svg',
    flagKind: 'symbol',
    flagNote: `Sơ đồ ba vòng thành Cổ Loa, kinh đô của An Dương Vương. Không có tư liệu về cờ. ${SYMBOL_NOTE}`,
    flagCredit: null,
    capital: 'Cổ Loa',
    period: '257–179 TCN (Toàn thư chép An Dương Vương mất nước năm 208 TCN)',
    sources: [TOAN_THU, LSVN(1, 'từ khởi thủy đến thế kỷ X'), TAYLOR]
  },
  {
    id: 'hai-ba-trung',
    name: 'Chính quyền Hai Bà Trưng',
    altNames: ['Trưng Vương'],
    color: '#5c1a1f',
    flag: '/flags/hai-ba-trung.png',
    flagKind: 'reconstructed',
    flagNote:
      'Cờ đề chữ 徵 (Trưng) phỏng theo lá cờ vẽ trong tranh dân gian Đông Hồ về Hai Bà Trưng. Không phải cờ có thật thời 40–43; ảnh đã được làm nền trắng.',
    flagCredit: commons(
      "The Trưng Sisters' flag depicted on a Đông Hồ painting.png",
      'CC BY-SA 4.0',
      'Daeva Trạc'
    ),
    capital: 'Mê Linh',
    period: '40–43',
    sources: [TOAN_THU, LSVN(1, 'từ khởi thủy đến thế kỷ X'), TAYLOR]
  },
  {
    id: 'van-xuan',
    name: 'Vạn Xuân',
    altNames: ['Nhà Tiền Lý'],
    color: '#b3261e',
    flag: '/flags/van-xuan.svg',
    flagKind: 'symbol',
    flagNote: `Quốc hiệu 萬春 (Vạn Xuân) do Lý Bí đặt năm 544. ${SYMBOL_NOTE} ${HAN_GLYPH_NOTE}`,
    flagCredit: null,
    period: '544–602',
    sources: [TOAN_THU, LSVN(1, 'từ khởi thủy đến thế kỷ X'), TAYLOR]
  },
  {
    id: 'mai-thuc-loan',
    name: 'Chính quyền Mai Thúc Loan',
    altNames: ['Mai Hắc Đế'],
    color: '#8a1f30',
    flag: '/flags/mai-thuc-loan.svg',
    flagKind: 'symbol',
    flagNote: `Chữ 梅 (Mai), họ của Mai Thúc Loan (Mai Hắc Đế). Không có tư liệu về một lá cờ của cuộc khởi binh năm 722. ${SYMBOL_NOTE} ${HAN_GLYPH_NOTE}`,
    flagCredit: null,
    capital: 'Thành Vạn An (Nam Đàn, Nghệ An)',
    period: '722',
    sources: [TOAN_THU, LSVN(1, 'từ khởi thủy đến thế kỷ X'), TAYLOR]
  },
  {
    id: 'phung-hung',
    name: 'Chính quyền Phùng Hưng',
    altNames: ['Bố Cái Đại Vương'],
    color: '#a13a2e',
    flag: '/flags/phung-hung.svg',
    flagKind: 'symbol',
    flagNote: `Chữ 馮 (Phùng), họ của Phùng Hưng (Bố Cái Đại Vương). Không có tư liệu về một lá cờ của cuộc khởi binh này. ${SYMBOL_NOTE} ${HAN_GLYPH_NOTE}`,
    flagCredit: null,
    capital: 'Tống Bình (Hà Nội)',
    period: 'Khoảng 766/791–791',
    sources: [TOAN_THU, LSVN(1, 'từ khởi thủy đến thế kỷ X'), TAYLOR]
  },
  {
    id: 'tinh-hai-quan',
    name: 'Tĩnh Hải quân tự chủ',
    altNames: ['Họ Khúc', 'Dương Đình Nghệ', 'Kiều Công Tiễn'],
    color: '#a8412b',
    flag: '/flags/tinh-hai-quan.svg',
    flagKind: 'symbol',
    flagNote: `Chữ 靜海軍 (Tĩnh Hải quân), tên đơn vị hành chính – quân sự thời Đường mà họ Khúc (từ 905), Dương Đình Nghệ rồi Kiều Công Tiễn nắm chức Tiết độ sứ trên thực tế tự chủ với chính quyền trung ương phương Bắc. Không có tư liệu về một lá cờ riêng của giai đoạn này. ${SYMBOL_NOTE} ${HAN_GLYPH_NOTE}`,
    flagCredit: null,
    capital: 'Đại La (Hà Nội)',
    period: '905–938',
    sources: [TOAN_THU, CUONG_MUC, LSVN(1, 'từ khởi thủy đến thế kỷ X')]
  },
  {
    id: 'nha-ngo',
    name: 'Nhà Ngô',
    color: '#e3b21c',
    flag: '/flags/nha-ngo.png',
    flagKind: 'reconstructed',
    flagNote:
      'Cờ nền vàng đề chữ 吳 (Ngô), mẫu hiện đại được một số ấn phẩm, trang mạng dùng để đại diện nhà Ngô. Không có tư liệu gốc về cờ thời này.',
    flagCredit: commons('Ngô dynasty flag.png', 'CC BY-SA 4.0', 'Flag Creator'),
    capital: 'Cổ Loa',
    period: '939–965',
    sources: [TOAN_THU, LSVN(2, 'từ thế kỷ X đến thế kỷ XIV')]
  },
  {
    id: 'thap-nhi-su-quan',
    name: 'Loạn 12 sứ quân',
    color: '#6b3a3a',
    flag: '/flags/thap-nhi-su-quan.svg',
    flagKind: 'symbol',
    flagNote:
      'Mười hai lá cờ tỏa ra từ một khoảng trống ở giữa, tượng trưng cho 12 sứ quân cát cứ sau khi nhà Ngô suy vong, không có chính quyền trung ương thống nhất cho tới khi Đinh Bộ Lĩnh dẹp loạn năm 968. Không có tư liệu về cờ của từng sứ quân. Biểu tượng tự thiết kế cho dự án, không phải cờ lịch sử.',
    flagCredit: null,
    period: '965–968',
    sources: [TOAN_THU, LSVN(2, 'từ thế kỷ X đến thế kỷ XIV')]
  },
  {
    id: 'nha-dinh',
    name: 'Đại Cồ Việt (nhà Đinh)',
    altNames: ['Nhà Đinh'],
    color: '#cf2a27',
    flag: '/flags/nha-dinh.svg',
    flagKind: 'reconstructed',
    flagNote: `Chữ 丁 (Đinh) viết lối triện. ${NAMVANHOIQUAN}`,
    flagCredit: commons('Flag of Dinh dynasty.svg', 'Public domain', '南文會館'),
    capital: 'Hoa Lư',
    period: '968–980',
    sources: [TOAN_THU, LSVN(2, 'từ thế kỷ X đến thế kỷ XIV')]
  },
  {
    id: 'tien-le',
    name: 'Đại Cồ Việt (nhà Tiền Lê)',
    altNames: ['Nhà Tiền Lê'],
    color: '#b22222',
    flag: '/flags/tien-le.svg',
    flagKind: 'reconstructed',
    flagNote: `Chữ 黎 (Lê) viết lối triện. ${NAMVANHOIQUAN}`,
    flagCredit: commons('Flag of Early Le dynasty.svg', 'Public domain', '南文會館'),
    capital: 'Hoa Lư',
    period: '980–1009',
    sources: [TOAN_THU, LSVN(2, 'từ thế kỷ X đến thế kỷ XIV')]
  },
  {
    id: 'nha-ly',
    name: 'Đại Việt (nhà Lý)',
    altNames: ['Nhà Lý', 'Đại Cồ Việt (1009–1054)'],
    color: '#f2a007',
    flag: '/flags/nha-ly.svg',
    flagKind: 'reconstructed',
    flagNote: `Chữ 李 (Lý) viết lối triện. ${NAMVANHOIQUAN}`,
    flagCredit: commons('Flag of Ly dynasty.svg', 'Public domain', '南文會館'),
    capital: 'Thăng Long (từ 1010)',
    period: '1009–1225 (quốc hiệu Đại Việt từ 1054)',
    sources: [TOAN_THU, LSVN(2, 'từ thế kỷ X đến thế kỷ XIV')]
  },
  {
    id: 'nha-tran',
    name: 'Đại Việt (nhà Trần)',
    altNames: ['Nhà Trần'],
    color: '#d42426',
    flag: '/flags/nha-tran.svg',
    flagKind: 'reconstructed',
    flagNote: `Chữ 陳 (Trần). ${NAMVANHOIQUAN}`,
    flagCredit: commons('Flag of Tran dynasty.svg', 'Public domain', '南文會館'),
    capital: 'Thăng Long',
    period: '1225–1400',
    sources: [TOAN_THU, LSVN(2, 'từ thế kỷ X đến thế kỷ XIV')]
  },
  {
    id: 'nha-ho',
    name: 'Đại Ngu (nhà Hồ)',
    altNames: ['Nhà Hồ'],
    color: '#c9302c',
    flag: '/flags/nha-ho.svg',
    flagKind: 'reconstructed',
    flagNote: `Chữ 胡 (Hồ). ${NAMVANHOIQUAN}`,
    flagCredit: commons('Flag of Ho dynasty.svg', 'Public domain', '南文會館'),
    capital: 'Tây Đô (Thanh Hóa)',
    period: '1400–1407',
    sources: [TOAN_THU, LSVN(3, 'từ thế kỷ XV đến thế kỷ XVI')]
  },
  {
    id: 'hau-tran',
    name: 'Nhà Hậu Trần',
    color: '#8f2020',
    flag: '/flags/hau-tran.svg',
    flagKind: 'symbol',
    flagNote: `Chữ 後陳 (Hậu Trần). Không tìm được tư liệu hay hiện vật về một lá cờ riêng của triều đại kháng Minh này, khác với cờ phục dựng hiện đại (không do dự án tự vẽ) đang dùng cho nhà Trần 1225–1400, nên dùng biểu tượng chữ Hán tự vẽ riêng để tránh gây hiểu nhầm là cùng một lá cờ. ${SYMBOL_NOTE} ${HAN_GLYPH_NOTE}`,
    flagCredit: null,
    capital: 'Ngự Thiên; Nghệ An (thời Trùng Quang Đế)',
    period: '1407–1414',
    sources: [TOAN_THU, CUONG_MUC, LSVN(3, 'từ thế kỷ XV đến thế kỷ XVI')]
  },
  {
    id: 'lam-son',
    name: 'Nghĩa quân Lam Sơn',
    altNames: ['Bình Định Vương Lê Lợi'],
    color: '#7a2e12',
    flag: '/flags/lam-son.svg',
    flagKind: 'symbol',
    flagNote:
      'Hình thanh gươm, gợi truyền thuyết gươm thần Lê Lợi dùng trong khởi nghĩa Lam Sơn. Không có tư liệu về một lá cờ cụ thể của nghĩa quân. Biểu tượng tự thiết kế cho dự án, không phải cờ lịch sử.',
    flagCredit: null,
    capital: 'Lam Sơn (Thanh Hóa); Đông Kinh (Thăng Long) từ 1427',
    period: '1418–1427',
    sources: [TOAN_THU, LSVN(3, 'từ thế kỷ XV đến thế kỷ XVI')]
  },
  {
    id: 'hau-le',
    name: 'Đại Việt (nhà Hậu Lê)',
    altNames: ['Nhà Lê sơ'],
    color: '#f0b90b',
    flag: '/flags/hau-le.svg',
    flagKind: 'reconstructed',
    flagNote: `Chữ 黎 (Lê). ${NAMVANHOIQUAN}`,
    flagCredit: commons('Flag of Later Le dynasty.svg', 'Public domain', '南文會館'),
    capital: 'Đông Kinh (Thăng Long)',
    period: '1428–1527',
    sources: [TOAN_THU, LSVN(3, 'từ thế kỷ XV đến thế kỷ XVI')]
  },
  {
    id: 'nha-mac',
    name: 'Đại Việt (nhà Mạc)',
    altNames: ['Nhà Mạc'],
    color: '#d21f26',
    flag: '/flags/nha-mac.svg',
    flagKind: 'reconstructed',
    flagNote: `Chữ 莫 (Mạc). ${NAMVANHOIQUAN}`,
    flagCredit: commons('Flag of Mac dynasty.svg', 'Public domain', '南文會館'),
    capital: 'Thăng Long',
    period: '1527–1592',
    sources: [TOAN_THU, LSVN(3, 'từ thế kỷ XV đến thế kỷ XVI')]
  },
  {
    id: 'mac-cao-bang',
    name: 'Nhà Mạc ở Cao Bằng',
    color: '#a8232a',
    flag: '/flags/nha-mac.svg',
    flagKind: 'reconstructed',
    flagNote: `Dùng chung lá cờ phục dựng của nhà Mạc (chữ 莫). ${NAMVANHOIQUAN}`,
    flagCredit: commons('Flag of Mac dynasty.svg', 'Public domain', '南文會館'),
    capital: 'Cao Bằng',
    period: '1592–1677',
    sources: [TOAN_THU, CUONG_MUC, LSVN(4, 'từ thế kỷ XVII đến thế kỷ XVIII')]
  },
  {
    id: 'le-trung-hung',
    name: 'Đại Việt (Lê trung hưng)',
    altNames: ['Đàng Ngoài (Lê – Trịnh)', 'Nhà Lê trung hưng'],
    color: '#f6c200',
    flag: '/flags/le-trung-hung.svg',
    flagKind: 'reconstructed',
    flagNote: `Chữ 黎 (Lê) màu đỏ trên nền vàng. ${NAMVANHOIQUAN}`,
    flagCredit: commons('Flag of Revival Le dynasty.svg', 'Public domain', '南文會館'),
    capital: 'Thăng Long (từ 1593)',
    period: '1533–1789',
    sources: [TOAN_THU, CUONG_MUC, LSVN(4, 'từ thế kỷ XVII đến thế kỷ XVIII')]
  },
  {
    id: 'dang-trong',
    name: 'Đàng Trong (chúa Nguyễn)',
    altNames: ['Xứ Đàng Trong', 'Quảng Nam quốc'],
    color: '#12509a',
    flag: '/flags/dang-trong.svg',
    flagKind: 'reconstructed',
    flagNote:
      'Cờ phục dựng hiện đại do người dùng 南文會館 vẽ trên Wikimedia Commons (chú thích "Quảng Nam quốc Nguyễn chủ đại kỳ"), đề chữ 阮 (Nguyễn) trên nền lam. Không có hiện vật hay mô tả gốc xác nhận mẫu cờ này.',
    flagCredit: commons('Flag of Nguyen clan.svg', 'Public domain', '南文會館'),
    capital: 'Phú Xuân (từ 1687)',
    period: '1558–1777 (Nguyễn Ánh giữ Gia Định đến 1802)',
    sources: [
      { title: 'Việt sử xứ Đàng Trong', author: 'Phan Khoang', note: '1967' },
      { title: 'Nguyễn Cochinchina', author: 'Li Tana', note: '1998' },
      { title: 'Đại Nam thực lục tiền biên', author: 'Quốc sử quán triều Nguyễn' }
    ]
  },
  {
    id: 'ha-tien',
    name: 'Trấn Hà Tiên (họ Mạc)',
    altNames: ['Hà Tiên'],
    color: '#d9772b',
    flag: '/flags/ha-tien.svg',
    flagKind: 'symbol',
    flagNote: `Địa danh 河仙 (Hà Tiên). ${SYMBOL_NOTE} ${HAN_GLYPH_NOTE}`,
    flagCredit: null,
    capital: 'Phương Thành (Hà Tiên)',
    period: 'Khoảng 1708–1780 (dòng họ Mạc cai quản, thần phục chúa Nguyễn)',
    sources: [
      { title: 'Gia Định thành thông chí', author: 'Trịnh Hoài Đức' },
      { title: 'Đại Nam thực lục tiền biên', author: 'Quốc sử quán triều Nguyễn' },
      { title: 'Nguyễn Cochinchina', author: 'Li Tana', note: '1998' }
    ]
  },
  {
    id: 'tay-son',
    name: 'Nhà Tây Sơn (Thái Đức, Quy Nhơn)',
    altNames: ['Nguyễn Nhạc', 'Thái Đức'],
    color: '#e0261c',
    flag: '/flags/tay-son.svg',
    flagKind: 'reconstructed',
    flagNote:
      'Nền đỏ là màu cờ của quân Tây Sơn được sử liệu nhắc tới; hình mặt trời vàng ở giữa là cách thể hiện hiện đại, chưa có hiện vật xác nhận. Id này đại diện toàn bộ vùng đất phong trào Tây Sơn kiểm soát trước năm 1786, và từ 1786 thu hẹp lại thành triều đình Thái Đức của Nguyễn Nhạc đóng ở Quy Nhơn sau khi Nguyễn Huệ tách triều đình ra Phú Xuân (xem id tay-son-phu-xuan).',
    flagCredit: commons('Flag of Tây Sơn Dynasty.svg', 'Public domain', 'Mai Lê Bảo Khang'),
    capital: 'Quy Nhơn (thành Hoàng Đế)',
    period: '1778–1793 (toàn cõi Tây Sơn đến 1786; riêng triều Thái Đức ở Quy Nhơn đến 1793)',
    sources: [
      {
        title: 'Đại Nam chính biên liệt truyện — Ngụy Tây liệt truyện',
        author: 'Quốc sử quán triều Nguyễn'
      },
      { title: 'The Tây Sơn Uprising', author: 'George Dutton', note: '2006' },
      LSVN(4, 'từ thế kỷ XVII đến thế kỷ XVIII')
    ]
  },
  {
    id: 'tay-son-phu-xuan',
    name: 'Tây Sơn ở Phú Xuân',
    altNames: ['Bắc Bình Vương (1786)', 'Quang Trung (1788–1792)', 'Cảnh Thịnh (1792–1802)'],
    color: '#c41e1e',
    flag: '/flags/tay-son.svg',
    flagKind: 'reconstructed',
    flagNote:
      'Dùng chung lá cờ phục dựng của nhà Tây Sơn (nền đỏ, mặt trời vàng ở giữa). Id này đại diện triều đình Tây Sơn đóng ở Phú Xuân: Nguyễn Huệ xưng Bắc Bình Vương năm 1786, lên ngôi Hoàng đế Quang Trung năm 1788, con là Cảnh Thịnh nối ngôi 1792–1802, tách khỏi triều Thái Đức của Nguyễn Nhạc ở Quy Nhơn (id tay-son) từ 1786–1787.',
    flagCredit: commons('Flag of Tây Sơn Dynasty.svg', 'Public domain', 'Mai Lê Bảo Khang'),
    capital: 'Phú Xuân (Huế)',
    period: '1786–1802',
    sources: [
      {
        title: 'Đại Nam chính biên liệt truyện — Ngụy Tây liệt truyện',
        author: 'Quốc sử quán triều Nguyễn'
      },
      { title: 'The Tây Sơn Uprising', author: 'George Dutton', note: '2006' },
      LSVN(4, 'từ thế kỷ XVII đến thế kỷ XVIII')
    ]
  },
  {
    id: 'nha-nguyen',
    name: 'Việt Nam (nhà Nguyễn)',
    altNames: ['Đại Nam (từ 1838)', 'Nhà Nguyễn'],
    color: '#f7c600',
    flag: '/flags/nha-nguyen.svg',
    flagKind: 'banner',
    flagNote:
      'Cờ hiệu của sứ bộ triều Nguyễn sang Pháp năm 1863, đề chữ 大南欽使 (Đại Nam khâm sứ, đọc từ phải sang trái), vẽ lại theo tư liệu ở Thư viện Quốc gia Pháp. Triều Nguyễn không có quốc kỳ theo nghĩa hiện đại; nền vàng là màu của hoàng triều.',
    flagCredit: commons(
      "Drapeau de la Délégation Diplomatique de l'Annam 1863.svg",
      'Public domain',
      '南文會館'
    ),
    capital: 'Phú Xuân (Huế)',
    period: '1802–1945',
    sources: [THUC_LUC, LSVN(5, '1802–1858'), LSVN(6, '1858–1896')]
  },
  {
    id: 'de-quoc-viet-nam',
    name: 'Đế quốc Việt Nam',
    color: '#f4d000',
    flag: '/flags/de-quoc-viet-nam.svg',
    flagKind: 'national',
    flagNote:
      'Cờ quẻ Ly (☲) đỏ trên nền vàng, quốc kỳ của chính phủ Trần Trọng Kim, dùng từ tháng 6 đến tháng 8 năm 1945.',
    flagCredit: commons(
      'Flag of the Empire of Vietnam (1945).svg',
      'Public domain',
      'Great Brightstar'
    ),
    capital: 'Huế',
    period: '3/1945 – 8/1945',
    sources: [LSVN(9, '1930–1945'), GOSCHA]
  },
  {
    id: 'vndcch',
    name: 'Việt Nam Dân chủ Cộng hòa',
    color: '#da251d',
    flag: '/flags/vndcch.svg',
    flagKind: 'national',
    flagNote:
      'Cờ đỏ sao vàng, quốc kỳ từ năm 1945. Hình ảnh là mẫu 1945–1955; năm 1955 ngôi sao được vẽ lại cho cân đối hơn.',
    flagCredit: commons('Flag of North Vietnam (1945–1955).svg', 'Public domain'),
    capital: 'Hà Nội',
    period: '1945–1976',
    sources: [LSVN(10, '1945–1950'), LSVN(12, '1954–1965'), GOSCHA]
  },
  {
    id: 'nam-ky-tu-tri',
    name: 'Cộng hòa tự trị Nam Kỳ',
    altNames: ['Nam Kỳ quốc'],
    color: '#1d3f8f',
    flag: '/flags/nam-ky-tu-tri.svg',
    flagKind: 'national',
    flagNote:
      'Cờ bảy sọc ngang xen kẽ lam – vàng, quốc kỳ của Cộng hòa tự trị Nam Kỳ, chính quyền do Pháp dựng lên nhằm tách Nam Kỳ khỏi Việt Nam Dân chủ Cộng hòa ngay sau Hiệp định Sơ bộ 6/3/1946.',
    flagCredit: commons('Flag of Republic of Cochinchina.svg', 'Public domain', 'Washiucho'),
    capital: 'Sài Gòn',
    period: '1946–1949',
    sources: [LSVN(10, '1945–1950'), GOSCHA]
  },
  {
    id: 'xu-thai',
    name: 'Xứ Thái tự trị',
    altNames: ['Liên bang Thái tự trị', 'Sip Song Chau Tai'],
    color: '#8a6a3a',
    flag: '/flags/xu-thai.svg',
    flagKind: 'national',
    flagNote:
      'Cờ nền tam tài phỏng theo cờ Pháp, có ngôi sao và trăng lưỡi liềm trắng ở góc; cờ của Xứ Thái tự trị/Liên bang Thái tự trị do các chúa Thái (họ Đèo) đứng đầu ở vùng Tây Bắc, trong Liên hiệp Pháp rồi trở thành một phần Hoàng triều Cương thổ dưới Quốc gia Việt Nam.',
    flagCredit: commons('Flag of Tai Autonomous Territory.svg', 'Public domain', 'Cikki'),
    capital: 'Lai Châu',
    period: '1948–1955',
    sources: [LSVN(10, '1945–1950'), LSVN(11, '1951–1954')]
  },
  {
    id: 'quoc-gia-viet-nam',
    name: 'Quốc gia Việt Nam',
    color: '#f7d117',
    flag: '/flags/vnch.svg',
    flagKind: 'national',
    flagNote:
      'Cờ nền vàng ba sọc đỏ, quốc kỳ của Quốc gia Việt Nam từ năm 1948–1949 và sau đó được Việt Nam Cộng hòa tiếp tục sử dụng.',
    flagCredit: commons('Flag of South Vietnam.svg', 'Public domain'),
    capital: 'Sài Gòn',
    period: '1949–1955',
    sources: [LSVN(10, '1945–1950'), LSVN(11, '1951–1954'), GOSCHA]
  },
  {
    id: 'vnch',
    name: 'Việt Nam Cộng hòa',
    color: '#fbd116',
    flag: '/flags/vnch.svg',
    flagKind: 'national',
    flagNote:
      'Cờ nền vàng ba sọc đỏ, quốc kỳ Việt Nam Cộng hòa (1955–1975), kế thừa từ Quốc gia Việt Nam.',
    flagCredit: commons('Flag of South Vietnam.svg', 'Public domain'),
    capital: 'Sài Gòn',
    period: '1955–1975',
    sources: [LSVN(12, '1954–1965'), LSVN(13, '1965–1975'), GOSCHA]
  },
  {
    id: 'cpcmlt',
    name: 'Cộng hòa miền Nam Việt Nam',
    altNames: [
      'Chính phủ Cách mạng lâm thời Cộng hòa miền Nam Việt Nam',
      'Mặt trận Dân tộc Giải phóng miền Nam Việt Nam'
    ],
    color: '#3399ff',
    flag: '/flags/cpcmlt.svg',
    flagKind: 'national',
    flagNote:
      'Cờ nửa đỏ nửa xanh, sao vàng ở giữa, cờ của Mặt trận Dân tộc Giải phóng miền Nam (từ 1960) và của Cộng hòa miền Nam Việt Nam (1969–1976).',
    flagCredit: commons(
      'Flag of the National Liberation Front of South Vietnam, Flag of South Vietnam (1975–1976).svg',
      'Public domain'
    ),
    period: '1969–1976',
    sources: [LSVN(13, '1965–1975'), GOSCHA]
  },
  {
    id: 'chxhcnvn',
    name: 'Cộng hòa Xã hội chủ nghĩa Việt Nam',
    altNames: ['Việt Nam'],
    color: '#da251d',
    flag: '/flags/chxhcnvn.svg',
    flagKind: 'national',
    flagNote: 'Cờ đỏ sao vàng, quốc kỳ nước Cộng hòa Xã hội chủ nghĩa Việt Nam từ năm 1976.',
    flagCredit: commons('Flag of Vietnam.svg', 'Public domain'),
    capital: 'Hà Nội',
    period: '1976–nay',
    sources: [
      LSVN(14, '1975–1986'),
      { title: 'Hiến pháp nước Cộng hòa Xã hội chủ nghĩa Việt Nam (2013), Điều 13' }
    ]
  },

  // ——————————————————— Chăm ———————————————————
  {
    id: 'lam-ap',
    name: 'Lâm Ấp',
    color: '#2e8b7a',
    flag: '/flags/lam-ap.svg',
    flagKind: 'symbol',
    flagNote: `Tên 林邑 (Lâm Ấp) mà sử sách Trung Hoa dùng gọi nước này. ${SYMBOL_NOTE} ${HAN_GLYPH_NOTE}`,
    flagCredit: null,
    period: '192 – khoảng giữa thế kỷ VIII',
    sources: [VICKERY_CHAMPA, MASPERO, LSVN(1, 'từ khởi thủy đến thế kỷ X')]
  },
  {
    id: 'champa',
    name: 'Chăm Pa',
    altNames: ['Hoàn Vương', 'Chiêm Thành'],
    color: '#3f9f8a',
    flag: '/flags/champa.svg',
    flagKind: 'symbol',
    flagNote: `Hình tháp Chăm (kalan) giản lược. Không có tư liệu về cờ của các vương quốc Chăm. ${SYMBOL_NOTE}`,
    flagCredit: null,
    capital: 'Indrapura (Đồng Dương), rồi Vijaya (Chà Bàn, Bình Định)',
    period: 'Khoảng thế kỷ VIII – 1697',
    sources: [VICKERY_CHAMPA, MASPERO, TOAN_THU]
  },
  {
    id: 'panduranga',
    name: 'Panduranga (Thuận Thành trấn)',
    altNames: ['Thuận Thành', 'Pāṇḍuraṅga'],
    color: '#1f6f66',
    flag: '/flags/panduranga.svg',
    flagKind: 'symbol',
    flagNote: `Hình tháp Chăm màu vàng trên nền xanh ngọc đậm, phân biệt với Chăm Pa thời trước. ${SYMBOL_NOTE}`,
    flagCredit: null,
    period: '1697–1832',
    sources: [
      { title: 'Le Pāṇḍuraṅga (Campā) 1802–1835', author: 'Po Dharma', note: 'EFEO, 1987' },
      VICKERY_CHAMPA,
      THUC_LUC
    ]
  },

  // ——————————————————— Khmer ———————————————————
  {
    id: 'phu-nam',
    name: 'Phù Nam',
    altNames: ['Funan'],
    color: '#3d6fa8',
    flag: '/flags/phu-nam.svg',
    flagKind: 'symbol',
    flagNote: `Tên 扶南 (Phù Nam) theo sử sách Trung Hoa. ${SYMBOL_NOTE} ${HAN_GLYPH_NOTE}`,
    flagCredit: null,
    period: 'Khoảng thế kỷ I – VII',
    sources: [VICKERY_KHMER, COEDES]
  },
  {
    id: 'chan-lap',
    name: 'Chân Lạp',
    altNames: ['Chenla'],
    color: '#4f86c0',
    flag: '/flags/chan-lap.svg',
    flagKind: 'symbol',
    flagNote: `Tên 真臘 (Chân Lạp) theo sử sách Trung Hoa. ${SYMBOL_NOTE} ${HAN_GLYPH_NOTE}`,
    flagCredit: null,
    capital: 'Isanapura (Sambor Prei Kuk)',
    period: 'Khoảng giữa thế kỷ VI – 802',
    sources: [VICKERY_KHMER, COEDES]
  },
  {
    id: 'khmer',
    name: 'Đế quốc Khmer (Angkor)',
    altNames: ['Angkor', 'Chân Lạp (tên gọi trong sử Việt)'],
    color: '#2f5d9e',
    flag: '/flags/khmer.svg',
    flagKind: 'symbol',
    flagNote: `Hình ba tháp đền Angkor giản lược. Không có tư liệu về cờ thời Angkor. ${SYMBOL_NOTE}`,
    flagCredit: null,
    capital: 'Yasodharapura (Angkor)',
    period: '802–1431',
    sources: [COEDES, CHANDLER]
  },
  {
    id: 'campuchia-hau-angkor',
    name: 'Campuchia thời hậu Angkor',
    altNames: ['Chân Lạp (tên gọi trong sử Việt)', 'Cao Miên'],
    color: '#5b86c4',
    flag: '/flags/campuchia-hau-angkor.svg',
    flagKind: 'symbol',
    flagNote: `Hình đền Angkor màu vàng trên nền lam nhạt, phân biệt với thời Angkor. ${SYMBOL_NOTE}`,
    flagCredit: null,
    capital: 'Srei Santhor, Longvek, rồi Oudong',
    period: '1431–1863',
    sources: [CHANDLER, { title: 'Việt sử xứ Đàng Trong', author: 'Phan Khoang', note: '1967' }]
  },
  {
    id: 'vuong-quoc-campuchia',
    name: 'Vương quốc Campuchia',
    color: '#032ea1',
    flag: '/flags/vuong-quoc-campuchia.svg',
    flagKind: 'national',
    flagNote:
      'Quốc kỳ Campuchia (đền Angkor Wat trên nền đỏ, hai sọc lam), dùng 1948–1970 và từ 1993 đến nay.',
    flagCredit: commons('Flag of Cambodia.svg', 'Public domain'),
    capital: 'Phnôm Pênh',
    period: '1953–1970; 1993–nay',
    sources: [CHANDLER, OSBORNE]
  },
  {
    id: 'cong-hoa-khmer',
    name: 'Cộng hòa Khmer',
    color: '#2b4aa0',
    flag: '/flags/cong-hoa-khmer.svg',
    flagKind: 'national',
    flagNote:
      'Quốc kỳ Cộng hòa Khmer (1970–1975): đền Angkor ở góc đỏ, ba ngôi sao trắng trên nền lam.',
    flagCredit: commons('Flag of the Khmer Republic.svg', 'Public domain', 'Himasaram'),
    capital: 'Phnôm Pênh',
    period: '1970–1975',
    sources: [CHANDLER, SHAWCROSS]
  },
  {
    id: 'campuchia-dan-chu',
    name: 'Campuchia Dân chủ',
    color: '#4a5fa8',
    flag: '/flags/campuchia-dan-chu.svg',
    flagKind: 'national',
    flagNote:
      'Quốc kỳ Campuchia Dân chủ (1975–1979): hình tháp Angkor ba ngọn màu vàng trên nền đỏ. Màu lãnh thổ giữ họ xanh lam để phân biệt với Việt Nam.',
    flagCredit: commons('Flag of Democratic Kampuchea.svg', 'Public domain'),
    capital: 'Phnôm Pênh',
    period: '1975–1979',
    sources: [CHANDLER, LSVN(14, '1975–1986')]
  },
  {
    id: 'chnd-campuchia',
    name: 'Cộng hòa Nhân dân Campuchia',
    color: '#5b7fc0',
    flag: '/flags/chnd-campuchia.svg',
    flagKind: 'national',
    flagNote:
      'Quốc kỳ Cộng hòa Nhân dân Campuchia (1979–1989): tháp Angkor năm ngọn màu vàng trên nền đỏ. Màu lãnh thổ giữ họ xanh lam để phân biệt với Việt Nam.',
    flagCredit: commons("Flag of the People's Republic of Kampuchea.svg", 'Public domain'),
    capital: 'Phnôm Pênh',
    period: '1979–1989',
    sources: [CHANDLER, LSVN(14, '1975–1986')]
  },
  {
    id: 'nha-nuoc-campuchia',
    name: 'Nhà nước Campuchia',
    altNames: ['State of Cambodia'],
    color: '#1c3f7a',
    flag: '/flags/nha-nuoc-campuchia.svg',
    flagKind: 'national',
    flagNote:
      'Quốc kỳ Nhà nước Campuchia (1989–1993): nền đỏ – lam, hình đền Angkor Wat cách điệu màu vàng ở giữa, thay cho quốc huy búa liềm thời Cộng hòa Nhân dân Campuchia.',
    flagCredit: commons(
      'Flag of the State of Cambodia 1989-1993.svg',
      'CC BY-SA 3.0',
      'Xufanc; bản SVG: Ángel Páez'
    ),
    capital: 'Phnôm Pênh',
    period: '1989–1993',
    sources: [CHANDLER, OSBORNE]
  },

  // ——————————————————— Lào, Xiêm ———————————————————
  {
    id: 'lan-xang',
    name: 'Lan Xang',
    altNames: ['Lạn Xạng', 'Vạn Tượng'],
    color: '#7e5aa6',
    flag: '/flags/lan-xang.svg',
    flagKind: 'symbol',
    flagNote: `Lọng trắng nhiều tầng, gợi tên đầy đủ "Lan Xang Hom Khao" (triệu voi, lọng trắng). ${SYMBOL_NOTE}`,
    flagCredit: null,
    capital: 'Xiang Dong Xiang Thong (Luang Prabang); Viêng Chăn từ 1560',
    period: '1353–1707',
    sources: [STUART_FOX_LX, STUART_FOX]
  },
  {
    id: 'bon-man',
    name: 'Bồn Man',
    altNames: ['Mường Phuan', 'Muang Phuan', 'Trấn Ninh (từ 1479)'],
    color: '#7d7a4f',
    flag: '/flags/bon-man.svg',
    flagKind: 'symbol',
    flagNote: `Chữ 盆蠻 (Bồn Man), tên phiên âm Hán Việt mà sử Việt dùng gọi xứ Mường Phuan ở cao nguyên Xiêng Khoảng. Không có tư liệu về một lá cờ. ${SYMBOL_NOTE} ${HAN_GLYPH_NOTE}`,
    flagCredit: null,
    capital: 'Xiêng Khoảng',
    period: 'Khoảng thế kỷ XIV–XVIII, thần phục luân phiên Đại Việt và Lan Xang',
    sources: [TOAN_THU, STUART_FOX]
  },
  {
    id: 'luang-prabang',
    name: 'Vương quốc Luang Prabang',
    color: '#8e3b8e',
    flag: '/flags/luang-prabang.svg',
    flagKind: 'reconstructed',
    flagNote:
      'Voi ba đầu dưới lọng trắng trên nền đỏ, mẫu do người dùng Sodacan vẽ trên Wikimedia Commons, không ghi nguồn gốc; chưa có tư liệu gốc xác nhận mẫu cờ này trước thời Pháp bảo hộ.',
    flagCredit: commons(
      'Flag of the Kingdom of Luang Phrabang (1707-1893).svg',
      'CC BY-SA 4.0',
      'Sodacan'
    ),
    capital: 'Luang Prabang',
    period: '1707–1893',
    sources: [STUART_FOX]
  },
  {
    id: 'vieng-chan',
    name: 'Vương quốc Viêng Chăn',
    altNames: ['Vientiane'],
    color: '#a77bc9',
    flag: '/flags/vieng-chan.svg',
    flagKind: 'reconstructed',
    flagNote:
      'Voi trắng ở góc đỏ trên nền vàng, mẫu do người dùng Sodacan vẽ trên Wikimedia Commons, không ghi nguồn gốc; chưa có tư liệu gốc xác nhận.',
    flagCredit: commons(
      'Flag of the Kingdom of Vientiane (1707–1828).svg',
      'CC BY-SA 4.0',
      'Sodacan'
    ),
    capital: 'Viêng Chăn',
    period: '1707–1828',
    sources: [STUART_FOX]
  },
  {
    id: 'champasak',
    name: 'Vương quốc Champasak',
    color: '#3f3a8c',
    flag: '/flags/champasak.svg',
    flagKind: 'reconstructed',
    flagNote:
      'Linh thú và lọng nhiều tầng trên nền lam thẫm, mẫu do người dùng Sodacan vẽ trên Wikimedia Commons, không ghi nguồn gốc; chưa có tư liệu gốc xác nhận.',
    flagCredit: commons(
      'Flag of the Kingdom of Champasak (1713-1947).svg',
      'CC BY-SA 4.0',
      'Sodacan'
    ),
    capital: 'Champasak',
    period: '1713–1904',
    sources: [STUART_FOX]
  },
  {
    id: 'vuong-quoc-lao',
    name: 'Vương quốc Lào',
    color: '#9b3b7d',
    flag: '/flags/vuong-quoc-lao.svg',
    flagKind: 'national',
    flagNote: 'Quốc kỳ Vương quốc Lào (1952–1975): voi ba đầu dưới lọng trắng trên nền đỏ.',
    flagCredit: commons('Flag of Laos (1952–1975).svg', 'Public domain', 'Thommy'),
    capital: 'Viêng Chăn (hành chính), Luang Prabang (hoàng cung)',
    period: '1947–1975',
    sources: [STUART_FOX, EVANS_SHORT]
  },
  {
    id: 'pathet-lao',
    name: 'Pathet Lào',
    altNames: ['Neo Lao Issara'],
    color: '#6e2d8c',
    flag: '/flags/chdcnd-lao.svg',
    flagKind: 'banner',
    flagNote:
      'Dùng chung mẫu cờ đỏ – lam – vòng tròn trắng do Maha Sila Viravong thiết kế; đây là cờ hiệu mà phong trào Pathet Lào dùng từ khoảng năm 1950 cho tới khi trở thành quốc kỳ Cộng hòa Dân chủ Nhân dân Lào năm 1975 mà không đổi mẫu.',
    flagCredit: commons('Flag of Laos.svg', 'Public domain', 'SKopp'),
    capital: 'Sầm Nưa',
    period: '1950–1975 (vùng kiểm soát)',
    sources: [STUART_FOX, GOSCHA]
  },
  {
    id: 'chdcnd-lao',
    name: 'Cộng hòa Dân chủ Nhân dân Lào',
    altNames: ['Lào'],
    color: '#5b4b9a',
    flag: '/flags/chdcnd-lao.svg',
    flagKind: 'national',
    flagNote: 'Quốc kỳ Lào từ năm 1975: sọc đỏ – lam – đỏ, vòng tròn trắng ở giữa.',
    flagCredit: commons('Flag of Laos.svg', 'Public domain', 'SKopp'),
    capital: 'Viêng Chăn',
    period: '1975–nay',
    sources: [STUART_FOX, EVANS_RITUAL]
  },
  {
    id: 'xiem',
    name: 'Xiêm',
    altNames: ['Ayutthaya', 'Thonburi', 'Rattanakosin'],
    color: '#b0304f',
    flag: '/flags/xiem.svg',
    flagKind: 'national',
    flagNote:
      'Cờ voi trắng trên nền đỏ, quốc kỳ Xiêm 1855–1916. Trước đó Xiêm dùng cờ đỏ trơn (thời Ayutthaya) rồi cờ đỏ có voi trong bánh xe chakra (1817–1855). Từ năm 1917 đổi sang cờ Trairanga ba màu và năm 1939 đổi quốc hiệu thành Thái Lan, xem id thai-lan.',
    flagCredit: commons('Flag of Siam (1855).svg', 'Public domain', 'Xiengyod, Sodacan'),
    capital: 'Ayutthaya, Thonburi, rồi Bangkok',
    period: '1351–1917',
    sources: [
      { title: 'A History of Thailand', author: 'Chris Baker, Pasuk Phongpaichit' },
      { title: 'Thailand: A Short History', author: 'David K. Wyatt' }
    ]
  },
  {
    id: 'thai-lan',
    name: 'Thái Lan',
    altNames: ['Xiêm (tên gọi trước 1939)'],
    color: '#2d2a4a',
    flag: '/flags/thai-lan.svg',
    flagKind: 'national',
    flagNote:
      'Quốc kỳ Thái Lan ba màu đỏ – trắng – lam (Trairanga), dùng từ năm 1917; đổi tên nước từ Xiêm thành Thái Lan năm 1939. Tách khỏi id xiem, dùng cho giai đoạn trước 1917.',
    flagCredit: commons('Flag of Thailand.svg', 'Public domain', 'Zscout370'),
    capital: 'Bangkok',
    period: '1917–nay',
    sources: [
      { title: 'A History of Thailand', author: 'Chris Baker, Pasuk Phongpaichit' },
      { title: 'Thailand: A Short History', author: 'David K. Wyatt' }
    ]
  },

  // ——————————————————— Trung Hoa ———————————————————
  {
    id: 'nha-tan-qin',
    name: 'Nhà Tần',
    altNames: ['Tần Thủy Hoàng'],
    color: '#5c3a21',
    flag: '/flags/nha-tan-qin.svg',
    flagKind: 'symbol',
    flagNote: `Chữ 秦 (Tần). ${SYMBOL_NOTE} ${HAN_GLYPH_NOTE}`,
    flagCredit: null,
    capital: 'Hàm Dương',
    period: '221–206 TCN (lập Tượng Quận ở Lĩnh Nam khoảng năm 214 TCN)',
    sources: [{ title: 'Sử ký — Tần Thủy Hoàng bản kỷ', author: 'Tư Mã Thiên' }, TAYLOR]
  },
  {
    id: 'nam-viet',
    name: 'Nam Việt (nhà Triệu)',
    color: '#7a5230',
    flag: '/flags/nam-viet.svg',
    flagKind: 'symbol',
    flagNote: `Quốc hiệu 南越 (Nam Việt). ${SYMBOL_NOTE} ${HAN_GLYPH_NOTE}`,
    flagCredit: null,
    capital: 'Phiên Ngung (Quảng Châu)',
    period: '204–111 TCN',
    sources: [{ title: 'Sử ký — Nam Việt liệt truyện', author: 'Tư Mã Thiên' }, TOAN_THU, TAYLOR]
  },
  {
    id: 'han',
    name: 'Nhà Hán',
    color: '#8c4a2f',
    flag: '/flags/han.svg',
    flagKind: 'symbol',
    flagNote: `Chữ 漢 (Hán). ${SYMBOL_NOTE} ${HAN_GLYPH_NOTE}`,
    flagCredit: null,
    capital: 'Trường An; Lạc Dương (Đông Hán)',
    period: '202 TCN – 220',
    sources: [{ title: 'Hán thư' }, { title: 'Hậu Hán thư' }, TAYLOR]
  },
  {
    id: 'dong-ngo',
    name: 'Đông Ngô',
    altNames: ['Tôn Ngô'],
    color: '#6f6a3a',
    flag: '/flags/dong-ngo.svg',
    flagKind: 'symbol',
    flagNote: `Chữ 吳 (Ngô). ${SYMBOL_NOTE} ${HAN_GLYPH_NOTE}`,
    flagCredit: null,
    capital: 'Kiến Nghiệp',
    period: '222–280',
    sources: [{ title: 'Tam quốc chí — Ngô thư', author: 'Trần Thọ' }, TAYLOR]
  },
  {
    id: 'nha-tan-jin',
    name: 'Nhà Tấn',
    color: '#85683f',
    flag: '/flags/nha-tan-jin.svg',
    flagKind: 'symbol',
    flagNote: `Chữ 晉 (Tấn). ${SYMBOL_NOTE} ${HAN_GLYPH_NOTE}`,
    flagCredit: null,
    capital: 'Lạc Dương; Kiến Khang (Đông Tấn)',
    period: '266–420',
    sources: [{ title: 'Tấn thư' }, TAYLOR]
  },
  {
    id: 'nam-trieu',
    name: 'Nam triều (Tống, Tề, Lương, Trần)',
    color: '#93704a',
    flag: '/flags/nam-trieu.svg',
    flagKind: 'symbol',
    flagNote: `Chữ 南朝 (Nam triều), gọi chung các triều Lưu Tống, Tề, Lương, Trần. ${SYMBOL_NOTE} ${HAN_GLYPH_NOTE}`,
    flagCredit: null,
    capital: 'Kiến Khang',
    period: '420–589',
    sources: [{ title: 'Nam sử', author: 'Lý Diên Thọ' }, TAYLOR]
  },
  {
    id: 'nha-tuy',
    name: 'Nhà Tùy',
    color: '#7c5a3a',
    flag: '/flags/nha-tuy.svg',
    flagKind: 'symbol',
    flagNote: `Chữ 隋 (Tùy). ${SYMBOL_NOTE} ${HAN_GLYPH_NOTE}`,
    flagCredit: null,
    capital: 'Đại Hưng (Trường An)',
    period: '581–618',
    sources: [{ title: 'Tùy thư' }, TAYLOR]
  },
  {
    id: 'nha-duong',
    name: 'Nhà Đường',
    color: '#9a6b2f',
    flag: '/flags/nha-duong.svg',
    flagKind: 'symbol',
    flagNote: `Chữ 唐 (Đường). ${SYMBOL_NOTE} ${HAN_GLYPH_NOTE}`,
    flagCredit: null,
    capital: 'Trường An',
    period: '618–907',
    sources: [{ title: 'Cựu Đường thư' }, { title: 'Tân Đường thư' }, TAYLOR]
  },
  {
    id: 'nam-chieu',
    name: 'Nam Chiếu',
    color: '#5a4a6e',
    flag: '/flags/nam-chieu.svg',
    flagKind: 'symbol',
    flagNote: `Quốc hiệu 南詔 (Nam Chiếu) mà sử sách Trung Hoa dùng gọi vương quốc của người Bạch, người Di ở Vân Nam, từng nhiều lần đem quân đánh Giao Châu/An Nam (854–866). Không có tư liệu về một lá cờ. ${SYMBOL_NOTE} ${HAN_GLYPH_NOTE}`,
    flagCredit: null,
    capital: 'Thái Hòa, sau là Dương Thư Miệt Thành (Đại Lý, Vân Nam)',
    period: '738–902',
    sources: [{ title: 'Tân Đường thư — Nam Chiếu truyện' }, TAYLOR]
  },
  {
    id: 'nam-han',
    name: 'Nam Hán',
    color: '#86613a',
    flag: '/flags/nam-han.svg',
    flagKind: 'symbol',
    flagNote: `Quốc hiệu 南漢 (Nam Hán). ${SYMBOL_NOTE} ${HAN_GLYPH_NOTE}`,
    flagCredit: null,
    capital: 'Hưng Vương phủ (Quảng Châu)',
    period: '917–971',
    sources: [{ title: 'Tân Ngũ Đại sử — Nam Hán thế gia', author: 'Âu Dương Tu' }, TOAN_THU]
  },
  {
    id: 'nha-tong',
    name: 'Nhà Tống',
    color: '#8f7442',
    flag: '/flags/nha-tong.svg',
    flagKind: 'symbol',
    flagNote: `Chữ 宋 (Tống). ${SYMBOL_NOTE} ${HAN_GLYPH_NOTE}`,
    flagCredit: null,
    capital: 'Biện Kinh (Khai Phong); Lâm An (Hàng Châu) từ 1127',
    period: '960–1279',
    sources: [{ title: 'Tống sử' }, TOAN_THU]
  },
  {
    id: 'nha-nguyen-mong',
    name: 'Nhà Nguyên (Mông Cổ)',
    color: '#a88f64',
    flag: '/flags/nha-nguyen-mong.svg',
    flagKind: 'banner',
    flagNote:
      'Ba hình trăng lưỡi liềm đỏ trên nền trắng, lá cờ mà Bản đồ Catalan (1375) vẽ cho "Cathay" (lãnh thổ nhà Nguyên). Đây là cách người vẽ bản đồ châu Âu hình dung, không phải cờ do triều Nguyên ban hành; đã thêm nền trắng.',
    flagCredit: commons('Yuan Empire Flag (Catalan Atlas 1375).svg', 'CC0', 'No Name Guy 1313'),
    capital: 'Đại Đô (Bắc Kinh)',
    period: '1271–1368',
    sources: [{ title: 'Nguyên sử' }, TOAN_THU]
  },
  {
    id: 'nha-minh',
    name: 'Nhà Minh',
    color: '#9b5a34',
    flag: '/flags/nha-minh.svg',
    flagKind: 'symbol',
    flagNote: `Chữ 明 (Minh). ${SYMBOL_NOTE} ${HAN_GLYPH_NOTE}`,
    flagCredit: null,
    capital: 'Nam Kinh; Bắc Kinh từ 1421',
    period: '1368–1644',
    sources: [{ title: 'Minh sử' }, TOAN_THU]
  },
  {
    id: 'nha-thanh',
    name: 'Nhà Thanh',
    color: '#b88a2e',
    flag: '/flags/nha-thanh.svg',
    flagKind: 'national',
    flagNote:
      'Cờ Hoàng Long (rồng xanh, ngọc đỏ trên nền vàng), quốc kỳ nhà Thanh 1889–1912. Trước 1889 nhà Thanh dùng cờ rồng hình tam giác (từ 1862) và chưa có quốc kỳ trước đó.',
    flagCredit: commons('Flag of China (1889–1912).svg', 'Public domain', 'Sodacan (vector)'),
    capital: 'Bắc Kinh',
    period: '1644–1912',
    sources: [{ title: 'Thanh sử cảo' }, THUC_LUC]
  },
  {
    id: 'trung-hoa-dan-quoc',
    name: 'Trung Hoa Dân Quốc',
    color: '#8f4a36',
    flag: '/flags/trung-hoa-dan-quoc.svg',
    flagKind: 'national',
    flagNote:
      'Cờ "Thanh thiên, bạch nhật, mãn địa hồng", quốc kỳ Trung Hoa Dân Quốc từ 1928. Giai đoạn 1912–1928 dùng cờ ngũ sắc.',
    flagCredit: commons('Flag of the Republic of China.svg', 'Public domain'),
    capital: 'Nam Kinh',
    period: '1912–1949 (trên đại lục)',
    sources: [{ title: 'The Search for Modern China', author: 'Jonathan D. Spence' }, GOSCHA]
  },
  {
    id: 'chnd-trung-hoa',
    name: 'Cộng hòa Nhân dân Trung Hoa',
    altNames: ['Trung Quốc'],
    color: '#a8402e',
    flag: '/flags/chnd-trung-hoa.svg',
    flagKind: 'national',
    flagNote:
      'Cờ đỏ năm sao, quốc kỳ Cộng hòa Nhân dân Trung Hoa từ 1949. Màu lãnh thổ chọn đỏ nâu để phân biệt với Việt Nam.',
    flagCredit: commons(
      "Flag of the People's Republic of China.svg",
      'Public domain',
      'Zeng Liansong'
    ),
    capital: 'Bắc Kinh',
    period: '1949–nay',
    sources: [{ title: 'The Search for Modern China', author: 'Jonathan D. Spence' }, FAIRBANK]
  },

  // ——————————————————— Thuộc địa ———————————————————
  {
    id: 'phap',
    name: 'Đông Dương thuộc Pháp',
    altNames: ['Liên bang Đông Dương'],
    color: '#5a6b7c',
    flag: '/flags/phap.svg',
    flagKind: 'national',
    flagNote:
      'Cờ tam tài của Pháp. Nam Kỳ là thuộc địa nên treo cờ Pháp; Bắc Kỳ, Trung Kỳ, Campuchia và Lào là xứ bảo hộ, vẫn có triều đình và cờ riêng nhưng cờ Pháp được treo bên cạnh hoặc gắn ở góc. Bản đồ dùng một màu và một lá cờ chung cho toàn Liên bang Đông Dương.',
    flagCredit: commons('Flag of France.svg', 'Public domain', 'SKopp'),
    capital: 'Sài Gòn (đến 1902), Hà Nội (từ 1902)',
    period: '1862–1954',
    sources: [
      LSVN(6, '1858–1896'),
      LSVN(7, '1897–1918'),
      {
        title: 'Indochina: An Ambiguous Colonization, 1858–1954',
        author: 'Pierre Brocheux, Daniel Hémery'
      }
    ]
  },

  // ——————————————————— Ngoại bang khác (chiếm đóng/giải giáp) ———————————————————
  {
    id: 'nhat-ban',
    name: 'Đế quốc Nhật Bản',
    altNames: ['Nhật'],
    color: '#bc002d',
    flag: '/flags/nhat-ban.svg',
    flagKind: 'national',
    flagNote:
      'Cờ Hinomaru, quốc kỳ Nhật Bản, dùng chung cho quân đội Nhật chiếm đóng Đông Dương từ 1940 và giữ quyền cai trị trên thực tế sau khi đảo chính Pháp ngày 9/3/1945.',
    flagCredit: commons('Flag of Japan.svg', 'Public domain'),
    capital: 'Tokyo',
    period: '1940–1945 (chiếm đóng Đông Dương)',
    sources: [MARR, LSVN(9, '1930–1945')]
  },
  {
    id: 'anh',
    name: 'Vương quốc Anh',
    altNames: ['Anh Quốc'],
    color: '#00247d',
    flag: '/flags/anh.svg',
    flagKind: 'national',
    flagNote:
      'Quốc kỳ Liên hiệp Vương quốc Anh (Union Jack). Quân Anh – Ấn dưới quyền Bộ chỉ huy Đông Nam Á (SEAC) vào giải giáp quân Nhật ở Đông Dương phía nam vĩ tuyến 16 từ tháng 9/1945, rồi bàn giao lại quyền kiểm soát cho Pháp đầu năm 1946.',
    flagCredit: commons('Flag of the United Kingdom.svg', 'Public domain', 'Yaddah'),
    period: '1945–1946',
    sources: [MARR, GOSCHA]
  }
];
