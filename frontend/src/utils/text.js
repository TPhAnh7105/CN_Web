/**
 * Removes Vietnamese diacritics (accents) from a string and converts it to lowercase.
 * This is useful for search queries and matching Latin text with Unicode.
 * 
 * @param {string} str - The input string to normalize
 * @returns {string} The normalized, lowercase, diacritic-free string
 */
export const removeDiacritics = (str) => {
  if (!str) return '';
  return str
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
};
