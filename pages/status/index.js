import useSWR from "swr";

const loadingMessage = "Loading...";

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();

  return responseBody;
}

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <UpdatedAt />
      <Dependencies />
    </>
  );
}

function UpdatedAt() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 5000,
  });

  let updatedAtMessage = loadingMessage;

  if (!isLoading && data) {
    updatedAtMessage = new Date(data.updated_at).toLocaleString("en-US");
  }

  return <div>Last Update: {updatedAtMessage}</div>;
}

function Dependencies() {
  return (
    <div>
      <DatabaseStatus />
    </div>
  );
}

function DatabaseStatus() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 5000,
  });

  let version = loadingMessage;
  let maxConnections = loadingMessage;
  let openConnections = loadingMessage;

  if (!isLoading && data) {
    version = data.dependencies.database.version;
    maxConnections = data.dependencies.database.max_connections;
    openConnections = data.dependencies.database.open_connections;
  }

  return (
    <div>
      <h2>Database</h2>
      Postgres Version: {version}
      <br />
      Max Connections: {maxConnections}
      <br />
      Open Connections: {openConnections}
    </div>
  );
}
