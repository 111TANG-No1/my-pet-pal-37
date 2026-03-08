import { Pet, UserSettings, ChatMessage, PetPlace, BoardMessage, AIChatMessage, ChatThread, ThreadMessage } from '@/types/pet';
import { mockPlaces } from '@/lib/mock-data';

const PETS_KEY = 'mypet_pets';
const SETTINGS_KEY = 'mypet_settings';
const CHATS_KEY = 'mypet_chats';
const LIKES_KEY = 'mypet_likes';
const PLACES_KEY = 'mypet_places';
const BOARD_KEY = 'mypet_board';
const AI_CHAT_KEY = 'mypet_ai_chat';
const THREADS_KEY = 'mypet_threads';
const THREAD_MSGS_KEY = 'mypet_thread_msgs';

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

export function getSettings(): UserSettings {
  const data = localStorage.getItem(SETTINGS_KEY);
  return data ? JSON.parse(data) : { discoverEnabled: true };
}

export function saveSettings(settings: UserSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

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

export function exportData(): string {
  return JSON.stringify({
    pets: getPets(),
    settings: getSettings(),
    likes: getLikes(),
    chats: JSON.parse(localStorage.getItem(CHATS_KEY) || '{}'),
    board: getBoardMessages(),
    aiChat: getAIChatHistory(),
    threads: getThreads(),
  }, null, 2);
}

export function getPlaces(): PetPlace[] {
  const data = localStorage.getItem(PLACES_KEY);
  if (!data) return [...mockPlaces];
  return JSON.parse(data);
}

export function savePlaces(places: PetPlace[]) {
  localStorage.setItem(PLACES_KEY, JSON.stringify(places));
}

export function addPlace(place: PetPlace) {
  const places = getPlaces();
  places.push(place);
  savePlaces(places);
}

// 留言板（旧版，保留兼容）
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

// AI 助手对话历史
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

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
