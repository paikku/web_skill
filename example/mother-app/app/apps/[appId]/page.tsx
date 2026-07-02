import { notFound } from "next/navigation";
import { getPortalUser } from "@/lib/auth";
import { getManifest } from "@/lib/manifests";
import { IframeTab } from "@/components/IframeTab";

export default async function AppTabPage({
  params,
}: {
  params: Promise<{ appId: string }>;
}) {
  const { appId } = await params;
  const manifest = getManifest(appId);
  if (!manifest?.iframeTab?.enabled || manifest.status === "disabled") {
    notFound();
  }
  const user = await getPortalUser();

  return (
    <IframeTab
      appId={manifest.appId}
      appName={manifest.appName}
      iframeTab={manifest.iframeTab}
      portalLoggedIn={!!user}
    />
  );
}
