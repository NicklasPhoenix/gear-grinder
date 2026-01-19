// Centralized number formatting utilities

/**
 * Format large numbers with abbreviations (K, M, B, T)
 * @param {number} num - The number to format
 * @param {number} decimals - Decimal places for abbreviated numbers (default: 1)
 * @returns {string} Formatted number string
 */
export function formatNumber(num) {
    if (num === undefined || num === null || isNaN(num)) return '0';

    const absNum = Math.abs(num);
    const sign = num < 0 ? '-' : '';

    if (absNum >= 1e12) return sign + (absNum / 1e12).toFixed(1) + 'T';
    if (absNum >= 1e9) return sign + (absNum / 1e9).toFixed(1) + 'B';
    if (absNum >= 1e6) return sign + (absNum / 1e6).toFixed(1) + 'M';
    if (absNum >= 1e3) return sign + (absNum / 1e3).toFixed(absNum >= 1e4 ? 0 : 1) + 'K';

    return sign + Math.floor(absNum).toLocaleString();
}

/**
 * Format number with locale separators (e.g., 1,234,567)
 * @param {number} num - The number to format
 * @returns {string} Formatted number with separators
 */
export function formatWithCommas(num) {
    if (num === undefined || num === null || isNaN(num)) return '0';
    return Math.floor(num).toLocaleString();
}

/**
 * Format a percentage value
 * @param {number} value - The value (e.g., 0.5 for 50% or 50 for 50%)
 * @param {number} decimals - Decimal places (default: 1)
 * @param {boolean} isRaw - If true, value is already a percentage (50 = 50%)
 * @returns {string} Formatted percentage string with % suffix
 */
export function formatPercent(value, decimals = 1, isRaw = true) {
    if (value === undefined || value === null || isNaN(value)) return '0%';
    const percent = isRaw ? value : value * 100;
    return percent.toFixed(decimals) + '%';
}

/**
 * Format a decimal number
 * @param {number} num - The number to format
 * @param {number} decimals - Decimal places (default: 2)
 * @returns {string} Formatted decimal string
 */
export function formatDecimal(num, decimals = 2) {
    if (num === undefined || num === null || isNaN(num)) return '0';
    return num.toFixed(decimals);
}

/**
 * Format a multiplier value (e.g., 1.5x)
 * @param {number} mult - The multiplier value
 * @param {number} decimals - Decimal places (default: 2)
 * @returns {string} Formatted multiplier string with x suffix
 */
export function formatMultiplier(mult, decimals = 2) {
    if (mult === undefined || mult === null || isNaN(mult)) return '1x';
    return mult.toFixed(decimals) + 'x';
}

/**
 * Format a bonus percentage (handles sign, e.g., +50% or -10%)
 * @param {number} value - The bonus value (already a percentage)
 * @param {number} decimals - Decimal places (default: 0)
 * @returns {string} Formatted bonus string with sign and %
 */
export function formatBonus(value, decimals = 0) {
    if (value === undefined || value === null || isNaN(value)) return '+0%';
    const sign = value >= 0 ? '+' : '';
    return sign + value.toFixed(decimals) + '%';
}

/**
 * Format time duration in seconds
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string (e.g., "1.5s", "2m 30s")
 */
export function formatTime(seconds) {
    if (seconds === undefined || seconds === null || isNaN(seconds) || seconds <= 0) return '?';

    if (seconds < 60) return seconds.toFixed(1) + 's';

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    if (mins < 60) {
        return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
    }

    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
}
