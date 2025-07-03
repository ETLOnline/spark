export async function GET(request: Request) {
  try {
    const os = await import("os")
    const dns = await import("dns")
    const net = await import("net")
    const dnsPromises = dns.promises

    // Container environment info
    const containerInfo = {
      hostname: os.hostname(),
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      networkInterfaces: Object.keys(os.networkInterfaces()),
      memory: process.memoryUsage(),
      isLinuxAppService:
        !!process.env.WEBSITE_SITE_NAME && os.platform() === "linux",
      environmentKeys: Object.keys(process.env).filter((k) =>
        k.startsWith("WEBSITE_")
      ),
      websiteSiteName: process.env.WEBSITE_SITE_NAME || "Not Azure App Service",
      isStandalone:
        process.env.NODE_ENV === "production" || !!process.env.STANDALONE
    }

    // DNS test
    const dbHost = process.env.DB_HOST
    let dnsResult = null
    if (dbHost) {
      try {
        dnsResult = await dnsPromises.resolve4(dbHost)
      } catch (dnsError: any) {
        dnsResult = { error: dnsError.message }
      }
    }

    console.log("Debug container API called") // Check if this appears in logs

    // Network connectivity test

    const testConnection = (dbHost: any) =>
      new Promise((resolve) => {
        const socket = new net.Socket()
        const timeout = setTimeout(() => {
          socket.destroy()
          resolve({ connected: false, error: "timeout" })
        }, 5000)

        if (!dbHost) {
          clearTimeout(timeout)
          resolve({ connected: false, error: "No database host found" })
          return
        }

        socket.connect(5432, dbHost, () => {
          clearTimeout(timeout)
          socket.destroy()
          resolve({ connected: true })
        })

        socket.on("error", (err) => {
          clearTimeout(timeout)
          resolve({ connected: false, error: err.message })
        })
      })

    const networkTest = dbHost ? await testConnection(dbHost) : null

    return Response.json({
      success: true,
      container: containerInfo,
      database: {
        host: dbHost || "No DATABASE_URL found",
        dns: dnsResult,
        connectivity: networkTest
      },
      request: {
        url: request.url,
        method: request.method
      },
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error("Container debug error:", error)
    return Response.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
        standalone: true
      },
      { status: 500 }
    )
  }
}
