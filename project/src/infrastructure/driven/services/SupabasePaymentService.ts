import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  IPaymentService,
  PaymentMethod,
  PaymentIntent,
  CreatePaymentDTO,
  RefundDTO,
  WalletTransaction
} from '../../../application/ports/services/IPaymentService';

export class SupabasePaymentService implements IPaymentService {
  constructor(private readonly supabase: SupabaseClient) {}

  async createPaymentIntent(paymentData: CreatePaymentDTO): Promise<{
    success: boolean;
    paymentIntent?: PaymentIntent;
    error?: string;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('payment_intents')
        .insert({
          amount: paymentData.amount,
          currency: paymentData.currency,
          payment_method_id: paymentData.paymentMethodId,
          customer_id: paymentData.customerId,
          description: paymentData.description,
          metadata: paymentData.metadata,
          status: 'requires_payment_method',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error al crear intent de pago:', error);
        return { success: false, error: error.message };
      }

      const paymentIntent: PaymentIntent = {
        id: data.id,
        amount: data.amount,
        currency: data.currency,
        status: data.status,
        clientSecret: `pi_${data.id}_secret_${Date.now()}`,
        metadata: data.metadata
      };

      return { success: true, paymentIntent };
    } catch (error) {
      console.error('Error al crear intent de pago:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async confirmPayment(paymentIntentId: string, paymentMethodId?: string): Promise<{
    success: boolean;
    paymentIntent?: PaymentIntent;
    error?: string;
  }> {
    try {
      // Simular procesamiento del pago
      const paymentSuccess = await this.simulatePaymentProcessing();

      const status = paymentSuccess ? 'succeeded' : 'canceled';

      const { data, error } = await this.supabase
        .from('payment_intents')
        .update({
          status,
          payment_method_id: paymentMethodId,
          processed_at: new Date().toISOString()
        })
        .eq('id', paymentIntentId)
        .select()
        .single();

      if (error) {
        console.error('Error al confirmar pago:', error);
        return { success: false, error: error.message };
      }

      const paymentIntent: PaymentIntent = {
        id: data.id,
        amount: data.amount,
        currency: data.currency,
        status: data.status,
        metadata: data.metadata
      };

      return { success: paymentSuccess, paymentIntent };
    } catch (error) {
      console.error('Error al confirmar pago:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async cancelPaymentIntent(paymentIntentId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('payment_intents')
        .update({
          status: 'canceled',
          canceled_at: new Date().toISOString()
        })
        .eq('id', paymentIntentId)
        .in('status', ['requires_payment_method', 'requires_confirmation']);

      return !error;
    } catch (error) {
      console.error('Error al cancelar intent de pago:', error);
      return false;
    }
  }

  async processRefund(refundData: RefundDTO): Promise<{
    success: boolean;
    refundId?: string;
    amount?: number;
    error?: string;
  }> {
    try {
      // Obtener el intent de pago original
      const { data: paymentIntent, error: fetchError } = await this.supabase
        .from('payment_intents')
        .select('*')
        .eq('id', refundData.paymentIntentId)
        .eq('status', 'succeeded')
        .single();

      if (fetchError || !paymentIntent) {
        return { success: false, error: 'Intent de pago no encontrado o no válido para reembolso' };
      }

      const refundAmount = refundData.amount || paymentIntent.amount;

      // Crear reembolso
      const { data: refund, error: refundError } = await this.supabase
        .from('refunds')
        .insert({
          payment_intent_id: refundData.paymentIntentId,
          amount: refundAmount,
          currency: paymentIntent.currency,
          reason: refundData.reason || 'requested_by_customer',
          metadata: refundData.metadata,
          status: 'pending',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (refundError) {
        console.error('Error al crear reembolso:', refundError);
        return { success: false, error: refundError.message };
      }

      // Simular procesamiento del reembolso
      const refundSuccess = await this.simulateRefundProcessing();

      const status = refundSuccess ? 'succeeded' : 'failed';

      await this.supabase
        .from('refunds')
        .update({
          status,
          processed_at: new Date().toISOString()
        })
        .eq('id', refund.id);

      return {
        success: refundSuccess,
        refundId: refund.id,
        amount: refundAmount
      };
    } catch (error) {
      console.error('Error al procesar reembolso:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    try {
      const { data, error } = await this.supabase
        .from('payment_methods')
        .select('*')
        .eq('customer_id', customerId)
        .eq('active', true)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error al obtener métodos de pago:', error);
        return [];
      }

      return (data || []).map(item => ({
        id: item.id,
        type: item.type,
        last4: item.last4,
        brand: item.brand,
        expiryMonth: item.expiry_month,
        expiryYear: item.expiry_year,
        isDefault: item.is_default,
        isValid: item.is_valid
      }));
    } catch (error) {
      console.error('Error al consultar métodos de pago:', error);
      return [];
    }
  }

  async addPaymentMethod(customerId: string, paymentMethodData: any): Promise<{
    success: boolean;
    paymentMethod?: PaymentMethod;
    error?: string;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('payment_methods')
        .insert({
          customer_id: customerId,
          type: paymentMethodData.type,
          last4: paymentMethodData.last4,
          brand: paymentMethodData.brand,
          expiry_month: paymentMethodData.expiryMonth,
          expiry_year: paymentMethodData.expiryYear,
          external_id: paymentMethodData.externalId,
          is_default: paymentMethodData.isDefault || false,
          is_valid: true,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error al agregar método de pago:', error);
        return { success: false, error: error.message };
      }

      // Si es el método por defecto, actualizar otros para que no lo sean
      if (paymentMethodData.isDefault) {
        await this.supabase
          .from('payment_methods')
          .update({ is_default: false })
          .eq('customer_id', customerId)
          .neq('id', data.id);
      }

      const paymentMethod: PaymentMethod = {
        id: data.id,
        type: data.type,
        last4: data.last4,
        brand: data.brand,
        expiryMonth: data.expiry_month,
        expiryYear: data.expiry_year,
        isDefault: data.is_default,
        isValid: data.is_valid
      };

      return { success: true, paymentMethod };
    } catch (error) {
      console.error('Error al crear método de pago:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async removePaymentMethod(paymentMethodId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('payment_methods')
        .update({ active: false })
        .eq('id', paymentMethodId);

      return !error;
    } catch (error) {
      console.error('Error al eliminar método de pago:', error);
      return false;
    }
  }

  async setDefaultPaymentMethod(customerId: string, paymentMethodId: string): Promise<boolean> {
    try {
      // Quitar el default de otros métodos
      await this.supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('customer_id', customerId);

      // Establecer el nuevo default
      const { error } = await this.supabase
        .from('payment_methods')
        .update({ is_default: true })
        .eq('id', paymentMethodId)
        .eq('customer_id', customerId);

      return !error;
    } catch (error) {
      console.error('Error al actualizar método de pago por defecto:', error);
      return false;
    }
  }

  async getWalletBalance(userId: string, currency: string = 'USD'): Promise<{
    balance: number;
    currency: string;
    lastUpdated: Date;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('user_wallets')
        .select('*')
        .eq('user_id', userId)
        .eq('currency', currency)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No existe wallet, crear uno
          const { data: newWallet, error: createError } = await this.supabase
            .from('user_wallets')
            .insert({
              user_id: userId,
              balance: 0,
              currency,
              created_at: new Date().toISOString()
            })
            .select()
            .single();

          if (createError) {
            throw createError;
          }

          return {
            balance: newWallet.balance,
            currency: newWallet.currency,
            lastUpdated: new Date(newWallet.created_at)
          };
        }
        throw error;
      }

      return {
        balance: data.balance,
        currency: data.currency,
        lastUpdated: new Date(data.updated_at || data.created_at)
      };
    } catch (error) {
      console.error('Error al obtener balance de wallet:', error);
      throw error;
    }
  }

  async creditWallet(
    userId: string,
    amount: number,
    description: string,
    referenceId?: string
  ): Promise<{
    success: boolean;
    transaction?: WalletTransaction;
    newBalance?: number;
    error?: string;
  }> {
    try {
      // Crear transacción
      const { data: transaction, error: transactionError } = await this.supabase
        .from('wallet_transactions')
        .insert({
          user_id: userId,
          type: 'credit',
          amount,
          currency: 'USD',
          description,
          reference_id: referenceId,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (transactionError) {
        console.error('Error al crear transacción de wallet:', transactionError);
        return { success: false, error: transactionError.message };
      }

      // Actualizar balance
      const { data: updatedWallet, error: updateError } = await this.supabase
        .rpc('credit_wallet_balance', {
          user_id: userId,
          amount,
          currency: 'USD'
        });

      if (updateError) {
        console.error('Error al actualizar balance:', updateError);
        return { success: false, error: updateError.message };
      }

      const walletTransaction: WalletTransaction = {
        id: transaction.id,
        userId: transaction.user_id,
        type: transaction.type,
        amount: transaction.amount,
        currency: transaction.currency,
        description: transaction.description,
        referenceId: transaction.reference_id,
        createdAt: new Date(transaction.created_at)
      };

      return {
        success: true,
        transaction: walletTransaction,
        newBalance: updatedWallet?.balance || 0
      };
    } catch (error) {
      console.error('Error al creditar wallet:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async debitWallet(
    userId: string,
    amount: number,
    description: string,
    referenceId?: string
  ): Promise<{
    success: boolean;
    transaction?: WalletTransaction;
    newBalance?: number;
    error?: string;
  }> {
    try {
      // Verificar balance suficiente
      const walletBalance = await this.getWalletBalance(userId);
      if (walletBalance.balance < amount) {
        return { success: false, error: 'Fondos insuficientes' };
      }

      // Crear transacción
      const { data: transaction, error: transactionError } = await this.supabase
        .from('wallet_transactions')
        .insert({
          user_id: userId,
          type: 'debit',
          amount,
          currency: 'USD',
          description,
          reference_id: referenceId,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (transactionError) {
        console.error('Error al crear transacción de wallet:', transactionError);
        return { success: false, error: transactionError.message };
      }

      // Actualizar balance
      const { data: updatedWallet, error: updateError } = await this.supabase
        .rpc('debit_wallet_balance', {
          user_id: userId,
          amount,
          currency: 'USD'
        });

      if (updateError) {
        console.error('Error al actualizar balance:', updateError);
        return { success: false, error: updateError.message };
      }

      const walletTransaction: WalletTransaction = {
        id: transaction.id,
        userId: transaction.user_id,
        type: transaction.type,
        amount: transaction.amount,
        currency: transaction.currency,
        description: transaction.description,
        referenceId: transaction.reference_id,
        createdAt: new Date(transaction.created_at)
      };

      return {
        success: true,
        transaction: walletTransaction,
        newBalance: updatedWallet?.balance || 0
      };
    } catch (error) {
      console.error('Error al debitar wallet:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async transferFunds(
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
  }> {
    try {
      // Verificar balance suficiente
      const fromWalletBalance = await this.getWalletBalance(fromUserId);
      if (fromWalletBalance.balance < amount) {
        return { success: false, error: 'Fondos insuficientes' };
      }

      // Debitar del usuario origen
      const debitResult = await this.debitWallet(
        fromUserId,
        amount,
        `Transferencia a usuario ${toUserId}: ${description}`,
        referenceId
      );

      if (!debitResult.success) {
        return { success: false, error: debitResult.error };
      }

      // Creditar al usuario destino
      const creditResult = await this.creditWallet(
        toUserId,
        amount,
        `Transferencia de usuario ${fromUserId}: ${description}`,
        referenceId
      );

      if (!creditResult.success) {
        // Revertir el débito
        await this.creditWallet(
          fromUserId,
          amount,
          `Reversión de transferencia fallida: ${description}`,
          referenceId
        );
        return { success: false, error: creditResult.error };
      }

      return {
        success: true,
        fromTransaction: debitResult.transaction,
        toTransaction: creditResult.transaction
      };
    } catch (error) {
      console.error('Error al transferir fondos:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getWalletTransactions(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<{
    transactions: WalletTransaction[];
    total: number;
  }> {
    try {
      const { data, error, count } = await this.supabase
        .from('wallet_transactions')
        .select(`
          id,
          type,
          amount,
          currency,
          description,
          reference_id,
          created_at
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error al obtener transacciones de wallet:', error);
        return { transactions: [], total: 0 };
      }

      const transactions = (data || []).map(item => ({
        id: item.id,
        userId,
        type: item.type,
        amount: item.amount,
        currency: item.currency,
        description: item.description,
        referenceId: item.reference_id,
        createdAt: new Date(item.created_at)
      }));

      return {
        transactions,
        total: count || 0
      };
    } catch (error) {
      console.error('Error al consultar transacciones de wallet:', error);
      return { transactions: [], total: 0 };
    }
  }

  private async simulatePaymentProcessing(): Promise<boolean> {
    // Simular tiempo de procesamiento
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simular 95% de éxito
    return Math.random() > 0.05;
  }

  private async simulateRefundProcessing(): Promise<boolean> {
    // Simular tiempo de procesamiento
    await new Promise(resolve => setTimeout(resolve, 500));

    // Simular 98% de éxito para reembolsos
    return Math.random() > 0.02;
  }
}
