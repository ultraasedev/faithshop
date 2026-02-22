import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Prisma
const mockFindUnique = vi.fn()
const mockCreate = vi.fn()
const mockUpdate = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    newsletterSubscriber: {
      findUnique: (...args: any[]) => mockFindUnique(...args),
      create: (...args: any[]) => mockCreate(...args),
      update: (...args: any[]) => mockUpdate(...args),
    },
  },
}))

// Mock email
vi.mock('@/lib/email', () => ({
  sendNewsletterWelcomeEmail: vi.fn().mockResolvedValue({ success: true }),
}))

const { POST } = await import('@/app/api/newsletter/subscribe/route')

function makeRequest(body: any) {
  return new Request('http://localhost/api/newsletter/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/newsletter/subscribe', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return error for missing email', async () => {
    const res = await POST(makeRequest({}))
    const data = await res.json()

    expect(res.status).toBe(400)
    expect(data.error).toBe('Email invalide')
  })

  it('should return error for invalid email', async () => {
    const res = await POST(makeRequest({ email: 'notanemail' }))
    const data = await res.json()

    expect(res.status).toBe(400)
    expect(data.error).toBe('Email invalide')
  })

  it('should create a new subscriber', async () => {
    mockFindUnique.mockResolvedValue(null)
    mockCreate.mockResolvedValue({ id: '1', email: 'test@example.com' })

    const res = await POST(makeRequest({ email: 'test@example.com' }))
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.success).toBe(true)
    expect(mockCreate).toHaveBeenCalledWith({
      data: { email: 'test@example.com' },
    })
  })

  it('should return conflict for already active subscriber', async () => {
    mockFindUnique.mockResolvedValue({
      id: '1',
      email: 'existing@example.com',
      isActive: true,
    })

    const res = await POST(makeRequest({ email: 'existing@example.com' }))
    const data = await res.json()

    expect(res.status).toBe(409)
    expect(data.error).toContain('déjà inscrit')
  })

  it('should reactivate inactive subscriber', async () => {
    mockFindUnique.mockResolvedValue({
      id: '1',
      email: 'inactive@example.com',
      isActive: false,
    })
    mockUpdate.mockResolvedValue({ id: '1', isActive: true })

    const res = await POST(makeRequest({ email: 'inactive@example.com' }))
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.success).toBe(true)
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { email: 'inactive@example.com' },
      data: { isActive: true },
    })
  })

  it('should normalize email to lowercase', async () => {
    mockFindUnique.mockResolvedValue(null)
    mockCreate.mockResolvedValue({ id: '1', email: 'test@example.com' })

    await POST(makeRequest({ email: '  TEST@Example.COM  ' }))

    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { email: 'test@example.com' },
    })
  })
})
