import ADMINS from '../../utils/admins.mjs';
import Layout from '../../components/layout';

function Place({ name }) {
  // @TODO Get the localized name?
  return (
    <Layout>
      <h1>{name}</h1>
    </Layout>
  );
}

export async function getStaticProps({ params }) {
  const { places } = require('../../data/app.json');
  const { admin: adminSlug, slug } = params;

  const { id, name } = places.find((p) => p.slug === slug);
  const admin = ADMINS.find((a) => a.slug === adminSlug);

  return {
    props: {
      id,
      name,
      admin: {
        id: admin.id,
        fips: admin.fips,
      },
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
