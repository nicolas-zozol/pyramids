import Link from "next/link";

export const Header = () => {
    return (
        <header className="bg-gray-900 text-white p-4">
            <nav className="container mx-auto flex justify-between items-center">
                <div className="text-xl font-bold">Dakar Surf</div>
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