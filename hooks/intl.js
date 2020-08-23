import { useContext, useCallback } from 'react';
import { BananaContext } from '@wikimedia/react.i18n';
import AppContext from '../context/app';

function useIntl() {
  const [app] = useContext(AppContext);
  const banana = useContext(BananaContext);

  return useCallback((key, ...parameters) => {
    if (app.languages.length === 0) {
      return '';
    }

    return banana.i18n(key, ...parameters);
  }, [
    app.languages,
    banana,
  ]);
}

export default useIntl;
