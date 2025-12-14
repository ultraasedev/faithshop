// Test de l'API de paiement avec les produits réels

async function testPaymentAPI() {
  console.log('💳 Testing payment API...')

  // D'abord récupérer un ID de produit réel
  try {
    // Simuler un produit du panier (utilisant l'ID d'un vrai produit)
    const cartItems = [
      {
        id: "cmj5zi6x20000c2dkla79q256", // Un des IDs de produit réels
        productId: "cmj5zi6x20000c2dkla79q256",
        name: "Ensemble Velours \"Jesus is King\"",
        price: 79.99,
        quantity: 1,
        image: "/prd/Jesus-is-King/IMG_8413.JPG",
        color: "Noir",
        size: "M"
      }
    ]

    console.log('🛒 Testing with cart items:', JSON.stringify(cartItems, null, 2))

    const response = await fetch('http://localhost:3000/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items: cartItems
      })
    })

    const data = await response.json()

    console.log('📊 Response status:', response.status)
    console.log('📊 Response data:', JSON.stringify(data, null, 2))

    if (response.ok && data.clientSecret) {
      console.log('✅ Payment API test passed!')
      console.log('🔐 Client secret received:', data.clientSecret.substring(0, 20) + '...')
    } else {
      console.log('❌ Payment API test failed!')
    }

  } catch (error) {
    console.error('❌ Error testing payment API:', error)
  }
}

// Test avec un produit inexistant
async function testPaymentWithInvalidProduct() {
  console.log('\n💳 Testing payment API with invalid product...')

  try {
    const cartItems = [
      {
        id: "invalid-product-id",
        productId: "invalid-product-id",
        name: "Produit inexistant",
        price: 50,
        quantity: 1,
        image: "/test.jpg",
        color: "Rouge",
        size: "L"
      }
    ]

    const response = await fetch('http://localhost:3000/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items: cartItems
      })
    })

    const data = await response.json()

    console.log('📊 Response status:', response.status)
    console.log('📊 Response data:', JSON.stringify(data, null, 2))

    if (response.status === 400 && data.error.includes('non disponible')) {
      console.log('✅ Invalid product test passed (correctly rejected)!')
    } else {
      console.log('❌ Invalid product test failed!')
    }

  } catch (error) {
    console.error('❌ Error testing payment API:', error)
  }
}

async function runPaymentTests() {
  await testPaymentAPI()
  await testPaymentWithInvalidProduct()
}

runPaymentTests()