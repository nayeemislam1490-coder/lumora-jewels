// Language switcher: English / বাংলা. Choice is remembered on the phone.
import { createContext, useContext, useEffect, useState } from "react";
import { DICT } from "./dict.js";

const LangContext = createContext({ lang: "en", setLang: () => {}, t: (k) => k });

const normalizeLang = (val) => (val === "bn" ? "bn" : "en");

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      return normalizeLang(localStorage.getItem("veloria_lang"));
    } catch {
      return "en";
    }
  });
  const setLang = (l) => {
    const next = normalizeLang(l);
    setLangState(next);
    try {
      localStorage.setItem("veloria_lang", next);
    } catch {}
  };
  useEffect(() => {
    document.documentElement.lang = lang;
    document.body.classList.toggle("lang-bn", lang === "bn");
  }, [lang]);
  const t = (key) => (DICT[lang] && DICT[lang][key]) || DICT.en[key] || key;
  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);

export function LangToggle() {
  const { lang, setLang } = useLang();
  const btn = (code, label) => (
    <button
      type="button"
      onClick={() => setLang(code)}
      aria-pressed={lang === code}
      style={{
        padding: "6px 12px",
        borderRadius: 999,
        border: "1px solid var(--gold)",
        background: lang === code ? "var(--gold)" : "transparent",
        color: lang === code ? "#121A33" : "var(--gold)",
        fontWeight: 600,
        fontSize: 13,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
  return (
    <div style={{ display: "inline-flex", gap: 6 }}>
      {btn("en", "EN")}
      {btn("bn", "বাংলা")}
    </div>
  );
}