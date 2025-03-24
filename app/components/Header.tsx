import { HeaderSearch } from "./HeaderSearch";
import Link from "next/link";

export function Header() {
  return (
    <header className="h-16 p-3 bg-gray-800 text-white  w-full fixed top-o left-0 z-10">
      <nav className="flex flex-wrap justify-between flex-1 items-center">
        <div className="gap-xs">FindMyPrebuilt</div>
        <HeaderSearch />
        <ul className="flex justify-around flex-wrap">
          <Li href="/" text="Home" />
          <Li href="/prebuilt/overview/" text="Review" />
          <Li href="/about" text="About" />
        </ul>
      </nav>
    </header>
  );
}

const Li = ({ href, text }: { href: string; text: string }) => (
  <li className="p-2">
    <Link href={href} prefetch={false}>{text}</Link>
  </li>
);
