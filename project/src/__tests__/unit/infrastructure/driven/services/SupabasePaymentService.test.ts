import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SupabasePaymentService } from '../../../../../infrastructure/driven/services/SupabasePaymentService';
import type {
  CreatePaymentDTO,
  RefundDTO,
  PaymentMethod,
  PaymentIntent,
  WalletTransaction
} from '../../../../../application/ports/services/IPaymentService';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(),
  rpc: vi.fn()
} as unknown as SupabaseClient;

// Mock query chain
const mockSelect = vi.fn().mockReturnThis();
const mockInsert = vi.fn().mockReturnThis();
const mockUpdate = vi.fn().mockReturnThis();
const mockDelete = vi.fn().mockReturnThis();
const mockEq = vi.fn().mockReturnThis();
const mockNeq = vi.fn().mockReturnThis();
const mockIn = vi.fn().mockReturnThis();
const mockOrder = vi.fn().mockReturnThis();
const mockRange = vi.fn().mockReturnThis();
const mockSingle = vi.fn();

const mockFrom = {
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
  delete: mockDelete
};

const resetMocks = () => {
  vi.clearAllMocks();

  mockSelect.mockReturnThis();
  mockInsert.mockReturnThis();
  mockUpdate.mockReturnThis();
  mockDelete.mockReturnThis();
  mockEq.mockReturnThis();
  mockNeq.mockReturnThis();
  mockIn.mockReturnThis();
  mockOrder.mockReturnThis();
  mockRange.mockReturnThis();
  mockSingle.mockResolvedValue({ data: null, error: null });

  // Chain methods
  [mockSelect, mockInsert, mockUpdate, mockDelete].forEach(mock => {
    mock.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
      eq: mockEq,
      neq: mockNeq,
      in: mockIn,
      order: mockOrder,
      range: mockRange,
      single: mockSingle
    });
  });

  [mockEq, mockNeq, mockIn, mockOrder, mockRange].forEach(mock => {
    mock.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
      eq: mockEq,
      neq: mockNeq,
      in: mockIn,
      order: mockOrder,
      range: mockRange,
      single: mockSingle
    });
  });

  (mockSupabase.from as any).mockReturnValue(mockFrom);
  (mockSupabase.rpc as any).mockResolvedValue({ data: null, error: null });
};

