declare module '*.mdx' {
    import type { ComponentProps, ComponentType } from 'react';
    const component: ComponentType<ComponentProps<'div'>>;
    export default component;
  }
  
  declare module '@mdx-js/react' {
    import type { ComponentProps, ComponentType } from 'react';
    export const MDXProvider: ComponentType<ComponentProps<'div'> & {components: any}>;
  }