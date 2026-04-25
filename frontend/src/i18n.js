import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ar from "./locales/ar.json";
import en from "./locales/en.json";

const DEFAULT_LANGUAGE = "en";
export const LANGUAGE_STORAGE_KEY = "app-language";

function normalizeLanguage(language) {
  return language === "ar" ? "ar" : "en";
}

function getInitialLanguage() {
  if (typeof window === "undefined") {
    return DEFAULT_LANGUAGE;
  }

  const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);

  if (savedLanguage) {
    return normalizeLanguage(savedLanguage);
  }

  return DEFAULT_LANGUAGE;
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
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: initialLanguage,
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: ["en", "ar"],
  interpolation: {
    escapeValue: false,
  },
  returnNull: false,
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
