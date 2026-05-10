export interface MenuItem {
  id: string;
  category: string;
  name: string;
  priceM?: number;
  priceL: number;
  fixedSweetness: boolean;
  temperature: 'iced' | 'hot/iced'; // 'iced' means cold only, 'hot/iced' means can be both
  notes?: string;
  hasBrownSugarOption?: boolean;
}

export const menuCategories = ['蜜果四季青', '港港好無咖啡因', '小農日厚鮮奶茶', '濃醇鮮飲'];

export const SWEETNESS_OPTIONS = ['正常糖', '7分糖', '5分糖', '3分糖'];
export const ICE_OPTIONS = ['正常冰', '微冰少冰', '去冰-保鮮冰塊'];

export const MENU: MenuItem[] = [
  // 蜜果四季青
  { id: '1', category: '蜜果四季青', name: '阿嬤慢熬鳳梨四季青茶', priceL: 55, fixedSweetness: true, temperature: 'iced', notes: '招牌！溫火慢熬古早味' },
  { id: '2', category: '蜜果四季青', name: '霧梅四季青', priceL: 60, fixedSweetness: true, temperature: 'iced', notes: '梅嶺直送重磅加入三顆梅' },
  { id: '3', category: '蜜果四季青', name: '鮮甘蔗四季青', priceL: 65, fixedSweetness: true, temperature: 'iced', notes: '甘蔗頭原汁與青茶1:1比例' },
  { id: '4', category: '蜜果四季青', name: '蜜柑四季青', priceL: 70, fixedSweetness: true, temperature: 'iced', notes: '茂谷柑原汁非濃縮還原果汁' },
  { id: '5', category: '蜜果四季青', name: '百香鮮柑四季青', priceL: 70, fixedSweetness: true, temperature: 'iced', notes: '埔里百香果與茶湯香醇結合' },
  { id: '6', category: '蜜果四季青', name: '有機檸冬四季青', priceL: 70, fixedSweetness: true, temperature: 'iced', notes: '古法熬煮有多瓜塊' },

  // 港港好無咖啡因
  { id: '7', category: '港港好無咖啡因', name: '阿嬤慢熬鳳梨冰茶', priceL: 50, fixedSweetness: true, temperature: 'iced', notes: '招牌！溫火慢熬古早味' },
  { id: '8', category: '港港好無咖啡因', name: '阿嬤慢熬鳳梨醇奶', priceL: 70, fixedSweetness: true, temperature: 'iced' },
  { id: '9', category: '港港好無咖啡因', name: '黑糖珍珠醇奶', priceM: 70, priceL: 80, fixedSweetness: false, temperature: 'hot/iced', hasBrownSugarOption: true, notes: '手熬黑糖漿健康美味' },
  { id: '10', category: '港港好無咖啡因', name: '有機小農檸檬汁', priceL: 65, fixedSweetness: true, temperature: 'iced', notes: '有機檸檬美味滋味' },
  { id: '11', category: '港港好無咖啡因', name: '有機檸檬鳳梨凍', priceL: 70, fixedSweetness: true, temperature: 'iced', notes: '有機檸檬加上自製鳳梨凍' },
  { id: '12', category: '港港好無咖啡因', name: '南非國寶茶那堤', priceL: 70, fixedSweetness: false, temperature: 'hot/iced', notes: '南非的紅寶石-無咖啡因' },
  { id: '13', category: '港港好無咖啡因', name: '南非國寶茶有機檸', priceL: 70, fixedSweetness: true, temperature: 'iced', notes: '南非的紅寶石-無咖啡因' },

  // 小農日厚鮮奶茶
  { id: '14', category: '小農日厚鮮奶茶', name: '周港茶小農鮮奶茶', priceL: 60, fixedSweetness: false, temperature: 'hot/iced' },
  { id: '15', category: '小農日厚鮮奶茶', name: '周港茶小農鮮奶茶2.0', priceL: 70, fixedSweetness: false, temperature: 'hot/iced', notes: '茶湯與鮮奶油搖滾雪克' },
  { id: '16', category: '小農日厚鮮奶茶', name: '黑糖濃鮮奶茶', priceL: 65, fixedSweetness: false, temperature: 'hot/iced', hasBrownSugarOption: true },
  { id: '17', category: '小農日厚鮮奶茶', name: '輕肉桂鮮奶茶', priceL: 65, fixedSweetness: false, temperature: 'hot/iced' },
  { id: '18', category: '小農日厚鮮奶茶', name: '珍珠日厚鮮奶茶', priceL: 65, fixedSweetness: false, temperature: 'hot/iced' },
  { id: '19', category: '小農日厚鮮奶茶', name: '太妃焦糖茶那堤', priceL: 70, fixedSweetness: false, temperature: 'hot/iced', notes: '手熬太妃焦糖醬' },
  { id: '20', category: '小農日厚鮮奶茶', name: '龍眼蜜鮮奶茶', priceL: 80, fixedSweetness: false, temperature: 'iced', notes: '純正龍眼蜜非調和糖蜜' },
  { id: '21', category: '小農日厚鮮奶茶', name: '重乳鮮奶酪鮮奶茶', priceL: 80, fixedSweetness: false, temperature: 'iced', notes: '手作鮮奶酪與茶湯完美絕配' },
  { id: '22', category: '小農日厚鮮奶茶', name: '濃郁布丁鮮奶茶', priceL: 80, fixedSweetness: false, temperature: 'iced', notes: '濃郁布丁與茶湯完美絕配' },

  // 濃醇鮮飲
  { id: '23', category: '濃醇鮮飲', name: '鍋煮水果茶', priceL: 70, fixedSweetness: true, temperature: 'hot/iced', notes: '手熬蘋果醬值得一嚐' },
  { id: '24', category: '濃醇鮮飲', name: '有機玫瑰茶那堤', priceL: 80, fixedSweetness: true, temperature: 'hot/iced', notes: '有機玫瑰讓你人美心美' },
  { id: '25', category: '濃醇鮮飲', name: '有機杭菊茶那堤', priceL: 80, fixedSweetness: true, temperature: 'hot/iced', notes: '有機杭菊讓你養生心暖' },
  { id: '26', category: '濃醇鮮飲', name: '鹽之花可可醇奶', priceL: 85, fixedSweetness: true, temperature: 'hot/iced' },
  { id: '27', category: '濃醇鮮飲', name: '燕麥奶黑糖日茶凍', priceM: 75, priceL: 85, fixedSweetness: false, temperature: 'hot/iced', hasBrownSugarOption: true, notes: '選擇自製茶凍或珍珠' },
  { id: '28', category: '濃醇鮮飲', name: '燕麥奶胚芽茶那堤', priceM: 75, priceL: 85, fixedSweetness: false, temperature: 'hot/iced', hasBrownSugarOption: true },
];
