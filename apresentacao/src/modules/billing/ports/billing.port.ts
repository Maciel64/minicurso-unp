export interface CustomerReturn {
  id: string;
  name: string;
}

export interface BillingReturn {
  id: string;
  link: string;
}

export type CreateCustomerPayload = {
  name: string;
  email: string;
  cpf: string;
}

export type CreateBillingPayload = {
  customer: string;
  value: number;
  dueDate: string;
}

export interface BillingPort {
  getCustomerByEmail(email: string): Promise<CustomerReturn>;
  createCustomer(data: CreateCustomerPayload): Promise<CustomerReturn>;
  createBilling(data: CreateBillingPayload): Promise<BillingReturn>;
}