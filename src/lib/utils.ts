// src/lib/utils.ts
export const cn = (...classes: string[]) => {
    return classes.filter(Boolean).join(' ');
};