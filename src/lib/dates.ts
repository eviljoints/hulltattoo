/** Parse explicit editorial dates, never locale-dependent Date.parse input. */
export function publicationDate(value: string): string {
  const old = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value);
  const iso = old ? `${old[3]}-${old[2]}-${old[1]}` : value;
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(iso) ||
    !Number.isFinite(Date.parse(`${iso}T12:00:00Z`)) ||
    new Date(`${iso}T12:00:00Z`).toISOString().slice(0, 10) !== iso
  )
    throw new Error("Invalid article date");
  return iso;
}
export function displayDate(iso: string) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/London",
  });
}
export function headingId(text: string) {
  return text
    .toLowerCase()
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-");
}
