import i18n from "../i18n";

/* ── SVG fallback placeholder ──────────────────────────────── */
const placeholderSvg = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="bg" x1="0%" x2="100%" y1="0%" y2="100%">
      <stop offset="0%" stop-color="#eff8ff"/>
      <stop offset="100%" stop-color="#d7effe"/>
    </linearGradient>
  </defs>
  <rect width="800" height="600" rx="36" fill="url(#bg)"/>
  <circle cx="400" cy="250" r="120" fill="#0d6e8c" opacity="0.16"/>
  <path d="M365 165h70c11 0 20 9 20 20v40h40c11 0 20 9 20 20v70c0 11-9 20-20 20h-40v40c0 11-9 20-20 20h-70c-11 0-20-9-20-20v-40h-40c-11 0-20-9-20-20v-70c0-11 9-20 20-20h40v-40c0-11 9-20 20-20Z" fill="#0d6e8c" opacity="0.90"/>
  <text x="400" y="470" fill="#35536b" font-family="Arial,sans-serif" font-size="34" font-weight="700" text-anchor="middle">EM Medica</text>
  <text x="400" y="512" fill="#5f7a8f" font-family="Arial,sans-serif" font-size="24" text-anchor="middle">Medical equipment</text>
</svg>
`);
export const productFallbackImage = `data:image/svg+xml;charset=UTF-8,${placeholderSvg}`;

/* ── Cloudinary optimisation ──────────────────────────────── */
/**
 * Insert Cloudinary responsive transforms into a Cloudinary URL.
 * Safe no-op for non-Cloudinary URLs.
 */
export function optimizeCloudinaryUrl(url, width = 400) {
  if (!url || typeof url !== "string") return url;
  if (!url.includes("res.cloudinary.com")) return url;
  // Already transformed — don't double-transform
  if (url.includes("/upload/w_")) return url;
  return url.replace(
    /\/upload\/(v\d+\/)/,
    `/upload/w_${width},q_auto,f_auto,c_limit/$1`
  );
}

/* ── Currency formatting ──────────────────────────────────── */
// Cache formatters per locale to avoid rebuilding Intl objects on every render
const currencyFormatters = new Map();

function getCurrencyFormatter(locale) {
  if (!currencyFormatters.has(locale)) {
    currencyFormatters.set(
      locale,
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "EGP",
        maximumFractionDigits: 0,
      })
    );
  }
  return currencyFormatters.get(locale);
}

export function formatCurrency(value) {
  const locale = i18n.resolvedLanguage === "ar" ? "ar-EG" : "en-US";
  return getCurrencyFormatter(locale).format(Number(value) || 0);
}

/* ── Image helpers ────────────────────────────────────────── */
export function getProductImage(product) {
  const raw = product?.image || product?.images?.[0] || product?.colors?.[0]?.images?.[0];
  if (!raw) return productFallbackImage;
  return optimizeCloudinaryUrl(raw, 400);
}

export function getProductImageFull(product) {
  const raw = product?.image || product?.images?.[0] || product?.colors?.[0]?.images?.[0];
  if (!raw) return productFallbackImage;
  return optimizeCloudinaryUrl(raw, 800);
}

export function handleProductImageError(event) {
  // Prevent infinite error loops if fallback itself 404s
  if (event.currentTarget.src !== productFallbackImage) {
    event.currentTarget.src = productFallbackImage;
  }
}

/* ── Text helpers ─────────────────────────────────────────── */
export function truncateText(text, maxLength = 90) {
  if (!text || typeof text !== "string") return "";
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  // Break at last word boundary before maxLength
  const sliced = trimmed.slice(0, maxLength);
  const lastSpace = sliced.lastIndexOf(" ");
  return `${lastSpace > 0 ? sliced.slice(0, lastSpace) : sliced}…`;
}

/* ── GPU/WebGL capability detection ──────────────────────── */
let _webglCapable = null;
/**
 * Returns true if the device has WebGL support and enough GPU memory
 * to run our Three.js scene without dropping below acceptable FPS.
 * Result is cached after first call.
 */
export function isWebGLCapable() {
  if (_webglCapable !== null) return _webglCapable;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    if (!gl) { _webglCapable = false; return false; }

    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    if (ext) {
      const renderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || "";
      // Known software / very low-end renderers — skip WebGL
      const blocked = /SwiftShader|llvmpipe|softpipe|Microsoft Basic/i;
      if (blocked.test(renderer)) { _webglCapable = false; return false; }
    }

    // Check device memory (Chrome-only API, >2 GB required)
    const mem = navigator.deviceMemory;
    if (typeof mem === "number" && mem < 2) { _webglCapable = false; return false; }

    _webglCapable = true;
    return true;
  } catch {
    _webglCapable = false;
    return false;
  }
}
