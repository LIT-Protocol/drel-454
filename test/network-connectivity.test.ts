import * as LitJsSdk from "@lit-protocol/lit-node-client-nodejs";

// Configuration constants
const NETWORKS = ["datil", "datil-test", "datil-dev"];
const CONNECTION_TIMEOUT = 30000; // 30 seconds timeout
const DEBUG_MODE = true;

async function testNetworkConnection(network: string): Promise<boolean> {
  console.log(`Testing connection to network: ${network}`);

  const litNodeClient = new LitJsSdk.LitNodeClientNodeJs({
    alertWhenUnauthorized: false,
    litNetwork: network as any,
    debug: DEBUG_MODE,
  });

  try {
    await litNodeClient.connect();
    console.log(`✅ Successfully connected to ${network}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to connect to ${network}:`, error);
    return false;
  }
}

/**
 * Runs connectivity tests for all specified networks
 */
async function runNetworkTests() {
  console.log("Starting Lit Protocol network connectivity tests");

  let failures = 0;

  for (const network of NETWORKS) {
    try {
      const success = await Promise.race([
        testNetworkConnection(network),
        new Promise<boolean>((_, reject) =>
          setTimeout(
            () =>
              reject(
                new Error(
                  `Connection to ${network} timed out after ${CONNECTION_TIMEOUT}ms`
                )
              ),
            CONNECTION_TIMEOUT
          )
        ),
      ]);

      if (!success) failures++;
    } catch (error) {
      console.error(`Test for ${network} failed:`, error);
      failures++;
    }
  }

  console.log(
    `\nNetwork tests completed. ${NETWORKS.length - failures}/${
      NETWORKS.length
    } networks accessible.`
  );

  if (failures > 0) {
    console.error(`Failed to connect to ${failures} network(s).`);
    process.exit(1); // Exit with error code for CI to detect failure
  } else {
    console.log("All network tests passed! 🎉");
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
