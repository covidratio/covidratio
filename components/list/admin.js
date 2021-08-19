import Place from './place';

function Admin({ name, slug, places }) {
  // @TODO Localize the names?
  return (
    <>
      <div className="list-group-item">
        <h4>{name}</h4>
      </div>
      {places.map(({ slug: itemSlug, label: itemLabel }) => (
        <Place key={`${slug}/${itemSlug}`} admin={slug} slug={itemSlug} label={itemLabel} />
      ))}
    </>
  );
}

export default Admin;
