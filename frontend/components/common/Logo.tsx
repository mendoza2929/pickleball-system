import Image from "next/image";
import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <Image
        src="/images/Hero.png"
        alt="RVS Pickleball"
        width={52}
        height={52}
        className="rounded-full"
      />

      <div>
        <h2 className="text-xl font-black text-white">
          RVS
        </h2>

        <p className="text-xs text-slate-400">
          Pickleball Club
        </p>
      </div>
    </Link>
  );
}