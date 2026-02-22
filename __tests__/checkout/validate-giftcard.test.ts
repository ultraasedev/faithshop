import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Prisma
const mockFindUnique = vi.fn()
vi.mock('@/lib/prisma', () => ({
  prisma: {
    giftCard: {
      findUnique: (...args: any[]) => mockFindUnique(...args),
    },
  },
}))

const { POST } = await import('@/app/api/checkout/validate-giftcard/route')

function makeRequest(body: any) {
  return new Request('http://localhost/api/checkout/validate-giftcard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/checkout/validate-giftcard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return error for missing code', async () => {
    const res = await POST(makeRequest({}))
    const data = await res.json()

    expect(res.status).toBe(400)
    expect(data.valid).toBe(false)
    expect(data.error).toBe('Code requis')
  })

  it('should return invalid for non-existent card', async () => {
    mockFindUnique.mockResolvedValue(null)

    const res = await POST(makeRequest({ code: 'FAKE1234' }))
    const data = await res.json()

    expect(data.valid).toBe(false)
    expect(data.error).toBe('Carte cadeau invalide')
  })

  it('should return invalid for inactive card', async () => {
    mockFindUnique.mockResolvedValue({
      code: 'USED1234',
      status: 'USED',
      balance: 0,
    })

    const res = await POST(makeRequest({ code: 'USED1234' }))
    const data = await res.json()

    expect(data.valid).toBe(false)
    expect(data.error).toContain('plus active')
  })

  it('should return invalid for expired card', async () => {
    mockFindUnique.mockResolvedValue({
      code: 'EXPIRED1',
      status: 'ACTIVE',
      expiresAt: new Date('2020-01-01'),
      balance: 50,
    })

    const res = await POST(makeRequest({ code: 'EXPIRED1' }))
    const data = await res.json()

    expect(data.valid).toBe(false)
    expect(data.error).toContain('expiré')
  })

  it('should return invalid for zero balance card', async () => {
    mockFindUnique.mockResolvedValue({
      code: 'EMPTY123',
      status: 'ACTIVE',
      expiresAt: null,
      balance: 0,
    })

    const res = await POST(makeRequest({ code: 'EMPTY123' }))
    const data = await res.json()

    expect(data.valid).toBe(false)
    expect(data.error).toContain('solde de 0€')
  })

  it('should return valid card with balance', async () => {
    mockFindUnique.mockResolvedValue({
      code: 'GIFT5000',
      status: 'ACTIVE',
      expiresAt: null,
      balance: 50,
    })

    const res = await POST(makeRequest({ code: 'GIFT5000' }))
    const data = await res.json()

    expect(data.valid).toBe(true)
    expect(data.code).toBe('GIFT5000')
    expect(data.balance).toBe(50)
  })

  it('should strip dashes and normalize code', async () => {
    mockFindUnique.mockResolvedValue(null)

    await POST(makeRequest({ code: ' gift-1234-5678 ' }))

    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { code: 'GIFT12345678' },
    })
  })

  it('should accept card with future expiry', async () => {
    const futureDate = new Date()
    futureDate.setFullYear(futureDate.getFullYear() + 1)

    mockFindUnique.mockResolvedValue({
      code: 'FUTURE12',
      status: 'ACTIVE',
      expiresAt: futureDate,
      balance: 25,
    })

    const res = await POST(makeRequest({ code: 'FUTURE12' }))
    const data = await res.json()

    expect(data.valid).toBe(true)
    expect(data.balance).toBe(25)
  })
})
