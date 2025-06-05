import Props from './props.types';
import styles from "./styles.module.scss";

export default function Component({ title, children, className = '' }: Props) {
    return (
        <section className={`${styles.container} ${className}`}>
            <h2>{title}</h2>
            {children}
        </section>
    );
}
