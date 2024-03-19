import { GetFormsByPageId } from "@/actions/form";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistance } from "date-fns";
import { Button } from "@/components/ui/button";
import { BiEditAlt } from "react-icons/bi";
import Link from "next/link";
import { Form } from "@prisma/client";
import NewFormBtn from "@/components/NewFormBtn";

import React, { Suspense } from "react";
import ReorderComponent from "./ReorderComponent";

function FormCardSkeleton() {
  return <Skeleton className="border-2 border-primary-/20 h-[190px] w-full" />;
}

function FormCard({ form }: { form: Form }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 justify-between">
          <span className="truncate font-bold">{form.name}</span>
        </CardTitle>
        <CardDescription className="flex items-center justify-between text-muted-foreground text-sm">
          {formatDistance(form.createdAt, new Date(), {
            addSuffix: true,
          })}
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button asChild variant={"secondary"} className="w-full mt-2 text-md gap-4">
          <Link href={`/builder/${form.id}`}>
            Edit Form <BiEditAlt />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

async function ApplicationPage({
  params,
}: {
  params: {
    id: string;
  };
}) {
  const { id } = params;
  const forms = await GetFormsByPageId(Number(id));

  if (!forms) {
    throw new Error("form not found");
  }

  return (
    <div className="container mx-auto pt-4 max-w-2xl">
      <h2 className="text-4xl font-bold text-center">Forms</h2>
      <Separator className="my-6" />
      <div className="grid grid-cols-1 gap-2 justify-center">
        <div className="flex justify-center items-center gap-2 max-w-lg mx-auto">
          <NewFormBtn pageId={Number(id)} />
          <Button>Update Sequence</Button>
        </div>
        <Suspense
          fallback={[1, 2, 3, 4].map((el) => (
            <FormCardSkeleton key={el} />
          ))}
        >
          <ReorderComponent forms={forms} />
        </Suspense>
      </div>
    </div>
  );
}

export default ApplicationPage;
