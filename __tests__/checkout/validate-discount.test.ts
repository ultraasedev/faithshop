import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Prisma
const mockFindUnique = vi.fn()
vi.mock('@/lib/prisma', () => ({
  prisma: {
    discountCode: {
      findUnique: (...args: any[]) => mockFindUnique(...args),
    },
  },
}))

// Import the route handler after mocking
const { POST } = await import('@/app/api/checkout/validate-discount/route')

function makeRequest(body: any) {
  return new Request('http://localhost/api/checkout/validate-discount', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/checkout/validate-discount', () => {
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

  it('should return error for non-string code', async () => {
    const res = await POST(makeRequest({ code: 123 }))
    const data = await res.json()

    expect(res.status).toBe(400)
    expect(data.valid).toBe(false)
  })

  it('should return invalid for non-existent code', async () => {
    mockFindUnique.mockResolvedValue(null)

    const res = await POST(makeRequest({ code: 'FAKE', cartTotal: 100 }))
    const data = await res.json()

    expect(data.valid).toBe(false)
    expect(data.error).toBe('Code promo invalide')
  })

  it('should return invalid for inactive code', async () => {
    mockFindUnique.mockResolvedValue({
      code: 'INACTIVE',
      isActive: false,
      type: 'PERCENTAGE',
      value: 10,
    })

    const res = await POST(makeRequest({ code: 'INACTIVE', cartTotal: 100 }))
    const data = await res.json()

    expect(data.valid).toBe(false)
    expect(data.error).toContain('plus actif')
  })

  it('should return invalid for expired code', async () => {
    mockFindUnique.mockResolvedValue({
      code: 'EXPIRED',
      isActive: true,
      expiresAt: new Date('2020-01-01'),
      type: 'PERCENTAGE',
      value: 10,
    })

    const res = await POST(makeRequest({ code: 'EXPIRED', cartTotal: 100 }))
    const data = await res.json()

    expect(data.valid).toBe(false)
    expect(data.error).toContain('expiré')
  })

  it('should return invalid when usage limit reached', async () => {
    mockFindUnique.mockResolvedValue({
      code: 'LIMIT',
      isActive: true,
      usageLimit: 5,
      usageCount: 5,
      type: 'PERCENTAGE',
      value: 10,
    })

    const res = await POST(makeRequest({ code: 'LIMIT', cartTotal: 100 }))
    const data = await res.json()

    expect(data.valid).toBe(false)
    expect(data.error).toContain('limite')
  })

  it('should return invalid when cart below minimum purchase', async () => {
    mockFindUnique.mockResolvedValue({
      code: 'MINPURCHASE',
      isActive: true,
      minPurchase: 50,
      type: 'PERCENTAGE',
      value: 10,
    })

    const res = await POST(makeRequest({ code: 'MINPURCHASE', cartTotal: 30 }))
    const data = await res.json()

    expect(data.valid).toBe(false)
    expect(data.error).toContain('50.00€')
  })

  it('should calculate percentage discount correctly', async () => {
    mockFindUnique.mockResolvedValue({
      code: 'SAVE20',
      isActive: true,
      type: 'PERCENTAGE',
      value: 20,
      maxDiscount: null,
      minPurchase: null,
      usageLimit: null,
      startsAt: null,
      expiresAt: null,
    })

    const res = await POST(makeRequest({ code: 'save20', cartTotal: 100 }))
    const data = await res.json()

    expect(data.valid).toBe(true)
    expect(data.discountAmount).toBe(20)
    expect(data.description).toBe('-20%')
  })

  it('should cap percentage discount with maxDiscount', async () => {
    mockFindUnique.mockResolvedValue({
      code: 'SAVE50',
      isActive: true,
      type: 'PERCENTAGE',
      value: 50,
      maxDiscount: 15,
      minPurchase: null,
      usageLimit: null,
      startsAt: null,
      expiresAt: null,
    })

    const res = await POST(makeRequest({ code: 'SAVE50', cartTotal: 100 }))
    const data = await res.json()

    expect(data.valid).toBe(true)
    expect(data.discountAmount).toBe(15) // capped at maxDiscount
  })

  it('should calculate fixed amount discount correctly', async () => {
    mockFindUnique.mockResolvedValue({
      code: 'FLAT10',
      isActive: true,
      type: 'FIXED_AMOUNT',
      value: 10,
      minPurchase: null,
      usageLimit: null,
      startsAt: null,
      expiresAt: null,
    })

    const res = await POST(makeRequest({ code: 'FLAT10', cartTotal: 50 }))
    const data = await res.json()

    expect(data.valid).toBe(true)
    expect(data.discountAmount).toBe(10)
    expect(data.description).toBe('-10.00€')
  })

  it('should handle FREE_SHIPPING type', async () => {
    mockFindUnique.mockResolvedValue({
      code: 'FREESHIP',
      isActive: true,
      type: 'FREE_SHIPPING',
      value: 0,
      minPurchase: null,
      usageLimit: null,
      startsAt: null,
      expiresAt: null,
    })

    const res = await POST(makeRequest({ code: 'FREESHIP', cartTotal: 30 }))
    const data = await res.json()

    expect(data.valid).toBe(true)
    expect(data.discountAmount).toBe(0)
    expect(data.description).toBe('Livraison gratuite')
  })

  it('should normalize code to uppercase', async () => {
    mockFindUnique.mockResolvedValue(null)

    await POST(makeRequest({ code: '  welcome10  ', cartTotal: 100 }))

    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { code: 'WELCOME10' },
    })
  })
})
