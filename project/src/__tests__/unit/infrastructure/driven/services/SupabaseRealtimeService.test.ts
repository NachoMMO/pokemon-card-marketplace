import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseRealtimeService } from '../../../../../infrastructure/driven/services/SupabaseRealtimeService';
import type {
  RealtimeSubscriptionConfig,
  RealtimePayload,
  RealtimeChannel
} from '../../../../../application/ports/services/IRealtimeService';

// Mock Supabase channel methods
const mockOn = vi.fn();
const mockSubscribe = vi.fn();
const mockUnsubscribe = vi.fn();
const mockSend = vi.fn();
const mockTrack = vi.fn();
const mockPresenceState = vi.fn();

// Mock Supabase channel
const mockSupabaseChannel = {
  on: mockOn,
  subscribe: mockSubscribe,
  unsubscribe: mockUnsubscribe,
  send: mockSend,
  track: mockTrack,
  presenceState: mockPresenceState
};

// Mock Supabase client
const mockSupabase = {
  channel: vi.fn()
} as unknown as SupabaseClient;

const resetMocks = () => {
  vi.clearAllMocks();

  // Reset all mock implementations to default behavior
  mockOn.mockReset().mockReturnValue(mockSupabaseChannel);
  mockSubscribe.mockReset().mockReturnValue(mockSupabaseChannel);
  mockUnsubscribe.mockReset(); // Reset to default behavior (no error)
  mockSend.mockReset().mockResolvedValue('ok');
  mockTrack.mockReset().mockResolvedValue(undefined);
  mockPresenceState.mockReset().mockReturnValue({});

  (mockSupabase.channel as any).mockReset().mockReturnValue(mockSupabaseChannel);
};

