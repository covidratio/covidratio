import { from } from 'rxjs';
import {
  bufferCount, flatMap, reduce, map,
} from 'rxjs/operators';
import { fromFetch } from 'rxjs/fetch';
import USER_AGENT from '../ua';

function fetchLabels(numericIds) {
  return from(numericIds).pipe(
    bufferCount(50), // No more than 50 per request.
    flatMap((ids) => {
      const entityIds = ids.map((id) => `Q${id}`);
      const url = new URL('https://wikidata.org/w/api.php');
      url.searchParams.append('action', 'wbgetentities');
      url.searchParams.append('format', 'json');
      url.searchParams.append('formatversion', 2);
      url.searchParams.append('props', 'labels');
      url.searchParams.append('ids', entityIds.join('|'));

      return fromFetch(url, {
        headers: {
          'User-Agent': USER_AGENT,
        },
      }).pipe(
        flatMap((response) => response.json()),
        map((data) => (
          ids.map((id) => ({
            id,
            labels: Object.values(data?.entities?.[`Q${id}`]?.labels || {}),
          }))
        )),
      );
    }),
    reduce((acc, labels) => ([
      ...acc,
      ...labels,
    ]), []),
  );
}

export default fetchLabels;
