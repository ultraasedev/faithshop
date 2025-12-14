// Test du système de récupération de mot de passe

async function testPasswordReset() {
  console.log('🔐 Testing password reset functionality...')

  try {
    // Test avec l'email de Franck Guerin
    const response = await fetch('http://localhost:3000/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'contact@playstart.fr'
      })
    })

    const data = await response.json()

    console.log('📊 Response status:', response.status)
    console.log('📊 Response data:', JSON.stringify(data, null, 2))

    if (response.ok) {
      console.log('✅ Password reset test passed!')
      if (data.resetUrl) {
        console.log('🔗 Reset URL (dev mode):', data.resetUrl)
      }
    } else {
      console.log('❌ Password reset test failed!')
    }

  } catch (error) {
    console.error('❌ Error testing password reset:', error)
  }
}

// Test avec un email inexistant
async function testPasswordResetInvalidEmail() {
  console.log('\n🔐 Testing password reset with invalid email...')

  try {
    const response = await fetch('http://localhost:3000/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'nonexistent@example.com'
      })
    })

    const data = await response.json()

    console.log('📊 Response status:', response.status)
    console.log('📊 Response data:', JSON.stringify(data, null, 2))

    if (response.ok && data.message.includes('lien de réinitialisation')) {
      console.log('✅ Invalid email test passed (security preserved)!')
    } else {
      console.log('❌ Invalid email test failed!')
    }

  } catch (error) {
    console.error('❌ Error testing password reset:', error)
  }
}

// Exécuter les tests
async function runAllTests() {
  await testPasswordReset()
  await testPasswordResetInvalidEmail()
}

runAllTests()