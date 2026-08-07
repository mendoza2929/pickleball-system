import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  `
    inline-flex
    items-center
    justify-center
    whitespace-nowrap
    rounded-full
    text-sm
    font-semibold
    transition-all
    duration-300
    disabled:pointer-events-none
    disabled:opacity-50
    focus-visible:outline-none
    focus-visible:ring-2
    focus-visible:ring-lime-400/40
    active:scale-95
  `,
  {
    variants: {
      variant: {
        default: `
          bg-lime-400
          text-slate-950
          shadow-[0_10px_30px_rgba(180,255,60,.25)]
          hover:bg-lime-300
          hover:scale-105
          hover:shadow-[0_20px_50px_rgba(180,255,60,.45)]
        `,

        secondary: `
          bg-white/5
          backdrop-blur-md
          border
          border-white/10
          text-white
          hover:bg-white/10
          hover:border-lime-400/40
        `,

        outline: `
          border
          border-white/15
          bg-transparent
          text-white
          hover:bg-white/5
          hover:border-lime-400
          hover:text-lime-300
        `,

        ghost: `
          bg-transparent
          text-slate-300
          hover:bg-lime-400/10
          hover:text-lime-300
        `,

        destructive: `
          bg-red-500
          text-white
          hover:bg-red-600
        `,

        link: `
          text-lime-400
          underline-offset-4
          hover:underline
        `,
      },

      size: {
        default: "h-11 px-6",

        sm: "h-9 px-4",

        lg: "h-14 px-8 text-base",

        xl: "h-16 px-10 text-lg",

        icon: "h-11 w-11 rounded-full",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(
          buttonVariants({
            variant,
            size,
          }),
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };