import { signIn } from "@/lib/auth";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ALLOWED_EMAIL_DOMAIN } from "@/lib/config";

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/");

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-paper px-5">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-[14px] flex items-center justify-center"
            style={{
              background: "#E0512F",
              boxShadow: "0 5px 14px rgba(224,81,47,.34)",
            }}
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2.1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 3v7M5 3v4a2 2 0 002 2M9 3v4a2 2 0 01-2 2M7 11v10M17 3c-1.5 0-2.5 2-2.5 5s1 4 2.5 4 2.5-1 2.5-4S18.5 3 17 3zM17 13v8" />
            </svg>
          </div>
          <div>
            <div className="font-display font-bold text-2xl text-ink tracking-tight">
              LunchVote
            </div>
            <div className="text-[13px] text-mut mt-0.5">
              Ranked-choice lunch decisions
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="w-full bg-card rounded-card border border-line2 shadow-card p-7">
          <h1 className="font-display font-bold text-[22px] text-ink mb-1">
            Sign in
          </h1>
          <p className="text-[13.5px] text-mut mb-6 leading-relaxed">
            Only <strong>@{ALLOWED_EMAIL_DOMAIN}</strong> accounts are allowed.
          </p>

          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 bg-card border border-line rounded-btn py-[15px] px-4 font-body font-bold text-base text-ink cursor-pointer transition-transform active:scale-[0.98]"
              style={{ boxShadow: "0 1px 3px rgba(34,26,20,.08)" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
