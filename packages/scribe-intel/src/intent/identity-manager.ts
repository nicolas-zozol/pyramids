import { v4 as uuidv4 } from 'uuid'; // Use uuid for robust anonymous IDs
// Reminder: Run `yarn add -D @types/uuid` in this package

const USER_ID_KEY = 'scribe_intel_user_id';
const ANONYMOUS_ID_KEY = 'scribe_intel_anonymous_id';

// Helper to safely access localStorage
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
    } catch (e) {
      console.error('localStorage getItem error:', e);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, value);
      }
    } catch (e) {
      console.error('localStorage setItem error:', e);
    }
  },
  removeItem: (key: string): void => {
     try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (e) {
      console.error('localStorage removeItem error:', e);
    }
  }
};


export class IdentityManager {
  private userId: string | null = null;
  private anonymousId: string | null = null;

  constructor() {
    this.userId = safeLocalStorage.getItem(USER_ID_KEY);
    this.anonymousId = safeLocalStorage.getItem(ANONYMOUS_ID_KEY);

    if (!this.anonymousId) {
      console.log('Generating new anonymous ID');
      const newAnonId = uuidv4(); 
      this.anonymousId = newAnonId; // Assign before setting in case setItem fails
      safeLocalStorage.setItem(ANONYMOUS_ID_KEY, newAnonId);
    }
  }

  setUserId(newUserId: string | null): void {
    if (newUserId !== null && newUserId !== undefined) { // Check for null/undefined explicitly
      if (newUserId !== this.userId) { // Only update if changed
        this.userId = newUserId;
        safeLocalStorage.setItem(USER_ID_KEY, newUserId);
      }
    } else if (this.userId !== null) { // Only remove if it exists
      // Explicitly setting userId to null means logout/reset
      this.userId = null;
      safeLocalStorage.removeItem(USER_ID_KEY);
      // Note: We keep the anonymousId for potential future sessions
    }
  }

  getUserId(): string | null {
    return this.userId;
  }

  getAnonymousId(): string { // Ensure return type is always string
    if (this.anonymousId === null || this.anonymousId === undefined) {
      console.warn('Anonymous ID was missing, regenerating.');
      const newAnonId = uuidv4();
      this.anonymousId = newAnonId;
      safeLocalStorage.setItem(ANONYMOUS_ID_KEY, newAnonId);
      return newAnonId; // Return the newly generated ID directly
    }
    // If it exists, it should be a string, satisfying the return type
    return this.anonymousId;
  }

  // Method to clear identified user, keeping anonymous ID
  reset(): void {
      this.setUserId(null);
  }
} 