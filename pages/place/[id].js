import { from } from 'rxjs';
import { flatMap, reduce } from 'rxjs/operators';
import fetchContains from '../../utils/fetch/contains';
import ADMINS from '../../utils/admins';
import fetchLabels from '../../utils/fetch/labels';
import Layout from '../../components/layout';
import useLocaleLabel from '../../hooks/local-label';

function Place({ labels }) {
  const label = useLocaleLabel(labels);

  // @TODO We need the parent id to properly handle getting the data.
  return (
    <Layout>
      <h1>{label}</h1>
    </Layout>
  );
}

export async function getStaticProps({ params }) {
  require('abortcontroller-polyfill/dist/polyfill-patch-fetch');

  const { id } = params;

  const [entity] = await fetchLabels([id]).toPromise();
  const { labels } = entity;

  return {
    props: {
      id,
      labels,
    },
  };
}

export async function getStaticPaths() {
  require('abortcontroller-polyfill/dist/polyfill-patch-fetch');

  const ids = ADMINS.map(({ id }) => id);

  const itemIds = await from(ids).pipe(
    flatMap((id) => fetchContains(id)),
    reduce((acc, items) => ([
      ...acc,
      ...items,
    ]), []),
  ).toPromise();

  return {
    paths: itemIds.map((id) => ({
      params: {
        id: id.toString(),
      },
    })),
    fallback: false,
  };
}

export default Place;
