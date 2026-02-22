import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Prisma
const mockProductFindUnique = vi.fn()
const mockDiscountFindUnique = vi.fn()
const mockGiftCardFindUnique = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    product: {
      findUnique: (...args: any[]) => mockProductFindUnique(...args),
    },
    discountCode: {
      findUnique: (...args: any[]) => mockDiscountFindUnique(...args),
    },
    giftCard: {
      findUnique: (...args: any[]) => mockGiftCardFindUnique(...args),
    },
  },
}))

// Mock Stripe
const mockStripeUpdate = vi.fn().mockResolvedValue({})
vi.mock('@/lib/stripe', () => ({
  stripe: {
    paymentIntents: {
      update: (...args: any[]) => mockStripeUpdate(...args),
    },
  },
}))

const { POST } = await import('@/app/api/checkout/update-payment-intent/route')

function makeRequest(body: any) {
  return new Request('http://localhost/api/checkout/update-payment-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

const validProduct = {
  id: 'prod-1',
  name: 'T-Shirt Faith',
  price: 30,
  stock: 10,
  isActive: true,
  productType: 'IN_STOCK',
}

const podProduct = {
  id: 'prod-2',
  name: 'Custom Hoodie',
  price: 50,
  stock: 0,
  isActive: true,
  productType: 'PRINT_ON_DEMAND',
}

describe('POST /api/checkout/update-payment-intent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockProductFindUnique.mockResolvedValue(validProduct)
  })

  it('should return error for missing data', async () => {
    const res = await POST(makeRequest({}))
    const data = await res.json()

    expect(res.status).toBe(400)
    expect(data.error).toBe('Données manquantes')
  })

  it('should update PI with just items (no discount/gift card)', async () => {
    const res = await POST(makeRequest({
      paymentIntentId: 'pi_test123',
      items: [{ id: 'prod-1', quantity: 2, image: '', color: '', size: '' }],
    }))
    const data = await res.json()

    expect(data.success).toBe(true)
    expect(data.subtotal).toBe(60) // 30 * 2
    expect(data.discountAmount).toBe(0)
    expect(data.giftCardAmount).toBe(0)
    expect(data.total).toBe(60)

    expect(mockStripeUpdate).toHaveBeenCalledWith('pi_test123', expect.objectContaining({
      amount: 6000, // 60 * 100 cents
    }))
  })

  it('should apply percentage discount correctly', async () => {
    mockDiscountFindUnique.mockResolvedValue({
      id: 'dc-1',
      code: 'SAVE20',
      isActive: true,
      type: 'PERCENTAGE',
      value: 20,
      maxDiscount: null,
      minPurchase: null,
      usageLimit: null,
      usageCount: 0,
      startsAt: null,
      expiresAt: null,
    })

    const res = await POST(makeRequest({
      paymentIntentId: 'pi_test123',
      items: [{ id: 'prod-1', quantity: 2, image: '', color: '', size: '' }],
      discountCode: 'SAVE20',
    }))
    const data = await res.json()

    expect(data.success).toBe(true)
    expect(data.subtotal).toBe(60)
    expect(data.discountAmount).toBe(12) // 20% of 60
    expect(data.total).toBe(48)
  })

  it('should apply gift card and cap at remaining total', async () => {
    mockGiftCardFindUnique.mockResolvedValue({
      id: 'gc-1',
      code: 'GIFT5000',
      status: 'ACTIVE',
      balance: 100, // More than the total
      expiresAt: null,
    })

    const res = await POST(makeRequest({
      paymentIntentId: 'pi_test123',
      items: [{ id: 'prod-1', quantity: 1, image: '', color: '', size: '' }],
      giftCardCode: 'GIFT5000',
    }))
    const data = await res.json()

    expect(data.success).toBe(true)
    expect(data.subtotal).toBe(30)
    expect(data.giftCardAmount).toBe(30) // Capped at total
    expect(data.total).toBe(0.50) // Stripe minimum
  })

  it('should apply both discount and gift card', async () => {
    mockDiscountFindUnique.mockResolvedValue({
      id: 'dc-1',
      code: 'SAVE10',
      isActive: true,
      type: 'FIXED_AMOUNT',
      value: 10,
      maxDiscount: null,
      minPurchase: null,
      usageLimit: null,
      usageCount: 0,
      startsAt: null,
      expiresAt: null,
    })
    mockGiftCardFindUnique.mockResolvedValue({
      id: 'gc-1',
      code: 'GIFT2000',
      status: 'ACTIVE',
      balance: 15,
      expiresAt: null,
    })

    const res = await POST(makeRequest({
      paymentIntentId: 'pi_test123',
      items: [{ id: 'prod-1', quantity: 2, image: '', color: '', size: '' }],
      discountCode: 'SAVE10',
      giftCardCode: 'GIFT2000',
    }))
    const data = await res.json()

    expect(data.success).toBe(true)
    expect(data.subtotal).toBe(60)
    expect(data.discountAmount).toBe(10)
    expect(data.giftCardAmount).toBe(15) // min(15, 60-10=50)
    expect(data.total).toBe(35) // 60 - 10 - 15
  })

  it('should skip stock check for POD products', async () => {
    mockProductFindUnique.mockResolvedValue(podProduct) // stock = 0 but POD

    const res = await POST(makeRequest({
      paymentIntentId: 'pi_test123',
      items: [{ id: 'prod-2', quantity: 1, image: '', color: '', size: '' }],
    }))
    const data = await res.json()

    expect(data.success).toBe(true)
    expect(data.subtotal).toBe(50)
  })

  it('should reject out-of-stock non-POD products', async () => {
    mockProductFindUnique.mockResolvedValue({
      ...validProduct,
      stock: 0,
    })

    const res = await POST(makeRequest({
      paymentIntentId: 'pi_test123',
      items: [{ id: 'prod-1', quantity: 1, image: '', color: '', size: '' }],
    }))
    const data = await res.json()

    expect(res.status).toBe(400)
    expect(data.error).toContain('Stock insuffisant')
  })

  it('should store discount metadata in PaymentIntent', async () => {
    mockDiscountFindUnique.mockResolvedValue({
      id: 'dc-abc',
      code: 'PROMO',
      isActive: true,
      type: 'PERCENTAGE',
      value: 10,
      maxDiscount: null,
      minPurchase: null,
      usageLimit: null,
      usageCount: 0,
      startsAt: null,
      expiresAt: null,
    })

    await POST(makeRequest({
      paymentIntentId: 'pi_test123',
      items: [{ id: 'prod-1', quantity: 1, image: '', color: '', size: '' }],
      discountCode: 'PROMO',
    }))

    expect(mockStripeUpdate).toHaveBeenCalledWith('pi_test123', expect.objectContaining({
      metadata: expect.objectContaining({
        discountCode: 'PROMO',
        discountCodeId: 'dc-abc',
        discountAmount: '3',
      }),
    }))
  })
})
