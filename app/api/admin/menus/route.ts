import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const menus = await prisma.menu.findMany({
      include: {
        items: {
          where: { parentId: null },
          orderBy: { order: 'asc' },
          include: {
            items: {
              orderBy: { order: 'asc' }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, menus })
  } catch (error) {
    console.error('Error fetching menus:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { handle, title } = body

    if (!handle || !title) {
      return NextResponse.json({ error: 'Handle et titre requis' }, { status: 400 })
    }

    // Check if handle already exists
    const existing = await prisma.menu.findUnique({ where: { handle } })
    if (existing) {
      return NextResponse.json({ error: 'Ce handle existe déjà' }, { status: 400 })
    }

    const menu = await prisma.menu.create({
      data: { handle, title },
      include: {
        items: {
          where: { parentId: null },
          orderBy: { order: 'asc' },
          include: { items: true }
        }
      }
    })

    return NextResponse.json({ success: true, menu })
  } catch (error) {
    console.error('Error creating menu:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { id, title, items } = body

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    // Update menu title if provided
    if (title) {
      await prisma.menu.update({
        where: { id },
        data: { title }
      })
    }

    // Update items if provided
    if (items && Array.isArray(items)) {
      // Delete existing items and recreate
      await prisma.menuItem.deleteMany({ where: { menuId: id } })

      // Create new items
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const createdItem = await prisma.menuItem.create({
          data: {
            menuId: id,
            title: item.title,
            url: item.url,
            order: i
          }
        })

        // Create sub-items if any
        if (item.items && Array.isArray(item.items)) {
          for (let j = 0; j < item.items.length; j++) {
            const subItem = item.items[j]
            await prisma.menuItem.create({
              data: {
                menuId: id,
                parentId: createdItem.id,
                title: subItem.title,
                url: subItem.url,
                order: j
              }
            })
          }
        }
      }
    }

    // Fetch updated menu
    const menu = await prisma.menu.findUnique({
      where: { id },
      include: {
        items: {
          where: { parentId: null },
          orderBy: { order: 'asc' },
          include: { items: { orderBy: { order: 'asc' } } }
        }
      }
    })

    return NextResponse.json({ success: true, menu })
  } catch (error) {
    console.error('Error updating menu:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    await prisma.menu.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Menu supprimé' })
  } catch (error) {
    console.error('Error deleting menu:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
