import { z } from "zod";



export const formSchemaWithoutPageName = z.object({
  name: z.string().min(4),
  description: z.string().optional(),
});

export const formSchema = formSchemaWithoutPageName.extend({
  pageName: z.string().min(4),
})

export type formSchemaType = z.infer<typeof formSchema>;
export type formSchemaWithoutPageNameType = z.infer<typeof formSchemaWithoutPageName>;
