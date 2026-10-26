import { useCallback } from 'react';
import { useToast } from '../components/Toast.tsx';
import { copyText } from '../utils.ts';

export function useCopy(): (text: string, label?: string) => Promise<void> {
  const toast = useToast();
  return useCallback(async (text: string, label = '') => {
    const ok = await copyText(text);
    toast(ok ? `${label} 복사했어요`.trim() : '복사하지 못했어요. 길게 눌러 직접 복사해 주세요');
  }, [toast]);
}
