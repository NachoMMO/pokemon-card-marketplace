export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'bank_transfer' | 'wallet';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  isValid: boolean;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'processing' | 'succeeded' | 'canceled';
  clientSecret?: string;
  metadata?: Record<string, any>;
}

export interface CreatePaymentDTO {
  amount: number;
  currency: string;
  paymentMethodId?: string;
  description?: string;
  metadata?: Record<string, any>;
  customerId?: string;
}

export interface RefundDTO {
  paymentIntentId: string;
  amount?: number; // Si no se especifica, se reembolsa el total
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
  metadata?: Record<string, any>;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'credit' | 'debit';
  amount: number;
  currency: string;
  description: string;
  referenceId?: string; // ID de compra, venta, etc.
  createdAt: Date;
}

export interface IPaymentService {
  /**
   * Crea un intent de pago
   * @param paymentData - Datos del pago
   * @returns Intent de pago creado
   */
  createPaymentIntent(paymentData: CreatePaymentDTO): Promise<{
    success: boolean;
    paymentIntent?: PaymentIntent;
    error?: string;
  }>;

  /**
   * Confirma un pago
   * @param paymentIntentId - ID del intent de pago
   * @param paymentMethodId - ID del método de pago
   * @returns Resultado de la confirmación
   */
  confirmPayment(paymentIntentId: string, paymentMethodId?: string): Promise<{
    success: boolean;
    paymentIntent?: PaymentIntent;
    error?: string;
  }>;

  /**
   * Cancela un intent de pago
   * @param paymentIntentId - ID del intent de pago
   * @returns true si se canceló
   */
  cancelPaymentIntent(paymentIntentId: string): Promise<boolean>;

  /**
   * Procesa un reembolso
   * @param refundData - Datos del reembolso
   * @returns Resultado del reembolso
   */
  processRefund(refundData: RefundDTO): Promise<{
    success: boolean;
    refundId?: string;
    amount?: number;
    error?: string;
  }>;

  /**
   * Obtiene métodos de pago de un usuario
   * @param customerId - ID del cliente
   * @returns Lista de métodos de pago
   */
  getPaymentMethods(customerId: string): Promise<PaymentMethod[]>;

  /**
   * Añade un nuevo método de pago
   * @param customerId - ID del cliente
   * @param paymentMethodData - Datos del método de pago
   * @returns Método de pago creado
   */
  addPaymentMethod(customerId: string, paymentMethodData: any): Promise<{
    success: boolean;
    paymentMethod?: PaymentMethod;
    error?: string;
  }>;

  /**
   * Elimina un método de pago
   * @param paymentMethodId - ID del método de pago
   * @returns true si se eliminó
   */
  removePaymentMethod(paymentMethodId: string): Promise<boolean>;

  /**
   * Establece un método de pago como predeterminado
   * @param customerId - ID del cliente
   * @param paymentMethodId - ID del método de pago
   * @returns true si se estableció como predeterminado
   */
  setDefaultPaymentMethod(customerId: string, paymentMethodId: string): Promise<boolean>;

  // Métodos para manejo de wallet interno
  /**
   * Obtiene el balance de la wallet de un usuario
   * @param userId - ID del usuario
   * @param currency - Moneda (por defecto USD)
   * @returns Balance actual
   */
  getWalletBalance(userId: string, currency?: string): Promise<{
    balance: number;
    currency: string;
    lastUpdated: Date;
  }>;

  /**
   * Añade fondos a la wallet de un usuario
   * @param userId - ID del usuario
   * @param amount - Cantidad a añadir
   * @param description - Descripción de la transacción
   * @param referenceId - ID de referencia (ej: venta)
   * @returns Transacción creada
   */
  creditWallet(
    userId: string,
    amount: number,
    description: string,
    referenceId?: string
  ): Promise<{
    success: boolean;
    transaction?: WalletTransaction;
    newBalance?: number;
    error?: string;
  }>;

  /**
   * Deduce fondos de la wallet de un usuario
   * @param userId - ID del usuario
   * @param amount - Cantidad a deducir
   * @param description - Descripción de la transacción
   * @param referenceId - ID de referencia (ej: compra)
   * @returns Transacción creada
   */
  debitWallet(
    userId: string,
    amount: number,
    description: string,
    referenceId?: string
  ): Promise<{
    success: boolean;
    transaction?: WalletTransaction;
    newBalance?: number;
    error?: string;
  }>;

  /**
   * Transfiere fondos entre usuarios
   * @param fromUserId - ID del usuario que envía
   * @param toUserId - ID del usuario que recibe
   * @param amount - Cantidad a transferir
   * @param description - Descripción de la transferencia
   * @param referenceId - ID de referencia
   * @returns Resultado de la transferencia
   */
  transferFunds(
    fromUserId: string,
    toUserId: string,
    amount: number,
    description: string,
    referenceId?: string
  ): Promise<{
    success: boolean;
    fromTransaction?: WalletTransaction;
    toTransaction?: WalletTransaction;
    error?: string;
  }>;

  /**
   * Obtiene historial de transacciones de wallet
   * @param userId - ID del usuario
   * @param limit - Límite de transacciones
   * @param offset - Offset para paginación
   * @returns Lista de transacciones
   */
  getWalletTransactions(
    userId: string,
    limit?: number,
    offset?: number
  ): Promise<{
    transactions: WalletTransaction[];
    total: number;
  }>;
}
