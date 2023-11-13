import { sql } from "@vercel/postgres";
import { unstable_noStore as noStore } from "next/cache";
import {
  CustomerField,
  CustomersTable,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  User,
  Revenue,
} from "./definitions";
import { formatCurrency } from "./utils";

export async function fetchRevenue() {
  // Add noStore() here prevent the response from being cached.
  // This is equivalent to in fetch(..., {cache: 'no-store'}).
  noStore();

  try {
    console.log("Fetching revenue data");
    await new Promise((revenue) => setTimeout(revenue, 4000));
    console.log("Data fetch complete after 4 seconds.");

    const data = await fetch("http://127.0.0.1:8000/api/revenue/");

    return data.json();
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch revenue data.");
  }
}

export async function fetchLatestInvoices() {
  noStore();
  try {
    console.log("Fetching invoices data");
    await new Promise((invoice) => setTimeout(invoice, 5000));
    console.log("Data fetch complete after 5 seconds.");

    const latestInvoices = await fetch("http://127.0.0.1:8000/api/invoice/");
    const data = await latestInvoices.json();

    return data;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch the latest invoices.");
  }
}

export async function fetchCardData() {
  noStore();
  try {
    console.log("Fecthing card data");
    await new Promise((card) => setTimeout(card, 3000));
    console.log("Card data fecth complete after 3 seconds.");

    const customers_data = await fetch("http://127.0.0.1:8000/api/customers/");
    const invoices_data = await fetch("http://127.0.0.1:8000/api/invoices/");
    const customers = await customers_data.json();
    const invoices = await invoices_data.json();

    const numberOfCustomers = Number(customers.length ?? "0");
    const numberOfInvoices = Number(invoices.length ?? "0");
    const totalPaidInvoices = formatCurrency(
      invoices.reduce((total: number, invoice: any) => {
        if (invoice.status == "paid") {
          return total + Number(invoice.amount);
        }
        return total;
      }, 0),
    );
    const totalPendingInvoices = formatCurrency(
      invoices.reduce((total: number, invoice: any) => {
        if (invoice.status == "pending") {
          return total + Number(invoice.amount);
        }
        return total;
      }, 0),
    );
    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to card data.");
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  noStore();
  try {
    const invoices_data = await fetch("http://127.0.0.1:8000/api/searchi/");
    const invoices = await invoices_data.json();
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    const filteredInvoices = invoices
      .filter((invoice: any) => {
        if (
          invoice.name.includes(query) ||
          invoice.email.includes(query) ||
          invoice.amount.includes(query) ||
          invoice.date.includes(query) ||
          invoice.status === query
        ) {
          return invoice;
        }
      })
      .slice(startIndex, endIndex);

    return filteredInvoices;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoices.");
  }
}

export async function fetchInvoicesPages(query: string) {
  noStore();
  try {
    const count = await sql`SELECT COUNT(*)
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE
      customers.name ILIKE ${`%${query}%`} OR
      customers.email ILIKE ${`%${query}%`} OR
      invoices.amount::text ILIKE ${`%${query}%`} OR
      invoices.date::text ILIKE ${`%${query}%`} OR
      invoices.status ILIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of invoices.");
  }
}

export async function fetchInvoiceById(id: string) {
  noStore();
  try {
    const data = await sql<InvoiceForm>`
      SELECT
        invoices.id,
        invoices.customer_id,
        invoices.amount,
        invoices.status
      FROM invoices
      WHERE invoices.id = ${id};
    `;

    const invoice = data.rows.map((invoice) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
    }));

    return invoice[0];
  } catch (error) {
    console.error("Database Error:", error);
  }
}

export async function fetchCustomers() {
  noStore();
  try {
    const data = await sql<CustomerField>`
      SELECT
        id,
        name
      FROM customers
      ORDER BY name ASC
    `;

    const customers = data.rows;
    return customers;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all customers.");
  }
}

export async function fetchFilteredCustomers(query: string) {
  noStore();
  try {
    const data = await sql<CustomersTable>`
		SELECT
		  customers.id,
		  customers.name,
		  customers.email,
		  customers.image_url,
		  COUNT(invoices.id) AS total_invoices,
		  SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
		  SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
		FROM customers
		LEFT JOIN invoices ON customers.id = invoices.customer_id
		WHERE
		  customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`}
		GROUP BY customers.id, customers.name, customers.email, customers.image_url
		ORDER BY customers.name ASC
	  `;

    const customers = data.rows.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending),
      total_paid: formatCurrency(customer.total_paid),
    }));

    return customers;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch customer table.");
  }
}

export async function getUser(email: string) {
  noStore();
  try {
    const user = await sql`SELECT * from USERS where email=${email}`;
    return user.rows[0] as User;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    throw new Error("Failed to fetch user.");
  }
}
