import Link from 'next/link';

function Place({ admin, slug, name }) {
  return (
    <Link href="/[admin]/[slug]" as={`/${admin}/${slug}`}>
      <a className="list-group-item list-group-item-action">
        {name}
      </a>
    </Link>
  );
}

export default Place;
