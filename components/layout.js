import { BananaContext } from '@wikimedia/react.i18n';
import Head from 'next/head';
import { useContext } from 'react';

function Layout({ children }) {
  const banana = useContext(BananaContext);

  return (
    <>
      <Head>
        <title>{banana.i18n('title')}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      </Head>
      <div className="container min-vh-100">
        {children}
      </div>
    </>
  );
}

export default Layout;
