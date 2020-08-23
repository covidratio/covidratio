import Head from 'next/head';
import { Message, BananaContext } from '@wikimedia/react.i18n';
import Layout from '../components/layout';

function Index() {
  return (
    <Layout>
      <h1><Message id="title" /></h1>
    </Layout>
  );
}

export default Index;