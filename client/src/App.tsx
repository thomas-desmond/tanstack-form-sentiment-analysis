import "./App.css";
import { useForm } from "@tanstack/react-form";
import type { AnyFieldApi } from "@tanstack/react-form";
import { useState } from "react";
import cloudflareLogo from "./assets/cloudflare-logo.png";
import { SentimentResult } from "./components/sentimentResult";

const WORKER_URL = "YOUR-DEPLOYED-WORKERS-URL";

function FieldInfo({ field }: { field: AnyFieldApi }) {
  return (
    <>
      {field.state.meta.isTouched && field.state.meta.errors.length ? (
        <em>{field.state.meta.errors.join(", ")}</em>
      ) : null}
    </>
  );
}


function App() {
  const [sentiment, setSentiment] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      name: "",
      feedback: "",
    },
    onSubmit: async ({ value }) => {

      const baseUrl = WORKER_URL ;

      try {
        const response = await fetch(`${baseUrl}/submit`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(value),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setSentiment(data.sentiment.response);
      } catch (error) {
        console.error("Error submitting feedback:", error);
      }
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
      <h1 style={{ color: "#F48120" }}>Feedback Analyzer</h1>
      <h3 style={{ color: "#F48120" }}>
        TanStack Form + Cloudflare Workers AI{" "}
      </h3>
      <div className="instructions" style={{ marginBottom: '1.5rem', maxWidth: '625px', margin: 'auto' }}>
        <p>Use the feedback input below to write potential feedback. This will get submitted to Cloudflare Workers AI and be analyzed and give you an analysis on whether its positive or negative.</p>
      </div>
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
