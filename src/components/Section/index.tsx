import { Container } from '@Components/Container';
import type React from 'react';
import type { PropsWithChildren } from 'react';
import { cn } from '@/lib/utils';

type Props = PropsWithChildren & {
  id?: string;
  className?: string;
  containerClassName?: string;
  as?: React.ElementType;
  noContainer?: boolean;
};

export const Section = ({
  children,
  id,
  className,
  containerClassName,
  as: Tag = 'section',
  noContainer = false
}: Props): React.JSX.Element => {
  // biome-ignore lint/suspicious/noExplicitAny: as="..." không ràng buộc; sau khi scene 3D (react-three-fiber) thêm hàng trăm intrinsic element vào JSX.IntrinsicElements toàn cục, TypeScript suy ra children của Tag là `never` — ép kiểu tại chỗ render để giữ hành vi cũ.
  const TagElement = Tag as any;
  return (
    <TagElement id={id} className={cn('relative py-16 md:py-24 lg:py-32', className)}>
      {noContainer ? children : <Container className={containerClassName}>{children}</Container>}
    </TagElement>
  );
};

export default Section;
