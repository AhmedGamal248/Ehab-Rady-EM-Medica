/**
 * Determines the stock tier based on quantity
 * @param {number} stock - The stock quantity
 * @returns {'out-of-stock' | 'low-stock' | 'available'} The stock tier
 */
export function getStockTier(stock) {
  const quantity = Number(stock) || 0;
  if (quantity === 0) return 'out-of-stock';
  if (quantity >= 1 && quantity <= 10) return 'low-stock';
  return 'available';
}

/**
 * Gets the localized stock message based on the tier
 * Used for product cards and cart display
 * @param {number} stock - The stock quantity
 * @param {function} t - The i18n translation function
 * @returns {string} The localized stock message
 */
export function getStockMessage(stock, t) {
  const tier = getStockTier(stock);
  switch (tier) {
    case 'out-of-stock':
      return t('productCard.outOfStock');
    case 'low-stock':
      return t('productCard.inStockLow', { count: stock });
    case 'available':
      return t('productCard.inStockAvailable');
    default:
      return t('productCard.inStockAvailable');
  }
}

/**
 * Gets the localized stock message for product detail pages
 * Uses productDetailsPage translation keys instead of productCard
 * @param {number} stock - The stock quantity
 * @param {function} t - The i18n translation function
 * @returns {string} The localized stock message for detail pages
 */
export function getDetailPageStockMessage(stock, t) {
  const tier = getStockTier(stock);
  switch (tier) {
    case 'out-of-stock':
      return t('productDetailsPage.unavailable');
    case 'low-stock':
      return t('productDetailsPage.lowStockWarning', { count: stock });
    case 'available':
      return t('productDetailsPage.available');
    default:
      return t('productDetailsPage.available');
  }
}
