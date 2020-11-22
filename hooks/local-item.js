import { useContext, useMemo } from 'react';
import LanguageContext from '../context/language';

function useLocalItems(items) {
  const languages = useContext(LanguageContext);

  return useMemo(() => {
    if (languages.length === 0) {
      return [];
    }

    return items.map((item) => {
      const { labels } = item;
      const labelMap = labels.reduce((map, { language, value }) => (
        map.set(language, value)
      ), new Map());
      const language = languages.find((lang) => labelMap.has(lang));

      return {
        ...item,
        label: language ? labelMap.get(language) : null,
      };
    }).sort((a, b) => a.label.localeCompare(b.label));
  }, [
    languages,
    items,
  ]);
}

export default useLocalItems;
