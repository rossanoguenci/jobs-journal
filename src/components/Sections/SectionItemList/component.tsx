import Props from './props.types';
import styles from "./styles.module.scss";

export default function Component({children}: Props){

    return(
        <li className={styles.container}>
            {children}
        </li>
    );
}
