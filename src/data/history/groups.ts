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
    id: 'champa-sau-1471',
    name: 'Chăm Pa sau năm 1471 (xấp xỉ)',
    selectors: [
      'VNM.phu-yen',
      'VNM.khanh-hoa',
      'VNM.ninh-thuan',
      'VNM.binh-thuan',
      'VNM.lam-dong',
      'VNM.dak-lak',
      'VNM.dak-nong',
      'VNM.gia-lai',
      'VNM.kon-tum'
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
    id: 'mac-cat-dat-1540',
    name: 'Dải động biên giới nhà Mạc xin dâng nhà Minh (1540, xấp xỉ, vị trí gây tranh cãi)',
    selectors: [
      'VNM.quang-ninh.mong-cai',
      'VNM.quang-ninh.hai-ha',
      'VNM.quang-ninh.binh-lieu',
      'VNM.lang-son.trang-dinh',
      'VNM.lang-son.van-lang'
    ]
  },
  {
    id: 'thai-khang-1653',
    name: 'Dinh Thái Khang – Diên Ninh (1653, xấp xỉ Khánh Hòa và bắc Ninh Thuận)',
    selectors: [
      'VNM.khanh-hoa',
      'VNM.ninh-thuan.nha-trang',
      'VNM.ninh-thuan.cam-ranh',
      'VNM.ninh-thuan.bac-ai'
    ]
  },
  {
    id: 'panduranga-1697',
    name: 'Trấn Thuận Thành sau khi tách phủ Bình Thuận (1697, phần Ninh Thuận còn lại)',
    selectors: [
      'VNM.ninh-thuan.ninh-hai',
      'VNM.ninh-thuan.ninh-phuoc',
      'VNM.ninh-thuan.ninh-son',
      'VNM.ninh-thuan.phan-rang-thap-cham',
      'VNM.ninh-thuan.thuan-bac',
      'VNM.ninh-thuan.thuan-nam'
    ]
  },
  {
    id: 'gia-dinh-1698',
    name: 'Phủ Gia Định (1698, dinh Trấn Biên và Phiên Trấn, gồm cả Mỹ Tho)',
    selectors: [
      'VNM.dong-nai',
      'VNM.ba-ria-vung-tau',
      'VNM.tp-ho-chi-minh',
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
    name: 'Dinh Long Hồ / châu Định Viễn (1732, xấp xỉ Vĩnh Long, Bến Tre, Trà Vinh)',
    selectors: ['VNM.vinh-long', 'VNM.ben-tre', 'VNM.tra-vinh']
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
  }
];