describe('SupabaseRealtimeService', () => {
  let realtimeService: SupabaseRealtimeService;

  beforeEach(() => {
    resetMocks();
    realtimeService = new SupabaseRealtimeService(mockSupabase);
    // Clear any internal state from the service
    (realtimeService as any).channels.clear();
  });

  describe('subscribe', () => {
    it('should subscribe to table changes successfully', async () => {
      const config: RealtimeSubscriptionConfig = {
        table: 'cards',
        event: 'INSERT',
        schema: 'public',
        filter: 'user_id=eq.123'
      };

      const callback = vi.fn();

      const channel = await realtimeService.subscribe(config, callback);

      expect(channel).toBeDefined();
      expect(channel.id).toBe('table-cards-INSERT');
      expect(channel.topic).toBe('cards:INSERT');
      expect(mockSupabase.channel).toHaveBeenCalledWith('table-cards-INSERT');
      expect(mockOn).toHaveBeenCalledWith(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'cards',
          filter: 'user_id=eq.123'
        },
        expect.any(Function)
      );
      expect(mockSubscribe).toHaveBeenCalled();
    });

    it('should subscribe with default values', async () => {
      const config: RealtimeSubscriptionConfig = {
        table: 'users'
      };

      const callback = vi.fn();

      const channel = await realtimeService.subscribe(config, callback);

      expect(channel.id).toBe('table-users-all');
      expect(channel.topic).toBe('users:*');
      expect(mockOn).toHaveBeenCalledWith(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
          filter: undefined
        },
        expect.any(Function)
      );
    });

    it('should handle subscription callback correctly', async () => {
      const config: RealtimeSubscriptionConfig = {
        table: 'cards',
        event: 'UPDATE'
      };

      const callback = vi.fn();
      let capturedCallback: Function;

      mockOn.mockImplementation((event: string, opts: any, cb: Function) => {
        capturedCallback = cb;
        return mockSupabaseChannel;
      });

      await realtimeService.subscribe(config, callback);

      // Simulate payload from Supabase
      const mockPayload = {
        schema: 'public',
        table: 'cards',
        commit_timestamp: '2023-01-15T10:00:00Z',
        eventType: 'UPDATE',
        new: { id: 1, name: 'Updated Card' },
        old: { id: 1, name: 'Old Card' },
        errors: null
      };

      capturedCallback!(mockPayload);

      expect(callback).toHaveBeenCalledWith({
        schema: 'public',
        table: 'cards',
        commit_timestamp: '2023-01-15T10:00:00Z',
        eventType: 'UPDATE',
        new: { id: 1, name: 'Updated Card' },
        old: { id: 1, name: 'Old Card' },
        errors: null
      });
    });

    it('should handle subscription error', async () => {
      const config: RealtimeSubscriptionConfig = {
        table: 'cards'
      };

      const callback = vi.fn();

      mockOn.mockImplementation(() => {
        throw new Error('Subscription failed');
      });

      await expect(realtimeService.subscribe(config, callback)).rejects.toThrow('Subscription failed');
    });
  });

  describe('subscribeToChannel', () => {
    it('should subscribe to channel successfully', async () => {
      const channelName = 'chat:room1';
      const callback = vi.fn();

      const channel = await realtimeService.subscribeToChannel(channelName, callback);

      expect(channel).toBeDefined();
      expect(channel.id).toBe(channelName);
      expect(channel.topic).toBe(channelName);
      expect(mockSupabase.channel).toHaveBeenCalledWith(channelName);
      expect(mockOn).toHaveBeenCalledWith(
        'broadcast',
        { event: '*' },
        callback
      );
      expect(mockSubscribe).toHaveBeenCalled();
    });

    it('should handle channel subscription error', async () => {
      const channelName = 'chat:room1';
      const callback = vi.fn();

      mockOn.mockImplementation(() => {
        throw new Error('Channel subscription failed');
      });

      await expect(realtimeService.subscribeToChannel(channelName, callback)).rejects.toThrow('Channel subscription failed');
    });
  });

  describe('broadcast', () => {
    it('should broadcast message successfully', async () => {
      const channelName = 'chat:room1';
      const event = 'new_message';
      const payload = { message: 'Hello', user: 'John' };

      // First subscribe to the channel
      await realtimeService.subscribeToChannel(channelName, vi.fn());

      mockSend.mockResolvedValue('ok');

      const result = await realtimeService.broadcast(channelName, event, payload);

      expect(result).toBe(true);
      expect(mockSend).toHaveBeenCalledWith({
        type: 'broadcast',
        event,
        payload
      });
    });

    it('should handle broadcast to non-existent channel', async () => {
      const channelName = 'nonexistent:channel';
      const event = 'test';
      const payload = { data: 'test' };

      const result = await realtimeService.broadcast(channelName, event, payload);

      expect(result).toBe(false);
      expect(mockSend).not.toHaveBeenCalled();
    });

    it('should handle broadcast error', async () => {
      const channelName = 'chat:room1';
      const event = 'new_message';
      const payload = { message: 'Hello' };

      // First subscribe to the channel
      await realtimeService.subscribeToChannel(channelName, vi.fn());

      mockSend.mockRejectedValue(new Error('Send failed'));

      const result = await realtimeService.broadcast(channelName, event, payload);

      expect(result).toBe(false);
    });

    it('should handle broadcast with failed response', async () => {
      const channelName = 'chat:room1';
      const event = 'new_message';
      const payload = { message: 'Hello' };

      // First subscribe to the channel
      await realtimeService.subscribeToChannel(channelName, vi.fn());

      mockSend.mockResolvedValue('error');

      const result = await realtimeService.broadcast(channelName, event, payload);

      expect(result).toBe(false);
    });
  });

  describe('subscribeToPresence', () => {
    it('should subscribe to presence successfully', async () => {
      const channelName = 'room:1';
      const userState = { user_id: '123', name: 'John' };
      const callbacks = {
        onJoin: vi.fn(),
        onLeave: vi.fn(),
        onSync: vi.fn()
      };

      const channel = await realtimeService.subscribeToPresence(channelName, userState, callbacks);

      expect(channel).toBeDefined();
      expect(channel.id).toBe(channelName);
      expect(channel.topic).toBe(`presence:${channelName}`);
      expect(mockSupabase.channel).toHaveBeenCalledWith(channelName);
      expect(mockTrack).toHaveBeenCalledWith(userState);
      expect(mockSubscribe).toHaveBeenCalled();
    });

    it('should handle presence callbacks correctly', async () => {
      const channelName = 'room:1';
      const userState = { user_id: '123', name: 'John' };
      const callbacks = {
        onJoin: vi.fn(),
        onLeave: vi.fn(),
        onSync: vi.fn()
      };

      let joinCallback: Function;
      let leaveCallback: Function;
      let syncCallback: Function;

      mockOn.mockImplementation((event: string, opts: any, cb?: Function) => {
        if (opts.event === 'join') {
          joinCallback = cb!;
        } else if (opts.event === 'leave') {
          leaveCallback = cb!;
        } else if (opts.event === 'sync') {
          syncCallback = cb!;
        }
        return mockSupabaseChannel;
      });

      await realtimeService.subscribeToPresence(channelName, userState, callbacks);

      // Test join callback
      const joinPayload = { key: 'user_123', currentPresence: {}, newPresence: { user_id: '123' } };
      joinCallback!(joinPayload);
      expect(callbacks.onJoin).toHaveBeenCalledWith('user_123', {}, { user_id: '123' });

      // Test leave callback
      const leavePayload = { key: 'user_123', currentPresence: { user_id: '123' }, leftPresence: {} };
      leaveCallback!(leavePayload);
      expect(callbacks.onLeave).toHaveBeenCalledWith('user_123', { user_id: '123' }, {});

      // Test sync callback
      syncCallback!();
      expect(callbacks.onSync).toHaveBeenCalled();
    });

    it('should handle presence with partial callbacks', async () => {
      const channelName = 'room:1';
      const userState = { user_id: '123' };
      const callbacks = {
        onJoin: vi.fn()
        // onLeave and onSync not provided
      };

      const channel = await realtimeService.subscribeToPresence(channelName, userState, callbacks);

      expect(channel).toBeDefined();
      expect(mockOn).toHaveBeenCalledTimes(1); // Only join callback registered
    });

    it('should handle presence subscription error', async () => {
      const channelName = 'room:1';
      const userState = { user_id: '123' };
      const callbacks = {};

      mockTrack.mockRejectedValue(new Error('Track failed'));

      await expect(realtimeService.subscribeToPresence(channelName, userState, callbacks)).rejects.toThrow('Track failed');
    });
  });

  describe('getPresenceState', () => {
    it('should get presence state successfully', async () => {
      const channelName = 'room:1';
      const mockPresenceStateData = {
        'user_123': { user_id: '123', name: 'John' },
        'user_456': { user_id: '456', name: 'Jane' }
      };

      // First subscribe to presence
      await realtimeService.subscribeToPresence(channelName, {}, {});

      mockPresenceState.mockReturnValue(mockPresenceStateData);

      const result = realtimeService.getPresenceState(channelName);

      expect(result).toEqual(mockPresenceStateData);
      expect(mockPresenceState).toHaveBeenCalled();
    });

    it('should handle getting presence state for non-existent channel', async () => {
      const channelName = 'nonexistent:channel';

      const result = realtimeService.getPresenceState(channelName);

      expect(result).toEqual({});
    });

    it('should handle null presence state', async () => {
      const channelName = 'room:1';

      // First subscribe to presence
      await realtimeService.subscribeToPresence(channelName, {}, {});

      mockPresenceState.mockReturnValue(null);

      const result = realtimeService.getPresenceState(channelName);

      expect(result).toEqual({});
    });
  });

  describe('unsubscribe', () => {
    it('should unsubscribe from channel successfully', async () => {
      const config: RealtimeSubscriptionConfig = {
        table: 'cards'
      };

      const channel = await realtimeService.subscribe(config, vi.fn());

      const result = await realtimeService.unsubscribe(channel);

      expect(result).toBe(true);
      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('should handle unsubscribe error', async () => {
      const config: RealtimeSubscriptionConfig = {
        table: 'cards'
      };

      const channel = await realtimeService.subscribe(config, vi.fn());

      mockUnsubscribe.mockImplementation(() => {
        throw new Error('Unsubscribe failed');
      });

      const result = await realtimeService.unsubscribe(channel);

      expect(result).toBe(false);
    });
  });

  describe('unsubscribeAll', () => {
    it('should unsubscribe from all channels successfully', async () => {
      // Subscribe to multiple channels
      const config1: RealtimeSubscriptionConfig = { table: 'cards' };
      const config2: RealtimeSubscriptionConfig = { table: 'users' };

      await realtimeService.subscribe(config1, vi.fn());
      await realtimeService.subscribe(config2, vi.fn());
      await realtimeService.subscribeToChannel('chat:room1', vi.fn());

      const result = await realtimeService.unsubscribeAll();

      expect(result).toBe(true);
      expect(mockUnsubscribe).toHaveBeenCalledTimes(3);
    });

    it('should handle unsubscribe all error', async () => {
      // Subscribe to a channel
      const config: RealtimeSubscriptionConfig = { table: 'cards' };
      await realtimeService.subscribe(config, vi.fn());

      mockUnsubscribe.mockImplementation(() => {
        throw new Error('Unsubscribe failed');
      });

      const result = await realtimeService.unsubscribeAll();

      expect(result).toBe(false);
    });

    it('should handle unsubscribe all with no channels', async () => {
      const result = await realtimeService.unsubscribeAll();

      expect(result).toBe(true);
      expect(mockUnsubscribe).not.toHaveBeenCalled();
    });
  });

  describe('getConnectionStatus', () => {
    it('should return connection status', () => {
      const status = realtimeService.getConnectionStatus();

      expect(status).toBe('OPEN');
    });
  });

  describe('RealtimeChannelImpl', () => {
    it('should unsubscribe correctly', async () => {
      const config: RealtimeSubscriptionConfig = {
        table: 'cards'
      };

      const channel = await realtimeService.subscribe(config, vi.fn());

      channel.unsubscribe();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });

  describe('Integration scenarios', () => {
    it('should handle multiple subscriptions to same table', async () => {
      const config1: RealtimeSubscriptionConfig = {
        table: 'cards',
        event: 'INSERT'
      };
      const config2: RealtimeSubscriptionConfig = {
        table: 'cards',
        event: 'UPDATE'
      };

      const callback1 = vi.fn();
      const callback2 = vi.fn();

      const channel1 = await realtimeService.subscribe(config1, callback1);
      const channel2 = await realtimeService.subscribe(config2, callback2);

      expect(channel1.id).toBe('table-cards-INSERT');
      expect(channel2.id).toBe('table-cards-UPDATE');
      expect(mockSupabase.channel).toHaveBeenCalledTimes(2);
    });

    it('should handle broadcast after subscription', async () => {
      const channelName = 'notifications:user123';

      // Subscribe first
      await realtimeService.subscribeToChannel(channelName, vi.fn());

      // Then broadcast
      const result = await realtimeService.broadcast(channelName, 'new_notification', {
        id: 1,
        message: 'You have a new message'
      });

      expect(result).toBe(true);
    });

    it('should handle presence join/leave flow', async () => {
      const channelName = 'room:game1';
      const userState = { user_id: '123', username: 'player1' };

      const onJoin = vi.fn();
      const onLeave = vi.fn();
      const onSync = vi.fn();

      await realtimeService.subscribeToPresence(channelName, userState, {
        onJoin,
        onLeave,
        onSync
      });

      // Get presence state
      mockPresenceState.mockReturnValue({
        'player1': { user_id: '123', username: 'player1' },
        'player2': { user_id: '456', username: 'player2' }
      });

      const presenceState = realtimeService.getPresenceState(channelName);

      expect(presenceState).toHaveProperty('player1');
      expect(presenceState).toHaveProperty('player2');
    });
  });
});
