export const SITE_URL = "https://www.hulltattoostudio.com";
export function canonical(path = "/") {
  return `${SITE_URL}${
    path === "/" ? "/" : "/" + path.replace(/^\/+|\/+$/g, "") + "/"
  }`;
}
export function jsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
