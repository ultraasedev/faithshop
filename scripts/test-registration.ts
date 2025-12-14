// Test de la création de compte

async function testRegistration() {
  console.log('📝 Testing user registration...')

  const testUser = {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'TestPassword123!'
  }

  try {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    })

    const data = await response.json()

    console.log('📊 Response status:', response.status)
    console.log('📊 Response data:', JSON.stringify(data, null, 2))

    if (response.ok) {
      console.log('✅ User registration test passed!')
      console.log('👤 Created user:', testUser.email)
    } else {
      console.log('❌ User registration test failed!')
    }

  } catch (error) {
    console.error('❌ Error testing user registration:', error)
  }
}

// Test avec email existant
async function testRegistrationDuplicateEmail() {
  console.log('\n📝 Testing registration with existing email...')

  try {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Duplicate User',
        email: 'contact@playstart.fr', // Email qui existe déjà
        password: 'TestPassword123!'
      })
    })

    const data = await response.json()

    console.log('📊 Response status:', response.status)
    console.log('📊 Response data:', JSON.stringify(data, null, 2))

    if (response.status === 400 && data.error && data.error.includes('existe')) {
      console.log('✅ Duplicate email test passed (correctly rejected)!')
    } else {
      console.log('❌ Duplicate email test failed!')
    }

  } catch (error) {
    console.error('❌ Error testing duplicate registration:', error)
  }
}

async function runRegistrationTests() {
  await testRegistration()
  await testRegistrationDuplicateEmail()
}

runRegistrationTests()