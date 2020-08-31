import ADMINS from '../../utils/admins.mjs';
import Layout from '../../components/layout';

function Place({ label }) {
  // @TODO Get the localized name?
  return (
    <Layout>
      <h1>{label}</h1>
    </Layout>
  );
}

export async function getStaticProps({ params }) {
  const { places } = require('../../data/app.json');
  const { slug } = params;

  const { id, label } = places.find((place) => place.slug === slug);

  return {
    props: {
      id,
      label,
    },
  };
}

export async function getStaticPaths() {
  const { places } = require('../../data/app.json');
  const adminMap = ADMINS.reduce((acc, admin) => acc.set(admin.id, admin), new Map());

  return {
    paths: places.map(({ admin, slug }) => ({
      params: {
        slug,
        admin: adminMap.get(admin).slug,
      },
    })),
    fallback: false,
  };
}

export default Place;
