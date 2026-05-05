import * as Sentry from "@sentry/node";

// Initialize the bridge to your WSL Air-Gapped Lab
Sentry.init({
  dsn: "http://145216f2e8cce8899412168c18694bb5@127.0.0.1:9000/1",
  tracesSampleRate: 1.0,
});

async function triggerCrash() {
  console.log("Connecting to local Sentry lab...");
  console.log("Triggering intentional TypeScript crash...");
  
  try {
    // This is the error Codestral is going to read
    throw new Error("Codestral Test: Type mismatch detected in Auspicious-Days module.");
  } catch (error) {
    // Manually capture the exception
    Sentry.captureException(error);
    
    // Wait up to 2 seconds for Sentry to finish sending the event over the network
    await Sentry.close(2000); 
    
    console.log("Crash report successfully sent to local Sentry!");
  }
}

triggerCrash();
