import "./App.css";
import { useForm } from "@tanstack/react-form";
import type { AnyFieldApi } from "@tanstack/react-form";
import { useState } from "react";
import cloudflareLogo from "./assets/cloudflare-logo.png";

const WORKER_URL = "https://worker.thomas-development.workers.dev/";

function FieldInfo({ field }: { field: AnyFieldApi }) {
  return (
    <>
      {field.state.meta.isTouched && field.state.meta.errors.length ? (
        <em>{field.state.meta.errors.join(", ")}</em>
      ) : null}
    </>
  );
}

function SentimentResult({
  sentiment,
}: {
  sentiment: { label: string; score: number } | null;
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
      <h2>Sentiment Analysis Result</h2>
      <p>
        <strong>Label:</strong> {sentiment.label}
      </p>
      <p>
        <strong>Score:</strong> {(sentiment.score * 100).toFixed(1)}%
      </p>
    </div>
  );
}

function App() {
  const [sentiment, setSentiment] = useState<{
    label: string;
    score: number;
  } | null>(null);

  const form = useForm({
    defaultValues: {
      name: "",
      feedback: "",
    },
    onSubmit: async ({ value }) => {
      const baseUrl = process.env.NODE_ENV === "development"
        ? "http://127.0.0.1:8787"
        : WORKER_URL;

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
      <div style={{ textAlign: "center", marginBottom: "1rem" }}>
        <img
          src={cloudflareLogo}
          alt="Cloudflare Logo"
          style={{ width: "150px" }}
        />
      </div>
      <h1 style={{ color: "#F48120" }}>Sentiment Analysis</h1>
      <h3 style={{ color: "#F48120" }}>
        TanStack Form + Cloudflare Workers AI{" "}
      </h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          maxWidth: "400px",
          margin: "auto",
          padding: "1rem",
          borderRadius: "8px",
        }}
      >
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
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
              return (
                <>
                  <label htmlFor={field.name}>First Name:</label>
                  <input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    style={{ padding: "0.5rem", borderRadius: "4px" }}
                  />
                  <FieldInfo field={field} />
                </>
              );
            }}
          />
        </div>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
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
                  style={{
                    padding: "0.5rem",
                    borderRadius: "4px",
                    border: "1px solid",
                  }}
                />
                <FieldInfo field={field} />
              </>
            )}
          />
        </div>
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]: [boolean, boolean]) => (
            <button
              type="submit"
              disabled={!canSubmit}
              style={{
                backgroundColor: "#F48120",
                color: "white",
                padding: "0.5rem",
                borderRadius: "4px",
                border: "none",
              }}
            >
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
