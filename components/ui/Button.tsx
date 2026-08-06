import Link from "next/link";
import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "blue" | "green" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-ink text-white hover:bg-ink-soft active:bg-ink-soft/90 border border-ink",
  blue: "bg-blue text-white hover:bg-blue-dark active:bg-blue-dark border border-blue",
  green:
    "bg-green text-white hover:bg-green-dark active:bg-green-dark border border-green",
  outline:
    "bg-transparent text-ink border border-border hover:border-ink hover:bg-surface",
  ghost: "bg-transparent text-ink hover:bg-surface border border-transparent",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-sm px-3.5 py-2 rounded-lg",
  md: "text-[15px] px-5 py-2.5 rounded-lg",
  lg: "text-base px-6 py-3.5 rounded-xl",
};

const base =
  "inline-flex items-center justify-center gap-2 font-medium transition-colors duration-150 whitespace-nowrap disabled:opacity-50 disabled:pointer-events-none";

interface CommonProps {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
}

interface ButtonAsButton
  extends CommonProps,
    Omit<
      ButtonHTMLAttributes<HTMLButtonElement>,
      "className" | "children"
    > {
  href?: undefined;
}

interface ButtonAsLink extends CommonProps {
  href: string;
}

type ButtonProps = ButtonAsButton | ButtonAsLink;

export default function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    children,
    className = "",
    ...rest
  } = props;

  const classes = `${base} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
