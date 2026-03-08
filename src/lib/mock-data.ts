import { DiscoverPet, PetPlace, PlaceCategory } from '@/types/pet';

const avatars = ['🐕', '🐈', '🐰', '🐹', '🦜', '🐢', '🐩', '🐈‍⬛', '🐕‍🦺', '🦮'];
const names = ['皮皮', '豆豆', '小花', '旺财', '咪咪', '球球', '大黄', '雪球', '黑妞', '奶茶'];
const species = ['狗', '猫', '狗', '狗', '猫', '兔', '狗', '猫', '狗', '猫'];
const breeds = ['德牧', '英短', '柴犬', '金毛', '布偶', '荷兰侏儒兔', '贵宾', '美短', '边牧', '暹罗'];
const personalities = [
  ['活泼', '亲人'], ['安静', '独立'], ['活泼', '好奇'], ['温顺', '亲人'],
  ['粘人', '温顺'], ['胆小', '安静'], ['活泼', '聪明'], ['独立', '好奇'],
  ['活泼', '聪明', '亲人'], ['优雅', '安静'],
];
const distances = ['< 500m', '0.5~1km', '1~2km', '2~3km', '0.5~1km', '1~2km', '< 500m', '2~3km', '1~2km', '0.5~1km'];

const baseLat = 39.9042;
const baseLng = 116.4074;

export const mockDiscoverPets: DiscoverPet[] = names.map((name, i) => ({
  id: `mock_${i}`,
  name,
  species: species[i],
  breed: breeds[i],
  gender: i % 2 === 0 ? '公' : '母',
  neutered: i % 3 !== 0,
  vaccinated: i % 4 !== 3,
  personality: personalities[i],
  avatar: avatars[i],
  distance: distances[i],
  lat: baseLat + (Math.random() - 0.5) * 0.03,
  lng: baseLng + (Math.random() - 0.5) * 0.03,
  liked: false,
  mutualLike: i === 0 || i === 3,
}));

export const COMMON_ALLERGIES = ['牛肉', '鸡肉', '鱼', '谷物', '乳制品', '尘螨', '花粉', '跳蚤', '大豆', '玉米'];
export const SPECIES_OPTIONS = ['狗', '猫', '兔', '仓鼠', '鸟', '爬行动物', '其他'];
export const PERSONALITY_OPTIONS = [
  '亲人', '粘人', '独立', '怕生', '社牛', '温顺', '活泼', '安静',
  '好奇', '胆小', '胆大', '警惕', '护食', '友善(对人)', '友善(对宠)',
  '爱叫', '不爱叫', '精力旺盛', '懒散/爱睡', '训练友好',
  '倔/固执', '爱玩玩具', '爱咬/爱啃', '爱拆家', '爱撒娇',
  '易紧张', '易兴奋', '需注意攻击性',
];
export const PET_AVATARS = ['🐕', '🐈', '🐰', '🐹', '🦜', '🐢', '🐩', '🐈‍⬛', '🐕‍🦺', '🦮', '🐾', '🐇'];

export const PLACE_CATEGORIES: PlaceCategory[] = [
  '医院/诊所', '宠物店/用品店', '猫咖/狗咖', '宠物友好餐厅', '宠物公园/遛宠点', '学校',
];

// 地点类别展示名称映射（内部枚举值→展示文案）
export const PLACE_CATEGORY_LABELS: Record<PlaceCategory, string> = {
  '医院/诊所': '医院/诊所',
  '宠物店/用品店': '宠物店/用品店',
  '猫咖/狗咖': '猫咖/狗咖',
  '宠物友好餐厅': '宠物友好餐厅',
  '宠物公园/遛宠点': '宠物公园/遛宠点',
  '学校': '宠物学校',
};

export const PLACE_CATEGORY_ICONS: Record<PlaceCategory, string> = {
  '医院/诊所': '🏥',
  '宠物店/用品店': '🛒',
  '猫咖/狗咖': '☕',
  '宠物友好餐厅': '🍽️',
  '宠物公园/遛宠点': '🌳',
  '学校': '🏫',
};

export const mockPlaces: PetPlace[] = [
  { id: 'place_1', name: '爱宠动物医院', category: '医院/诊所', address: '朝阳区建国路88号', phone: '010-12345678', hours: '09:00-21:00', lat: 39.9065, lng: 116.4120 },
  { id: 'place_2', name: '宠乐汇宠物用品', category: '宠物店/用品店', address: '海淀区中关村大街12号', phone: '010-87654321', hours: '10:00-22:00', lat: 39.9010, lng: 116.4030 },
  { id: 'place_3', name: '喵星人猫咖', category: '猫咖/狗咖', address: '东城区南锣鼓巷56号', hours: '11:00-22:00', lat: 39.9080, lng: 116.4010 },
  { id: 'place_4', name: '汪汪乐园', category: '宠物公园/遛宠点', address: '朝阳公园南门内', lat: 39.9025, lng: 116.4150 },
  { id: 'place_5', name: '友宠西餐厅', category: '宠物友好餐厅', address: '三里屯路19号', phone: '010-55667788', hours: '11:30-23:00', lat: 39.9055, lng: 116.4095 },
  { id: 'place_6', name: '萌宠训练学校', category: '学校', address: '海淀区清华东路10号', phone: '010-99887766', hours: '08:00-18:00', lat: 39.9090, lng: 116.4050 },
];

// 打招呼模板
export const GREETING_TEMPLATES = [
  '你好呀，想认识一下～',
  '我们也在附近遛宠，周末要不要约公园？',
  '你家宝宝好可爱！想交流下养宠经验',
  '你家也是这个品种吗？感觉很有缘',
  '方便问下宝宝多大了？',
  '一起交个朋友吧！',
];

// AI 模板回复（离线模式）
export const AI_TEMPLATE_REPLIES: Record<string, string[]> = {
  health: [
    '根据您的描述，建议先观察1-2天。如果症状持续或加重，建议尽快就医。',
    '这个症状比较常见，建议保持环境清洁，注意饮食。如有异常及时就医。',
    '建议记录好发病时间和症状变化，就医时方便医生判断。',
  ],
  feeding: [
    '建议根据宠物年龄和体重选择适合的粮食，避免频繁更换。',
    '训练时注意正向激励，可以用零食作为奖励，每次训练不超过15分钟。',
    '幼犬/幼猫建议少食多餐，成年后可调整为每日2餐。',
  ],
  general: [
    '您好！我是宠物AI助手，可以帮您解答宠物健康、喂养、训练等问题。',
    '建议定期驱虫和疫苗接种，保持宠物健康。',
    '请提供更多细节，我可以给出更有针对性的建议。',
  ],
};
