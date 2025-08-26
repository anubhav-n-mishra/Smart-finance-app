// Currency utility functions for Indian Rupees (INR)

/**
 * Format a number as Indian Rupees currency
 * @param {number} amount - The amount to format
 * @param {boolean} showSymbol - Whether to show the ₹ symbol
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount, showSymbol = true) => {
  if (amount === null || amount === undefined) return '₹0.00';
  
  const formatted = Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return showSymbol ? `₹${formatted}` : formatted;
};

/**
 * Format a number as Indian Rupees with appropriate scaling (Lakhs, Crores)
 * @param {number} amount - The amount to format
 * @param {boolean} compact - Whether to use compact notation
 * @returns {string} - Formatted currency string with scaling
 */
export const formatCurrencyCompact = (amount, compact = true) => {
  if (amount === null || amount === undefined) return '₹0';
  
  if (!compact || amount < 100000) {
    return formatCurrency(amount);
  }
  
  if (amount >= 10000000) {
    // Crores
    const crores = amount / 10000000;
    return `₹${crores.toFixed(1)}Cr`;
  } else if (amount >= 100000) {
    // Lakhs
    const lakhs = amount / 100000;
    return `₹${lakhs.toFixed(1)}L`;
  }
  
  return formatCurrency(amount);
};

/**
 * Parse a currency string to number
 * @param {string} currencyString - The currency string to parse
 * @returns {number} - Parsed number
 */
export const parseCurrency = (currencyString) => {
  if (!currencyString) return 0;
  
  // Remove currency symbol and commas, then parse
  const cleanString = currencyString.replace(/[₹,\s]/g, '');
  return parseFloat(cleanString) || 0;
};

/**
 * Format percentage with Indian locale
 * @param {number} percentage - The percentage to format
 * @returns {string} - Formatted percentage string
 */
export const formatPercentage = (percentage) => {
  if (percentage === null || percentage === undefined) return '0%';
  return `${Number(percentage).toFixed(1)}%`;
};

/**
 * Currency constants
 */
export const CURRENCY = {
  SYMBOL: '₹',
  CODE: 'INR',
  NAME: 'Indian Rupee',
  DECIMAL_PLACES: 2,
  LOCALE: 'en-IN'
};

/**
 * Common Indian currency amounts for suggestions
 */
export const COMMON_AMOUNTS = [
  500, 1000, 2000, 5000, 10000, 25000, 50000, 100000
];

export default {
  formatCurrency,
  formatCurrencyCompact,
  parseCurrency,
  formatPercentage,
  CURRENCY,
  COMMON_AMOUNTS
};
