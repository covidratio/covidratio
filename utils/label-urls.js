const { from } = require('rxjs');
const { map, bufferCount } = require('rxjs/operators');

function labelUrls(numericIds, languages = ['en']) {
  return from(numericIds).pipe(
    bufferCount(50), // No more than 50 per request.
    map((ids) => {
      const entityIds = ids.map((id) => `Q${id}`);
      const url = new URL('https://wikidata.org/w/api.php');
      url.searchParams.append('action', 'wbgetentities');
      url.searchParams.append('format', 'json');
      url.searchParams.append('formatversion', 2);
      url.searchParams.append('props', 'labels');
      url.searchParams.append('languages', languages.join('|'));
      url.searchParams.append('ids', entityIds.join('|'));

      return {
        ids,
        url: url.toString(),
      };
    }),
  );
}

module.exports = labelUrls;
