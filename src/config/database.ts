import { Db, Document, MongoClient } from 'mongodb'

let client: MongoClient | null = null
let db: Db | null = null

const connectDB = async (): Promise<void> => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI
    
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is required')
    }

    const options = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000 // Close sockets after 45 seconds of inactivity
    }

    client = new MongoClient(MONGODB_URI, options)
    await client.connect()
    
    // Get database name from URI or use default
    const dbName = process.env.DB_NAME
    db = client.db(dbName)
    
    console.log('✅ MongoDB connected successfully')
    
    // Handle connection events
    client.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err)
    })

    client.on('close', () => {
      console.warn('⚠️ MongoDB connection closed')
    })

    client.on('reconnect', () => {
      console.log('🔄 MongoDB reconnected')
    })

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error)
    process.exit(1)
  }
}

const disconnectDB = async (): Promise<void> => {
  try {
    if (client) {
      await client.close()
      client = null
      db = null
      console.log('✅ MongoDB disconnected successfully')
    }
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error)
  }
}

const getDB = (): Db => {
  if (!db) {
    throw new Error('Database not connected. Call connectDB() first.')
  }
  return db
}

const getCollection = <T extends Document = Document>(collectionName: string) => {
  const database = getDB()
  return database.collection<T>(collectionName)
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await disconnectDB()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await disconnectDB()
  process.exit(0)
})

export { connectDB, disconnectDB, getCollection, getDB }

