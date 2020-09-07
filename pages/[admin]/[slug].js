import { useReducer, useMemo } from 'react';
import { DateTime } from 'luxon';
import { filter, map, switchMap } from 'rxjs/operators';
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

  const { name: adminLabel, caseCount, authority = {} } = useMemo(() => (
    ADMINS.find((admin) => admin.slug === adminSlug) || {}
  ), [
    adminSlug,
  ]);

  useReactor((value$) => (
    value$.pipe(
      filter(([countyName, fetchCaseCount]) => (countyName && fetchCaseCount)),
      switchMap(([countyName, fetchCaseCount]) => fetchCaseCount(countyName)),
      map((payload) => ({
        type: CASE_COUNT,
        payload,
      })),
    )
  ), dispatch, [
    name,
    caseCount,
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
          <header className="mt-2">
            <h1>
              {label}
              <span> </span>
              <span className="small">{adminLabel}</span>
            </h1>
          </header>
          <main className="d-flex flex-column justify-content-center flex-grow-1">
            <p className="result text-center">
              <Message
                id="result"
                placeholders={[
                  <span className="d-block"><strong className="ratio">{ratio}</strong></span>,
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
                  pop.toLocaleString(),
                  state.caseCount ? state.caseCount.toLocaleString() : null,
                  <a href="https://www.wikidata.org/wiki/Q93050329">Nathan Smith</a>,
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
