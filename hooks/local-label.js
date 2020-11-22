import { useContext, useMemo } from 'react';
import LanguageContext from '../context/language';

function useLocaleLabel(labels) {
  const languages = useContext(LanguageContext);

  return useMemo(() => {
    if (languages.length === 0) {
      return null;
    }

    const labelMap = labels.reduce((map, { language, value }) => (
      map.set(language, value)
    ), new Map());

    const language = languages.find((lang) => labelMap.has(lang));

    return language ? labelMap.get(language) : null;
  }, [
    languages,
    labels,
  ]);
}

export default useLocaleLabel;
