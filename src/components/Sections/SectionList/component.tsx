import Props from './props.types';
import styles from "./styles.module.scss";

export default function Component({children}: Props) {

    return (
        <ul className={styles.container}>
            {children}
        </ul>
    );
}
