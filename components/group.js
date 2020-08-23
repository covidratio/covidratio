import useLocalItems from "../hooks/local-item";
import GroupItem from './group-item';
import useLocaleLabel from '../hooks/local-label';

function Group({ labels, items }) {
  const label = useLocaleLabel(labels);
  const localItems = useLocalItems(items);

  return (
    <>
      <h4 className="list-group-item">{label}</h4>
      {localItems.map(({ id, label: itemLabel }) => (
        <GroupItem key={id} id={id} label={itemLabel} />
      ))}
    </>
  );
}

export default Group;
