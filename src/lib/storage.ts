import { Pet, UserSettings, ChatMessage, PetPlace, BoardMessage, AIChatMessage, ChatThread, ThreadMessage } from '@/types/pet';
import { mockPlaces, PLACE_CATEGORY_LABELS, PLACE_SYNONYMS } from '@/lib/mock-data';

// ===== 固定全局唯一 localStorage Keys =====
const PETS_KEY = 'mypet_pets';
const SETTINGS_KEY = 'mypet_settings';
const CHATS_KEY = 'mypet_chats';
const LIKES_KEY = 'mypet_likes';
const PLACES_KEY = 'mypet_places';
const BOARD_KEY = 'mypet_board';
const AI_CHAT_KEY = 'mypet_ai_chat';
const THREADS_KEY = 'mypet_threads';
const THREAD_MSGS_KEY = 'mypet_thread_msgs';

// ===== 宠物 CRUD =====
export function getPets(): Pet[] {
  const data = localStorage.getItem(PETS_KEY);
  return data ? JSON.parse(data) : [];
}

export function savePets(pets: Pet[]) {
  localStorage.setItem(PETS_KEY, JSON.stringify(pets));
}

export function getPetById(id: string): Pet | undefined {
  return getPets().find(p => p.id === id);
}

export function addPet(pet: Pet) {
  const pets = getPets();
  pets.push(pet);
  savePets(pets);
}

export function updatePet(pet: Pet) {
  const pets = getPets().map(p => p.id === pet.id ? pet : p);
  savePets(pets);
}

export function deletePet(id: string) {
  savePets(getPets().filter(p => p.id !== id));
}

// ===== 用户设置 =====
export function getSettings(): UserSettings {
  const data = localStorage.getItem(SETTINGS_KEY);
  return data ? JSON.parse(data) : { discoverEnabled: true };
}

