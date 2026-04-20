import CoachForm from "@/components/admin/CoachForm";
import Link from "next/link";

export default function NewCoachPage() {
  return (
    <div className="p-8">
      <div className="flex items-center gap-2 mb-8">
        <Link href="/admin/coaches" className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-tbwr-gold transition-colors">
          Coaches
        </Link>
        <span className="text-gray-600">→</span>
        <span className="text-xs font-bold uppercase tracking-widest text-tbwr-white">New Coach</span>
      </div>

      <div className="max-w-xl">
        <h1 className="tbwr-heading-md text-tbwr-white mb-8">Add Coach</h1>
        <CoachForm />
      </div>
    </div>
  );
}
