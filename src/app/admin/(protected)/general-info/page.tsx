import GeneralInfoForm from "@/components/GeneralInfoForm";
import { getContent } from "@/lib/content";

export default async function GeneralInfoPage() {
  const content = await getContent();

  return (
    <>
      <h1 className="mb-2 text-xl font-semibold text-white">General Info</h1>
      <p className="mb-6 text-sm text-white/60">Company contact details shown in the site footer.</p>

      <GeneralInfoForm contactEmail={content.contactEmail} contactPhone={content.contactPhone} />
    </>
  );
}
