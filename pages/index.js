import Layout from '../components/layout';
import Message from '../components/message';
import Admin from '../components/list/admin';
import ADMINS from '../utils/admins';

function Index({ admins }) {
  // @TODO Get the localized name?
  return (
    <Layout title="title">
      <div className="row">
        <div className="col">
          <header className="mt-2">
            <h1><Message id="title" /></h1>
          </header>
          <main>
            <div className="list-group mb-3">
              {admins.map(({
                id, name, slug, places,
              }) => (
                <Admin key={id} name={name} slug={slug} places={places} />
              ))}
            </div>
          </main>
        </div>
      </div>
    </Layout>
  );
}

export async function getStaticProps() {
  const { places } = require('../data/app.json');

  const admins = ADMINS.map(({ id, name, slug }) => ({
    id,
    name,
    slug,
    places: places.filter((place) => place.admin === id),
  }));

  return {
    props: {
      admins,
    },
  };
}

export default Index;
