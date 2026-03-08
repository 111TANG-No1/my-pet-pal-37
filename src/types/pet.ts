export interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  gender: '公' | '母' | '未知';
  birthday: string;
  neutered: boolean;
  vaccinated: boolean;
  personality: string[];
  temperamentNote: string;
  allergies: string[];
  avatar: string;
  medicalHistory: MedicalRecord[];
  reminders: Reminder[];
  photos: PetPhoto[];
}

export interface MedicalRecord {
  id: string;
  date: string;
  symptom: string;
  note: string;
  images: string[];
}

export interface Reminder {
  id: string;
  date: string;
  type: '驱虫' | '复诊' | '疫苗' | '自定义';
  customType?: string;
  note: string;
  advanceDays: number;
  completed: boolean;
}

export interface PetPhoto {
  id: string;
  petId: string;
  url: string;
  createdAt: number;
  caption?: string;
}

export interface DiscoverPet {
  id: string;
  name: string;
  species: string;
  breed: string;
  gender: '公' | '母';
  neutered: boolean;
  vaccinated: boolean;
  personality: string[];
  avatar: string;
  distance: string;
  lat: number;
  lng: number;
  liked: boolean;
  mutualLike: boolean;
}

export interface ChatMessage {
  id: string;
  petId: string;
  text: string;
  fromMe: boolean;
  timestamp: number;
}

export type PlaceCategory = '医院/诊所' | '宠物店/用品店' | '猫咖/狗咖' | '宠物友好餐厅' | '宠物公园/遛宠点' | '学校';

export interface PetPlace {
  id: string;
  name: string;
  category: PlaceCategory;
  address: string;
  phone?: string;
  hours?: string;
  lat: number;
  lng: number;
  tags?: string[];
}

export interface UserSettings {
  discoverEnabled: boolean;
}

// 留言板消息（旧版，保留兼容）
export interface BoardMessage {
  id: string;
  toPetId: string;
  fromPetId: string;
  fromPetName: string;
  fromPetAvatar: string;
  text: string;
  createdAt: number;
}

// AI 助手对话
export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'error';
  text: string;
  petId?: string;
  timestamp: number;
  images?: string[];
}

// 聊天线程
export interface ChatThread {
  threadId: string;
  myPetId: string;
  peerPetId: string;
  createdAt: number;
  lastMessageAt: number;
}

// 聊天消息（微信式）
export interface ThreadMessage {
  id: string;
  threadId: string;
  sender: 'me' | 'peer';
  text: string;
  createdAt: number;
}
