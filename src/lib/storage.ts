import { Pet, UserSettings, ChatMessage, PetPlace } from '@/types/pet';
import { mockPlaces } from '@/lib/mock-data';

const PETS_KEY = 'mypet_pets';
const SETTINGS_KEY = 'mypet_settings';
const CHATS_KEY = 'mypet_chats';
const LIKES_KEY = 'mypet_likes';
const PLACES_KEY = 'mypet_places';

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
  }, null, 2);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
