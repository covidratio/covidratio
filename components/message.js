import { Message as ReactMessage } from '@wikimedia/react.i18n';
import { useContext, useMemo } from 'react';
import AppContext from '../context/app';

function Message({ id, placeholders }) {
  const [app] = useContext(AppContext);

  return useMemo(() => {
    if (app.languages.length === 0) {
      return null;
    }

    return (
      <ReactMessage id={id} placeholders={placeholders} />
    );
  }, [
    app.languages,
    id,
    placeholders,
  ]);
}

export default Message;
