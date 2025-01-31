import { CopyButton } from "@/components/CopyButton";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getTenantId } from "@/lib/auth";
import { db, eq, schema } from "@unkey/db";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PropsWithChildren } from "react";
import { DeleteApiButton } from "./DeleteApi";
import { NavLink } from "./navbar";

type Props = PropsWithChildren<{
  params: {
    apiId: string;
  };
}>;

export default async function ApiPageLayout(props: Props) {
  const tenantId = getTenantId();

  const api = await db.query.apis.findFirst({
    where: eq(schema.apis.id, props.params.apiId),
    with: {
      workspace: true,
      keys: true,
    },
  });
  if (!api || api.workspace.tenantId !== tenantId) {
    return redirect("/onboarding");
  }
  const navigation: { name: string; href: string }[] = [
    { name: "Overview", href: `/app/${props.params.apiId}` },
    { name: "Keys", href: `/app/${props.params.apiId}/keys` },
  ];

  return (
    <div>
      <PageHeader
        title={api.name}
        description={"Here is a list of your current API keys"}
        actions={[
          <Badge key="apiId" variant="outline" className="font-mono font-medium">
            {api.id}
            <CopyButton value={api.id} className="ml-2" />
          </Badge>,
          <Link href={`/app/${api.id}/keys/new`}>
            <Button variant="outline">Create Key</Button>
          </Link>,
          <DeleteApiButton key="delete-api" apiId={api.id} apiName={api.name} />,
        ]}
      />
      <div className="-mt-4 md:space-x-4 ">
        {navigation.map((item) => (
          <NavLink key={item.name} href={item.href} label={item.name} />
        ))}
      </div>
      <Separator className="mb-6" />
      {props.children}
    </div>
  );
}
