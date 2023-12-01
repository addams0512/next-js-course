import { unstable_noStore as noStore } from "next/cache";
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

    const latestInvoices = await fetch(
      "http://127.0.0.1:8000/api/invoice-list/",
    );
    const data = await latestInvoices.json();
    console.log(data);

    return data.slice(0, 6);
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
    const invoices_data = await fetch(
      "http://127.0.0.1:8000/api/invoice-list/",
    );
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
    const invoices_data = await fetch(
      "http://127.0.0.1:8000/api/invoice-list/",
    );
    const invoices = await invoices_data.json();
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    const filteredInvoices = invoices
      .filter((invoice: any) => {
        if (
          invoice.customer.name.includes(query.toLowerCase()) ||
          invoice.customer.email.includes(query.toLowerCase()) ||
          invoice.amount.includes(query.toLowerCase()) ||
          invoice.date.includes(query.toLowerCase()) ||
          invoice.status.includes(query.toLowerCase())
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
    const invoices_data = await fetch(
      "http://127.0.0.1:8000/api/invoice-list/",
    );
    const invoices = await invoices_data.json();

    const filteredInvoices = invoices.filter((invoice: any) => {
      if (
        invoice.customer.name.includes(query) ||
        invoice.customer.email.includes(query) ||
        invoice.amount.includes(query) ||
        invoice.date.includes(query) ||
        invoice.status.includes(query)
      ) {
        return invoice;
      }
    });

    const totalPages = Math.ceil(
      Number(filteredInvoices.length) / ITEMS_PER_PAGE,
    );

    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of invoices.");
  }
}

export async function fetchInvoiceById(id: number) {
  noStore();
  try {
    const data_invoices = await fetch(
      `http://127.0.0.1:8000/api/invoice-list/${id}`,
    );
    const data = await data_invoices.json();

    return data;
  } catch (error) {
    console.error("Database Error:", error);
  }
}

export async function fetchCustomers() {
  noStore();
  try {
    const customers_data = await fetch("http://127.0.0.1:8000/api/customers/");
    const customers = await customers_data.json();
    const data = customers.sort(function (a: any, b: any) {
      const nameA = a.name.toLowerCase(); // Convert names to lowercase for case-insensitive sorting
      const nameB = b.name.toLowerCase();

      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      // names must be equal
      return 0;
    });
    return data;
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
