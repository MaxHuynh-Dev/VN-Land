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
  }
];
