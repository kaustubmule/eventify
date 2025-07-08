import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="border-t bg-white">
      <div className="flex flex-col items-center justify-between gap-4 p-6 text-center sm:flex-row w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Link href="/" className="text-2xl font-bold text-blue-600">
          Eventify
        </Link>

        <p>© 2025 Eventify. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
