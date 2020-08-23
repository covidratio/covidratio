import { useContext, useMemo } from 'react';
import AppContext from '../context/app';

function useLocalItems(items) {
  const [app] = useContext(AppContext);

  return useMemo(() => {
    if (app.languages.length === 0) {
      return [];
    }

    return items.map((item) => {
      const { labels } = item;
      const labelMap = labels.reduce((map, { language, value }) => (
        map.set(language, value)
      ), new Map());
      const language = app.languages.find((lang) => labelMap.has(lang));

      return {
        ...item,
        label: language ? labelMap.get(language) : null,
      };
    }).sort((a, b) => a.label.localeCompare(b.label));
  }, [
    app.languages,
    items,
  ]);
}

export default useLocalItems;
