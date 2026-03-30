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
    <nav className="flex items-center space-x-1 text-lg mb-4">
      <Link
        href="/dashboard"
        className="text-gray-200 hover:text-brand-400 font-medium transition-colors px-2 py-1 rounded-md hover:bg-gray-800"
      >
        My Drive
      </Link>
      
      {paths.map((path, index) => (
        <div key={path._id} className="flex items-center">
          <ChevronRight className="w-4 h-4 text-gray-500 mx-1 flex-shrink-0" />
          {index === paths.length - 1 ? (
            <span className="text-gray-100 font-semibold px-2 py-1 cursor-default">
              {path.name}
            </span>
          ) : (
            <Link
              href={`/dashboard?folder=${path._id}`}
              className="text-gray-200 hover:text-brand-400 font-medium transition-colors px-2 py-1 rounded-md hover:bg-gray-800"
            >
              {path.name}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
