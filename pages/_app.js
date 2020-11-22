import { IntlProvider } from '@wikimedia/react.i18n';
import useLanguageLoader from '@chickaree/language-loader';
import LanguageContext from '../context/language';
import messagesEn from '../i18n/en.json';
import '../styles/globals.scss';

async function languageLoader(lang) {
  const { default: messages } = await import(`../i18n/${lang}.json`);
  return messages;
}

const initialLanguages = [
  'en',
];

const initialMessages = {
  en: messagesEn,
};

function CovidRatio({ Component, pageProps }) {
  const [
    locale,
    messages,
    languages,
  ] = useLanguageLoader(languageLoader, initialLanguages, initialMessages);

  return (
    <IntlProvider locale={locale} messages={messages}>
      <LanguageContext.Provider value={languages}>
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <Component {...pageProps} />
      </LanguageContext.Provider>
    </IntlProvider>
  );
}

export default CovidRatio;
