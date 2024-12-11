/**
 * Generates a unique ID
 * @returns A unique string ID
 */

import { v4 as uuidv4 } from 'uuid';

export function generateId(): string {
  return uuidv4();
}
