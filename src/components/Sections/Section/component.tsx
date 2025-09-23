import Props from './props.types';

export default function Component({ title, children, className = '' }: Props) {
    return (
        <section className={`container container-bg ${className}`}>
            <h2 className="font-semibold">{title}</h2>
            <div className="mt-3">{children}</div>
        </section>
    );
}
