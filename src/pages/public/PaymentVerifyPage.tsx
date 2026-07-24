import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { intelligenceApi } from "../../api/intelligenceApi";
import { listingsApi } from "../../api/listings.api";
import LoadingSpinner from "../../components/shared/LoadingSpinner";
import PageWrapper from "../../components/layout/PageWrapper";

const formatPlanLabel = (plan: string) => {
  const normalized = plan.toLowerCase();
  const labels: Record<string, string> = {
    starter: "Starter",
    growth: "Growth",
    pro: "Pro",
  };

  return labels[normalized] ?? plan;
};

export default function PaymentVerifyPage() {
  const [searchParams] = useSearchParams();
  const reference = useMemo(
    () =>
      searchParams.get("reference") || searchParams.get("trxref") || undefined,
    [searchParams],
  );
  const returnUrl = useMemo(
    () => searchParams.get("returnUrl") || "/",
    [searchParams],
  );
  const flow = useMemo(() => {
    const top = searchParams.get('flow');
    if (top) return top;
    const returnParam = searchParams.get('returnUrl');
    if (returnParam) {
      try {
        // returnParam is an encoded path like "/agent/listings/new?flow=listing-plan"
        const parts = returnParam.split('?');
        const qs = parts[1] ?? '';
        const p = new URLSearchParams(qs);
        const f = p.get('flow');
        if (f) return f;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        // ignore parse errors
      }
    }
    return window.location.pathname.includes('/listings') ? 'listing-plan' : 'intelligence';
  }, [searchParams]);
  const [loading, setLoading] = useState(Boolean(reference));
  const [message, setMessage] = useState(
    reference ? "Verifying your payment..." : "Payment reference missing.",
  );
  const [success, setSuccess] = useState(false);
  const [planName, setPlanName] = useState<string | null>(null);
  const [quotaLimit, setQuotaLimit] = useState<number | null>(null);

  useEffect(() => {
    if (!reference) return;

    const verify = async () => {
      try {
        const res = await (flow === "listing-plan"
          ? listingsApi.verifyListingPlanSubscription(reference, returnUrl)
          : intelligenceApi.verifySubscription(reference, returnUrl));
        const returnPath = res.returnUrl || "/";
        const plan = (res as { plan?: string }).plan;
        const quota = (res as { listingQuotaLimit?: number }).listingQuotaLimit;

        if (plan) {
          setPlanName(formatPlanLabel(plan));
        }
        if (typeof quota === "number") {
          setQuotaLimit(quota);
        }

        setMessage(
          plan
            ? `Payment successful! You are now on the ${formatPlanLabel(plan)} plan${typeof quota === "number" ? ` with ${quota} listing slot${quota === 1 ? "" : "s"}` : ""}.`
            : "Payment confirmed! Redirecting you back now...",
        );
        setSuccess(true);

        window.setTimeout(() => {
          window.location.href = returnPath;
        }, 3000);
      } catch (err) {
        console.error(err);
        setMessage(
          "We could not verify your payment yet. Please return to Paystack and complete the transaction.",
        );
      } finally {
        setLoading(false);
      }
    };

    void verify();
    }, [flow, reference, returnUrl]);

  return (
    <PageWrapper className="py-24">
      <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-[#0A1628] p-10 text-center shadow-[0_24px_80px_-36px_rgba(0,0,0,0.9)]">
        <h1 className="text-2xl font-bold text-white mb-4">
          Paystack payment verification
        </h1>
        <p className="text-sm text-slate-300 mb-6">{message}</p>
        {success && planName && (
          <div className="mb-6 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            Your plan access has been updated. You will be returned to the form shortly.
            {quotaLimit !== null && (
              <span className="mt-1 block">You now have {quotaLimit} listing slot{quotaLimit === 1 ? "" : "s"} available.</span>
            )}
          </div>
        )}
        {loading ? (
          <div className="flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              if (success) {
                const fallbackPath = searchParams.get("returnUrl") || "/";
                window.location.href = fallbackPath;
                return;
              }
              window.location.href = "/";
            }}
            className="rounded-full bg-[#00C9A7] px-6 py-3 font-semibold text-[#0A1628] transition hover:bg-[#00b396]"
          >
            {success ? "Continue" : "Return home"}
          </button>
        )}
      </div>
    </PageWrapper>
  );
}
