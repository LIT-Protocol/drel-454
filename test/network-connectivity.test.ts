import * as LitJsSdk from "@lit-protocol/lit-node-client-nodejs";

// Configuration constants
const NETWORKS = ["datil", "datil-test", "datil-dev"];
const CONNECTION_TIMEOUT = 30000; // 30 seconds timeout
const DEBUG_MODE = true;

async function testNetworkConnection(network: string): Promise<boolean> {
  let litNodeClient: LitJsSdk.LitNodeClientNodeJs | null = null;
  
  try {
    console.log(`Testing connection to network: ${network}`);
    
    litNodeClient = new LitJsSdk.LitNodeClientNodeJs({
      alertWhenUnauthorized: false,
      litNetwork: network as any,
      debug: DEBUG_MODE,
    });

    await litNodeClient.connect();
    console.log(`✅ Successfully connected to ${network}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to connect to ${network}:`, error);
    return false;
  } finally {
    // Cleanup connection if possible
    if (litNodeClient) {
      try {
        // @ts-ignore - disconnect might not be in types but often exists
        if (typeof litNodeClient.disconnect === 'function') {
          await litNodeClient.disconnect();
        }
      } catch (error) {
        console.warn(`Warning: Failed to disconnect from ${network}:`, error);
      }
    }
  }
}

/**
 * Runs connectivity tests for all specified networks
 */
async function runNetworkTests() {
  console.log("Starting Lit Protocol network connectivity tests");
  
  let failures = 0;
  const results = await Promise.allSettled(
    NETWORKS.map(network =>
      Promise.race([
        testNetworkConnection(network),
        new Promise<boolean>((_, reject) =>
          setTimeout(
            () => reject(new Error(`Connection to ${network} timed out after ${CONNECTION_TIMEOUT}ms`)),
            CONNECTION_TIMEOUT
          )
        ),
      ])
    )
  );

  results.forEach((result, index) => {
    if (result.status === 'rejected' || (result.status === 'fulfilled' && !result.value)) {
      failures++;
    }
  });

  console.log(
    `\nNetwork tests completed. ${NETWORKS.length - failures}/${NETWORKS.length} networks accessible.`
  );

  if (failures > 0) {
    console.error(`Failed to connect to ${failures} network(s).`);
    process.exit(1);
  } else {
    console.log("All network tests passed! 🎉");
    process.exit(0); // Explicitly exit with success code
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runNetworkTests().catch((error) => {
    console.error("Test suite failed:", error);
    process.exit(1);
  });
}

// Export for use in other test frameworks
export { testNetworkConnection, runNetworkTests };