describe('SupabasePaymentService', () => {
  let paymentService: SupabasePaymentService;

  beforeEach(() => {
    resetMocks();
    paymentService = new SupabasePaymentService(mockSupabase);
  });

  describe('createPaymentIntent', () => {
    it('should create payment intent successfully', async () => {
      const paymentData: CreatePaymentDTO = {
        amount: 2500,
        currency: 'USD',
        paymentMethodId: 'pm_123',
        customerId: 'cus_123',
        description: 'Test payment',
        metadata: { orderId: 'order_123' }
      };

      const mockPaymentIntentData = {
        id: 'pi_123',
        amount: 2500,
        currency: 'USD',
        status: 'requires_payment_method',
        metadata: { orderId: 'order_123' }
      };

      mockSingle.mockResolvedValue({ data: mockPaymentIntentData, error: null });

      const result = await paymentService.createPaymentIntent(paymentData);

      expect(result.success).toBe(true);
      expect(result.paymentIntent).toMatchObject({
        id: 'pi_123',
        amount: 2500,
        currency: 'USD',
        status: 'requires_payment_method',
        metadata: { orderId: 'order_123' }
      });
      expect(result.paymentIntent?.clientSecret).toMatch(/^pi_pi_123_secret_\d+$/);
      expect(mockSupabase.from).toHaveBeenCalledWith('payment_intents');
      expect(mockInsert).toHaveBeenCalledWith({
        amount: 2500,
        currency: 'USD',
        payment_method_id: 'pm_123',
        customer_id: 'cus_123',
        description: 'Test payment',
        metadata: { orderId: 'order_123' },
        status: 'requires_payment_method',
        created_at: expect.any(String)
      });
    });

    it('should handle payment intent creation error', async () => {
      const paymentData: CreatePaymentDTO = {
        amount: 2500,
        currency: 'USD'
      };

      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      });

      const result = await paymentService.createPaymentIntent(paymentData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
      expect(result.paymentIntent).toBeUndefined();
    });

    it('should handle unexpected errors', async () => {
      const paymentData: CreatePaymentDTO = {
        amount: 2500,
        currency: 'USD'
      };

      mockSingle.mockRejectedValue(new Error('Unexpected error'));

      const result = await paymentService.createPaymentIntent(paymentData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unexpected error');
    });
  });

  describe('confirmPayment', () => {
    it('should confirm payment successfully', async () => {
      const paymentIntentId = 'pi_123';
      const paymentMethodId = 'pm_123';

      const mockPaymentIntentData = {
        id: 'pi_123',
        amount: 2500,
        currency: 'USD',
        status: 'succeeded',
        metadata: { orderId: 'order_123' }
      };

      mockSingle.mockResolvedValue({ data: mockPaymentIntentData, error: null });

      // Mock successful payment processing
      vi.spyOn(paymentService as any, 'simulatePaymentProcessing')
        .mockResolvedValue(true);

      const result = await paymentService.confirmPayment(paymentIntentId, paymentMethodId);

      expect(result.success).toBe(true);
      expect(result.paymentIntent).toMatchObject({
        id: 'pi_123',
        amount: 2500,
        currency: 'USD',
        status: 'succeeded'
      });
      expect(mockUpdate).toHaveBeenCalledWith({
        status: 'succeeded',
        payment_method_id: 'pm_123',
        processed_at: expect.any(String)
      });
    });

    it('should handle failed payment processing', async () => {
      const paymentIntentId = 'pi_123';

      const mockPaymentIntentData = {
        id: 'pi_123',
        amount: 2500,
        currency: 'USD',
        status: 'canceled',
        metadata: {}
      };

      mockSingle.mockResolvedValue({ data: mockPaymentIntentData, error: null });

      // Mock failed payment processing
      vi.spyOn(paymentService as any, 'simulatePaymentProcessing')
        .mockResolvedValue(false);

      const result = await paymentService.confirmPayment(paymentIntentId);

      expect(result.success).toBe(false);
      expect(result.paymentIntent?.status).toBe('canceled');
    });

    it('should handle payment confirmation error', async () => {
      const paymentIntentId = 'pi_123';

      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Payment not found' }
      });

      const result = await paymentService.confirmPayment(paymentIntentId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Payment not found');
    });
  });

  describe('cancelPaymentIntent', () => {
    it('should cancel payment intent successfully', async () => {
      const paymentIntentId = 'pi_123';

      mockIn.mockResolvedValue({ data: null, error: null });

      const result = await paymentService.cancelPaymentIntent(paymentIntentId);

      expect(result).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith({
        status: 'canceled',
        canceled_at: expect.any(String)
      });
      expect(mockEq).toHaveBeenCalledWith('id', paymentIntentId);
      expect(mockIn).toHaveBeenCalledWith('status', ['requires_payment_method', 'requires_confirmation']);
    });

    it('should handle cancel payment intent error', async () => {
      const paymentIntentId = 'pi_123';

      mockIn.mockResolvedValue({
        data: null,
        error: { message: 'Update failed' }
      });

      const result = await paymentService.cancelPaymentIntent(paymentIntentId);

      expect(result).toBe(false);
    });

    it('should handle unexpected errors in cancel', async () => {
      const paymentIntentId = 'pi_123';

      mockEq.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const result = await paymentService.cancelPaymentIntent(paymentIntentId);

      expect(result).toBe(false);
    });
  });

  describe('processRefund', () => {
    it('should process refund successfully', async () => {
      const refundData: RefundDTO = {
        paymentIntentId: 'pi_123',
        amount: 1000,
        reason: 'requested_by_customer'
      };

      const mockPaymentIntent = {
        id: 'pi_123',
        amount: 2500,
        currency: 'USD',
        status: 'succeeded'
      };

      const mockRefund = {
        id: 'ref_123',
        payment_intent_id: 'pi_123',
        amount: 1000,
        currency: 'USD'
      };

      // Mock payment intent fetch
      mockSingle.mockResolvedValueOnce({ data: mockPaymentIntent, error: null });
      // Mock refund creation
      mockSingle.mockResolvedValueOnce({ data: mockRefund, error: null });
      // Mock successful refund processing
      vi.spyOn(paymentService as any, 'simulateRefundProcessing')
        .mockResolvedValue(true);

      // Mock refund update
      mockEq.mockResolvedValue({ data: null, error: null });

      const result = await paymentService.processRefund(refundData);

      expect(result.success).toBe(true);
      expect(result.refundId).toBe('ref_123');
      expect(result.amount).toBe(1000);
      expect(mockInsert).toHaveBeenCalledWith({
        payment_intent_id: 'pi_123',
        amount: 1000,
        currency: 'USD',
        reason: 'requested_by_customer',
        metadata: undefined,
        status: 'pending',
        created_at: expect.any(String)
      });
    });

    it('should handle payment intent not found for refund', async () => {
      const refundData: RefundDTO = {
        paymentIntentId: 'pi_123'
      };

      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Payment intent not found', code: 'PGRST116' }
      });

      const result = await paymentService.processRefund(refundData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Intent de pago no encontrado o no válido para reembolso');
    });

    it('should handle refund creation error', async () => {
      const refundData: RefundDTO = {
        paymentIntentId: 'pi_123'
      };

      const mockPaymentIntent = {
        id: 'pi_123',
        amount: 2500,
        currency: 'USD',
        status: 'succeeded'
      };

      // Mock payment intent fetch success
      mockSingle.mockResolvedValueOnce({ data: mockPaymentIntent, error: null });
      // Mock refund creation error
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { message: 'Refund creation failed' }
      });

      const result = await paymentService.processRefund(refundData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Refund creation failed');
    });
  });

  describe('getPaymentMethods', () => {
    it('should get payment methods successfully', async () => {
      const customerId = 'cus_123';

      const mockPaymentMethods = [
        {
          id: 'pm_123',
          type: 'card',
          last4: '4242',
          brand: 'visa',
          expiry_month: 12,
          expiry_year: 2025,
          is_default: true,
          is_valid: true
        },
        {
          id: 'pm_456',
          type: 'paypal',
          last4: null,
          brand: null,
          expiry_month: null,
          expiry_year: null,
          is_default: false,
          is_valid: true
        }
      ];

      // Mock complete chain: from().select().eq().eq().order().order()
      const mockChain = {
        select: mockSelect,
        eq: mockEq,
        order: mockOrder
      };

      mockSelect.mockReturnValue(mockChain);
      mockEq.mockReturnValue(mockChain);
      mockOrder.mockReturnValue(mockChain);
      mockOrder.mockResolvedValue({ data: mockPaymentMethods, error: null });

      const result = await paymentService.getPaymentMethods(customerId);

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: 'pm_123',
        type: 'card',
        last4: '4242',
        brand: 'visa',
        expiryMonth: 12,
        expiryYear: 2025,
        isDefault: true,
        isValid: true
      });
      expect(mockOrder).toHaveBeenCalledWith('is_default', { ascending: false });
    });

    it('should handle get payment methods error', async () => {
      const customerId = 'cus_123';

      mockOrder.mockResolvedValue({
        data: null,
        error: { message: 'Query failed' }
      });

      const result = await paymentService.getPaymentMethods(customerId);

      expect(result).toEqual([]);
    });

    it('should handle unexpected errors in get payment methods', async () => {
      const customerId = 'cus_123';

      mockEq.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const result = await paymentService.getPaymentMethods(customerId);

      expect(result).toEqual([]);
    });
  });

  describe('addPaymentMethod', () => {
    it('should add payment method successfully', async () => {
      const customerId = 'cus_123';
      const paymentMethodData = {
        type: 'card',
        last4: '4242',
        brand: 'visa',
        expiryMonth: 12,
        expiryYear: 2025,
        externalId: 'pm_stripe_123',
        isDefault: true
      };

      const mockPaymentMethod = {
        id: 'pm_123',
        type: 'card',
        last4: '4242',
        brand: 'visa',
        expiry_month: 12,
        expiry_year: 2025,
        is_default: true,
        is_valid: true
      };

      mockSingle.mockResolvedValue({ data: mockPaymentMethod, error: null });
      mockNeq.mockResolvedValue({ data: null, error: null });

      const result = await paymentService.addPaymentMethod(customerId, paymentMethodData);

      expect(result.success).toBe(true);
      expect(result.paymentMethod).toMatchObject({
        id: 'pm_123',
        type: 'card',
        last4: '4242',
        brand: 'visa',
        expiryMonth: 12,
        expiryYear: 2025,
        isDefault: true,
        isValid: true
      });
      expect(mockInsert).toHaveBeenCalledWith({
        customer_id: customerId,
        type: 'card',
        last4: '4242',
        brand: 'visa',
        expiry_month: 12,
        expiry_year: 2025,
        external_id: 'pm_stripe_123',
        is_default: true,
        is_valid: true,
        created_at: expect.any(String)
      });
    });

    it('should handle add payment method error', async () => {
      const customerId = 'cus_123';
      const paymentMethodData = {
        type: 'card'
      };

      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Insert failed' }
      });

      const result = await paymentService.addPaymentMethod(customerId, paymentMethodData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Insert failed');
    });
  });

  describe('removePaymentMethod', () => {
    it('should remove payment method successfully', async () => {
      const paymentMethodId = 'pm_123';

      mockEq.mockResolvedValue({ data: null, error: null });

      const result = await paymentService.removePaymentMethod(paymentMethodId);

      expect(result).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith({ active: false });
      expect(mockEq).toHaveBeenCalledWith('id', paymentMethodId);
    });

    it('should handle remove payment method error', async () => {
      const paymentMethodId = 'pm_123';

      mockEq.mockResolvedValue({
        data: null,
        error: { message: 'Update failed' }
      });

      const result = await paymentService.removePaymentMethod(paymentMethodId);

      expect(result).toBe(false);
    });
  });

  describe('setDefaultPaymentMethod', () => {
    it('should set default payment method successfully', async () => {
      const customerId = 'cus_123';
      const paymentMethodId = 'pm_123';

      // Mock the chaining properly - both calls should succeed
      const mockChain = {
        update: mockUpdate,
        eq: mockEq
      };

      mockUpdate.mockReturnValue(mockChain);
      mockEq.mockReturnValue({ data: null, error: null });

      const result = await paymentService.setDefaultPaymentMethod(customerId, paymentMethodId);

      expect(result).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith({ is_default: false });
      expect(mockUpdate).toHaveBeenCalledWith({ is_default: true });
    });

    it('should handle set default payment method error', async () => {
      const customerId = 'cus_123';
      const paymentMethodId = 'pm_123';

      // First update succeeds, second fails
      mockEq.mockResolvedValueOnce({ data: null, error: null });
      mockEq.mockResolvedValueOnce({
        data: null,
        error: { message: 'Update failed' }
      });

      const result = await paymentService.setDefaultPaymentMethod(customerId, paymentMethodId);

      expect(result).toBe(false);
    });
  });

  describe('getWalletBalance', () => {
    it('should get wallet balance successfully', async () => {
      const userId = 'user_123';
      const currency = 'USD';

      const mockWallet = {
        balance: 1500,
        currency: 'USD',
        updated_at: '2023-01-15T10:00:00Z'
      };

      mockSingle.mockResolvedValue({ data: mockWallet, error: null });

      const result = await paymentService.getWalletBalance(userId, currency);

      expect(result).toMatchObject({
        balance: 1500,
        currency: 'USD',
        lastUpdated: new Date('2023-01-15T10:00:00Z')
      });
    });

    it('should create new wallet if not exists', async () => {
      const userId = 'user_123';
      const currency = 'USD';

      const mockNewWallet = {
        balance: 0,
        currency: 'USD',
        created_at: '2023-01-15T10:00:00Z'
      };

      // First call fails with PGRST116 (not found)
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' }
      });
      // Second call creates new wallet
      mockSingle.mockResolvedValueOnce({ data: mockNewWallet, error: null });

      const result = await paymentService.getWalletBalance(userId, currency);

      expect(result).toMatchObject({
        balance: 0,
        currency: 'USD',
        lastUpdated: new Date('2023-01-15T10:00:00Z')
      });
    });

    it('should handle wallet balance query error', async () => {
      const userId = 'user_123';

      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      });

      await expect(paymentService.getWalletBalance(userId)).rejects.toThrow();
    });
  });

  describe('creditWallet', () => {
    it('should credit wallet successfully', async () => {
      const userId = 'user_123';
      const amount = 500;
      const description = 'Payment received';
      const referenceId = 'sale_123';

      const mockTransaction = {
        id: 'txn_123',
        user_id: userId,
        type: 'credit',
        amount,
        currency: 'USD',
        description,
        reference_id: referenceId,
        created_at: '2023-01-15T10:00:00Z'
      };

      mockSingle.mockResolvedValue({ data: mockTransaction, error: null });
      (mockSupabase.rpc as any).mockResolvedValue({
        data: { balance: 1500 },
        error: null
      });

      const result = await paymentService.creditWallet(userId, amount, description, referenceId);

      expect(result.success).toBe(true);
      expect(result.transaction).toMatchObject({
        id: 'txn_123',
        userId,
        type: 'credit',
        amount,
        currency: 'USD',
        description,
        referenceId,
        createdAt: new Date('2023-01-15T10:00:00Z')
      });
      expect(result.newBalance).toBe(1500);
    });

    it('should handle credit wallet transaction error', async () => {
      const userId = 'user_123';
      const amount = 500;
      const description = 'Payment received';

      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Transaction failed' }
      });

      const result = await paymentService.creditWallet(userId, amount, description);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Transaction failed');
    });

    it('should handle credit wallet balance update error', async () => {
      const userId = 'user_123';
      const amount = 500;
      const description = 'Payment received';

      const mockTransaction = {
        id: 'txn_123',
        user_id: userId,
        type: 'credit',
        amount,
        currency: 'USD',
        description,
        reference_id: null,
        created_at: '2023-01-15T10:00:00Z'
      };

      mockSingle.mockResolvedValue({ data: mockTransaction, error: null });
      (mockSupabase.rpc as any).mockResolvedValue({
        data: null,
        error: { message: 'Balance update failed' }
      });

      const result = await paymentService.creditWallet(userId, amount, description);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Balance update failed');
    });
  });

  describe('debitWallet', () => {
    it('should debit wallet successfully', async () => {
      const userId = 'user_123';
      const amount = 300;
      const description = 'Purchase made';
      const referenceId = 'purchase_123';

      const mockTransaction = {
        id: 'txn_456',
        user_id: userId,
        type: 'debit',
        amount,
        currency: 'USD',
        description,
        reference_id: referenceId,
        created_at: '2023-01-15T10:00:00Z'
      };

      // Mock wallet balance check
      vi.spyOn(paymentService, 'getWalletBalance').mockResolvedValue({
        balance: 1500,
        currency: 'USD',
        lastUpdated: new Date()
      });

      mockSingle.mockResolvedValue({ data: mockTransaction, error: null });
      (mockSupabase.rpc as any).mockResolvedValue({
        data: { balance: 1200 },
        error: null
      });

      const result = await paymentService.debitWallet(userId, amount, description, referenceId);

      expect(result.success).toBe(true);
      expect(result.transaction).toMatchObject({
        id: 'txn_456',
        userId,
        type: 'debit',
        amount,
        currency: 'USD',
        description,
        referenceId,
        createdAt: new Date('2023-01-15T10:00:00Z')
      });
      expect(result.newBalance).toBe(1200);
    });

    it('should handle insufficient funds', async () => {
      const userId = 'user_123';
      const amount = 2000;
      const description = 'Purchase made';

      // Mock insufficient balance
      vi.spyOn(paymentService, 'getWalletBalance').mockResolvedValue({
        balance: 1500,
        currency: 'USD',
        lastUpdated: new Date()
      });

      const result = await paymentService.debitWallet(userId, amount, description);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Fondos insuficientes');
    });
  });

  describe('transferFunds', () => {
    it('should transfer funds successfully', async () => {
      const fromUserId = 'user_123';
      const toUserId = 'user_456';
      const amount = 200;
      const description = 'Payment for cards';

      const mockFromTransaction = {
        id: 'txn_123',
        userId: fromUserId,
        type: 'debit' as const,
        amount,
        currency: 'USD',
        description: `Transferencia a usuario ${toUserId}: ${description}`,
        referenceId: undefined,
        createdAt: new Date()
      };

      const mockToTransaction = {
        id: 'txn_456',
        userId: toUserId,
        type: 'credit' as const,
        amount,
        currency: 'USD',
        description: `Transferencia de usuario ${fromUserId}: ${description}`,
        referenceId: undefined,
        createdAt: new Date()
      };

      // Mock wallet balance check
      vi.spyOn(paymentService, 'getWalletBalance').mockResolvedValue({
        balance: 1500,
        currency: 'USD',
        lastUpdated: new Date()
      });

      // Mock debit wallet
      vi.spyOn(paymentService, 'debitWallet').mockResolvedValue({
        success: true,
        transaction: mockFromTransaction,
        newBalance: 1300
      });

      // Mock credit wallet
      vi.spyOn(paymentService, 'creditWallet').mockResolvedValue({
        success: true,
        transaction: mockToTransaction,
        newBalance: 700
      });

      const result = await paymentService.transferFunds(fromUserId, toUserId, amount, description);

      expect(result.success).toBe(true);
      expect(result.fromTransaction).toEqual(mockFromTransaction);
      expect(result.toTransaction).toEqual(mockToTransaction);
    });

    it('should handle insufficient funds in transfer', async () => {
      const fromUserId = 'user_123';
      const toUserId = 'user_456';
      const amount = 2000;
      const description = 'Payment for cards';

      // Mock insufficient balance
      vi.spyOn(paymentService, 'getWalletBalance').mockResolvedValue({
        balance: 1500,
        currency: 'USD',
        lastUpdated: new Date()
      });

      const result = await paymentService.transferFunds(fromUserId, toUserId, amount, description);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Fondos insuficientes');
    });

    it('should revert debit on credit failure', async () => {
      const fromUserId = 'user_123';
      const toUserId = 'user_456';
      const amount = 200;
      const description = 'Payment for cards';

      const mockFromTransaction = {
        id: 'txn_123',
        userId: fromUserId,
        type: 'debit' as const,
        amount,
        currency: 'USD',
        description: `Transferencia a usuario ${toUserId}: ${description}`,
        referenceId: undefined,
        createdAt: new Date()
      };

      // Mock wallet balance check
      vi.spyOn(paymentService, 'getWalletBalance').mockResolvedValue({
        balance: 1500,
        currency: 'USD',
        lastUpdated: new Date()
      });

      // Mock successful debit
      vi.spyOn(paymentService, 'debitWallet').mockResolvedValue({
        success: true,
        transaction: mockFromTransaction,
        newBalance: 1300
      });

      // Mock failed credit
      const creditSpy = vi.spyOn(paymentService, 'creditWallet')
        .mockResolvedValueOnce({
          success: false,
          error: 'Credit failed'
        })
        .mockResolvedValueOnce({
          success: true,
          transaction: {
            id: 'txn_revert',
            userId: fromUserId,
            type: 'credit',
            amount,
            currency: 'USD',
            description: `Reversión de transferencia fallida: ${description}`,
            referenceId: undefined,
            createdAt: new Date()
          },
          newBalance: 1500
        });

      const result = await paymentService.transferFunds(fromUserId, toUserId, amount, description);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Credit failed');
      expect(creditSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('getWalletTransactions', () => {
    it('should get wallet transactions successfully', async () => {
      const userId = 'user_123';
      const limit = 10;
      const offset = 0;

      const mockTransactions = [
        {
          id: 'txn_123',
          type: 'credit',
          amount: 500,
          currency: 'USD',
          description: 'Payment received',
          reference_id: 'sale_123',
          created_at: '2023-01-15T10:00:00Z'
        },
        {
          id: 'txn_456',
          type: 'debit',
          amount: 200,
          currency: 'USD',
          description: 'Purchase made',
          reference_id: 'purchase_456',
          created_at: '2023-01-14T15:30:00Z'
        }
      ];

      mockRange.mockResolvedValue({
        data: mockTransactions,
        error: null,
        count: 2
      });

      const result = await paymentService.getWalletTransactions(userId, limit, offset);

      expect(result.transactions).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.transactions[0]).toMatchObject({
        id: 'txn_123',
        userId,
        type: 'credit',
        amount: 500,
        currency: 'USD',
        description: 'Payment received',
        referenceId: 'sale_123',
        createdAt: new Date('2023-01-15T10:00:00Z')
      });
      expect(mockRange).toHaveBeenCalledWith(0, 9);
    });

    it('should handle get wallet transactions error', async () => {
      const userId = 'user_123';

      mockRange.mockResolvedValue({
        data: null,
        error: { message: 'Query failed' },
        count: 0
      });

      const result = await paymentService.getWalletTransactions(userId);

      expect(result.transactions).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should handle unexpected errors in get wallet transactions', async () => {
      const userId = 'user_123';

      mockEq.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const result = await paymentService.getWalletTransactions(userId);

      expect(result.transactions).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('simulatePaymentProcessing', () => {
    it('should simulate payment processing with high success rate', async () => {
      // Mock Math.random to return high value (should succeed)
      vi.spyOn(Math, 'random').mockReturnValue(0.96);

      const result = await (paymentService as any).simulatePaymentProcessing();

      expect(result).toBe(true);
    });

    it('should simulate payment processing failure', async () => {
      // Mock Math.random to return low value (should fail)
      vi.spyOn(Math, 'random').mockReturnValue(0.01);

      const result = await (paymentService as any).simulatePaymentProcessing();

      expect(result).toBe(false);
    });
  });

  describe('simulateRefundProcessing', () => {
    it('should simulate refund processing with high success rate', async () => {
      // Mock Math.random to return high value (should succeed)
      vi.spyOn(Math, 'random').mockReturnValue(0.99);

      const result = await (paymentService as any).simulateRefundProcessing();

      expect(result).toBe(true);
    });

    it('should simulate refund processing failure', async () => {
      // Mock Math.random to return low value (should fail)
      vi.spyOn(Math, 'random').mockReturnValue(0.01);

      const result = await (paymentService as any).simulateRefundProcessing();

      expect(result).toBe(false);
    });
  });
});
