import { FC } from 'react';
import Icons from './icons';
import type { IconProps } from './props.types';

const default_size = 'size-4';

const Component: FC<IconProps> = ({ name = 'default', className = '' }) => {
    const iconKey = name in Icons ? name : 'default';

    const Icon = Icons[iconKey];

    if (!Icon) return null;

    const hasSizeClass = /\b(size-|w-|h-)\d+/.test(className);
    const finalClassName = hasSizeClass ? className : `${className} ${default_size}`.trim();
    
    return <Icon className={`${finalClassName}`} />;
};

export default Component;