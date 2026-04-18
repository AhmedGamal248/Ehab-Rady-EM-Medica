import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ar from "./locales/ar.json";
import en from "./locales/en.json";

const DEFAULT_LANGUAGE = "ar";
const LANGUAGE_STORAGE_KEY = "app-language";

function normalizeLanguage(language) {
  return language === "en" ? "en" : "ar";
}

function getInitialLanguage() {
  if (typeof window === "undefined") {
    return DEFAULT_LANGUAGE;
  }

  return normalizeLanguage(window.localStorage.getItem(LANGUAGE_STORAGE_KEY));
}

function getDirection(language) {
  return language === "ar" ? "rtl" : "ltr";
}

function applyDocumentLanguage(language) {
  if (typeof document === "undefined") {
    return;
  }

  const nextLanguage = normalizeLanguage(language);
  const nextDirection = getDirection(nextLanguage);

  document.documentElement.lang = nextLanguage;
  document.documentElement.dir = nextDirection;
  document.dir = nextDirection;

  if (document.body) {
    document.body.dir = nextDirection;
  }
}

const initialLanguage = getInitialLanguage();

i18n.use(initReactI18next).init({
  resources: {
    ar: { translation: ar },
    en: { translation: en },
  },
  lng: initialLanguage,
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: ["ar", "en"],
  interpolation: {
    escapeValue: false,
  },
});

applyDocumentLanguage(initialLanguage);

i18n.on("languageChanged", (language) => {
  const nextLanguage = normalizeLanguage(language);

  if (typeof window !== "undefined") {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
  }

  applyDocumentLanguage(nextLanguage);
});

export default i18n;
