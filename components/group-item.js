import Link from 'next/link';

function GroupItem({ id, label }) {
  return (
    <Link href={`/place/${id}`}>
      <a className="list-group-item list-group-item-action">
        {label}
      </a>
    </Link>
  );
}

export default GroupItem;
