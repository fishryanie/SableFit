import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { BrandLockup } from "@/components/brand-lockup";
import { LocaleSwitcher } from "@/components/locale-switcher";

export default async function InstallPage() {
  const t = await getTranslations("installPage");

  return (
    <main className="min-h-dvh bg-background">
      <div className="mx-auto flex min-h-dvh w-full max-w-[400px] flex-col px-4 pb-10 pt-4">
        <div className="mb-4 flex items-center justify-between">
          <BrandLockup href="/" markSize={32} wordmarkWidth={146} />
          <LocaleSwitcher />
        </div>

        <div className="rounded-[36px] border border-border bg-background-secondary p-5 shadow-[0_20px_55px_rgba(17,17,17,0.08)]">
          <h1 className="font-heading text-[2rem] font-semibold text-foreground">{t("title")}</h1>
          <p className="mt-3 text-sm leading-6 text-foreground-secondary">{t("body")}</p>
          <ol className="mt-5 space-y-2 pl-5 text-sm leading-6 text-foreground-secondary">
            <li>Open the browser menu or share sheet.</li>
            <li>Choose Install App or Add to Home Screen.</li>
            <li>Launch SableFit from the home screen for the best reminder flow.</li>
          </ol>
        </div>

        <div className="mt-4 overflow-hidden rounded-[32px] border border-border bg-background-secondary p-3 shadow-[0_16px_42px_rgba(17,17,17,0.06)]">
          <Image
            src="/screens/install.svg"
            alt="SableFit install flow preview"
            width={420}
            height={860}
            unoptimized
            className="h-auto w-full rounded-[24px]"
          />
        </div>

        <div className="mt-4 grid grid-cols-[80px_1fr] gap-3 rounded-[28px] border border-border bg-background-secondary p-4 shadow-[0_16px_42px_rgba(17,17,17,0.06)]">
          <Image
            src="/pwa/icon-192.png"
            alt="SableFit app icon"
            width={80}
            height={80}
            className="h-20 w-20 rounded-[24px]"
          />
          <div>
            <p className="font-heading text-lg font-semibold text-foreground">SableFit App Icon</p>
            <p className="mt-1 text-sm leading-6 text-foreground-secondary">
              Custom icon, install-first onboarding, and standalone-friendly artwork are now bundled for the home-screen experience.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
