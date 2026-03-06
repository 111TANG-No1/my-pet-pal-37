import { DiscoverPet } from '@/types/pet';

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

// Center around Beijing
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
  mutualLike: i === 0 || i === 3, // some have mutual likes for demo
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
