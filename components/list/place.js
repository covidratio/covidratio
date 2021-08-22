import Link from 'next/link';

function Place({
  admin, slug, label, ratio,
}) {
  let ratioBadge;

  if (ratio !== 0) {
    ratioBadge = (
      <span className="badge bg-secondary text-primary">{ratio.toLocaleString()}</span>
    );
  }

  return (
    <Link href="/[admin]/[slug]" as={`/${admin}/${slug}`}>
      <a className="list-group-item list-group-item-action d-flex justify-content-between">
        <span>{label}</span>
        {ratioBadge}
      </a>
    </Link>
  );
}

export default Place;
