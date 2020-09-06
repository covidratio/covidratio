import {
  flatMap, reduce, map,
} from 'rxjs/operators';
import { fromFetch } from 'rxjs/fetch';
import labelUrls from '../label-urls';

function fetchLabels(numericIds, languages = ['en']) {
  return labelUrls(numericIds, languages).pipe(
    flatMap(({ ids, url }) => (
      fromFetch(url).pipe(
        flatMap((response) => response.json()),
        map((data) => (
          ids.map((id) => ({
            id,
            labels: Object.values(data?.entities?.[`Q${id}`]?.labels || {}),
          }))
        )),
      )
    )),
    reduce((acc, labels) => ([
      ...acc,
      ...labels,
    ]), []),
  );
}

export default fetchLabels;
