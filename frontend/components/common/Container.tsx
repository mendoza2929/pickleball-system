import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
}

export default function Container({
  children,
  className = "",
}: Props) {
  return (
    <div
      className={`
        container-width
        px-6
        lg:px-8
        ${className}
      `}
    >
      {children}
    </div>
  );
}