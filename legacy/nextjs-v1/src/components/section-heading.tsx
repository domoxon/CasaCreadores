type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  lede?: string;
};

export function SectionHeading({ eyebrow, title, lede }: SectionHeadingProps) {
  return (
    <div>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="section-title">{title}</h2>
      {lede ? <p className="section-lede">{lede}</p> : null}
    </div>
  );
}
