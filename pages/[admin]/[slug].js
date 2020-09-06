import { useReducer, useMemo } from 'react';
import { DateTime } from 'luxon';
import { EMPTY } from 'rxjs';
import { flatMap, map, switchMap } from 'rxjs/operators';
import { fromFetch } from 'rxjs/fetch';
import useReactor from '@cinematix/reactor';
import ADMINS from '../../utils/admins';
import Layout from '../../components/layout';
import Message from '../../components/message';

const CASE_COUNT = 'CASE_COUNT';

const initialState = {
  caseCount: null,
  datetime: null,
};

function reducer(state, action) {
  switch (action.type) {
    case CASE_COUNT:
      return {
        ...state,
        caseCount: action.payload.count,
        datetime: action.payload.datetime,
      };
    default:
      throw new Error('Invalid Action');
  }
}

function Place({
  label, name, pop, adminSlug,
}) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const { name: adminLabel } = useMemo(() => (
    ADMINS.find((admin) => admin.slug === adminSlug) || {}
  ), [
    adminSlug,
  ]);

  useReactor((value$) => (
    value$.pipe(
      switchMap(([county]) => {
        // @TODO Move this to ADMINS
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
            const start = end.minus({ days: 14 }).startOf('day');

            const format = 'yyyy-MM-dd HH:mm:ss';
            const where = `County = '${county}' AND EventDate >= TIMESTAMP '${start.toFormat(format)}' AND EventDate <= TIMESTAMP '${end.toFormat(format)}'`;

            const queryUrl = new URL('https://services1.arcgis.com/CY1LXxl9zlJeBuRZ/arcgis/rest/services/Florida_COVID19_Case_Line_Data_NEW/FeatureServer/0/query');
            queryUrl.searchParams.append('where', where);
            queryUrl.searchParams.append('returnCountOnly', 'true');
            queryUrl.searchParams.append('f', 'json');

            return fromFetch(queryUrl).pipe(
              flatMap((response) => response.json()),
              map(({ count }) => ({
                type: CASE_COUNT,
                payload: {
                  datetime: DateTime.fromMillis(timestamp).toISO(),
                  count: parseInt(count, 10),
                },
              })),
            );
          }),
        );
      }),
    )
  ), dispatch, [
    name,
  ]);

  let ratio = null;
  if (state.caseCount) {
    ratio = Math.round(pop / state.caseCount).toLocaleString();
  }

  let datetime = null;
  if (state.datetime) {
    datetime = DateTime.fromISO(state.datetime).toLocaleString(DateTime.DATETIME_SHORT);
  }

  // @TODO Get the localized name?
  return (
    <Layout>
      <div className="row min-vh-100">
        <div className="col d-flex flex-column">
          <h1 className="mt-2">
            {label}
            <span> </span>
            <small>{adminLabel}</small>
          </h1>
          <div className="d-flex flex-column justify-content-center flex-grow-1">
            <p className="result text-center">
              <Message
                id="result"
                placeholders={[
                  <div><strong className="ratio">{ratio}</strong></div>,
                  <em>{label}</em>,
                  <strong>{datetime}</strong>,
                ]}
              />
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export async function getStaticProps({ params }) {
  const { places } = require('../../data/app.json');
  const { slug, admin: adminSlug } = params;

  const {
    id, label, name, pop,
  } = places.find((place) => place.slug === slug);

  return {
    props: {
      id,
      label,
      name,
      pop,
      adminSlug,
    },
  };
}

export async function getStaticPaths() {
  const { places } = require('../../data/app.json');
  const adminMap = ADMINS.reduce((acc, admin) => acc.set(admin.id, admin), new Map());

  return {
    paths: places.map(({ admin, slug }) => ({
      params: {
        slug,
        admin: adminMap.get(admin).slug,
      },
    })),
    fallback: false,
  };
}

export default Place;
