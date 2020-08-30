import Place from './place';

function Admin({ name, slug, places }) {
  // @TODO Localize the names?
  return (
    <>
      <div className="list-group-item">
        <h4>{name}</h4>
      </div>
      {places.map(({ id, slug: itemSlug, name: itemName }) => (
        <Place key={id} admin={slug} slug={itemSlug} name={itemName} />
      ))}
    </>
  );
}

export default Admin;
