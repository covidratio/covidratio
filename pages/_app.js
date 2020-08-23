import '../styles/globals.scss';
import { useReducer, useLayoutEffect, useEffect } from 'react';
import { IntlProvider } from '@wikimedia/react.i18n';

const initialState = {
  locale: '',
  messages: {},
};

const MESSAGES_ADD = 'MESSAGES_ADD';
const LOCALE_SET = 'LOCALE_SET';

function reducer(state, action) {
  switch (action.type) {
    case MESSAGES_ADD:
      return {
        ...state,
        messages: {
          ...state.messages,
          ...action.payload,
        },
      };
    case LOCALE_SET:
      return {
        ...state,
        locale: action.payload,
      };
    default:
      throw new Error('Invalid Action');
  }
}

function CovidRatio({ Component, pageProps }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    // eslint-disable-next-line no-undef
    window.navigator.languages.forEach((lang) => {
      import(`../i18n/${lang.toLowerCase()}.json`).then(({ default: messages }) => {
        dispatch({
          type: MESSAGES_ADD,
          payload: {
            en: messages,
          },
        });
      }).catch((e) => { /* Silence is Golden */ });
    });

    dispatch({
      type: LOCALE_SET,
      // eslint-disable-next-line no-undef
      payload: window.navigator.language,
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
