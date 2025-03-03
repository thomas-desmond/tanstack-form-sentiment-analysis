export function SentimentResult({
  sentiment,
}: {
  sentiment: string | null;
}) {
  if (!sentiment) return null;

  return (
    <div
      style={{
        marginTop: "1rem",
        padding: "1rem",
        border: "1px solid #ccc",
        borderRadius: "8px",
      }}
    >
      <h2>Feedback Analysis Result</h2>
      <p>
        {sentiment}
      </p>
    </div>
  );
}