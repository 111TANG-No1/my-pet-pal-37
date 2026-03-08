// 模板兜底回复语料（20条）
export const PEER_REPLY_TEMPLATES = [
  '好呀～',
  '可以的！',
  '我们周末方便。',
  '你家多大了？',
  '在哪个公园呀？',
  '我家也在附近～',
  '我也想认识新朋友！',
  '要不要交换一下遛宠时间？',
  '太好了，改天约一下～',
  '哈哈谢谢夸奖！',
  '我家也很调皮呢😂',
  '嗯嗯，有空可以一起遛',
  '好的呀，期待见面！',
  '你拍的照片好好看！',
  '我家最近刚打完疫苗',
  '你平时都去哪里遛呀？',
  '很高兴认识你～',
  '我家宝贝看到你家也很兴奋',
  '下次带零食一起分享吧',
  '加油加油，养宠快乐！',
];

export function getRandomReply(): string {
  return PEER_REPLY_TEMPLATES[Math.floor(Math.random() * PEER_REPLY_TEMPLATES.length)];
}
