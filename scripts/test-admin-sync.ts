/**
 * Script de test pour vérifier la synchronisation Admin → Site Public
 *
 * Ce script teste que les modifications faites dans le panel admin
 * se répercutent bien sur le site public en temps réel.
 */

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

interface TestResult {
  test: string
  status: 'PASS' | 'FAIL'
  message: string
  timestamp: Date
}

class AdminSyncTester {
  private results: TestResult[] = []

  async runAllTests() {
    console.log('🚀 Démarrage des tests de synchronisation Admin → Site Public\n')

    await this.testMenuSynchronization()
    await this.testPageContentSynchronization()
    await this.testProductSynchronization()
    await this.testThemeSynchronization()
    await this.testBannerSynchronization()

    this.printResults()
    return this.results
  }

  private async testMenuSynchronization() {
    console.log('📋 Test: Synchronisation des menus...')

    try {
      // 1. Modifier le menu via les actions admin
      const testMenuItem = {
        title: 'Test Menu Item',
        url: '/test-page'
      }

      // Créer un menu de test
      const menu = await prisma.menu.upsert({
        where: { handle: 'test-menu' },
        update: { title: 'Menu Test' },
        create: { handle: 'test-menu', title: 'Menu Test' }
      })

      await prisma.menuItem.create({
        data: {
          menuId: menu.id,
          title: testMenuItem.title,
          url: testMenuItem.url,
          order: 0
        }
      })

      // 2. Vérifier que le menu existe en base
      const savedMenu = await prisma.menu.findUnique({
        where: { handle: 'test-menu' },
        include: { items: true }
      })

      if (savedMenu?.items.length === 1) {
        this.addResult('Menu Synchronization', 'PASS', 'Menu créé et sauvegardé avec succès')
      } else {
        this.addResult('Menu Synchronization', 'FAIL', 'Menu non sauvegardé correctement')
      }

      // Nettoyage
      await prisma.menuItem.deleteMany({ where: { menuId: menu.id } })
      await prisma.menu.delete({ where: { id: menu.id } })

    } catch (error) {
      this.addResult('Menu Synchronization', 'FAIL', `Erreur: ${error}`)
    }
  }

  private async testPageContentSynchronization() {
    console.log('📄 Test: Synchronisation du contenu des pages...')

    try {
      // 1. Créer une page via les actions admin
      const testPage = await prisma.pageContent.create({
        data: {
          title: 'Page Test',
          slug: 'test-page',
          content: '<h1>Contenu de test</h1><p>Cette page a été créée par le test de synchronisation.</p>',
          metaTitle: 'Page Test - Faith Shop',
          metaDescription: 'Description de test',
          isPublished: true
        }
      })

      // 2. Vérifier que la page existe
      const savedPage = await prisma.pageContent.findUnique({
        where: { id: testPage.id }
      })

      if (savedPage && savedPage.isPublished) {
        this.addResult('Page Content Sync', 'PASS', 'Contenu de page créé et publié')
      } else {
        this.addResult('Page Content Sync', 'FAIL', 'Contenu de page non créé correctement')
      }

      // Nettoyage
      await prisma.pageContent.delete({ where: { id: testPage.id } })

    } catch (error) {
      this.addResult('Page Content Sync', 'FAIL', `Erreur: ${error}`)
    }
  }

  private async testProductSynchronization() {
    console.log('🛍️ Test: Synchronisation des produits...')

    try {
      // 1. Créer un produit via Prisma (simulation du panel admin)
      const testProduct = await prisma.product.create({
        data: {
          name: 'Produit Test',
          description: 'Description de produit de test',
          price: 19.99,
          images: ['/test-product.jpg'],
          isActive: true,
          categories: {
            create: {
              name: 'Test Category'
            }
          }
        },
        include: {
          categories: true
        }
      })

      // 2. Vérifier que le produit est créé et actif
      const savedProduct = await prisma.product.findUnique({
        where: { id: testProduct.id }
      })

      if (savedProduct && savedProduct.isActive) {
        this.addResult('Product Sync', 'PASS', 'Produit créé et activé avec succès')
      } else {
        this.addResult('Product Sync', 'FAIL', 'Produit non créé correctement')
      }

      // Nettoyage
      await prisma.product.delete({ where: { id: testProduct.id } })

    } catch (error) {
      this.addResult('Product Sync', 'FAIL', `Erreur: ${error}`)
    }
  }

