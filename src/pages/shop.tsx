import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import products from '../data/noirnexus.json';
import styles from '../styles/shop.module.css';

const categories = ['All', 'Clothing', 'Jewellery', 'Home & gifts'];
const store = 'https://noirnexus.myshopify.com';

export function productUrl(handle: string) {
  const url = new URL(`/products/${handle}`, store);
  url.searchParams.set('utm_source', 'hulltattoostudio');
  url.searchParams.set('utm_medium', 'referral');
  url.searchParams.set('utm_campaign', 'studio_shop');
  return url.toString();
}

export default function Shop() {
  const [category, setCategory] = useState('All');
  const visible = products.filter(p => category === 'All' || p.category === category);
  return <>
    <Head>
      <title>Gothic Clothing, Jewellery & Gifts | Hull Tattoo Studio</title>
      <meta name="description" content="Discover NoirNexus at Hull Tattoo Studio: a curated edit of gothic clothing, statement jewellery and dark gifts. Explore each piece in the NoirNexus shop." />
      <link rel="canonical" href="https://www.hulltattoostudio.com/shop/" />
      <meta property="og:title" content="NoirNexus at Hull Tattoo Studio" />
      <meta property="og:description" content="Dark clothing. Statement jewellery. Little gothic delights." />
      <meta property="og:url" content="https://www.hulltattoostudio.com/shop/" />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={products[0].image} />
    </Head>
    <div className={styles.shop}>
      <header className={styles.hero}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>At Hull Tattoo Studio</p>
          <p className={styles.wordmark}>NoirNexus</p>
          <h1>Wear your dark side.</h1>
          <p>A curated corner of gothic clothing, statement jewellery and unusual gifts. Chosen for people who express themselves beyond the ordinary.</p>
          <a className={styles.primary} href="#the-edit">Explore the edit <span aria-hidden="true">↓</span></a>
        </div>
        <div className={styles.heroImage}>
          <Image src={products[0].image} alt="Dark in Love Shadow Lament gothic lace dress" layout="fill" objectFit="contain" priority sizes="(max-width: 700px) 100vw, 45vw" />
          <span className={styles.caption}>Dark in Love · Shadow Lament</span>
        </div>
      </header>
      <aside className={styles.notice}>
        <strong>Introducing NoirNexus.</strong> Our shop is preparing to launch. You can explore the edit here; product options, current prices and availability are confirmed on NoirNexus. Online orders are fulfilled by our suppliers, with delivery shown at checkout.
      </aside>
      <section id="the-edit" aria-labelledby="edit-title" className={styles.edit}>
        <div className={styles.sectionHead}><div><p className={styles.eyebrow}>The studio selection</p><h2 id="edit-title">Find your next favourite.</h2></div><a href={`${store}/collections/all?utm_source=hulltattoostudio&utm_medium=referral&utm_campaign=studio_shop`}>Explore all NoirNexus →</a></div>
        <div className={styles.filters} aria-label="Filter products">
          {categories.map(c => <button key={c} type="button" aria-pressed={category === c} onClick={() => setCategory(c)}>{c}</button>)}
        </div>
        <p className={styles.resultCount} role="status">{visible.length} pieces in this edit</p>
        <div className={styles.grid}>
          {visible.map(p => <article className={styles.card} key={p.id}>
            <a href={productUrl(p.handle)} className={styles.productLink}>
              <div className={styles.productImage}><Image src={p.image} alt={p.title} layout="fill" objectFit="contain" sizes="(max-width: 600px) 90vw, (max-width: 1000px) 45vw, 30vw" /></div>
              <div className={styles.cardBody}><p className={styles.category}>{p.category}</p><h3>{p.title}</h3><span className={styles.view}>View on NoirNexus <span aria-hidden="true">↗</span></span></div>
            </a>
          </article>)}
        </div>
      </section>
      <section className={styles.story} aria-labelledby="story-title">
        <p className={styles.eyebrow}>More than the ink</p><h2 id="story-title">A little darkness, every day.</h2>
        <p>From graphic clothing to a favourite mug, personal style lives in the details. Our NoirNexus edit brings those details together without losing the individuality that brought you to the studio.</p>
        <Link href="/blog/gothic-gifts-under-10" legacyBehavior><a className={styles.primary}>Read our gothic gift guide →</a></Link>
      </section>
      <section className={styles.faq} aria-labelledby="shop-help"><h2 id="shop-help">Shopping with NoirNexus</h2>
        <details><summary>Where do I choose my size and pay?</summary><p>Follow any product link to NoirNexus to choose your options and, when the shop launches, complete your order through Shopify checkout.</p></details>
        <details><summary>Can I collect products from the tattoo studio?</summary><p>These are online products dispatched by suppliers. Studio collection is not currently offered. Check the delivery options on NoirNexus before ordering.</p></details>
        <details><summary>Where are delivery and returns explained?</summary><p>Read the <a href={`${store}/policies/shipping-policy`}>NoirNexus delivery policy</a> and <a href={`${store}/policies/refund-policy`}>returns policy</a>. Delivery charges and availability are confirmed in the shop.</p></details>
      </section>
    </div>
  </>;
}
