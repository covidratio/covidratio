#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import rxjs from 'rxjs';
// eslint-disable-next-line import/extensions
import operators from 'rxjs/operators/index.js';
import fetch from 'node-fetch';
import slugify from 'slugify';
import ADMINS from '../utils/admins.mjs';
import labelUrls from '../utils/label-urls.mjs';

const { from, defer, forkJoin } = rxjs;
const {
  flatMap, map, toArray, reduce,
} = operators;
const { writeFile, mkdir } = fs;
const { join } = path;

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
      }).map((claim) => (
        claim?.mainsnak?.datavalue?.value
      ))
    )),
  );
}

function fetchContains(id) {
  const property = 150; // contains administrative territorial entity

  return fetchProperty(id, property).pipe(
    map((values) => (
      values.reduce((acc, value) => {
        const numericId = value?.['numeric-id'];

        if (!numericId) {
          return acc;
        }

        return [
          ...acc,
          numericId,
        ];
      }, [])
    )),
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

function fetchShortNames(numericIds) {
  const property = 1813; // short name

  return from(numericIds).pipe(
    flatMap((id) => (
      fetchProperty(id, property).pipe(
        map((shortNames) => (
          [id, shortNames.map(({ text }) => text)]
        )),
      )
    )),
    reduce((acc, [key, value]) => acc.set(key, value), new Map()),
  );
}

function fetchNameSlug(numericIds) {
  return forkJoin([
    fetchLabels(numericIds),
    fetchShortNames(numericIds),
  ]).pipe(
    flatMap(([labels, shortNames]) => (
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
        };
      }))
    )),
  );
}

async function main() {
  // @TODO Run a search for the metropolatan areas:
  // haswbstatement:P31=Q1907114 haswbstatement:P131=Q812 then the "has part" I guess?
  const places = await from(ADMINS).pipe(
    flatMap(({ id: adminId }) => (
      fetchContains(adminId).pipe(
        flatMap((ids) => fetchNameSlug(ids)),
        map(({
          id, name, label, slug,
        }) => ({
          id,
          admin: adminId,
          name,
          label,
          slug,
        })),
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
