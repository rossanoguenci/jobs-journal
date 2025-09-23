import Props from './props.types';
import { variantClassMap } from './variants';

export default function Component(props: Props){
    const variant = props.variant ?? 'default';
    const className = variantClassMap[variant] ?? '';

    return(
        <li className={className}>
            {props.children}
        </li>
    );
}
