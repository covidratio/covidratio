import '../styles/globals.scss';
import { useReducer, useLayoutEffect, useEffect } from 'react';
import { IntlProvider } from '@wikimedia/react.i18n';

const initialState = {
  locale: '',
  messages: {},
};

const MESSAGES_ADD = 'MESSAGES_ADD';

function reducer(state, action) {
  switch (action.type) {
    case MESSAGES_ADD:
      return {
        ...state,
        locale: action.payload.locale,
        messages: {
          ...state.messages,
          [action.payload.locale]: action.payload.messages,
        },
      };
    default:
      throw new Error('Invalid Action');
  }
}

function CovidRatio({ Component, pageProps }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    import('../i18n/en.json').then(({ default: messages }) => {
      dispatch({
        type: MESSAGES_ADD,
        payload: {
          locale: 'en',
          messages,
        },
      });
    });
  }, []);

  return (
    <IntlProvider locale={state.locale} messages={state.messages}>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <Component {...pageProps} />
    </IntlProvider>
  );
}

export default CovidRatio;