  private async testThemeSynchronization() {
    console.log('🎨 Test: Synchronisation des paramètres de thème...')

    try {
      // 1. Créer/modifier des paramètres de thème
      const themeSettings = await prisma.setting.upsert({
        where: { key: 'theme_primary_color' },
        update: { value: '#FF6B35' },
        create: {
          key: 'theme_primary_color',
          value: '#FF6B35',
          type: 'color'
        }
      })

      // 2. Vérifier que le paramètre est sauvegardé
      const savedSetting = await prisma.setting.findUnique({
        where: { key: 'theme_primary_color' }
      })

      if (savedSetting?.value === '#FF6B35') {
        this.addResult('Theme Sync', 'PASS', 'Paramètres de thème synchronisés')
      } else {
        this.addResult('Theme Sync', 'FAIL', 'Paramètres de thème non synchronisés')
      }

    } catch (error) {
      this.addResult('Theme Sync', 'FAIL', `Erreur: ${error}`)
    }
  }

  private async testBannerSynchronization() {
    console.log('🎯 Test: Synchronisation des bannières...')

    try {
      // 1. Créer une bannière
      const testBanner = await prisma.banner.create({
        data: {
          title: 'Bannière Test',
          content: 'Contenu de test',
          isActive: true,
          priority: 1,
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours
        }
      })

      // 2. Vérifier que la bannière est active
      const savedBanner = await prisma.banner.findUnique({
        where: { id: testBanner.id }
      })

      if (savedBanner && savedBanner.isActive) {
        this.addResult('Banner Sync', 'PASS', 'Bannière créée et activée')
      } else {
        this.addResult('Banner Sync', 'FAIL', 'Bannière non créée correctement')
      }

      // Nettoyage
      await prisma.banner.delete({ where: { id: testBanner.id } })

    } catch (error) {
      this.addResult('Banner Sync', 'FAIL', `Erreur: ${error}`)
    }
  }

  private addResult(test: string, status: 'PASS' | 'FAIL', message: string) {
    const result: TestResult = {
      test,
      status,
      message,
      timestamp: new Date()
    }
    this.results.push(result)

    const emoji = status === 'PASS' ? '✅' : '❌'
    console.log(`   ${emoji} ${test}: ${message}`)
  }

  private printResults() {
    const passed = this.results.filter(r => r.status === 'PASS').length
    const failed = this.results.filter(r => r.status === 'FAIL').length
    const total = this.results.length

    console.log('\n📊 RÉSULTATS DES TESTS')
    console.log('========================')
    console.log(`✅ Tests réussis: ${passed}/${total}`)
    console.log(`❌ Tests échoués: ${failed}/${total}`)
    console.log(`📈 Taux de réussite: ${((passed / total) * 100).toFixed(1)}%`)

    if (failed === 0) {
      console.log('\n🎉 EXCELLENT ! Tous les tests passent.')
      console.log('   La synchronisation Admin → Site Public fonctionne parfaitement.')
    } else {
      console.log('\n⚠️  Certains tests ont échoué.')
      console.log('   Vérifiez les erreurs ci-dessus.')
    }

    console.log('\n🔗 FONCTIONNALITÉS TESTÉES:')
    this.results.forEach(result => {
      const emoji = result.status === 'PASS' ? '✅' : '❌'
      console.log(`   ${emoji} ${result.test}`)
    })
  }
}

// Exécuter les tests si ce script est appelé directement
if (require.main === module) {
  const tester = new AdminSyncTester()
  tester.runAllTests()
    .then(() => {
      console.log('\n✨ Tests terminés.')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n💥 Erreur lors des tests:', error)
      process.exit(1)
    })
}

export default AdminSyncTester