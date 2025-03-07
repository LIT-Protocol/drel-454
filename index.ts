import * as LitJsSdk from "@lit-protocol/lit-node-client-nodejs";

async function initialize() {
  const litNetwork = "datil";
  const litNodeDebugMode = true;

  // Create a Lit client instance
  const litNodeClient = new LitJsSdk.LitNodeClientNodeJs({
    alertWhenUnauthorized: false,
    litNetwork,
    debug: litNodeDebugMode,
  });

  await litNodeClient.connect();
  console.log("litNodeClient connected", {
    data: {
      litNetwork,
      litNodeDebugMode,
    },
  });
}

(async () => {
  await initialize();
})();
