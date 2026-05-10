export async function callClaude(password, { system, messages, max_tokens = 1000 }) {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Site-Password": password,
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens,
      system,
      messages,
    }),
  });

  if (response.status === 401) throw new Error("Unauthorised");
  if (!response.ok) throw new Error("API error");

  const data = await response.json();
  const text = data.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");

  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}
