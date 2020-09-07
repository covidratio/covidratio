const { EMPTY } = require('rxjs');
const { flatMap, map } = require('rxjs/operators');
const { fromFetch } = require('rxjs/fetch');
const { DateTime } = require('luxon');

const ADMINS = [
  {
    name: 'Florida',
    slug: 'florida',
    id: 812,
    fips: 12,
    authority: {
      id: 5461315,
      name: 'Florida Department of Health',
      href: 'http://www.floridahealth.gov/',
    },
    caseCount: (countyName) => {
      const url = new URL('https://services1.arcgis.com/CY1LXxl9zlJeBuRZ/arcgis/rest/services/Florida_COVID19_Case_Line_Data_NEW/FeatureServer/0/query');
      url.searchParams.append('where', '1=1');
      url.searchParams.append('outFields', 'EventDate');
      url.searchParams.append('f', 'json');
      url.searchParams.append('orderByFields', 'EventDate DESC');

      return fromFetch(url).pipe(
        flatMap((response) => response.json()),
        flatMap(({ features }) => {
          const timestamp = features?.[0]?.attributes.EventDate;

          if (!timestamp) {
            return EMPTY;
          }

          const end = DateTime.fromMillis(timestamp).endOf('day');
          const start = end.minus({ days: 13 }).startOf('day');

          const format = 'yyyy-MM-dd HH:mm:ss';
          const where = `County = '${countyName}' AND EventDate >= TIMESTAMP '${start.toFormat(format)}' AND EventDate <= TIMESTAMP '${end.toFormat(format)}'`;

          const queryUrl = new URL('https://services1.arcgis.com/CY1LXxl9zlJeBuRZ/arcgis/rest/services/Florida_COVID19_Case_Line_Data_NEW/FeatureServer/0/query');
          queryUrl.searchParams.append('where', where);
          queryUrl.searchParams.append('returnCountOnly', 'true');
          queryUrl.searchParams.append('f', 'json');

          return fromFetch(queryUrl).pipe(
            flatMap((response) => response.json()),
            map(({ count }) => ({
              datetime: DateTime.fromMillis(timestamp).toISO(),
              count: parseInt(count, 10),
            })),
          );
        }),
      );
    },
  },
];

module.exports = ADMINS;
