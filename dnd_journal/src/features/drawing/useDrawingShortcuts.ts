import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import { drawingAction } from "./shortcuts";
import type { DrawingAction } from "./shortcuts";

export function useDrawingShortcuts(
  workspace: RefObject<HTMLElement | null>,
  actions: Record<DrawingAction, () => void>,
  canRun: () => boolean,
) {
  const latest = useRef({ actions, canRun });
  latest.current = { actions, canRun };

  useEffect(() => {
    function handle(event: KeyboardEvent) {
      if (event.defaultPrevented || !latest.current.canRun()) return;
      if (document.querySelector("dialog[open]")) return;
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || target.closest("input, textarea, select"))) return;
      if (!workspace.current?.contains(document.activeElement)) return;
      const action = drawingAction(event);
      if (!action) return;
      event.preventDefault();
      event.stopPropagation();
      latest.current.actions[action]();
    }
    window.addEventListener("keydown", handle, true);
    return () => window.removeEventListener("keydown", handle, true);
  }, [workspace]);
}
