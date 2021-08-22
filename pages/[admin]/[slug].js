import { DateTime } from 'luxon';
import { Message } from '@wikimedia/react.i18n';
import Layout from '../../components/layout';
import Header from '../../components/header';
import calculateRatio from '../../util/ratio';
import caseCount from '../../util/case-count';

function Place({
  label, population, adminLabel, updated, caseCount, ratio, authority,
}) {
  let datetime = null;
  if (updated) {
    datetime = DateTime.fromISO(updated).toLocaleString(DateTime.DATE_SHORT);
  }

  // @TODO Get the localized name?
  return (
    <Layout>
      <div className="row min-vh-100">
        <div className="col d-flex flex-column">
          <Header>
            {label}
            <span> </span>
            <span className="fs-2 fw-normal">{adminLabel}</span>
          </Header>
          <main className="d-flex flex-column justify-content-center flex-grow-1">
            <p className="result text-center">
              <Message
                id="result"
                placeholders={[
                  <span className="d-block"><strong className="ratio">{ratio ? ratio.toLocaleString() : '\u00A0'}</strong></span>,
                  <em>{label}</em>,
                  <strong>{datetime}</strong>,
                ]}
              />
            </p>
          </main>
          <footer>
            <p>
              <Message
                id="explanation"
                placeholders={[
                  <em>{label}</em>,
                  population.toLocaleString(),
                  caseCount ? caseCount.toLocaleString() : null,
                  <a href="https://www.wikidata.org/wiki/Q93050329">Nathan D L Smith ALM</a>,
                  <a href="https://www.instagram.com/p/CEDPeb6Dod2/"><Message id="video" /></a>,
                ]}
              />
            </p>
            <p>
              <Message
                id="source"
                placeholders={[
                  <a href={authority.href}>{authority.name}</a>,
                  <a href="https://github.com/covidratio/covidratio"><Message id="source-code" /></a>,
                  <a href="https://www.gnu.org/licenses/agpl-3.0.en.html"><Message id="license" placeholders={['AGPL-3']} /></a>,
                ]}
              />
            </p>
          </footer>
        </div>
      </div>
    </Layout>
  );
}

export async function getStaticProps({ params }) {
  const path = require('path');
  const { readFile } = require('fs/promises');
  const yaml = require('js-yaml');
  const { slug, admin: adminSlug } = params;

  const result = await readFile(path.join(process.cwd(), 'data', `${adminSlug}.yml`));

  const {
    label: adminLabel,
    updated,
    authority,
    places,
  } = yaml.load(result);

  const {
    label, population, cases,
  } = places[slug];

  return {
    props: {
      label,
      updated,
      adminLabel,
      authority,
      population,
      caseCount: caseCount(cases),
      ratio: calculateRatio(population, cases),
    },
  };
}

export async function getStaticPaths() {
  const path = require('path');
  const { readdir, readFile } = require('fs/promises');
  const yaml = require('js-yaml');

  const files = await readdir(path.join(process.cwd(), 'data'));

  const admins = await Promise.all(files.map(async (filename) => {
    const slug = path.basename(filename, path.extname(filename));

    const result = await readFile(path.join(process.cwd(), 'data', filename));

    const { places } = yaml.load(result);

    return {
      slug,
      places: Object.keys(places).map((key) => ({
        slug: key,
        ...places[key],
      })),
    };
  }));

  const paths = admins.reduce((acc, { slug: admin, places }) => {
    places.forEach(({ slug }) => acc.add({ admin, slug }));
    return acc;
  }, new Set());

  return {
    paths: Array.from(paths).map((params) => ({ params })),
    fallback: false,
  };
}

export default Place;
