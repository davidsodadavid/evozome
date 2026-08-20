import CopySubscribersButton from "@/components/CopySubscribersButton";
import DeleteSubscriberButton from "@/components/DeleteSubscriberButton";
import { getSubscribers } from "@/lib/subscribers";

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

export default async function SubscribersPage() {
  const subscribers = await getSubscribers();
  const now = Date.now();

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-white">Subscribers</h1>
        <CopySubscribersButton emails={subscribers.map((s) => s.email)} />
      </div>

      {subscribers.length === 0 ? (
        <p className="text-white/60">No subscribers yet.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-white/10 rounded-md border border-white/10 bg-white/5">
          {subscribers.map((sub) => (
            <li key={sub.email} className="flex items-center justify-between px-4 py-3">
              <div className="flex flex-col">
                <span className="flex items-center gap-2 text-sm font-medium text-white">
                  {sub.email}
                  {now - new Date(sub.subscribedAt).getTime() < THREE_DAYS_MS && (
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
                      style={{ backgroundColor: "rgb(226,224,213)", color: "rgb(20,21,22)" }}
                    >
                      New!
                    </span>
                  )}
                </span>
                <span className="text-xs text-white/40">
                  {new Date(sub.subscribedAt).toLocaleDateString()}
                </span>
              </div>
              <DeleteSubscriberButton email={sub.email} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
