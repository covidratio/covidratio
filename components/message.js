import { Message as ReactMessage } from '@wikimedia/react.i18n';
import { useContext, useMemo } from 'react';
import AppContext from '../context/app';

function Message({ id, params }) {
  const [app] = useContext(AppContext);

  return useMemo(() => {
    if (app.languages.length === 0) {
      return null;
    }

    return (
      <ReactMessage id={id} params={params} />
    );
  }, [
    app.languages,
    id,
    params,
  ]);
}

export default Message;
