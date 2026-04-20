import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-tbwr-black flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-6xl font-black text-tbwr-gold mb-4">404</div>
        <h1 className="tbwr-heading-md text-tbwr-white mb-4">Page Not Found</h1>
        <p className="text-gray-500 text-sm mb-8">
          That page does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="text-xs font-bold uppercase tracking-widest text-tbwr-gold hover:underline"
        >
          ← Return to Home
        </Link>
      </div>
    </div>
  );
}
