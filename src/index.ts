import 'dotenv/config';
import app from './app';
import { connectDB } from './config/database';

const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDB()

    const PORT = process.env.PORT || 3000
    const NODE_ENV = process.env.NODE_ENV || 'development'

    // Start server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`📊 Environment: ${NODE_ENV}`)
      console.log(`🔗 API URL: http://localhost:${PORT}`)
    })

    // Graceful shutdown
    const gracefulShutdown = (signal: string) => {
      console.log(`\n${signal} received. Shutting down gracefully...`)
      
      server.close(() => {
        console.log('✅ HTTP server closed')
        process.exit(0)
      })

      // Force close server after 10 seconds
      setTimeout(() => {
        console.error('❌ Could not close connections in time, forcefully shutting down')
        process.exit(1)
      }, 10000)
    }

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
    process.on('SIGINT', () => gracefulShutdown('SIGINT'))

  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
