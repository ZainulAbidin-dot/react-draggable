"use server";

import prisma from "@/lib/prisma";
import { formSchema, formSchemaType, formSchemaWithoutPageName, formSchemaWithoutPageNameType } from "@/schemas/form";
import { currentUser } from "@clerk/nextjs";
import { redirect } from 'next/navigation'



class UserNotFoundErr extends Error { }

export async function handleFormSubmit(pageId: number, formData: FormData) {
  console.log("Form Submitting");

  const name = formData.get("name");
  const description = formData.get("description");

  console.log({ name, description });

  if (!pageId || typeof pageId !== 'number') {
    return {
      errors: "Page id must be number"
    }
  }

  const validatedFields = formSchemaWithoutPageName.safeParse({ name, description })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const formId = await CreateForm(validatedFields.data);
  const pageFormId = await CreatePageFormBridge(pageId, formId);

  redirect(`/builder/${formId}`)
}

export async function GetFormStats() {
  const user = await currentUser();
  if (!user) {
    throw new UserNotFoundErr();
  }

  const stats = await prisma.form.aggregate({
    where: {
      userId: user.id,
    },
    _sum: {
      visits: true,
      submissions: true,
    },
  });

  const visits = stats._sum.visits || 0;
  const submissions = stats._sum.submissions || 0;

  let submissionRate = 0;

  if (visits > 0) {
    submissionRate = (submissions / visits) * 100;
  }

  const bounceRate = 100 - submissionRate;

  return {
    visits,
    submissions,
    submissionRate,
    bounceRate,
  };
}

export async function CreatePage(data: formSchemaType) {
  const validation = formSchema.safeParse(data);
  if (!validation.success) {
    throw new Error("form not valid");
  }

  const user = await currentUser();
  if (!user) {
    throw new UserNotFoundErr();
  }

  const { pageName: name } = data;

  const page = await prisma.page.create({
    data: {
      userId: user.id,
      name,
    },
  });

  if (!page) {
    throw new Error("something went wrong");
  }

  return page.id;
}


export async function CreateForm(data: formSchemaWithoutPageNameType) {
  const validation = formSchemaWithoutPageName.safeParse(data);
  if (!validation.success) {
    throw new Error("form not valid");
  }

  const user = await currentUser();
  if (!user) {
    throw new UserNotFoundErr();
  }

  const { name, description } = data;

  const form = await prisma.form.create({
    data: {
      userId: user.id,
      name,
      description,
    },
  });

  if (!form) {
    throw new Error("something went wrong");
  }

  return form.id;
}


export async function CreatePageFormBridge(pageId: number, formId: number) {

  const user = await currentUser();
  if (!user) {
    throw new UserNotFoundErr();
  }

  const pageFormBridge = await prisma.formsinPages.create({
    data: {
      pageId,
      formId,
    },
  });

  if (!pageFormBridge) {
    throw new Error("something went wrong");
  }

  return pageFormBridge.id;
}


export async function GetPages() {
  const user = await currentUser();
  if (!user) {
    throw new UserNotFoundErr();
  }

  const pages = await prisma.page.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    }
  });


  return pages;
}

export async function GetForms() {
  const user = await currentUser();
  if (!user) {
    throw new UserNotFoundErr();
  }

  return await prisma.form.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function GetFormsByPageId(pageId: number) {
  const user = await currentUser();
  if (!user) {
    throw new UserNotFoundErr();
  }

  const pageData = await prisma.page.findFirst({
    where: {
      userId: user.id,
      id: pageId
    },
    include: {
      forms: {
        include: {
          form: true
        }
      }
    }
  });

  if (pageData == null) {
    return null;
  }

  return pageData.forms.map(form => form.form);

}

export async function GetFormById(id: number) {
  const user = await currentUser();
  if (!user) {
    throw new UserNotFoundErr();
  }

  return await prisma.form.findUnique({
    where: {
      userId: user.id,
      id,
    },
  });
}

export async function UpdateFormContent(id: number, jsonContent: string) {
  const user = await currentUser();
  if (!user) {
    throw new UserNotFoundErr();
  }

  return await prisma.form.update({
    where: {
      userId: user.id,
      id,
    },
    data: {
      content: jsonContent,
    },
  });
}

export async function PublishForm(id: number) {
  const user = await currentUser();
  if (!user) {
    throw new UserNotFoundErr();
  }

  return await prisma.form.update({
    data: {
      published: true,
    },
    where: {
      userId: user.id,
      id,
    },
  });
}

export async function GetFormContentByUrl(formUrl: string) {
  return await prisma.form.update({
    select: {
      content: true,
    },
    data: {
      visits: {
        increment: 1,
      },
    },
    where: {
      shareURL: formUrl,
    },
  });
}

export async function SubmitForm(formUrl: string, content: string) {
  return await prisma.form.update({
    data: {
      submissions: {
        increment: 1,
      },
      FormSubmissions: {
        create: {
          content,
        },
      },
    },
    where: {
      shareURL: formUrl,
      published: true,
    },
  });
}

export async function GetFormWithSubmissions(id: number) {
  const user = await currentUser();
  if (!user) {
    throw new UserNotFoundErr();
  }

  return await prisma.form.findUnique({
    where: {
      userId: user.id,
      id,
    },
    include: {
      FormSubmissions: true,
    },
  });
}
