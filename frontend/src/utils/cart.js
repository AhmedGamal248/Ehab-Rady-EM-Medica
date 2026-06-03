/**
 * Unique cart line key: same product + different color = separate lines.
 */
export function getCartLineKey(productId, color) {
  const id = String(productId);
  const colorName = color?.name?.trim().toLowerCase();
  return colorName ? `${id}::${colorName}` : `${id}::__default__`;
}

export function normalizeCartItem(item) {
  const lineKey = item.lineKey || getCartLineKey(item._id, item.selectedColor);
  return { ...item, lineKey };
}

export const PRODUCT_STOCK_UPDATED_EVENT = "product-stock-updated";

export function dispatchProductStockUpdates(updates = []) {
  if (!updates.length) return;
  window.dispatchEvent(
    new CustomEvent(PRODUCT_STOCK_UPDATED_EVENT, { detail: { updates } })
  );
}
