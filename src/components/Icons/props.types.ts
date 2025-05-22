import type Icons from './icons';

export type IconName = keyof typeof Icons;

export interface IconProps {
    name?: IconName;
    className?: string;
}
