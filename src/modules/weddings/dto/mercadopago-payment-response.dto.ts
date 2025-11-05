export interface MercadoPagoPaymentResponse {
  id: number;
  status: string;
  status_detail?: string;
  payment_method_id: string;
  payment_type_id: string;
  transaction_amount: number;
  date_approved?: string;
  date_created: string;
  date_last_updated: string;
  point_of_interaction?: {
    transaction_data?: {
      qr_code?: string;
      qr_code_base64?: string;
    };
  };
  [key: string]: any;
} 