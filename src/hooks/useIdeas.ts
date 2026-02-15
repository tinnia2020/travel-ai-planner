import { useCallback } from 'react';
import { useAppStore } from '../stores/appStore';
import { readFileAsDataURL, isImageFile, isValidURL } from '../utils/helpers';
import type { UseIdeasReturn } from '../types';

export const useIdeas = (): UseIdeasReturn => {
  const { ideas, addIdea, removeIdea } = useAppStore();

  const addTextIdea = useCallback(
    (content: string) => {
      if (!content.trim()) {
        throw new Error('請輸入內容');
      }

      addIdea({
        type: 'text',
        content: content.trim(),
      });
    },
    [addIdea]
  );

  const addImageIdea = useCallback(
    async (file: File) => {
      if (!isImageFile(file)) {
        throw new Error('請上傳圖片檔案');
      }

      try {
        const dataURL = await readFileAsDataURL(file);
        addIdea({
          type: 'image',
          content: dataURL,
          fileName: file.name,
        });
      } catch (error) {
        throw new Error('圖片讀取失敗：' + (error as Error).message);
      }
    },
    [addIdea]
  );

  const addLinkIdea = useCallback(
    (url: string) => {
      if (!url.trim()) {
        throw new Error('請輸入網址');
      }

      if (!isValidURL(url)) {
        throw new Error('請輸入有效的網址');
      }

      addIdea({
        type: 'link',
        content: url.trim(),
      });
    },
    [addIdea]
  );

  return {
    ideas,
    addTextIdea,
    addImageIdea,
    addLinkIdea,
    removeIdea,
  };
};
