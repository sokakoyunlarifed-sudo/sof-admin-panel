import Image from "next/image";

export function Logo() {
  return (
    <div className="flex items-center gap-3 max-w-full">
      <Image
        src="/logo/logo.jpg"
        alt="SOF Admin Panel logo"
        width={40}
        height={40}
        className="rounded"
        quality={100}
      />
      <span className="truncate text-lg font-bold text-dark dark:text-white md:text-xl">
        SOF Admin Panel
      </span>
    </div>
  );
}
