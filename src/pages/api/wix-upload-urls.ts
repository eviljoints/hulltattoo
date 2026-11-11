import type { NextApiRequest, NextApiResponse } from 'next';
import { allowContactRequest, proxyToWix, shortText } from '~/lib/wixProxy';
export const config = {api:{bodyParser:{sizeLimit:'16kb'}}};
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!allowContactRequest(req,res)) return;
  const {files} = req.body || {};
  if (!Array.isArray(files) || files.length < 1 || files.length > 10 || files.some(f =>
    !f || !shortText(f.fileName,255) || !['image/jpeg','image/png','image/webp','image/heic','image/heif'].includes(f.fileType)
    || !Number.isInteger(f.fileSize) || f.fileSize < 1 || f.fileSize > 5*1024*1024)) {
    return res.status(400).json({error:'Choose up to 10 JPG, PNG, WebP or HEIC images, no larger than 5 MB each.'});
  }
  // Preserve Wix's original contract; image bytes still go directly to Wix.
  return proxyToWix(process.env.WIX_UPLOAD_URLS_ENDPOINT || 'https://hulltattoostudio.co.uk/_functions/contactUploadUrls', {
    files:files.map(({fileName,fileType})=>({fileName,fileType})),
  },res);
}
