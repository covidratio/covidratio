import { fromFetch } from 'rxjs/fetch';
import { flatMap, map } from 'rxjs/operators';
import USER_AGENT from '../ua';

function fetchContains(id) {
  const entityId = `Q${id}`;
  const url = new URL('https://wikidata.org/w/api.php');
  url.searchParams.append('action', 'wbgetclaims');
  url.searchParams.append('format', 'json');
  url.searchParams.append('formatversion', 2);
  url.searchParams.append('props', '');
  url.searchParams.append('entity', entityId);
  url.searchParams.append('property', 'P150'); // contains administrative territorial entity

  return fromFetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
    },
  }).pipe(
    flatMap((response) => response.json()),
    map((data) => (
      (data?.claims?.P150 || []).map((claim) => (
        claim?.mainsnak?.datavalue?.value?.['numeric-id']
      ))
    )),
  );
}

export default fetchContains;
