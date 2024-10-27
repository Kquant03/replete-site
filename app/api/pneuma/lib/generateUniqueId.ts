/**
 * Generates a uniquely identifiable string for use as a queue ID.
 *
 * @returns {string} - A unique ID based on current timestamp, nanoseconds, and a random component
 */
export function generateUniqueId(): string {
    const timeComponent = Date.now();
    const nanoComponent = process.hrtime()[1]; // High-Resolution time in nanoseconds
    const randomComponent = Math.random().toString(36).substring(2, 15);
    return `${timeComponent}-${nanoComponent}-${randomComponent}`;
}