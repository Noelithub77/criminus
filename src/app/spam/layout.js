export default function SpamLayout({ children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        maxWidth: "100%",
        margin: 0,
        padding: 0,
        backgroundColor: "black",
        color: "#d1d5db",
        boxSizing: "border-box",
      }}
    >
      {children}
    </div>
  );
}
