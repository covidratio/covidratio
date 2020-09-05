import { useReducer, useEffect } from 'react';
import ADMINS from '../../utils/admins.mjs';
import Layout from '../../components/layout';

const POPULATION = 'POPULATION';

const initialState = {
  population: null,
};

function reducer(state, action) {
  switch (action.type) {
    case POPULATION:
      return {
        ...state,
        population: action.payload,
      };
    default:
      throw new Error('Invalid Action');
  }
}

function Place({ label, pop }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    dispatch({
      type: POPULATION,
      payload: pop.toLocaleString(),
    });
  }, [
    pop,
  ]);

  // @TODO Get the localized name?
  return (
    <Layout>
      <h1>{label}</h1>
      <h2>
        <span>Population: </span>
        <span>{state.population}</span>
      </h2>
    </Layout>
  );
}

export async function getStaticProps({ params }) {
  const { places } = require('../../data/app.json');
  const { slug } = params;

  const { id, label, pop } = places.find((place) => place.slug === slug);

  return {
    props: {
      id,
      label,
      pop,
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
