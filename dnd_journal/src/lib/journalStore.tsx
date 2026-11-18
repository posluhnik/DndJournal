import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
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
  saving: boolean;
  dirty: boolean;
  saveError: string;
  path: string;
  retrySave: () => void;
};

const JournalContext =
  createContext<JournalContextValue | null>(null);

export function JournalProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [snapshot, setSnapshot] = useState<Snapshot>({});
  const [savedJson, setSavedJson] = useState("{}");

  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [path, setPath] = useState("");

  const [retryVersion, setRetryVersion] = useState(0);

  // Save operations are executed sequentially.
  const saveQueue = useRef<Promise<void>>(Promise.resolve());

  // Load the journal when the application starts.
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
          throw new Error(
            "The saved journal has an invalid format."
          );
        }

        setSnapshot(data);
        setSavedJson(JSON.stringify(data));
        setPath(databasePath);
        setLoaded(true);
      } catch (error) {
        if (!cancelled) {
          setLoadError(String(error));
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  // Check whether the current journal differs from the saved version.
  const dirty = JSON.stringify(snapshot) !== savedJson;

  // Manually retry a failed save.
  const retrySave = useCallback(() => {
    setRetryVersion((current) => current + 1);
  }, []);

  // Automatically save whenever journal data changes.
  useEffect(() => {
    if (!loaded || !dirty) return;

    const json = JSON.stringify(snapshot);

    // A short delay prevents unnecessary database writes
    // when several changes happen in quick succession.
    const timeoutId = window.setTimeout(() => {
      saveQueue.current = saveQueue.current
        .catch(() => {
          // A failed operation must not block future saves.
        })
        .then(async () => {
          setSaving(true);
          setSaveError("");

          try {
            await invoke("save_journal", {
              snapshot: JSON.parse(json) as Snapshot,
            });

            setSavedJson(json);
          } catch (error) {
            setSaveError(String(error));
          } finally {
            setSaving(false);
          }
        });
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    snapshot,
    savedJson,
    loaded,
    dirty,
    retryVersion,
  ]);

  // Show an error if the journal cannot be loaded.
  if (loadError) {
    return (
      <main style={{ padding: 24 }}>
        <p role="alert">
          Could not open the journal: {loadError}
        </p>

        <button
          type="button"
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      </main>
    );
  }

  // Wait until the existing journal has finished loading.
  if (!loaded) {
    return (
      <main style={{ padding: 24 }}>
        Loading journal...
      </main>
    );
  }

  return (
    <JournalContext.Provider
      value={{
        snapshot,
        setSnapshot,
        saving,
        dirty,
        saveError,
        path,
        retrySave,
      }}
    >
      {children}
    </JournalContext.Provider>
  );
}

// Access the current journal saving status.
export function useJournalStatus() {
  const context = useContext(JournalContext);

  if (!context) {
    throw new Error(
      "useJournalStatus must be used inside JournalProvider."
    );
  }

  return {
    saving: context.saving,
    dirty: context.dirty,
    saveError: context.saveError,
    path: context.path,
    retrySave: context.retrySave,
  };
}

// A shared-state hook that automatically saves changes.
export function useJournalState<T>(
  key: string,
  initialValue: T | (() => T),
): [T, Dispatch<SetStateAction<T>>] {
  const context = useContext(JournalContext);

  if (!context) {
    throw new Error(
      "useJournalState must be used inside JournalProvider."
    );
  }

  const { snapshot, setSnapshot } = context;

  const [fallback] = useState<T>(initialValue);

  const value = Object.prototype.hasOwnProperty.call(
    snapshot,
    key
  )
    ? (snapshot[key] as T)
    : fallback;

  const setValue = useCallback<
    Dispatch<SetStateAction<T>>
  >(
    (action) => {
      setSnapshot((current) => {
        const previous = Object.prototype.hasOwnProperty.call(
          current,
          key
        )
          ? (current[key] as T)
          : fallback;

        const next =
          typeof action === "function"
            ? (action as (previous: T) => T)(previous)
            : action;

        return {
          ...current,
          [key]: next,
        };
      });
    },
    [key, fallback, setSnapshot]
  );

  return [value, setValue];
}