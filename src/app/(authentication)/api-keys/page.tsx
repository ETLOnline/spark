import { UserProfile } from "@clerk/nextjs"

export default function ApiKeysPage() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100vh",
        padding: "40px 20px",
        backgroundColor: "#f9fafb"
      }}
    >
      <div style={{ marginBottom: "24px", textAlign: "center" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#111827" }}>
          Developer Settings
        </h1>
        <p style={{ color: "#4b5563" }}>
          Manage your API keys for Postman access
        </p>
      </div>
      <UserProfile routing="hash" />
      <div
        style={{
          marginTop: "32px",
          maxWidth: "400px",
          fontSize: "14px",
          color: "#6b7280",
          textAlign: "center",
          fontStyle: "italic"
        }}
      >
        <p>
          <strong>Reminder:</strong> If you don't see the "API Keys" tab inside
          the profile, make sure it is enabled in your{" "}
          <b>Clerk Dashboard &gt; Configure &gt; Developers &gt; API Keys</b>.
        </p>
      </div>
    </div>
  )
}
