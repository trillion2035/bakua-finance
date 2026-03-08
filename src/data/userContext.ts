// Stores user registration data for dynamic dashboard rendering
// In production this would come from the database

export interface UserProfile {
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  country: string;
  assetType: string;
  capitalTarget: string;
}

const STORAGE_KEY = "bakua_user_profile";

const defaultProfile: UserProfile = {
  firstName: "Emmanuel",
  lastName: "Nkweti",
  company: "Menoua Highlands Coffee Cooperative",
  email: "emmanuel@mhcc.cm",
  country: "Cameroon",
  assetType: "Agriculture",
  capitalTarget: "$2,000,000",
};

export function saveUserProfile(profile: UserProfile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function getUserProfile(): UserProfile {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return defaultProfile;
}

export function clearUserProfile() {
  localStorage.removeItem(STORAGE_KEY);
}
