import Link from "next/link";
import { IconBrandGithub } from "@tabler/icons-react";

export default function Footer() {
  return (
    <footer className="flex flex-col justify-center items-center gap-2 px-6 md:px-10 py-2 md:py-4 max-h-20 w-full text-sm border-t text-gray-700 dark:text-gray-300">
      <div>
        Developed & Maintained by{" "}
        <Link
          href="https://itskdhere.com"
          className="underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          KD
        </Link>
      </div>

      <div>
        <Link
          href="https://github.com/itskdhere/NoBG"
          target="_blank"
          rel="noopener noreferrer"
          className="flex justify-center items-center gap-1 underline"
        >
          <IconBrandGithub className="size-3.5" />
          <span>itskdhere/NoBG</span>
        </Link>
      </div>
    </footer>
  );
}
