import { v4 as uuidv4 } from 'uuid';
import { getSafeLocalStorage } from '../../../utils/localstorage/safe-local-storage.js';
import { deobfuscateData, obfuscateData } from '../../../utils/obfuscator.js';
// Reminder: Run `yarn add -D @types/uuid` in this package

const USER_ID_KEY = 'saas_intel_user_id';

// Helper to safely access localStorage
const safeLocalStorage = getSafeLocalStorage();

export class HoriIdentifier {
  // obfuscated user ID
  private obfuscatedUserId: string | null = null;

  constructor() {
    let id = safeLocalStorage.getItem(USER_ID_KEY);
    if (id) {
      this.obfuscatedUserId = id;
    }
  }

  setUserId(clearUserId: string): void {
    this.obfuscatedUserId = obfuscateData(clearUserId);
    safeLocalStorage.setItem(USER_ID_KEY, this.obfuscatedUserId!);
  }

  /**
   * Return clear user ID
   */
  getUserId(): string {
    if (this.obfuscatedUserId === null) {
      const id = this.getAnonymousId();
      this.setUserId(id);
      return id;
    }
    return deobfuscateData(this.obfuscatedUserId);
  }

  protected getAnonymousId(): string {
    return uuidv4();
  }

  // Method to clear identified user, keeping anonymous ID
  reset(): void {
    this.setUserId(this.getAnonymousId());
  }
}
