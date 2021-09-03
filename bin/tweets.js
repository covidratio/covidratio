#!/usr/bin/env node

import path from 'path';
import { readdir, readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import calculateRatio from '../util/ratio.js';

async function main() {
  const dirname = path.dirname(fileURLToPath(import.meta.url));

  const files = await readdir(path.join(dirname, '..', 'data'));
  const admins = await Promise.all(files.map(async (filename) => {
    const slug = path.basename(filename, path.extname(filename));

    const result = await readFile(path.join(dirname, '..', 'data', filename));

    const { label, places } = yaml.load(result);

    return {
      slug,
      label,
      places: Object.keys(places).map((key) => ({
        slug: key,
        twitter: places[key].twitter,
        label: places[key].label,
        ratio: calculateRatio(places[key].population, places[key].cases),
      })),
    };
  }));

  admins.forEach((admin) => {
    admin.places.forEach((place) => {
      const name = place.twitter ? `@${place.twitter}` : `${place.label}, ${admin.label}`;
      // eslint-disable-next-line no-console
      console.log(`Approximately 1 in ${place.ratio} people in ${name} have COVID-19 https://covidratio.com/${admin.slug}/${place.slug}`);
    });
  });
}

main();
