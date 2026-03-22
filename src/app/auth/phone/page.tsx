import Image from "next/image";
import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PhoneAuthForm } from "@/components/forms/phone-auth-form";
import { BrandLockup } from "@/components/brand-lockup";
import { LocaleSwitcher } from "@/components/locale-switcher";

export default async function PhoneAuthPage() {
  const session = await getAuthSession();
  if (session) {
    redirect("/app/today");
  }

  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_top,#ffffff,#f4f1ea_48%,#ece6d8_100%)]">
      <div className="mx-auto flex min-h-dvh w-full max-w-[400px] flex-col px-4 pb-10 pt-4">
        <div className="mb-4 flex items-center justify-between">
          <BrandLockup href="/" markSize={32} wordmarkWidth={146} />
          <LocaleSwitcher />
        </div>

        <div className="mb-4 overflow-hidden rounded-[28px] border border-border bg-background-secondary p-3 shadow-[0_16px_42px_rgba(17,17,17,0.06)]">
          <Image
            src="/screens/today.svg"
            alt="SableFit Today screen preview"
            width={420}
            height={860}
            unoptimized
            className="h-auto w-full rounded-[22px]"
          />
        </div>

        <div className="my-auto">
          <PhoneAuthForm />
        </div>
      </div>
    </main>
  );
}
