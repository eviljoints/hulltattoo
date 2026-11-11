import { test, expect } from "@playwright/test";
import contact from "../src/pages/api/contact";
import uploadUrls from "../src/pages/api/wix-upload-urls";
import { allowContactRequest } from "../src/lib/wixProxy";
import { publicationDate } from "../src/lib/dates";

test("editorial dates preserve day/month meaning and reject invalid dates", () => {
  expect(publicationDate("02.01.2025")).toBe("2025-01-02");
  expect(publicationDate("23.02.2025")).toBe("2025-02-23");
  expect(publicationDate("2026-11-11")).toBe("2026-11-11");
  expect(() => publicationDate("31.02.2025")).toThrow("Invalid article date");
});

function response() {
  const result: any = { code: 200, headers: {}, body: null };
  result.status = (code: number) => {
    result.code = code;
    return result;
  };
  result.json = (body: unknown) => {
    result.body = body;
    return result;
  };
  result.setHeader = (key: string, value: string) => {
    result.headers[key] = value;
    return result;
  };
  return result;
}
function request(body: unknown, ip = "fixture") {
  return {
    method: "POST",
    body,
    headers: {
      host: "localhost:3100",
      origin: "http://localhost:3100",
      "x-forwarded-for": ip,
    },
    socket: { remoteAddress: ip },
  } as any;
}

test("contact proxy preserves Wix attachment payload and never sends unvalidated fields", async () => {
  const originalFetch = global.fetch,
    originalSecret = process.env.WIX_CONTACT_SECRET;
  const calls: any[] = [];
  process.env.WIX_CONTACT_SECRET = "fixture-only";
  global.fetch = async (_url, options) => {
    calls.push(options);
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };
  try {
    const res = response();
    await contact(
      request(
        {
          firstName: " Test ",
          lastName: "Visitor",
          email: "test@example.test",
          message: "Fixture enquiry",
          unexpected: "discard",
          uploads: [
            {
              fileId: "image-id",
              fileType: "image/png",
              displayName: "reference.png",
              unexpected: "discard",
            },
          ],
        },
        "contact-contract"
      ),
      res
    );
    expect(res.code).toBe(200);
    expect(JSON.parse(calls[0].body)).toEqual({
      firstName: "Test",
      lastName: "Visitor",
      email: "test@example.test",
      message: "Fixture enquiry",
      uploads: [
        {
          fileId: "image-id",
          fileType: "image/png",
          displayName: "reference.png",
        },
      ],
    });
    expect(Boolean(calls[0].headers["x-contact-secret"])).toBe(true);
  } finally {
    global.fetch = originalFetch;
    if (originalSecret === undefined) delete process.env.WIX_CONTACT_SECRET;
    else process.env.WIX_CONTACT_SECRET = originalSecret;
  }
});

test("upload proxy enforces limits and forwards the unchanged Wix metadata contract", async () => {
  const originalFetch = global.fetch,
    originalSecret = process.env.WIX_CONTACT_SECRET;
  const calls: any[] = [];
  process.env.WIX_CONTACT_SECRET = "fixture-only";
  global.fetch = async (_url, options) => {
    calls.push(options);
    return new Response(JSON.stringify({ uploads: [] }), { status: 200 });
  };
  try {
    const invalid = response();
    await uploadUrls(
      request(
        {
          files: [
            {
              fileName: "large.png",
              fileType: "image/png",
              fileSize: 6 * 1024 * 1024,
            },
          ],
        },
        "upload-limit"
      ),
      invalid
    );
    expect(invalid.code).toBe(400);
    expect(calls).toHaveLength(0);
    const valid = response();
    await uploadUrls(
      request(
        {
          files: [
            { fileName: "reference.png", fileType: "image/png", fileSize: 10 },
          ],
        },
        "upload-contract"
      ),
      valid
    );
    expect(valid.code).toBe(200);
    expect(JSON.parse(calls[0].body)).toEqual({
      files: [{ fileName: "reference.png", fileType: "image/png" }],
    });
  } finally {
    global.fetch = originalFetch;
    if (originalSecret === undefined) delete process.env.WIX_CONTACT_SECRET;
    else process.env.WIX_CONTACT_SECRET = originalSecret;
  }
});

test("upstream errors are generic and missing contact credentials fail closed", async () => {
  const originalFetch = global.fetch,
    originalSecret = process.env.WIX_CONTACT_SECRET;
  let calls = 0;
  global.fetch = async () => {
    calls++;
    throw new Error("private-upstream-detail");
  };
  const payload = {
    firstName: "Test",
    lastName: "Visitor",
    email: "test@example.test",
    message: "Fixture enquiry",
  };
  try {
    process.env.WIX_CONTACT_SECRET = "fixture-only";
    const failed = response();
    await contact(request(payload, "upstream-failure"), failed);
    expect(failed.code).toBe(502);
    expect(JSON.stringify(failed.body)).not.toContain(
      "private-upstream-detail"
    );
    delete process.env.WIX_CONTACT_SECRET;
    const missing = response();
    await contact(request(payload, "missing-credentials"), missing);
    expect(missing.code).toBe(503);
    expect(calls).toBe(1);
  } finally {
    global.fetch = originalFetch;
    if (originalSecret === undefined) delete process.env.WIX_CONTACT_SECRET;
    else process.env.WIX_CONTACT_SECRET = originalSecret;
  }
});

test("contact origin and burst checks reject requests before forwarding", () => {
  const foreign = request({}, "foreign-origin");
  foreign.headers.origin = "https://example.test";
  const forbidden = response();
  expect(allowContactRequest(foreign, forbidden)).toBe(false);
  expect(forbidden.code).toBe(403);
  for (let i = 0; i < 10; i++)
    expect(allowContactRequest(request({}, "burst-fixture"), response())).toBe(
      true
    );
  const limited = response();
  expect(allowContactRequest(request({}, "burst-fixture"), limited)).toBe(
    false
  );
  expect(limited.code).toBe(429);
});
