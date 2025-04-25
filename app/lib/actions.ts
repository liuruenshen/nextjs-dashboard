'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect, RedirectType } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

export interface GeneralErrorState {
  message: string;
}

export type CreateInvoiceErrorState = {
  error?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' })
    .transform((value) => value * 100),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status',
  }),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(
  needRedirect: boolean,
  _prevState: CreateInvoiceErrorState,
  formData: FormData,
): Promise<CreateInvoiceErrorState> {
  const rawFormData = Object.fromEntries(formData.entries());
  const validatedFields = CreateInvoice.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  const { customerId, amount, status } = validatedFields.data;

  const [date] = new Date().toISOString().split('T');

  // Test it out:

  try {
    await sql` INSERT INTO invoices (customer_id, amount, status, date) VALUES (${customerId}, ${amount}, ${status}, ${date})`;
  } catch (e) {
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }

  revalidatePath('/dashboard/invoices');

  if (needRedirect) {
    redirect('/dashboard/invoices');
  }

  return {
    message: 'Created Invoice.',
    error: [] as CreateInvoiceErrorState['error'],
  };
}

const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function updateInvoice(
  needRedirect: boolean,
  id: string,
  _prevState: GeneralErrorState,
  formData: FormData,
): Promise<{ message: string }> {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  try {
    await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amount}, status = ${status}
    WHERE id = ${id}
  `;
  } catch (e) {
    return { message: 'Database Error: Failed to Update Invoice.' };
  }

  revalidatePath('/dashboard/invoices');
  if (needRedirect) {
    redirect('/dashboard/invoices');
  }

  return { message: 'Updated Invoice.' };
}

export async function deleteInvoice(id: string) {
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
    return { message: 'Deleted Invoice.' };
  } catch (e) {
    return {
      message: 'Database Error: Failed to Delete Invoice.',
    };
  }
}

// ...

export async function authenticate(
  _prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch ((error as any).type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}
