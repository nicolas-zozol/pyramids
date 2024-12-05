import Link from 'next/link';

export const Header = () => {
  return (
    <header className="bg-background-hero text-white p-4">
      <nav className=" flex justify-between items-center">
        <div className="text-xl font-bold">Dakar.🏄‍</div>
        <ul className="flex space-x-4">
          <li>
            <Link href="/" className="hover:text-gray-400">
              Home
            </Link>
          </li>
          <li>
            <Link href="/about" className="hover:text-gray-400">
              About
            </Link>
          </li>
          <li>
            <Link href="/contact" className="hover:text-gray-400">
              Contact
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};
