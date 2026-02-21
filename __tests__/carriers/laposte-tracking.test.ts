import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mapTimelineTypeToStatus, trackShipment, testConnection } from '@/lib/carriers/laposte-tracking'

describe('La Poste Tracking', () => {
  describe('mapTimelineTypeToStatus', () => {
    it('should map type 1 to PICKED_UP', () => {
      expect(mapTimelineTypeToStatus(1)).toBe('PICKED_UP')
    })

    it('should map type 2 to IN_TRANSIT', () => {
      expect(mapTimelineTypeToStatus(2)).toBe('IN_TRANSIT')
    })

    it('should map type 3 to OUT_FOR_DELIVERY', () => {
      expect(mapTimelineTypeToStatus(3)).toBe('OUT_FOR_DELIVERY')
    })

    it('should map type 4 to DELIVERED', () => {
      expect(mapTimelineTypeToStatus(4)).toBe('DELIVERED')
    })

    it('should map type 5 to RETURNED', () => {
      expect(mapTimelineTypeToStatus(5)).toBe('RETURNED')
    })

    it('should default to IN_TRANSIT for unknown types', () => {
      expect(mapTimelineTypeToStatus(0)).toBe('IN_TRANSIT')
      expect(mapTimelineTypeToStatus(99)).toBe('IN_TRANSIT')
    })
  })

  describe('trackShipment', () => {
    beforeEach(() => {
      vi.restoreAllMocks()
    })

    it('should call La Poste API with correct headers', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          returnCode: 200,
          returnMessage: 'OK',
          shipment: {
            idShip: '6A12345678901',
            holder: 1,
            product: 'Colissimo',
            isFinal: false,
            timeline: [
              { shortLabel: 'Pris en charge', longLabel: 'Votre colis a été pris en charge', date: '2024-01-15T10:00:00Z', status: true, type: 1 },
              { shortLabel: 'En transit', longLabel: 'Votre colis est en cours d\'acheminement', date: '2024-01-16T08:00:00Z', status: true, type: 2 },
              { shortLabel: 'Livré', longLabel: 'Votre colis a été livré', date: '', status: false, type: 4 }
            ],
            event: []
          }
        })
      }

      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce(mockResponse as any)

      const result = await trackShipment('6A12345678901', 'test-api-key')

      expect(fetchSpy).toHaveBeenCalledWith(
        'https://api.laposte.fr/suivi/v2/idships/6A12345678901',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'X-Okapi-Key': 'test-api-key'
          }
        })
      )

      expect(result.trackingNumber).toBe('6A12345678901')
      expect(result.carrier).toBe('Colissimo')
      expect(result.status).toBe('IN_TRANSIT')
      expect(result.isFinal).toBe(false)
      expect(result.events).toHaveLength(2) // Only status=true entries
    })

    it('should handle API errors gracefully', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: () => Promise.resolve('Unauthorized')
      } as any)

      await expect(trackShipment('INVALID', 'bad-key'))
        .rejects.toThrow('La Poste API error 401')
    })

    it('should handle returnCode errors', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          returnCode: 400,
          returnMessage: 'Invalid tracking number',
          shipment: null
        })
      } as any)

      await expect(trackShipment('INVALID', 'good-key'))
        .rejects.toThrow('Invalid tracking number')
    })

    it('should determine DELIVERED status correctly', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          returnCode: 200,
          returnMessage: 'OK',
          shipment: {
            idShip: '6A12345678901',
            holder: 1,
            product: 'Colissimo',
            isFinal: true,
            timeline: [
              { shortLabel: 'Pris en charge', longLabel: 'Pris en charge', date: '2024-01-15T10:00:00Z', status: true, type: 1 },
              { shortLabel: 'En transit', longLabel: 'En transit', date: '2024-01-16T08:00:00Z', status: true, type: 2 },
              { shortLabel: 'En livraison', longLabel: 'En cours de livraison', date: '2024-01-17T09:00:00Z', status: true, type: 3 },
              { shortLabel: 'Livré', longLabel: 'Livré', date: '2024-01-17T14:00:00Z', status: true, type: 4 }
            ],
            event: []
          }
        })
      } as any)

      const result = await trackShipment('6A12345678901', 'key')
      expect(result.status).toBe('DELIVERED')
      expect(result.isFinal).toBe(true)
      expect(result.events).toHaveLength(4)
    })

    it('should sort events by date (most recent first)', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          returnCode: 200,
          returnMessage: 'OK',
          shipment: {
            idShip: '6A12345678901',
            holder: 1,
            product: 'Colissimo',
            isFinal: false,
            timeline: [
              { shortLabel: 'Step 1', longLabel: 'First event', date: '2024-01-15T10:00:00Z', status: true, type: 1 },
              { shortLabel: 'Step 2', longLabel: 'Second event', date: '2024-01-16T10:00:00Z', status: true, type: 2 }
            ],
            event: []
          }
        })
      } as any)

      const result = await trackShipment('6A12345678901', 'key')
      expect(result.events[0].description).toBe('Second event')
      expect(result.events[1].description).toBe('First event')
    })
  })

  describe('testConnection', () => {
    beforeEach(() => {
      vi.restoreAllMocks()
    })

    it('should return ok: true for valid API key', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        status: 404, // 404 = auth OK, tracking not found (expected)
        ok: false
      } as any)

      const result = await testConnection('valid-key')
      expect(result.ok).toBe(true)
    })

    it('should return ok: false for 401', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        status: 401,
        ok: false
      } as any)

      const result = await testConnection('invalid-key')
      expect(result.ok).toBe(false)
      expect(result.error).toBe('Clé API invalide')
    })

    it('should return ok: false for 403', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        status: 403,
        ok: false
      } as any)

      const result = await testConnection('forbidden-key')
      expect(result.ok).toBe(false)
      expect(result.error).toBe('Clé API invalide')
    })

    it('should handle network errors', async () => {
      vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'))

      const result = await testConnection('key')
      expect(result.ok).toBe(false)
      expect(result.error).toBe('Network error')
    })
  })
})
