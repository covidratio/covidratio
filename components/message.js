import { Message as BananaMessage } from '@wikimedia/react.i18n';
import { useContext, useMemo } from 'react';
import AppContext from '../context/app';

function Message({ id, params }) {
  const [app] = useContext(AppContext);

  const [locale] = app.languages;

  return useMemo(() => {
    if (!locale) {
      return null;
    }

    return (
      <BananaMessage id={id} params={params} />
    );
  }, [
    locale,
    id,
    params,
  ]);
}

export default Message;
