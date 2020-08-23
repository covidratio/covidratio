import useLocaleLabel from "../hooks/local-label";

function GroupItem({ id, label }) {
  return (
    <a href="#" className="list-group-item list-group-item-action">
      {label}
    </a>
  );
}

export default GroupItem;
