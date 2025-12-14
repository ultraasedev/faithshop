import { hash } from 'bcryptjs'
import { prisma } from '../lib/prisma'

async function createFranckAdmin() {
  try {
    console.log('Creating admin user for Franck Guerin...')

    const hashedPassword = await hash('admin123@', 12)

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: 'contact@playstart.fr' }
    })

    if (existingUser) {
      // Mettre à jour l'utilisateur existant
      const updatedUser = await prisma.user.update({
        where: { email: 'contact@playstart.fr' },
        data: {
          name: 'Franck Guerin',
          email: 'contact@playstart.fr',
          password: hashedPassword,
          role: 'ADMIN',
        }
      })
      console.log('✅ Admin user updated:', {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      })
    } else {
      // Créer nouvel utilisateur
      const newUser = await prisma.user.create({
        data: {
          name: 'Franck Guerin',
          email: 'contact@playstart.fr',
          password: hashedPassword,
          role: 'ADMIN',
        }
      })
      console.log('✅ Admin user created:', {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      })
    }

    console.log('🔐 Login credentials:')
    console.log('Email: contact@playstart.fr')
    console.log('Password: admin123@')

  } catch (error) {
    console.error('❌ Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createFranckAdmin()