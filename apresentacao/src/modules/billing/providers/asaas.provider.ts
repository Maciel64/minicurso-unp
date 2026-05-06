import axios, { AxiosInstance } from "axios";
import { BillingPort, BillingReturn, CreateBillingPayload, CreateCustomerPayload, CustomerReturn } from "../ports/billing.port";

export interface AsaasGetClientResponse {
  data: AsaasData[]
}

export interface AsaasData {
  id: string
  name: string
  email: string
  cpfCnpj: string
}

export interface AsaasCreateClientBody {
	name: string
	email: string
	cpfCnpj: string
}

export interface AsaasCreateBillingBody {
	customer: string
	billingType: 'UNDEFINED' | 'PIX' | 'CREDIT_CARD' | 'BOLETO'
	value: number
	dueDate: string
}

export interface AsaasCreateBillingResponse {
  id: string
  invoiceUrl: string
}

export class AsaasProvider implements BillingPort {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: 'https://api-sandbox.asaas.com/v3',
      headers: {
        'Content-Type': 'application/json',
        'access_token': process.env.ASAAS_API_KEY as string,
        "User-Agent": "Minicurso Unp"
      },
    });
  }

  async getCustomerByEmail(email: string) {
    const response = await this.api.get<AsaasGetClientResponse>('/customers', {
      params: { email }
    });
    
    return response.data.data?.[0];
  }

  async createCustomer(data: CreateCustomerPayload): Promise<CustomerReturn> {
    const payload: AsaasCreateClientBody = {
      name: data.name,
      email: data.email,
      cpfCnpj: data.cpf,
    }

    const response = await this.api.post<AsaasData>('/customers', payload);
    
    return response.data;
  }

  async createBilling(data: CreateBillingPayload): Promise<BillingReturn> {
    const payload: AsaasCreateBillingBody = {
      billingType: 'UNDEFINED',
      customer: data.customer,
      dueDate: data.dueDate,
      value: data.value
    }

    const response = await this.api.post<AsaasCreateBillingResponse>('/payments', payload);

    return {
     id: response.data.id,
     link: response.data.invoiceUrl,
    };
  }
}
