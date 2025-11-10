/**
 * String utility functions
 */

/**
 * Truncate text to a specified length
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

/**
 * Get initials from name (first and last name)
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Capitalize first letter of string
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Convert string to title case
 */
export function titleCase(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Convert string to slug (URL-friendly)
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate random string
 */
export function randomString(length: number = 10): string {
  return Math.random().toString(36).substring(2, length + 2);
}

/**
 * Generate random ID
 */
export function generateId(): string {
  return `${Date.now()}-${randomString(8)}`;
}

/**
 * Pluralize word based on count
 */
export function pluralize(word: string, count: number, suffix: string = 's'): string {
  return count === 1 ? word : word + suffix;
}

/**
 * Format file size in bytes to human-readable string
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Parse full name into first and last name
 */
export function parseName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts[0] || '';
  const lastName = parts.slice(1).join(' ') || '';
  return { firstName, lastName };
}

/**
 * Remove extra whitespace from string
 */
export function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Check if string is email
 */
export function isEmail(text: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(text);
}

/**
 * Check if string is URL
 */
export function isURL(text: string): boolean {
  try {
    new URL(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Mask sensitive string (e.g., email, phone)
 */
export function maskString(text: string, visibleChars: number = 4): string {
  if (text.length <= visibleChars * 2) return text;
  const start = text.slice(0, visibleChars);
  const end = text.slice(-visibleChars);
  const masked = '*'.repeat(text.length - visibleChars * 2);
  return start + masked + end;
}

/**
 * Extract domain from email
 */
export function getEmailDomain(email: string): string {
  return email.split('@')[1] || '';
}

/**
 * Convert camelCase to kebab-case
 */
export function camelToKebab(text: string): string {
  return text.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Convert kebab-case to camelCase
 */
export function kebabToCamel(text: string): string {
  return text.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}
