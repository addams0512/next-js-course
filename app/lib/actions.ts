"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { signIn } from "@/auth";

const FormSchema = z.object({
  customer_id: z.string({
    invalid_type_error: "Please select a customer.",
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: "Please enter an amount greater than $0." }),
  status: z.enum(["pending", "paid"], {
    invalid_type_error: "Please select an invoice status.",
  }),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ date: true });
const UpdateInvoice = FormSchema.omit({ date: true });

export type State = {
  errors?: {
    customer_id?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createInvoice(prevState: State, formData: FormData) {
  const validateFields = CreateInvoice.safeParse({
    customer_id: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  if (!validateFields.success) {
    return {
      errors: validateFields.error.flatten().fieldErrors,
      message: "Missing Field , Failed to create invoice",
    };
  }

  const date = new Date().toISOString().split("T")[0];
  const { customer_id, amount, status } = validateFields.data;
  const data = {
    customer_id: customer_id,
    amount: amount * 100,
    status: status,
    date: date,
  };

  const apiURL = "http://127.0.0.1:8000/api/invoice-create/";
  try {
    const response = await fetch(apiURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      notFound();
    }

    const responseData = await response.json();
    console.log(responseData);
  } catch (error) {
    return {
      message: "Back-end Error: Failed to Create Invoice",
    };
  }

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function updateInvoice(
  id: number,
  prevState: State,
  formData: FormData,
) {
  const validateFields = UpdateInvoice.safeParse({
    customer_id: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  if (!validateFields.success) {
    return {
      errors: validateFields.error.flatten().fieldErrors,
      message: "Missing fields. Can not update invoice",
    };
  }

  const { customer_id, amount, status } = validateFields.data;
  const amountInCent = amount * 100;
  const date = new Date().toISOString().split("T")[0];

  const data_update = {
    id: id,
    customer_id: customer_id,
    amount: amountInCent,
    status: status,
    date: date,
  };

  const apiURL = `http://127.0.0.1:8000/api/invoice-list/${id}`;

  try {
    const response = await fetch(apiURL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data_update),
    });

    if (!response.ok) {
      console.error(`HTTP error! Status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log({ responseData });
  } catch (error) {
    return { message: "Failed to Update Invoice." };
  }

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function deleteInvoice(id: number) {
  const apiURL = `http://127.0.0.1:8000/api/invoice-list/${id}`;
  try {
    const response = await fetch(apiURL, {
      method: "DELETE",
    });

    if (!response.ok) {
      console.error(`HTTP error! Status: ${response.status}`);
    }

    revalidatePath("/dashboard/invoices");
    return { message: "Deleted Invoice" };
  } catch (error) {
    return { message: "Back-end Error: Failed to Delete Invoice" };
  }
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn("credentials", Object.fromEntries(formData));
  } catch (error) {
    if ((error as Error).message.includes("CredentialsSignin")) {
      return "CredentialsSignin";
    }
    throw error;
  }
}
