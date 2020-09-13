#!/usr/bin/env node
const { writeFile, mkdir } = require('fs/promises');
const { join } = require('path');
const { from, defer, forkJoin } = require('rxjs');
const {
  flatMap, map, toArray, reduce,
} = require('rxjs/operators');
const fetch = require('node-fetch');
const slugify = require('slugify');
const ADMINS = require('../utils/admins/index.js');
const labelUrls = require('../utils/label-urls.js');

const USER_AGENT = 'COVID Ratio/1.0.0 (https://covidratio.com/)';

function fetchProperty(id, property) {
  const entityId = `Q${id}`;
  const propertyId = `P${property}`;
  const url = new URL('https://wikidata.org/w/api.php');
  url.searchParams.append('action', 'wbgetclaims');
  url.searchParams.append('format', 'json');
  url.searchParams.append('formatversion', 2);
  url.searchParams.append('props', '');
  url.searchParams.append('entity', entityId);
  url.searchParams.append('property', propertyId); // contains administrative territorial entity

  return defer(() => (
    fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
      },
    })
  )).pipe(
    flatMap((response) => response.json()),
    map((data) => (
      (data?.claims?.[propertyId] || []).filter((claim) => (
        claim?.rank !== 'deprecated' && claim?.mainsnak?.datavalue?.value
      )).sort((a, b) => {
        if (!a?.rank || !b?.rank) {
          return 0;
        }

        if (a.rank === 'preferred') {
          return 1;
        }

        if (b.rank === 'preferred') {
          return -1;
        }

        return 0;
      }).map((claim) => {
        const { datatype } = claim?.mainsnak || {};

        switch (datatype) {
          case 'wikibase-item':
            return claim?.mainsnak?.datavalue?.value?.['numeric-id'];
          case 'external-id':
            return claim?.mainsnak?.datavalue?.value;
          case 'monolingualtext':
            return claim?.mainsnak?.datavalue?.value?.text;
          default:
            return claim?.mainsnak?.datavalue?.value;
        }
      }).filter((value) => !!value)
    )),
  );
}

function fetchPropertyMultiple(ids, property) {
  return from(ids).pipe(
    flatMap((id) => (
      fetchProperty(id, property).pipe(
        map((values) => [id, values]),
      )
    )),
    reduce((acc, [key, value]) => acc.set(key, value), new Map()),
  );
}

function fetchLabels(numericIds) {
  return labelUrls(numericIds).pipe(
    flatMap(({ ids, url }) => (
      from(fetch(url)).pipe(
        flatMap((response) => response.json()),
        flatMap((data) => (
          from(ids.map((id) => ([id, Object.values(data?.entities?.[`Q${id}`]?.labels || {})])))
        )),
      )
    )),
    reduce((acc, [key, value]) => acc.set(key, value), new Map()),
  );
}

function getFirst(valueMap, key) {
  if (!valueMap.has(key)) {
    return undefined;
  }

  const values = valueMap.get(key);
  if (values.length === 0) {
    return undefined;
  }

  return values[0];
}

function fetchPlaces(numericIds) {
  const shortNameId = 1813;
  const fipsId = 882;

  return forkJoin([
    fetchLabels(numericIds),
    fetchPropertyMultiple(numericIds, shortNameId),
    fetchPropertyMultiple(numericIds, fipsId),
  ]).pipe(
    flatMap(([labels, shortNames, fipsIds]) => (
      from(numericIds.map((id) => {
        let name;
        let label;

        if (shortNames.has(id)) {
          const itemShortNames = shortNames.get(id);
          if (itemShortNames.length > 0) {
            [name] = itemShortNames;
          }
        }

        if (labels.has(id)) {
          const itemLabels = labels.get(id);
          if (itemLabels.length > 0) {
            label = itemLabels[0].value;
          }
          label = itemLabels[0].value;
          if (!name) {
            name = label.replace(' County', '');
          }
        }

        return {
          id,
          name,
          label,
          slug: slugify(name, {
            lower: true,
            strict: true,
          }),
          fips: getFirst(fipsIds, id),
        };
      }))
    )),
  );
}

function fetchCensusPopulation(stateId) {
  const url = new URL('https://api.census.gov/data/2019/pep/population');
  url.searchParams.append('get', 'POP');
  url.searchParams.append('for', 'county:*');
  url.searchParams.append('in', `state:${stateId}`);

  return defer(() => (
    fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
      },
    })
  )).pipe(
    flatMap((response) => response.json()),
    map((data) => data.reduce((acc, row, idx) => {
      if (idx === 0) {
        return acc;
      }

      const [population, state, county] = row;

      return acc.set(state + county, parseInt(population, 10));
    }, new Map())),
  );
}

async function main() {
  const containsId = 150; // contains administrative territorial entity

  // @TODO Run a search for the metropolatan areas:
  // haswbstatement:P31=Q1907114 haswbstatement:P131=Q812 then the "has part" I guess?
  const places = await from(ADMINS).pipe(
    flatMap(({ id: adminId, fips }) => (
      forkJoin([
        fetchProperty(adminId, containsId),
        fetchCensusPopulation(fips),
      ]).pipe(
        flatMap(([placeIds, populations]) => (
          fetchPlaces(placeIds).pipe(
            map((place) => ({
              ...place,
              admin: adminId,
              pop: populations.get(place.fips),
            })),
          )
        )),
      )
    )),
    toArray(),
  ).toPromise();

  try {
    await mkdir(join(process.cwd(), 'data'));
  } catch (e) {
    // Silence is golden.
  }

  const data = {
    places,
  };

  await writeFile(join(process.cwd(), 'data', 'app.json'), JSON.stringify(data, null, 2));
}

main();
