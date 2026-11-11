import { test, expect, Page } from '@playwright/test';

const ids = {
  mike: '11111111-1111-4111-8111-111111111111',
  harley: '22222222-2222-4222-8222-222222222222',
  jen: '33333333-3333-4333-8333-333333333333',
};
const serviceId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
async function mockWix(page: Page, options: { failServices?: boolean; failCheckout?: boolean } = {}) {
  const availability: any[] = [], checkout: any[] = [], blocked: string[] = [];
  let serviceRequests = 0;
  const day = new Date(); day.setUTCDate(day.getUTCDate() + 1); day.setUTCHours(10, 0, 0, 0);
  const entry = { slot: { serviceId, startDate: day.toISOString(), endDate: new Date(+day + 3600000).toISOString() }, bookable: true };
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') return route.continue();
    // Every external request is mocked or blocked, including analytics, embeds and checkout.
    if (url.pathname.includes('/services/query')) {
      serviceRequests++;
      if (options.failServices && serviceRequests === 1) return route.fulfill({status:500,json:{message:'Unavailable'}});
      return route.fulfill({json:{services:Object.entries(ids).map(([name,id],i)=>({id:i===0?serviceId:`bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb${i}`,name:`${name} appointment`,staffMemberIds:[id]})),pagingMetadata:{count:3,total:3}}});
    }
    if (/availability/i.test(url.pathname)) { availability.push(route.request().postDataJSON()); return route.fulfill({json:{availabilityEntries:[entry]}}); }
    if (/redirect/i.test(url.pathname)) {
      checkout.push(route.request().postDataJSON());
      return route.fulfill(options.failCheckout ? {status:500,json:{message:'Unavailable'}} : {json:{redirectSession:{fullUrl:'https://example.test/checkout'}}});
    }
    if (/oauth|token/i.test(url.pathname)) return route.fulfill({json:{access_token:'test-access',refresh_token:'test-refresh',expires_in:3600,token_type:'Bearer'}});
    if (url.hostname === 'example.test') return route.fulfill({contentType:'text/html',body:'<h1>Mock Wix checkout</h1>'});
    blocked.push(url.hostname + url.pathname);
    return route.abort();
  });
  return { availability, checkout, entry, blocked };
}

test('artist, service and appointment selection reach Wix checkout with the original entry', async ({ page }) => {
  const calls = await mockWix(page);
  await page.goto('/book/?artist=mike');
  await expect(page.getByLabel('Artist:', {exact:true})).toHaveValue('mike');
  await expect(page.getByLabel('Service', {exact:true})).toContainText('mike appointment');
  await expect(page.getByLabel('Service', {exact:true})).not.toContainText('jen appointment');
  await page.getByLabel('Artist:', {exact:true}).selectOption('harley');
  await expect(page.getByLabel('Service', {exact:true})).toContainText('harley appointment');
  await page.getByLabel('Artist:', {exact:true}).selectOption('mike');
  await page.getByLabel('Service', {exact:true}).selectOption(serviceId);
  await expect(page.getByRole('button', {name:'10:00',exact:true})).toBeVisible();
  const request = calls.availability[calls.availability.length-1];
  expect((request.query?.filter || request.filter).serviceId).toEqual([serviceId]);
  expect((request.query?.filter || request.filter).resourceId).toEqual([ids.mike]);
  expect(request.timezone).toBe('Europe/London');
  await page.screenshot({path:test.info().outputPath('booking.png'),fullPage:true});
  await page.getByRole('button', {name:'10:00',exact:true}).click();
  await expect(page).toHaveURL(/\/checkout\//);
  await expect(page.getByText('Mike', {exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Continue to payment'}).click();
  await expect(page).toHaveURL('https://example.test/checkout');
  expect(calls.checkout).toHaveLength(1);
  expect(calls.checkout[0].bookingsCheckout.slotAvailability).toMatchObject(calls.entry);
  expect(calls.checkout[0].bookingsCheckout.timezone).toBe('Europe/London');
  expect(calls.checkout[0].callbacks.postFlowUrl).toBe('http://localhost:3100/checkout/return');
});

test('failed service loading offers a retry', async ({ page }) => {
  await mockWix(page,{failServices:true});
  await page.goto('/book/?artist=mike');
  await page.getByRole('button',{name:'Try again',exact:true}).click();
  await expect(page.getByLabel('Service',{exact:true})).toContainText('mike appointment');
});

test('checkout return never claims payment success and clears stale selection', async ({ page }) => {
  await mockWix(page);
  await page.goto('/checkout/return/');
  await expect(page.getByText(/Returning here does not confirm payment/)).toBeVisible();
  expect(await page.evaluate(()=>sessionStorage.getItem('HTS_WIX_CHECKOUT_PAYLOAD'))).toBeNull();
  await page.screenshot({path:test.info().outputPath('return.png'),fullPage:true});
});

test('retired endpoints are absent and retained APIs reject invalid requests locally', async ({ request }) => {
  for (const path of ['/loyalty/','/admin/','/api/clients','/api/clients/register','/api/admin/designs','/api/images','/api/reviews','/api/google/oauth/start','/api/upload']) {
    expect((await request.get(path)).status(),path).toBe(404);
  }
  expect((await request.get('/api/contact')).status()).toBe(405);
  expect((await request.post('/api/contact',{data:{}})).status()).toBe(400);
  expect((await request.post('/api/wix-upload-urls',{data:{files:[{fileName:'bad.svg',fileType:'image/svg+xml',fileSize:50}]}})).status()).toBe(400);
});

test('contact attachment and enquiry keep the Wix contracts using local mocks', async ({page}) => {
  await mockWix(page);
  let enquiry: any, upload: any;
  await page.route('**/api/wix-upload-urls', async route => {upload=route.request().postDataJSON();return route.fulfill({json:{uploads:[{uploadUrl:'https://example.test/upload',fileId:'test-image',fileType:'image/png',fileName:'reference.png'}]}});});
  await page.route('https://example.test/upload*',route=>route.fulfill({status:200,body:''}));
  await page.route('**/api/contact', async route=>{enquiry=route.request().postDataJSON();return route.fulfill({json:{ok:true}});});
  await page.goto('/');
  await page.getByRole('button',{name:'Contact Us',exact:true}).click();
  await page.getByLabel('First Name').fill('Test');
  await page.getByLabel('Last Name').fill('Visitor');
  await page.getByRole('textbox',{name:'Email',exact:true}).fill('test@example.test');
  await page.getByLabel('Your Message').fill('Mock enquiry only');
  await page.getByLabel(/Attach Images/).setInputFiles({name:'reference.png',mimeType:'image/png',buffer:Buffer.from('mock-image')});
  await page.getByRole('button',{name:'Send Message',exact:true}).click();
  await expect(page.getByText(/Thank you for sending us a message/)).toBeVisible();
  expect(upload.files[0]).toEqual({fileName:'reference.png',fileType:'image/png',fileSize:10});
  expect(enquiry.uploads).toEqual([{fileId:'test-image',fileType:'image/png',displayName:'reference.png'}]);
});
