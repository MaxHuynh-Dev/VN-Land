import type { Snapshot, Source } from '../types';

/*
 * Task C2 — mốc tiền sử (~20.000 TCN → ~2.000 TCN), 5 mốc, thời kỳ `tien-su`.
 *
 * Các chính thể `van-hoa-*` là biểu tượng khảo cổ (xem POLITIES), không phải nhà nước. Ranh giới
 * phân bố luôn xấp xỉ ở cấp tỉnh hiện đại — không tương ứng ranh giới văn hóa thời tiền sử — nên
 * mọi mốc trong file này đều đánh dấu `lowConfidence` cho vùng phân bố văn hóa.
 */

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
const LSVN1: Source = {
  title: 'Lịch sử Việt Nam, tập 1 (từ khởi thủy đến thế kỷ X)',
  author: 'Viện Sử học',
  note: 'NXB Khoa học xã hội, 2017'
};
const TAYLOR: Source = { title: 'The Birth of Vietnam', author: 'Keith W. Taylor', note: '1983' };

// Phân bố Sơn Vi: chủ yếu vùng trung du và núi thấp Bắc Bộ (di chỉ điển hình ở Lâm Thao, Phú Thọ).
const SON_VI = [
  'VNM.phu-tho',
  'VNM.vinh-phuc',
  'VNM.yen-bai',
  'VNM.son-la',
  'VNM.lai-chau',
  'VNM.dien-bien',
  'VNM.bac-giang',
  'VNM.thai-nguyen',
  'VNM.tuyen-quang'
];

// Văn hóa Hòa Bình lan rộng khắp vùng núi đá vôi Bắc Bộ và Bắc Trung Bộ.
const HOA_BINH = [
  'VNM.hoa-binh',
  'VNM.thanh-hoa',
  'VNM.ninh-binh',
  'VNM.son-la',
  'VNM.lai-chau',
  'VNM.dien-bien',
  'VNM.nghe-an',
  'VNM.quang-binh',
  'VNM.quang-tri',
  'VNM.lang-son',
  'VNM.cao-bang',
  'VNM.phu-tho',
  'VNM.vinh-phuc',
  'VNM.yen-bai',
  'VNM.bac-giang',
  'VNM.thai-nguyen',
  'VNM.tuyen-quang'
];

// Văn hóa Bắc Sơn tập trung ở vùng núi đá vôi đông bắc, tách khỏi phần còn lại của Hòa Bình.
const BAC_SON = [
  'VNM.lang-son',
  'VNM.cao-bang',
  'VNM.bac-kan',
  'VNM.thai-nguyen',
  'VNM.bac-giang',
  'VNM.quang-ninh',
  'VNM.tuyen-quang',
  'VNM.ha-giang'
];

