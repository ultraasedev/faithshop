import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function resetAdmin() {
  console.log('🔄 Suppression des comptes admin existants...')

  // Supprimer tous les utilisateurs avec des rôles admin
  const deletedUsers = await prisma.user.deleteMany({
    where: {
      OR: [
        { role: 'ADMIN' },
        { role: 'SUPER_ADMIN' }
      ]
    }
  })

  console.log(`❌ ${deletedUsers.count} comptes admin supprimés`)

  console.log('✨ Création du nouveau compte admin...')

  // Créer le nouveau compte admin
  const hashedPassword = await hash('Faithadmin@', 12)

  const newAdmin = await prisma.user.create({
    data: {
      name: 'Admin Faith Shop',
      email: 'contact@faith-shop.fr',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      canManageProducts: true,
      canManageOrders: true,
      canManageUsers: true,
      canManageSettings: true,
      canManageDiscounts: true,
      canManageShipping: true,
    }
  })

  console.log('✅ Nouveau admin créé:')
  console.log(`📧 Email: ${newAdmin.email}`)
  console.log(`🔑 Mot de passe: Faithadmin@`)
  console.log(`👑 Rôle: ${newAdmin.role}`)

  console.log('🎉 Reset admin terminé!')
}

resetAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect())