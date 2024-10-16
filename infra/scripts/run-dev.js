const { spawn } = require("node:child_process");

let servicesProcess;
let nextDevProcess;

// Function to execute commands using spawn
const runCommand = (command, args, callback) => {
  const process = spawn(command, args, { stdio: "inherit", shell: true });

  process.on("close", (code) => {
    callback(code);
  });
};

// Function to stop the services
const stopServices = () => {
  if (servicesProcess) {
    servicesProcess.kill(); // Try to kill the process if it's running
  }
  runCommand("npm", ["run", "services:stop"], () => {
    console.log("Services stopped.");
    process.exit(); // Exits the process after stopping the services
  });
};

// Main function
const runDev = () => {
  // Start the services
  servicesProcess = runCommand("npm", ["run", "services:up"], (code) => {
    if (code !== 0) return; // Do not proceed if it fails

    runCommand("npm", ["run", "services:wait:database"], (code) => {
      if (code !== 0) return; // Do not proceed if it fails

      runCommand("npm", ["run", "migrations:up"], (code) => {
        if (code !== 0) return; // Do not proceed if it fails

        // Start the 'next dev' process
        nextDevProcess = runCommand("next", ["dev"], () => {
          // Stop services after 'next dev' finishes
          stopServices();
        });

        // Capture the SIGINT signal (Ctrl+C)
        process.on("SIGINT", () => {
          console.log("\nStopping services...");
          if (nextDevProcess) {
            nextDevProcess.kill(); // Now nextDevProcess is accessible here
          }
        });
      });
    });
  });
};

// Execute the main function
runDev();
