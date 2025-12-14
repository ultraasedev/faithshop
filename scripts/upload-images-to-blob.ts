// Script pour uploader toutes les images vers Vercel Blob
import { put } from '@vercel/blob'
import * as fs from 'fs'
import * as path from 'path'
import { glob } from 'glob'

async function uploadImageToBlob(filePath: string): Promise<string> {
  const fileName = path.basename(filePath)
  const fileBuffer = fs.readFileSync(filePath)

  try {
    const blob = await put(fileName, fileBuffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN!
    })

    console.log(`✅ Uploaded: ${fileName} → ${blob.url}`)
    return blob.url
  } catch (error) {
    console.error(`❌ Failed to upload ${fileName}:`, error)
    throw error
  }
}

async function uploadAllImages() {
  console.log('📸 Upload des images vers Vercel Blob...')

  // Trouver toutes les images
  const imagePatterns = [
    'public/**/*.{jpg,jpeg,png,gif,webp}',
    'public/*.{jpg,jpeg,png,gif,webp}'
  ]

  const imageFiles: string[] = []
  for (const pattern of imagePatterns) {
    const files = glob.sync(pattern)
    imageFiles.push(...files)
  }

  console.log(`🔍 Trouvé ${imageFiles.length} images à uploader`)

  const uploadPromises = imageFiles.map(async (filePath) => {
    try {
      const url = await uploadImageToBlob(filePath)
      return {
        localPath: filePath,
        blobUrl: url,
        success: true
      }
    } catch (error) {
      return {
        localPath: filePath,
        blobUrl: null,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  })

  const results = await Promise.allSettled(uploadPromises)

  // Résultats
  console.log('\n📊 Résultats upload:')
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      const data = result.value
      if (data.success) {
        console.log(`   ✅ ${path.basename(data.localPath)}`)
      } else {
        console.log(`   ❌ ${path.basename(data.localPath)}: ${data.error}`)
      }
    }
  })

  console.log('\n🎉 Upload terminé!')
}

if (require.main === module) {
  uploadAllImages().catch(console.error)
}

export default uploadAllImages