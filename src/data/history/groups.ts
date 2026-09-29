import type { CellGroup } from './types';

export const GROUPS: CellGroup[] = [
  {
    id: 'bac-bo-nui',
    name: 'Miền núi và trung du Bắc Bộ (ngoài đồng bằng)',
    selectors: [
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
    ]
  },
  {
    id: 'linh-nam-trung-hoa',
    name: 'Lĩnh Nam thuộc Trung Hoa (Quảng Đông – Quảng Tây thời Bắc thuộc)',
    selectors: ['CHN.quang-dong', 'CHN.quang-tay', 'CHN.hong-kong', 'CHN.ma-cao']
  },
  {
    id: 'quan-nhat-nam',
    name: 'Quận Nhật Nam thời Hán (xấp xỉ)',
    selectors: [
      'VNM.quang-binh',
      'VNM.quang-tri',
      'VNM.thua-thien-hue',
      'VNM.da-nang',
      'VNM.quang-nam',
      'VNM.quang-ngai',
      'VNM.binh-dinh'
    ]
  },
  {
    id: 'dong-bang-bac-bo',
    name: 'Đồng bằng Bắc Bộ và Bắc Trung Bộ',
    selectors: [
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
      'VNM.thanh-hoa',
      'VNM.nghe-an',
      'VNM.ha-tinh'
    ]
  },
  {
    id: 'nam-bo',
    name: 'Nam Bộ',
    selectors: [
      'VNM.tp-ho-chi-minh',
      'VNM.ba-ria-vung-tau',
      'VNM.binh-duong',
      'VNM.binh-phuoc',
      'VNM.dong-nai',
      'VNM.tay-ninh',
      'VNM.long-an',
      'VNM.tien-giang',
      'VNM.ben-tre',
      'VNM.tra-vinh',
      'VNM.vinh-long',
      'VNM.dong-thap',
      'VNM.an-giang',
      'VNM.kien-giang',
      'VNM.can-tho',
      'VNM.hau-giang',
      'VNM.soc-trang',
      'VNM.bac-lieu',
      'VNM.ca-mau',
      'VNM.con-dao'
    ]
  },
  {
    id: 'ba-chau-1069',
    name: 'Ba châu Bố Chính, Địa Lý, Ma Linh (1069)',
    selectors: [
      'VNM.quang-binh',
      'VNM.quang-tri.vinh-linh',
      'VNM.quang-tri.gio-linh',
      'VNM.quang-tri.cam-lo',
      'VNM.quang-tri.dong-ha',
      'VNM.quang-tri.con-co',
      'VNM.quang-tri.huong-hoa',
      'VNM.quang-tri.da-krong'
    ]
  },
  {
    id: 'chau-o',
    name: 'Châu Ô (sau đổi Thuận Châu, 1306)',
    selectors: [
      'VNM.quang-tri.quang-tri',
      'VNM.quang-tri.trieu-phong',
      'VNM.quang-tri.hai-lang',
      'VNM.thua-thien-hue.phong-dien',
      'VNM.thua-thien-hue.quang-dien',
      'VNM.thua-thien-hue.huong-tra'
    ]
  },
  {
    id: 'chau-ly',
    name: 'Châu Lý (sau đổi Hóa Châu, 1306)',
    selectors: [
      'VNM.thua-thien-hue.hue',
      'VNM.thua-thien-hue.huong-thuy',
      'VNM.thua-thien-hue.phu-vang',
      'VNM.thua-thien-hue.phu-loc',
      'VNM.thua-thien-hue.nam-dong',
      'VNM.thua-thien-hue.a-luoi'
    ]
  },
  {
    id: 'bien-gioi-ly-tong-1077',
    name: 'Dải châu động biên giới bị Tống chiếm giữ 1076–1084 (Quảng Nguyên, Tư Lang, Môn châu)',
    selectors: [
      'VNM.cao-bang.quang-uyen',
      'VNM.cao-bang.phuc-hoa',
      'VNM.cao-bang.trung-khanh',
      'VNM.cao-bang.ha-lang',
      'VNM.cao-bang.thach-an'
    ]
  },
  {
    id: 'kauthara',
    name: 'Kauthara (xấp xỉ, tiểu quốc Chăm vùng Nha Trang)',
    selectors: ['VNM.phu-yen', 'VNM.khanh-hoa']
  },
  {
    id: 'panduranga',
    name: 'Panduranga (xấp xỉ, tiểu quốc Chăm vùng Phan Rang, trước 1697)',
    selectors: ['VNM.ninh-thuan', 'VNM.binh-thuan']
  },
  {
    id: 'bon-man',
    name: 'Bồn Man (Mường Phuan, xấp xỉ, sau là phủ Trấn Ninh)',
    selectors: ['LAO.xiangkhouang']
  },
  {
    id: 'thai-khang-1653',
    name: 'Phủ Thái Khang – Diên Ninh (1653, xấp xỉ Khánh Hòa và phần Ninh Thuận phía bắc sông Phan Rang)',
    selectors: [
      'VNM.khanh-hoa',
      'VNM.phu-yen.van-ninh',
      'VNM.ninh-thuan.nha-trang',
      'VNM.ninh-thuan.cam-ranh',
      'VNM.ninh-thuan.bac-ai',
      'VNM.ninh-thuan.ninh-hai',
      'VNM.ninh-thuan.thuan-bac',
      'VNM.ninh-thuan.ninh-son'
    ]
  },
  {
    id: 'panduranga-1697',
    name: 'Trấn Thuận Thành sau khi tách phủ Bình Thuận (1697, xấp xỉ phần Ninh Thuận nam sông Phan Rang)',
    selectors: [
      'VNM.ninh-thuan.ninh-phuoc',
      'VNM.ninh-thuan.phan-rang-thap-cham',
      'VNM.ninh-thuan.thuan-nam'
    ]
  },
  {
    id: 'gia-dinh-1698',
    name: 'Phủ Gia Định (1698, dinh Trấn Biên và Phiên Trấn, gồm Bình Dương và Mỹ Tho)',
    selectors: [
      'VNM.dong-nai',
      'VNM.ba-ria-vung-tau',
      'VNM.tp-ho-chi-minh',
      'VNM.binh-duong',
      'VNM.tien-giang.cai-be',
      'VNM.tien-giang.chau-thanh',
      'VNM.tien-giang.huyen-cai-lay',
      'VNM.tien-giang.my-tho',
      'VNM.tien-giang.tan-phuoc',
      'VNM.tien-giang.thi-xa-cai-lay'
    ]
  },
  {
    id: 'ha-tien-1708',
    name: 'Trấn Hà Tiên buổi đầu (1708, vùng Mang Khảm)',
    selectors: [
      'VNM.kien-giang.ha-tien',
      'VNM.kien-giang.kien-luong',
      'VNM.kien-giang.giang-thanh',
      'VNM.kien-giang.phu-quoc'
    ]
  },
  {
    id: 'ha-tien-1739',
    name: 'Bốn đạo Hà Tiên mở thêm năm 1739 (Long Xuyên, Kiên Giang, Trấn Giang, Trấn Di)',
    selectors: [
      'VNM.ca-mau',
      'VNM.kien-giang.rach-gia',
      'VNM.kien-giang.an-bien',
      'VNM.kien-giang.an-minh',
      'VNM.kien-giang.chau-thanh',
      'VNM.kien-giang.go-quao',
      'VNM.kien-giang.hon-dat',
      'VNM.kien-giang.kien-hai',
      'VNM.kien-giang.tan-hiep',
      'VNM.kien-giang.u-minh-thuong',
      'VNM.kien-giang.vinh-thuan',
      'VNM.can-tho',
      'VNM.hau-giang',
      'VNM.bac-lieu'
    ]
  },
  {
    id: 'long-ho-1732',
    name: 'Dinh Long Hồ / châu Định Viễn (1732, xấp xỉ Vĩnh Long)',
    selectors: ['VNM.vinh-long']
  },
  {
    id: 'tra-vang-ba-thac-1757',
    name: 'Trà Vang và Ba Thắc (khoảng 1757, xấp xỉ Bến Tre, Trà Vinh, Sóc Trăng)',
    selectors: ['VNM.ben-tre', 'VNM.tra-vinh', 'VNM.soc-trang']
  },
  {
    id: 'bac-bo-chinh',
    name: 'Bắc Bố Chính (bắc sông Gianh, xấp xỉ theo huyện Quảng Bình ngày nay)',
    selectors: [
      'VNM.quang-binh.quang-trach',
      'VNM.quang-binh.ba-don',
      'VNM.quang-binh.tuyen-hoa',
      'VNM.quang-binh.minh-hoa'
    ]
  },
  {
    id: 'tam-bon-loi-lap-1756',
    name: 'Tầm Bôn – Lôi Lạp (1756, xấp xỉ Long An và Gò Công)',
    selectors: [
      'VNM.long-an',
      'VNM.tien-giang.go-cong',
      'VNM.tien-giang.go-cong-dong',
      'VNM.tien-giang.go-cong-tay'
    ]
  },
  {
    id: 'tam-phong-long-1757',
    name: 'Tầm Phong Long (1757, xấp xỉ An Giang và Đồng Tháp)',
    selectors: ['VNM.an-giang', 'VNM.dong-thap']
  },
  // 1771 – 1847 (Tây Sơn – đầu triều Nguyễn)
  {
    id: 'tay-son-can-cu-1771',
    name: 'Căn cứ khởi nghĩa Tây Sơn (ấp Tây Sơn và vùng thượng đạo An Khê, 1771, xấp xỉ)',
    selectors: ['VNM.gia-lai.an-khe', 'VNM.binh-dinh.tay-son']
  },
  {
    id: 'campuchia-xiem-1794',
    name: 'Vùng Campuchia do Xiêm cai quản trực tiếp (Battambang, Siem Reap từ 1794, cùng Koh Kong, Preah Vihear; xấp xỉ)',
    selectors: [
      'KHM.battambang',
      'KHM.pailin',
      'KHM.bantey-meanchey',
      'KHM.siem-reap',
      'KHM.oddar-meanchey',
      'KHM.koh-kong',
      'KHM.preah-vihear'
    ]
  },
  {
    id: 'lac-bien-1828',
    name: 'Chín châu Lạc Biên (các mường phía tây Cam Lộ, 1828, xấp xỉ vùng Sepon – Vang)',
    selectors: [
      'LAO.savannakhet.sepone',
      'LAO.savannakhet.phine',
      'LAO.savannakhet.nong',
      'LAO.savannakhet.vilabuly'
    ]
  },
  {
    id: 'tran-dinh-1828',
    name: 'Phủ Trấn Định (Cam Cát, Cam Môn, Cam Linh, 1828, xấp xỉ đông Khammouane)',
    selectors: [
      'LAO.khammouane.nakay',
      'LAO.khammouane.bualapha',
      'LAO.khammouane.mahaxay',
      'LAO.khammouane.nhommalath',
      'LAO.khammouane.hinboon'
    ]
  },
  {
    id: 'tran-tay-1834',
    name: 'Trấn Tây thành (Campuchia dưới quyền Đại Nam, 1834–1841, trừ vùng Xiêm giữ và Stung Treng)',
    selectors: [
      'KHM.kampong-cham',
      'KHM.tbong-khmum',
      'KHM.kampong-chhnang',
      'KHM.kampong-speu',
      'KHM.kampong-thom',
      'KHM.kampot',
      'KHM.kep',
      'KHM.kandal',
      'KHM.preah-sihanouk',
      'KHM.kratie',
      'KHM.mondulkiri',
      'KHM.phnom-penh',
      'KHM.prey-veng',
      'KHM.pursat',
      'KHM.ratanakiri',
      'KHM.svay-rieng',
      'KHM.takeo'
    ]
  },
  // 1858 – 1945 (Pháp thuộc)
  {
    id: 'dong-nam-ky-1862',
    name: 'Ba tỉnh miền Đông Nam Kỳ và Côn Lôn theo hòa ước 1862 (xấp xỉ)',
    selectors: [
      'VNM.tp-ho-chi-minh',
      'VNM.dong-nai',
      'VNM.ba-ria-vung-tau',
      'VNM.binh-duong',
      'VNM.binh-phuoc',
      'VNM.tay-ninh',
      'VNM.long-an',
      'VNM.tien-giang',
      'VNM.con-dao'
    ]
  },
  // 1945 – 2025 (hiện đại)
  {
    id: 'hd-thai-chiem-1941',
    name: 'Vùng Campuchia và Lào Thái Lan chiếm 1941–1946 (xấp xỉ theo tỉnh và huyện hiện nay; thiếu Koh Kong và một phần Stung Treng)',
    selectors: [
      'KHM.battambang',
      'KHM.pailin',
      'KHM.bantey-meanchey',
      'KHM.oddar-meanchey',
      'KHM.siem-reap',
      'KHM.preah-vihear',
      'LAO.xaignabouli',
      'LAO.champasak.champasack',
      'LAO.champasak.sanasomboon'
    ]
  },
  {
    id: 'hd-tay-nguyen',
    name: 'Tây Nguyên (Xứ Thượng Nam Đông Dương 1946, Hoàng triều Cương thổ 1950, xấp xỉ)',
    selectors: ['VNM.kon-tum', 'VNM.gia-lai', 'VNM.dak-lak', 'VNM.dak-nong', 'VNM.lam-dong']
  },
  {
    id: 'hd-xu-thai-1948',
    name: 'Xứ Thái tự trị 1948 (Lai Châu, Sơn La, Phong Thổ, xấp xỉ theo Lai Châu, Điện Biên, Sơn La)',
    selectors: ['VNM.lai-chau', 'VNM.dien-bien', 'VNM.son-la']
  }
];
