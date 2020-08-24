import { from, forkJoin } from 'rxjs';
import { flatMap, map, reduce, toArray } from 'rxjs/operators';
import Layout from '../components/layout';
import Message from '../components/message';
import Group from '../components/group';
import fetchContains from '../utils/fetch/contains';
import ADMINS from '../utils/admins';
import fetchLabels from '../utils/fetch/labels';

function Index({ groups }) {
  return (
    <Layout title="title">
      <h1><Message id="title" /></h1>
  <div className="list-group mb-3">
        {groups.map(({ id, labels, items }) => (
          <Group key={id} labels={labels} items={items} />
        ))}
      </div>
    </Layout>
  );
}

function getItems(id) {
  return fetchContains(id).pipe(
    flatMap((contains) => fetchLabels(contains)),
  );
}

export async function getStaticProps() {
  require('abortcontroller-polyfill/dist/polyfill-patch-fetch');
  const ids = ADMINS.map(({ id }) => id);

  // @TODO Run a search for the metropolatan areas:
  // haswbstatement:P31=Q1907114 haswbstatement:P131=Q812 then the "has part" I guess?
  const [groupLabels, groupItems] = await forkJoin([
    fetchLabels(ids),
    from(ids).pipe(
      flatMap((id) => (
        getItems(id).pipe(
          map((items) => ({
            id,
            items,
          })),
        )
      )),
      toArray(),
    ),
  ]).toPromise();

  const groups = groupLabels.map(({ id, labels }) => ({
    id,
    labels,
    items: groupItems.find((({ id: itemId }) => id === itemId)).items,
  }));

  return {
    props: {
      groups,
    },
  };
}

export default Index;
