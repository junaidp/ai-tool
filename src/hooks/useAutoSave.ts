import { useEffect, useRef, useState, useCallback } from 'react';

interface UseAutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

interface UseAutoSaveReturn {
  isSaving: boolean;
  lastSaved: Date | null;
  saveNow: () => Promise<void>;
  error: string | null;
}

export function useAutoSave<T>({
  data,
  onSave,
  delay = 2000,
  enabled = true,
}: UseAutoSaveOptions<T>): UseAutoSaveReturn {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousDataRef = useRef<T>(data);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const saveNow = useCallback(async () => {
    if (!enabled) return;

    setIsSaving(true);
    setError(null);

    try {
      await onSave(data);
      if (isMountedRef.current) {
        setLastSaved(new Date());
        previousDataRef.current = data;
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        setError(err.message || 'Failed to save');
      }
    } finally {
      if (isMountedRef.current) {
        setIsSaving(false);
      }
    }
  }, [data, onSave, enabled]);

  useEffect(() => {
    if (!enabled) return;

    // Check if data has changed
    if (JSON.stringify(data) === JSON.stringify(previousDataRef.current)) {
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for auto-save
    timeoutRef.current = setTimeout(() => {
      saveNow();
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay, enabled, saveNow]);

  return {
    isSaving,
    lastSaved,
    saveNow,
    error,
  };
}

export function formatLastSaved(lastSaved: Date | null): string {
  if (!lastSaved) return 'Not saved';

  const now = new Date();
  const seconds = Math.floor((now.getTime() - lastSaved.getTime()) / 1000);

  if (seconds < 10) return 'Saved just now';
  if (seconds < 60) return `Saved ${seconds} seconds ago`;
  if (seconds < 3600) return `Saved ${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `Saved ${Math.floor(seconds / 3600)} hours ago`;
  return `Saved on ${lastSaved.toLocaleDateString()} at ${lastSaved.toLocaleTimeString()}`;
}
