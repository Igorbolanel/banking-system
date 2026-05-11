interface PlaceholderPageProps {
  title: string;
  description: string;
}

function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <section className="card placeholder-page">
      <h2 className="card__title">{title}</h2>
      <p>{description}</p>
    </section>
  );
}

export default PlaceholderPage;