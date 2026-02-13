export interface Pet {
  id: string;
  name: string;
  species: string; // 猫、狗、兔、仓鼠、鸟、爬行动物、其他
  breed: string;
  gender: '公' | '母' | '未知';
  birthday: string;
  neutered: boolean;
  vaccinated: boolean;
  personality: string[];
  allergies: string[];
  avatar: string; // emoji or base64
  medicalHistory: MedicalRecord[];
  reminders: Reminder[];
}

export interface MedicalRecord {
  id: string;
  date: string;
  symptom: string;
  note: string;
  images: string[]; // base64 previews
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

export interface UserSettings {
  discoverEnabled: boolean;
}
