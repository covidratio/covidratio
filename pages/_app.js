import { useReducer, useEffect } from 'react';
import { from, of } from 'rxjs';
import {
  flatMap, catchError, reduce, map, filter,
} from 'rxjs/operators';
import { IntlProvider } from '@wikimedia/react.i18n';
import useReactor from '@cinematix/reactor';
import AppContext from '../context/app';
import messagesEn from '../i18n/en.json';
import '../styles/globals.scss';

const initialState = {
  languages: [],
  messages: {
    en: messagesEn,
  },
};

const LANGUAGES_ADD = 'LANGUAGES_ADD';

function reducer(state, action) {
  switch (action.type) {
    case LANGUAGES_ADD:
      return {
        ...state,
        messages: {
          ...state.messages,
          ...action.payload.messages,
        },
        languages: action.payload.languages,
      };
    default:
      throw new Error('Invalid Action');
  }
}

function languagesReactor(value$) {
  return value$.pipe(
    flatMap((languages) => (
      from(languages).pipe(
        // 'en' is the finalFallback so there is no need to load it again.
        filter((lang) => lang.toLowerCase() !== 'en'),
        flatMap((lang) => (
          from(import(`../i18n/${lang.toLowerCase()}.json`)).pipe(
            map(({ default: messages }) => ({
              [lang.toLowerCase()]: messages,
            })),
            catchError(() => (
              of({
                [lang.toLowerCase()]: {},
              })
            )),
          )
        )),
        reduce((acc, messages) => ({
          ...acc,
          ...messages,
        }), {}),
        map((messages) => ({
          type: LANGUAGES_ADD,
          payload: {
            messages,
            languages,
          },
        })),
      )
    )),
  );
}

function CovidRatio({ Component, pageProps }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const languages = useReactor(languagesReactor, dispatch);

  useEffect(() => {
    // eslint-disable-next-line no-undef
    languages.next(window.navigator.languages);
  }, [
    languages,
  ]);

  const [locale] = state.languages;

  return (
    <IntlProvider locale={locale || ''} messages={state.messages}>
      <AppContext.Provider value={[state, dispatch]}>
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <Component {...pageProps} />
      </AppContext.Provider>
    </IntlProvider>
  );
}

export default CovidRatio;
