import "./App.css";
import { useForm } from "@tanstack/react-form";
import type { AnyFieldApi } from "@tanstack/react-form";
import { useState } from "react";

const WORKER_URL = "https://worker.thomas-development.workers.dev/";

function FieldInfo({ field }: { field: AnyFieldApi }) {
  return (
    <>
      {field.state.meta.isTouched && field.state.meta.errors.length ? (
        <em>{field.state.meta.errors.join(", ")}</em>
      ) : null}
      {field.state.meta.isValidating ? "Validating..." : null}
    </>
  );
}

function SentimentResult({ sentiment }: { sentiment: { label: string; score: number } | null }) {
  if (!sentiment) return null;

  return (
    <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Sentiment Analysis Result</h2>
      <p><strong>Label:</strong> {sentiment.label}</p>
      <p><strong>Score:</strong> {(sentiment.score * 100).toFixed(1)}%</p>
    </div>
  );
}

function App() {
  const [sentiment, setSentiment] = useState<{ label: string; score: number } | null>(null);

  const form = useForm({
    defaultValues: {
      name: "",
      feedback: "",
    },
    onSubmit: async ({ value }) => {
      let baseUrl = WORKER_URL;
      if (process.env.NODE_ENV === "development") {
        baseUrl = "http://127.0.0.1:8787";
      }
      const response = await fetch(`${baseUrl}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(value),
      });
      const data = await response.json();
      console.log(data);
      setSentiment(data.sentiment);
    },
  });

  return (
    <>
      <h1>TanStack Form + Cloudflare Workers AI</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px', margin: 'auto' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {/* A type-safe field component*/}
          <form.Field
            name="name"
            validators={{
              onChange: ({ value }) =>
                !value
                  ? "Name is required"
                  : value.length < 3
                  ? "Your name must be least 3 characters"
                  : undefined,
              onChangeAsyncDebounceMs: 500,
              onChangeAsync: async ({ value }) => {
                await new Promise((resolve) => setTimeout(resolve, 500));
                return (
                  value.includes("error") && 'No "error" allowed in first name'
                );
              },
            }}
            children={(field) => {
              // Avoid hasty abstractions. Render props are great!
              return (
                <>
                  <label htmlFor={field.name}>First Name:</label>
                  <input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldInfo field={field} />
                </>
              );
            }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <form.Field
            name="feedback"
            validators={{
              onChange: ({ value }) =>
                !value
                  ? "Feedback is a required field"
                  : value.length < 10
                  ? "Your feedback must be least 10 characters"
                  : undefined,
              onChangeAsyncDebounceMs: 500,
              onChangeAsync: async ({ value }) => {
                await new Promise((resolve) => setTimeout(resolve, 500));
                return (
                  value.includes("error") && 'No "error" allowed in feedback'
                );
              },
            }}
            children={(field) => (
              <>
                <label htmlFor={field.name}>Feedback:</label>
                <textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <FieldInfo field={field} />
              </>
            )}
          />
        </div>
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]: [boolean, boolean]) => (
            <button type="submit" disabled={!canSubmit}>
              {isSubmitting ? "..." : "Submit"}
            </button>
          )}
        />
      </form>
      <SentimentResult sentiment={sentiment} />
    </>
  );
}

export default App;
