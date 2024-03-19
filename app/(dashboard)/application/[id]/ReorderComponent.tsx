"use client";

import React, { useState } from "react";
import { Reorder } from "framer-motion";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistance } from "date-fns";
import { Button } from "@/components/ui/button";
import { BiEditAlt } from "react-icons/bi";
import Link from "next/link";
import { Form } from "@prisma/client";

interface Props {
  item: string;
}

function FormCard({ form }: { form: Form }) {
  return (
    <Card className="m-4">
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

const ReorderComponent = ({ forms }: { forms: Form[] }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [items, setItems] = useState(forms);

  const handleReorder = (reorderedItems: Form[]) => {
    setItems(reorderedItems);
    setActiveIndex(reorderedItems.findIndex((item) => item === items[activeIndex]));
    console.log(items);
  };

  return (
    <Reorder.Group values={items} onReorder={handleReorder}>
      {items.map((form, index) => (
        <Reorder.Item value={form} key={form.id} id={form.name} onDragStart={() => setActiveIndex(index)}>
          <FormCard key={form.id} form={form} />
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
};

export default ReorderComponent;
