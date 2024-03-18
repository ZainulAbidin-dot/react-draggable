"use client";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Form as FormComponent, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImSpinner2 } from "react-icons/im";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formSchemaWithoutPageName, formSchemaWithoutPageNameType } from "@/schemas/form";
// import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
// import { CreateForm, CreatePageFormBridge } from "@/actions/form";
// import router from "next/router";
import { BsFileEarmarkPlus } from "react-icons/bs";
import { handleFormSubmit } from "@/actions/form";
import { experimental_useFormStatus as useFormStatus } from "react-dom";

function NewFormBtn({ pageId }: { pageId: number }) {
  const form = useForm<formSchemaWithoutPageNameType>({
    resolver: zodResolver(formSchemaWithoutPageName),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const handleFormSubmitWithPageId = handleFormSubmit.bind(null, pageId);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={"outline"}
          className="group border border-primary/20 h-[190px] items-center justify-center flex flex-col hover:border-primary hover:cursor-pointer border-dashed gap-4"
        >
          <BsFileEarmarkPlus className="h-8 w-8 text-muted-foreground group-hover:text-primary" />
          <p className="font-bold text-xl text-muted-foreground group-hover:text-primary">New Form</p>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <FormComponent {...form}>
          <form action={handleFormSubmitWithPageId} className="space-y-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Form Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={5} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormSubmitButton />
          </form>
        </FormComponent>
      </DialogContent>
    </Dialog>
  );
}

function FormSubmitButton({}) {
  const status = useFormStatus();

  return (
    <Button className="w-full mt-4" type="submit" disabled={status.pending}>
      {status.pending ? <ImSpinner2 className="animate-spin" /> : "Save"}
    </Button>
  );
}

export default NewFormBtn;
