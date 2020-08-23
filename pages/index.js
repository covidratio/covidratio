import { useContext } from 'react';
import Layout from '../components/layout';
import Message from '../components/message';
import Group from '../components/group';
import { from } from 'rxjs';
import { bufferCount, flatMap, reduce } from 'rxjs/operators';

function Index({ groups }) {
  return (
    <Layout>
      <h1><Message id="title" /></h1>
      <div className="list-group">
        {groups.map(({ id, labels, items }) => (
          <Group key={id} labels={labels} items={items} />
        ))}
      </div>
    </Layout>
  );
}

function uaFetch(resource, init) {
  return fetch(resource, {
    ...(init || {}),
    headers: {
      ...(init?.headers || {}),
      'User-Agent': 'COVID Ratio/1.0.0 (https://covidratio.com/)',
    },
  });
}

async function getLabels(numericIds) {
  return from(numericIds).pipe(
    bufferCount(50), // No more than 50 per request.
    flatMap(async (nIds) => {
      const ids = nIds.map((id) => `Q${id}`);
      const url = new URL('https://wikidata.org/w/api.php');
      url.searchParams.append('action', 'wbgetentities');
      url.searchParams.append('format', 'json');
      url.searchParams.append('formatversion', 2);
      url.searchParams.append('props', 'labels');
      url.searchParams.append('ids', ids.join('|'));

      const response = await uaFetch(url);
      const data = await response.json();

      return nIds.map((id) => ({
        id,
        labels: Object.values(data?.entities?.[`Q${id}`]?.labels || {}),
      }));
    }),
    reduce((acc, labels) => ([
      ...acc,
      ...labels,
    ]), []),
  ).toPromise();
}

async function getItems(numericId) {
  const id = `Q${numericId}`;
  const url = new URL('https://wikidata.org/w/api.php');
  url.searchParams.append('action', 'wbgetclaims');
  url.searchParams.append('format', 'json');
  url.searchParams.append('formatversion', 2);
  url.searchParams.append('props', '');
  url.searchParams.append('entity', id);
  url.searchParams.append('property', 'P150'); // contains administrative territorial entity

  const response = await uaFetch(url);
  const data = await response.json();

  const ids = (data?.claims?.P150 || []).map((claim) => (
    claim?.mainsnak?.datavalue?.value?.['numeric-id']
  ));

  return getLabels(ids);
}

export async function getStaticProps() {
  const ids = [
    812, // Florida
  ];
  const [groupLabels, groupItems] = await Promise.all([
    getLabels(ids),
    Promise.all(ids.map((id) => (
      getItems(id).then((items) => ({
        id,
        items,
      }))
    ))),
  ]);

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
