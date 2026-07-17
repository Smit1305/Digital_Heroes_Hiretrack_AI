/**
 * Renders a JSON-LD <script> tag for structured data.
 * Must be used in server components only.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires innerHTML
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data, null, 0) }}
    />
  )
}