export function saveSettings(settings: UserSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// ===== 点赞 =====
export function getLikes(): string[] {
  const data = localStorage.getItem(LIKES_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveLikes(likes: string[]) {
  localStorage.setItem(LIKES_KEY, JSON.stringify(likes));
}

export function toggleLike(petId: string): string[] {
  const likes = getLikes();
  const idx = likes.indexOf(petId);
  if (idx >= 0) likes.splice(idx, 1);
  else likes.push(petId);
  saveLikes(likes);
  return likes;
}

// ===== 旧版聊天（保留兼容） =====
export function getChats(petId: string): ChatMessage[] {
  const all = JSON.parse(localStorage.getItem(CHATS_KEY) || '{}');
  return all[petId] || [];
}

export function addChat(petId: string, msg: ChatMessage) {
  const all = JSON.parse(localStorage.getItem(CHATS_KEY) || '{}');
  if (!all[petId]) all[petId] = [];
  all[petId].push(msg);
  localStorage.setItem(CHATS_KEY, JSON.stringify(all));
}

// ===== 地点（带 merge 初始化） =====

/**
 * 获取地点列表：首次或空时写入 mock，已有数据时补齐缺失的 mock 数据（不覆盖用户新增）
 */
export function getPlaces(): PetPlace[] {
  const raw = localStorage.getItem(PLACES_KEY);
  if (!raw || raw === '[]') {
    // key 不存在或为空 → 写入全部 mock
    savePlaces([...mockPlaces]);
    return [...mockPlaces];
  }

  let existing: PetPlace[] = [];
  try {
    existing = JSON.parse(raw);
  } catch {
    // 解析失败 → 重写 mock
    savePlaces([...mockPlaces]);
    return [...mockPlaces];
  }

  // 合并：补齐缺失的 mock 数据，去重规则 = id 优先，name+category 次之
  const existingIds = new Set(existing.map(p => p.id));
  const existingKeys = new Set(existing.map(p => `${p.name}__${p.category}`));

  let added = false;
  for (const mp of mockPlaces) {
    if (!existingIds.has(mp.id) && !existingKeys.has(`${mp.name}__${mp.category}`)) {
      existing.push(mp);
      added = true;
    }
  }
  if (added) {
    savePlaces(existing);
  }
  return existing;
}

export function savePlaces(places: PetPlace[]) {
  localStorage.setItem(PLACES_KEY, JSON.stringify(places));
}

export function addPlace(place: PetPlace) {
  const places = getPlaces();
  places.push(place);
  savePlaces(places);
}

// ===== 地点搜索工具 =====

function normalize(s: string): string {
  return s.toLowerCase().replace(/[\s\-\/·,，、。.!！?？()（）]/g, '');
}

function buildSearchText(place: PetPlace): string {
  const label = PLACE_CATEGORY_LABELS[place.category] || place.category;
  const parts = [place.name, label, place.category, place.address, ...(place.tags || [])];
  if (place.phone) parts.push(place.phone);
  if (place.hours) parts.push(place.hours);
  return normalize(parts.join(' '));
}

/**
 * 扩展查询词：应用同义词重写，返回所有需要匹配的 token
 */
function expandQuery(query: string): string[] {
  const q = query.trim();
  if (!q) return [];
  const tokens = new Set<string>();
  tokens.add(normalize(q));

  // 检查同义词表
  for (const [key, synonyms] of Object.entries(PLACE_SYNONYMS)) {
    if (q.includes(key) || normalize(q).includes(normalize(key))) {
      synonyms.forEach(s => tokens.add(normalize(s)));
    }
  }
  return Array.from(tokens);
}

/**
 * 搜索地点：同义词扩展 + token OR 匹配 + 按命中数排序
 */
export function searchPlaces(places: PetPlace[], query: string): PetPlace[] {
  const tokens = expandQuery(query);
  if (tokens.length === 0) return places;

  const scored = places.map(place => {
    const text = buildSearchText(place);
    let hits = 0;
    for (const t of tokens) {
      if (text.includes(t)) hits++;
    }
    return { place, hits };
  }).filter(x => x.hits > 0);

  scored.sort((a, b) => b.hits - a.hits);
  return scored.map(x => x.place);
}

// ===== 留言板（旧版，保留兼容） =====
export function getBoardMessages(): BoardMessage[] {
  const data = localStorage.getItem(BOARD_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveBoardMessages(msgs: BoardMessage[]) {
  localStorage.setItem(BOARD_KEY, JSON.stringify(msgs));
}

export function addBoardMessage(msg: BoardMessage) {
  const msgs = getBoardMessages();
  msgs.push(msg);
  saveBoardMessages(msgs);
}

export function getBoardMessagesForPet(toPetId: string): BoardMessage[] {
  return getBoardMessages().filter(m => m.toPetId === toPetId);
}

export function getBoardMessagesSentByMe(): BoardMessage[] {
  const myPetIds = getPets().map(p => p.id);
  return getBoardMessages().filter(m => myPetIds.includes(m.fromPetId));
}

// ===== AI 助手对话历史 =====
export function getAIChatHistory(): AIChatMessage[] {
  const data = localStorage.getItem(AI_CHAT_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveAIChatHistory(msgs: AIChatMessage[]) {
  localStorage.setItem(AI_CHAT_KEY, JSON.stringify(msgs));
}

export function addAIChatMessage(msg: AIChatMessage) {
  const msgs = getAIChatHistory();
  msgs.push(msg);
  saveAIChatHistory(msgs);
}

// ===== 聊天线程 =====
export function getThreads(): ChatThread[] {
  const data = localStorage.getItem(THREADS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveThreads(threads: ChatThread[]) {
  localStorage.setItem(THREADS_KEY, JSON.stringify(threads));
}

export function getOrCreateThread(myPetId: string, peerPetId: string): ChatThread {
  const threads = getThreads();
  let thread = threads.find(t => t.myPetId === myPetId && t.peerPetId === peerPetId);
  if (!thread) {
    thread = {
      threadId: generateId(),
      myPetId,
      peerPetId,
      createdAt: Date.now(),
      lastMessageAt: Date.now(),
    };
    threads.push(thread);
    saveThreads(threads);
  }
  return thread;
}

export function updateThreadLastMessage(threadId: string) {
  const threads = getThreads();
  const t = threads.find(th => th.threadId === threadId);
  if (t) {
    t.lastMessageAt = Date.now();
    saveThreads(threads);
  }
}

export function getThreadMessages(threadId: string): ThreadMessage[] {
  const all = JSON.parse(localStorage.getItem(THREAD_MSGS_KEY) || '{}');
  return all[threadId] || [];
}

export function addThreadMessage(msg: ThreadMessage) {
  const all = JSON.parse(localStorage.getItem(THREAD_MSGS_KEY) || '{}');
  if (!all[msg.threadId]) all[msg.threadId] = [];
  all[msg.threadId].push(msg);
  localStorage.setItem(THREAD_MSGS_KEY, JSON.stringify(all));
  updateThreadLastMessage(msg.threadId);
}

// ===== 数据导出 =====
export function exportData(): string {
  return JSON.stringify({
    pets: getPets(),
    settings: getSettings(),
    likes: getLikes(),
    chats: JSON.parse(localStorage.getItem(CHATS_KEY) || '{}'),
    board: getBoardMessages(),
    aiChat: getAIChatHistory(),
    threads: getThreads(),
    threadMsgs: JSON.parse(localStorage.getItem(THREAD_MSGS_KEY) || '{}'),
    places: getPlaces(),
  }, null, 2);
}

// ===== 工具函数 =====
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
