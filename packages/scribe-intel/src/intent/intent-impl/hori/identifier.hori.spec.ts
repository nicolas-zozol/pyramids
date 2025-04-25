import { describe, expect, test, beforeEach, vi, Mock } from 'vitest';
import { v4 as uuidv4 } from 'uuid';
import { HoriIdentifier } from './identifier.hori.js';
import { getSafeLocalStorage } from '../../../utils/localstorage/safe-local-storage.js';
import { NodeLocalStorage } from '../../../utils/localstorage/node-local-storage.js';
import { obfuscateData, deobfuscateData } from '../../../utils/obfuscator.js';
import type { SimpleLocalStorage } from '../../../utils/localstorage/simple-local-storage.js';

// Mock uuidv4 to get predictable anonymous IDs
vi.mock('uuid', () => ({
  v4: vi.fn(),
}));

const USER_ID_KEY = 'saas_intel_user_id';
const MOCK_UUID_1 = 'mock-uuid-1111-1111-1111-111111111111';
const MOCK_UUID_2 = 'mock-uuid-2222-2222-2222-222222222222';

describe('HoriIdentifier', () => {
  let safeLocalStorage: SimpleLocalStorage;

  beforeEach(() => {
    safeLocalStorage = getSafeLocalStorage() as NodeLocalStorage;
    (safeLocalStorage as NodeLocalStorage).clear();
    vi.mocked(uuidv4).mockClear();
  });

  test('should generate and store an obfuscated anonymous ID if none exists', () => {
    (vi.mocked(uuidv4) as Mock<() => string>).mockReturnValueOnce(MOCK_UUID_1);
    const identifier = new HoriIdentifier();

    const userId: string = identifier.getUserId();
    expect(userId).toBe(MOCK_UUID_1);

    const storedValue = safeLocalStorage.getItem(USER_ID_KEY);
    expect(storedValue).toBeDefined();
    expect(storedValue).not.toBe(MOCK_UUID_1);
    const deobfuscatedValue = deobfuscateData(storedValue!);
    expect(deobfuscatedValue).toBe(MOCK_UUID_1);
  });

  test('should allow setting a specific user ID, storing it obfuscated', () => {
    const specificUserId: string = 'specific-user-abc';
    const identifier = new HoriIdentifier();

    identifier.setUserId(specificUserId);

    const userId: string = identifier.getUserId();
    expect(userId).toBe(specificUserId);

    const storedValue = safeLocalStorage.getItem(USER_ID_KEY);
    expect(storedValue).not.toBeNull();
    expect(storedValue).not.toBe(specificUserId);
    const deobfuscatedValue = deobfuscateData(storedValue!);
    expect(deobfuscatedValue).toBe(specificUserId);
  });

  test('setUserId should overwrite an existing user ID', () => {
    (vi.mocked(uuidv4) as Mock<() => string>).mockReturnValueOnce(MOCK_UUID_1);
    const identifier = new HoriIdentifier();
    const initialUserId: string = identifier.getUserId();
    expect(initialUserId).toBe(MOCK_UUID_1);
    expect(safeLocalStorage.getItem(USER_ID_KEY)).toBe(
      obfuscateData(MOCK_UUID_1),
    );

    const newSpecificId: string = 'overwritten-user-456';
    identifier.setUserId(newSpecificId);

    const userId: string = identifier.getUserId();
    expect(userId).toBe(newSpecificId);
    const storedValue = safeLocalStorage.getItem(USER_ID_KEY);
    expect(storedValue).toBe(obfuscateData(newSpecificId));
  });

  test('reset should generate and store a new obfuscated anonymous ID', () => {
    const initialId: string = 'user-to-reset';
    const identifier = new HoriIdentifier();
    identifier.setUserId(initialId);
    expect(identifier.getUserId()).toBe(initialId);

    (vi.mocked(uuidv4) as Mock<() => string>).mockReturnValueOnce(MOCK_UUID_2);

    identifier.reset();

    const userId: string = identifier.getUserId();
    expect(userId).toBe(MOCK_UUID_2);
    expect(userId).not.toBe(initialId);

    const storedValue = safeLocalStorage.getItem(USER_ID_KEY);
    expect(storedValue).not.toBeNull();
    expect(storedValue).not.toBe(MOCK_UUID_2);
    const deobfuscatedValue = deobfuscateData(storedValue!);
    expect(deobfuscatedValue).toBe(MOCK_UUID_2);
  });

  test('should persist the ID between instances', () => {
    const persistentId: string = 'persist-me';

    const identifier1 = new HoriIdentifier();
    identifier1.setUserId(persistentId);
    const storedValue1 = safeLocalStorage.getItem(USER_ID_KEY);
    expect(storedValue1).toBe(obfuscateData(persistentId));

    const identifier2 = new HoriIdentifier();
    const userId2: string = identifier2.getUserId();

    expect(userId2).toBe(persistentId);
  });
});
