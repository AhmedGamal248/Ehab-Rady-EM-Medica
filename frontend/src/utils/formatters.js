import i18n from "../i18n";

const placeholderSvg = encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
    <defs>
      <linearGradient id="bg" x1="0%" x2="100%" y1="0%" y2="100%">
        <stop offset="0%" stop-color="#eff8ff" />
        <stop offset="100%" stop-color="#d7effe" />
      </linearGradient>
    </defs>
    <rect width="800" height="600" rx="36" fill="url(#bg)" />
    <circle cx="400" cy="250" r="120" fill="#0f6e8c" opacity="0.18" />
    <path d="M365 165h70c11 0 20 9 20 20v40h40c11 0 20 9 20 20v70c0 11-9 20-20 20h-40v40c0 11-9 20-20 20h-70c-11 0-20-9-20-20v-40h-40c-11 0-20-9-20-20v-70c0-11 9-20 20-20h40v-40c0-11 9-20 20-20Z" fill="#0f6e8c" opacity="0.88" />
    <text x="400" y="470" fill="#35536b" font-family="Arial, sans-serif" font-size="34" font-weight="700" text-anchor="middle">EM Medica</text>
    <text x="400" y="512" fill="#5f7a8f" font-family="Arial, sans-serif" font-size="24" text-anchor="middle">Medical equipment</text>
  </svg>
`);

export const productFallbackImage = `data:image/svg+xml;charset=UTF-8,${placeholderSvg}`;

/**
 * Apply Cloudinary responsive transforms to image URLs.
 * Converts: .../upload/v123/path.jpg → .../upload/w_400,q_auto,f_auto/v123/path.jpg
 */
export function optimizeCloudinaryUrl(url, width = 400) {
  if (!url || !url.includes("res.cloudinary.com")) return url;

  // Insert transforms before /v[version]/ or after /upload/
  return url.replace(
    /\/upload\/(v\d+\/)/,
    `/upload/w_${width},q_auto,f_auto,c_limit/$1`
  );
}

export function formatCurrency(value) {
  const locale = i18n.resolvedLanguage === "ar" ? "ar-EG" : "en-US";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function getProductImage(product) {
  const raw = product?.image || product?.images?.[0];
  if (!raw) return productFallbackImage;
  return optimizeCloudinaryUrl(raw, 400);
}

export function getProductImageFull(product) {
  const raw = product?.image || product?.images?.[0];
  if (!raw) return productFallbackImage;
  return optimizeCloudinaryUrl(raw, 800);
}

export function handleProductImageError(event) {
  event.currentTarget.src = productFallbackImage;
}

export function truncateText(text, maxLength = 90) {
  if (!text) {
    return "";
  }

  return text.length > maxLength
    ? `${text.slice(0, maxLength).trim()}...`
    : text;
}
