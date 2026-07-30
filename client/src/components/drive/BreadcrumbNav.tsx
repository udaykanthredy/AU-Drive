import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface BreadcrumbItem {
  _id: string;
  name: string;
}

interface BreadcrumbNavProps {
  paths: BreadcrumbItem[];
}

export function BreadcrumbNav({ paths }: BreadcrumbNavProps) {
  return (
    <nav className="flex items-center space-x-1 text-xl mb-4 font-bold uppercase">
      <Link
        href="/dashboard"
        className="text-black hover:bg-neo-yellow border-2 border-transparent hover:border-black transition-colors px-2 py-1 rounded-none shadow-sm"
      >
        My Drive
      </Link>
      
      {paths.map((path, index) => (
        <div key={path._id} className="flex items-center">
          <ChevronRight className="w-5 h-5 text-black mx-1 flex-shrink-0 stroke-[3]" />
          {index === paths.length - 1 ? (
            <span className="text-black font-bold px-2 py-1 cursor-default border-2 border-transparent">
              {path.name}
            </span>
          ) : (
            <Link
              href={`/dashboard?folder=${path._id}`}
              className="text-black hover:bg-neo-yellow border-2 border-transparent hover:border-black transition-colors px-2 py-1 rounded-none"
            >
              {path.name}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
