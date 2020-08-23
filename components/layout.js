import Head from 'next/head';
import useIntl from '../hooks/intl';

function Layout({ children }) {
  const i18n = useIntl();

  return (
    <>
      <Head>
        <title>{i18n('title')}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      </Head>
      <div className="container">
        {children}
      </div>
    </>
  );
}

export default Layout;
