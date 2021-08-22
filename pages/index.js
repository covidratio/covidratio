import { Message } from '@wikimedia/react.i18n';
import Layout from '../components/layout';
import Admin from '../components/list/admin';
import Header from '../components/header';
import calculateRatio from '../util/ratio';

function Index({ admins }) {
  // @TODO Get the localized name?
  return (
    <Layout>
      <Header>
        <Message id="title" />
      </Header>
      <div className="row">
        <div className="col">
          <main>
            <div className="list-group mb-3">
              {admins.map(({
                label, slug, places,
              }) => (
                <Admin key={slug} name={label} slug={slug} places={places} />
              ))}
            </div>
          </main>
        </div>
      </div>
    </Layout>
  );
}

export async function getStaticProps() {
  const path = require('path');
  const { readdir, readFile } = require('fs/promises');
  const yaml = require('js-yaml');

  const files = await readdir(path.join(process.cwd(), 'data'));

  const admins = await Promise.all(files.map(async (filename) => {
    const slug = path.basename(filename, path.extname(filename));

    const result = await readFile(path.join(process.cwd(), 'data', filename));

    const { label, places } = yaml.load(result);

    return {
      slug,
      label,
      places: Object.keys(places).map((key) => ({
        slug: key,
        label: places[key].label,
        ratio: calculateRatio(places[key].population, places[key].cases),
      })),
    };
  }));

  return {
    props: {
      admins,
    },
  };
}

export default Index;
