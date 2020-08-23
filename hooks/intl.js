import { useContext, useCallback } from 'react';
import { BananaContext } from '@wikimedia/react.i18n';
import AppContext from '../context/app';

function useIntl() {
  const [app] = useContext(AppContext);
  const banana = useContext(BananaContext);

  const [locale] = app.languages;

  return useCallback((key, ...parameters) => {
    if (!locale) {
      return '';
    }

    return banana.i18n(key, ...parameters);
  }, [
    locale,
    banana,
  ]);
}

export default useIntl;