export const TIEN_SU: Snapshot[] = [
  {
    id: 'tcn20000',
    year: -20000,
    yearLabel: '~20.000 TCN',
    era: 'tien-su',
    title: 'Văn hóa Sơn Vi',
    summary:
      'Văn hóa Sơn Vi là giai đoạn hậu kỳ đá cũ được biết đến sớm nhất ở Việt Nam, với công cụ cuội ghè đẽo thô sơ tìm thấy chủ yếu ở vùng trung du và núi thấp Bắc Bộ, tập trung quanh khu vực Phú Thọ ngày nay. Niên đại các di chỉ dao động khá rộng giữa các nghiên cứu (khoảng 20.000–11.000 năm trước), nên ranh giới phân bố trên bản đồ chỉ mang tính xấp xỉ.',
    assign: {
      '*': null,
      ...Object.fromEntries(SON_VI.map((s) => [s, 'van-hoa-son-vi']))
    },
    lowConfidence: SON_VI,
    focus: { lon: 105.2, lat: 21.3 },
    sources: [KCH1, LSVN1]
  },
  {
    id: 'tcn10000',
    year: -10000,
    yearLabel: '~10.000 TCN',
    era: 'tien-su',
    title: 'Văn hóa Hòa Bình',
    summary:
      'Văn hóa Hòa Bình kế tục Sơn Vi, đặc trưng bởi công cụ cuội ghè hai mặt hình bầu dục (kiểu Sumatralith), phân bố rất rộng trong các hang động, mái đá vùng núi đá vôi khắp Bắc Bộ và Bắc Trung Bộ. Đây là một trong những nền văn hóa đá giữa được nghiên cứu nhiều nhất Đông Nam Á lục địa, đặt tên theo tỉnh Hòa Bình nơi phát hiện di chỉ đầu tiên.',
    assign: Object.fromEntries(HOA_BINH.map((s) => [s, 'van-hoa-hoa-binh'])),
    lowConfidence: HOA_BINH,
    focus: { lon: 105.5, lat: 20.8 },
    sources: [KCH1, LSVN1, TAYLOR]
  },
  {
    id: 'tcn8000',
    year: -8000,
    yearLabel: '~8.000 TCN',
    era: 'tien-su',
    title: 'Văn hóa Bắc Sơn',
    summary:
      'Văn hóa Bắc Sơn phát triển song song và có phần muộn hơn Hòa Bình, tập trung ở vùng núi đá vôi đông bắc (Lạng Sơn, Cao Bằng, Bắc Kạn, Thái Nguyên), với dấu hiệu đặc trưng là rìu mài lưỡi và các rãnh mài trên đá ("dấu Bắc Sơn"). Ở phần còn lại của Bắc Bộ và Bắc Trung Bộ, cư dân truyền thống Hòa Bình vẫn tiếp tục sinh sống.',
    assign: Object.fromEntries(BAC_SON.map((s) => [s, 'van-hoa-bac-son'])),
    lowConfidence: BAC_SON,
    focus: { lon: 106.3, lat: 21.9 },
    sources: [KCH1, LSVN1]
  },
  {
    id: 'tcn5000',
    year: -5000,
    yearLabel: '~5.000 TCN',
    era: 'tien-su',
    title: 'Quỳnh Văn, Đa Bút – cư dân ven biển',
    summary:
      'Bước sang thời đá mới, cư dân ven biển và cửa sông hình thành các văn hóa riêng: Quỳnh Văn ở vùng cồn sò điệp ven biển Nghệ An với nồi gốm đáy nhọn đặc trưng, và Đa Bút ở Thanh Hóa với nồi gốm đáy tròn có văn thừng. Niên đại tuyệt đối của Đa Bút còn được các nghiên cứu ước tính khác nhau (một số tài liệu đặt khởi điểm muộn hơn, gần 4.000 TCN), nên mốc này chỉ thể hiện thời điểm đại diện gần đúng.',
    assign: {
      'VNM.nghe-an': 'van-hoa-quynh-van',
      'VNM.thanh-hoa': 'van-hoa-da-but'
    },
    lowConfidence: ['VNM.nghe-an', 'VNM.thanh-hoa'],
    focus: { lon: 105.6, lat: 19.6 },
    sources: [KCH1, LSVN1]
  },
  {
    id: 'tcn2000',
    year: -2000,
    yearLabel: '~2.000 TCN',
    era: 'tien-su',
    title: 'Phùng Nguyên, Sa Huỳnh sớm, Đồng Nai',
    summary:
      'Sơ kỳ thời đại đồng thau chứng kiến ba trung tâm văn hóa khảo cổ song song: Phùng Nguyên ở vùng trung du và đồng bằng quanh ngã ba sông Hồng (nền tảng vật chất dẫn tới nhà nước Văn Lang sau này), giai đoạn tiền Sa Huỳnh ở duyên hải Nam Trung Bộ (đi trước văn hóa Sa Huỳnh cổ điển hơn một thiên niên kỷ), và văn hóa Đồng Nai ở lưu vực sông Đồng Nai – Sài Gòn. Đồng bằng sông Cửu Long khi đó phần lớn còn ngập nước, chưa có dấu vết cư trú rõ rệt nên vẫn để trống trên bản đồ.',
    assign: {
      'VNM.phu-tho': 'van-hoa-phung-nguyen',
      'VNM.vinh-phuc': 'van-hoa-phung-nguyen',
      'VNM.ha-noi': 'van-hoa-phung-nguyen',
      'VNM.bac-ninh': 'van-hoa-phung-nguyen',
      'VNM.bac-giang': 'van-hoa-phung-nguyen',
      'VNM.quang-nam': 'van-hoa-sa-huynh',
      'VNM.da-nang': 'van-hoa-sa-huynh',
      'VNM.quang-ngai': 'van-hoa-sa-huynh',
      'VNM.binh-dinh': 'van-hoa-sa-huynh',
      'VNM.dong-nai': 'van-hoa-dong-nai',
      'VNM.binh-duong': 'van-hoa-dong-nai',
      'VNM.binh-phuoc': 'van-hoa-dong-nai',
      'VNM.tay-ninh': 'van-hoa-dong-nai',
      'VNM.ba-ria-vung-tau': 'van-hoa-dong-nai',
      'VNM.tp-ho-chi-minh': 'van-hoa-dong-nai'
    },
    lowConfidence: [
      'VNM.phu-tho',
      'VNM.vinh-phuc',
      'VNM.ha-noi',
      'VNM.bac-ninh',
      'VNM.bac-giang',
      'VNM.quang-nam',
      'VNM.da-nang',
      'VNM.quang-ngai',
      'VNM.binh-dinh',
      'VNM.dong-nai',
      'VNM.binh-duong',
      'VNM.binh-phuoc',
      'VNM.tay-ninh',
      'VNM.ba-ria-vung-tau',
      'VNM.tp-ho-chi-minh'
    ],
    focus: { lon: 106.5, lat: 16.5 },
    sources: [KCH2, LSVN1]
  }
];
