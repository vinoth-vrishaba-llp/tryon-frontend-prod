/**
 * Frontend Encryption Service
 * Uses AES-GCM encryption to secure sensitive data before transmission
 */

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'default-dev-key-change-in-production-32';

// Convert string to ArrayBuffer
const str2ab = (str: string): ArrayBuffer => {
    const encoder = new TextEncoder();
    return encoder.encode(str);
};

// Convert ArrayBuffer to string
const ab2str = (buffer: ArrayBuffer): string => {
    const decoder = new TextDecoder();
    return decoder.decode(buffer);
};

// Convert ArrayBuffer to base64
const ab2base64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
};

// Convert base64 to ArrayBuffer
const base642ab = (base64: string): ArrayBuffer => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
};

// Derive encryption key from password
const deriveKey = async (password: string): Promise<CryptoKey> => {
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        str2ab(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: str2ab('tryon-app-salt-v1'),
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );
};

/**
 * Encrypt sensitive data
 * Returns base64 encoded string with IV prepended
 */
export const encryptData = async (plaintext: string): Promise<string> => {
    try {
        const key = await deriveKey(ENCRYPTION_KEY);
        const iv = crypto.getRandomValues(new Uint8Array(12));

        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            key,
            str2ab(plaintext)
        );

        // Combine IV and ciphertext
        const combined = new Uint8Array(iv.length + encrypted.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(encrypted), iv.length);

        return ab2base64(combined.buffer);
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt data');
    }
};

/**
 * Encrypt multiple fields in an object
 */
export const encryptFields = async <T extends Record<string, any>>(
    data: T,
    fieldsToEncrypt: (keyof T)[]
): Promise<T> => {
    const result = { ...data };

    for (const field of fieldsToEncrypt) {
        if (result[field] !== undefined && result[field] !== null) {
            const value = typeof result[field] === 'string'
                ? result[field]
                : JSON.stringify(result[field]);
            (result as any)[field] = await encryptData(value);
        }
    }

    return result;
};

/**
 * Create encrypted payload wrapper
 * Encrypts the entire payload for maximum security
 */
export const createEncryptedPayload = async (data: any): Promise<{ encrypted: string; v: number }> => {
    const encrypted = await encryptData(JSON.stringify(data));
    return { encrypted, v: 1 };
};

export default {
    encryptData,
    encryptFields,
    createEncryptedPayload
};
