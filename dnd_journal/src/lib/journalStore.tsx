import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type {
  Dispatch,
  ReactNode,
  SetStateAction,
} from "react";
import { invoke } from "@tauri-apps/api/core";

type Snapshot = Record<string, unknown>;

type JournalContextValue = {
  snapshot: Snapshot;
  setSnapshot: Dispatch<SetStateAction<Snapshot>>;
};

const JournalContext = createContext<JournalContextValue | null>(null);

export function JournalProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<Snapshot>({});
  const [savedJson, setSavedJson] = useState("{}");

  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [path, setPath] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [data, databasePath] = await Promise.all([
          invoke<Snapshot>("load_journal"),
          invoke<string>("database_path"),
        ]);

        if (cancelled) return;

        if (
          data === null ||
          typeof data !== "object" ||
          Array.isArray(data)
        ) {
          throw new Error("Неверный формат сохранённого журнала");
        }

        setSnapshot(data);
        setSavedJson(JSON.stringify(data));
        setPath(databasePath);
        setLoaded(true);
      } catch (error) {
        if (!cancelled) setLoadError(String(error));
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const dirty = JSON.stringify(snapshot) !== savedJson;

  async function save() {
    if (saving) return;

    // Фиксируем именно ту версию, которую отправляем в Rust.
    const json = JSON.stringify(snapshot);

    setSaving(true);
    setSaveError("");

    try {
      await invoke("save_journal", {
        snapshot: JSON.parse(json),
      });

      setSavedJson(json);
    } catch (error) {
      setSaveError(String(error));
    } finally {
      setSaving(false);
    }
  }

  if (loadError) {
    return (
      <main style={{ padding: 24 }}>
        <p role="alert">Не удалось открыть журнал: {loadError}</p>
        <button onClick={() => window.location.reload()}>
          Попробовать снова
        </button>
      </main>
    );
  }

  // Не открываем пустой интерфейс до окончания загрузки:
  // пользователь не сможет случайно затереть старые данные.
  if (!loaded) {
    return <p style={{ padding: 24 }}>Загрузка журнала…</p>;
  }

  return (
    <JournalContext.Provider value={{ snapshot, setSnapshot }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          padding: 12,
          borderBottom: "1px solid #555",
        }}
      >
        <button
          type="button"
          disabled={saving || !dirty}
          onClick={() => void save()}
        >
          {saving ? "Сохранение…" : "Сохранить"}
        </button>

        <span role="status">
          {dirty ? "Есть несохранённые изменения" : "Всё сохранено"}
        </span>

        <details>
          <summary>Файл базы</summary>
          <code>{path}</code>
        </details>

        {saveError && (
          <span role="alert" style={{ color: "#ff7676" }}>
            {saveError}
          </span>
        )}
      </div>

      {children}
    </JournalContext.Provider>
  );
}

// Используется почти так же, как useState.
// Отличие: значение находится в общем сохраняемом журнале.
export function useJournalState<T>(
  key: string,
  initialValue: T | (() => T),
): [T, Dispatch<SetStateAction<T>>] {
  const context = useContext(JournalContext);

  if (!context) {
    throw new Error("useJournalState нужен JournalProvider");
  }

  const { snapshot, setSnapshot } = context;

  const [fallback] = useState<T>(initialValue);

  const value = Object.prototype.hasOwnProperty.call(snapshot, key)
    ? (snapshot[key] as T)
    : fallback;

  const setValue = useCallback<Dispatch<SetStateAction<T>>>(
    (action) => {
      setSnapshot((current) => {
        const previous = Object.prototype.hasOwnProperty.call(current, key)
          ? (current[key] as T)
          : fallback;

        const next =
          typeof action === "function"
            ? (action as (previous: T) => T)(previous)
            : action;

        return { ...current, [key]: next };
      });
    },
    [key, fallback, setSnapshot],
  );

  return [value, setValue];
}