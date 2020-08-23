import { useContext } from 'react';
import Head from 'next/head';
import { BananaContext } from '@wikimedia/react.i18n';

function Layout({ children }) {
  const banana = useContext(BananaContext);

  return (
    <>
      <Head>
        <title>{banana.i18n('title')}</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      </Head>
      <div className="container">
        {children}
      </div>
    </>
  );
}

export default Layout;