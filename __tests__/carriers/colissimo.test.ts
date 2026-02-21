import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateLabel, testColissimoConnection } from '@/lib/carriers/colissimo'

describe('Colissimo', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('generateLabel', () => {
    it('should call Colissimo API with multipart form data', async () => {
      // Simulate a successful multipart response with JSON + PDF
      const jsonResponse = JSON.stringify({
        messages: [],
        labelV2Response: {
          parcelNumber: '6A12345678901'
        }
      })
      const pdfContent = Buffer.from('%PDF-1.4 fake pdf content')

      const boundary = '----=_Part_123'
      const multipartBody = [
        `--${boundary}\r\n`,
        'Content-Type: application/json\r\n\r\n',
        jsonResponse,
        `\r\n--${boundary}\r\n`,
        'Content-Type: application/pdf\r\n\r\n',
        pdfContent.toString('binary'),
        `\r\n--${boundary}--\r\n`
      ].join('')

      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        headers: new Headers({
          'content-type': `multipart/mixed; boundary=${boundary}`
        }),
        arrayBuffer: () => Promise.resolve(Buffer.from(multipartBody).buffer)
      } as any)

      const result = await generateLabel({
        contractNumber: '123456',
        password: 'test-password',
        sender: {
          firstName: 'Faith',
          lastName: 'Shop',
          address: '1 rue du Commerce',
          city: 'Paris',
          zipCode: '75001',
          countryCode: 'FR'
        },
        recipient: {
          firstName: 'Jean',
          lastName: 'Dupont',
          address: '10 avenue des Champs',
          city: 'Lyon',
          zipCode: '69001',
          countryCode: 'FR'
        },
        weight: 0.5,
        orderNumber: 'FS-001'
      })

      expect(fetchSpy).toHaveBeenCalledWith(
        'https://ws.colissimo.fr/sls-ws/SlsServiceWSRest/2.0/generateLabel',
        expect.objectContaining({ method: 'POST' })
      )

      expect(result.trackingNumber).toBe('6A12345678901')
      expect(result.trackingUrl).toContain('6A12345678901')
    })

    it('should handle JSON-only error response', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({
          messages: [
            { id: 'AUTH_ERROR', type: 'ERROR', messageContent: 'Authentication failed' }
          ]
        })
      } as any)

      await expect(generateLabel({
        contractNumber: 'bad',
        password: 'bad',
        sender: { firstName: 'A', lastName: 'B', address: 'X', city: 'Y', zipCode: '00000', countryCode: 'FR' },
        recipient: { firstName: 'C', lastName: 'D', address: 'X', city: 'Y', zipCode: '00000', countryCode: 'FR' },
        weight: 1
      })).rejects.toThrow('Authentication failed')
    })

    it('should handle HTTP errors', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal Server Error')
      } as any)

      await expect(generateLabel({
        contractNumber: '123',
        password: 'pass',
        sender: { firstName: 'A', lastName: 'B', address: 'X', city: 'Y', zipCode: '00000', countryCode: 'FR' },
        recipient: { firstName: 'C', lastName: 'D', address: 'X', city: 'Y', zipCode: '00000', countryCode: 'FR' },
        weight: 1
      })).rejects.toThrow('Colissimo API error 500')
    })
  })

  describe('testColissimoConnection', () => {
    it('should return ok: true for valid credentials', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          messages: [
            { id: 'FIELD_REQUIRED', type: 'ERROR', messageContent: 'Address required' }
          ]
        })
      } as any)

      const result = await testColissimoConnection('123456', 'password')
      expect(result.ok).toBe(true)
    })

    it('should return ok: false for auth errors', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          messages: [
            { id: 'AUTH_ERR', type: 'ERROR', messageContent: 'Echec authentification' }
          ]
        })
      } as any)

      const result = await testColissimoConnection('bad', 'bad')
      expect(result.ok).toBe(false)
      expect(result.error).toBe('Identifiants invalides')
    })

    it('should handle network errors', async () => {
      vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Connection refused'))

      const result = await testColissimoConnection('123', 'pass')
      expect(result.ok).toBe(false)
      expect(result.error).toBe('Connection refused')
    })
  })
})
