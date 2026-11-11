import Head from "next/head";
import { canonical, SITE_URL } from "~/lib/site";
export default function PageSeo({
  title,
  description,
  path,
  image = "/images/og-image.webp",
  article = false,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  article?: boolean;
}) {
  const url = canonical(path),
    imageUrl = image.startsWith("/") ? SITE_URL + image : image;
  return (
    <Head>
      <title>{title} | Hull Tattoo Studio</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={`${title} | Hull Tattoo Studio`} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={article ? "article" : "website"} />
      <meta property="og:image" content={imageUrl} />
      <meta name="twitter:title" content={`${title} | Hull Tattoo Studio`} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
    </Head>
  );
}
