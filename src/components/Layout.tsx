// components/Layout.tsx

import React, { ReactNode } from "react";
import Link from "next/link";
import Head from "next/head";

import {
  FaFacebook,
  FaInstagram,
  FaHome,
  FaFirstAid,
  FaStar,
  FaNewspaper,
  FaYoutube,
  FaTiktok,
  FaUserFriends,
  FaPaintBrush,
} from "react-icons/fa";

import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuGroup,     // ⬅️ added
  MenuDivider,   // ⬅️ added
  Button,
  Box,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import NeonLogo from "./NeonLogo";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      className="layout-container"
      overflowX="hidden"
      minH="100vh"
      color="white"
      position="relative"
      bg="transparent"
    >
      {/* Global SEO Head Tags */}
      <Head>
        <meta name="robots" content="index, follow" />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        {/* Preload brand font (improves FCP/LCP) */}
        <link
          rel="preload"
          href="/fonts/VanillaWhale.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />

        {/* Organization + Logo schema (site-wide) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Hull Tattoo Studio",
              url: "https://www.hulltattoostudio.com",
              logo: {
                "@type": "ImageObject",
                url: "https://www.hulltattoostudio.com/images/logo.png",
                width: 512,
                height: 512,
              },
              sameAs: [
                "https://www.instagram.com/hull_tattoo_studio/",
                "https://www.facebook.com/Hulltattoostudio",
                "https://www.youtube.com/@Hulltattoostudio",
                "https://www.tiktok.com/@hulltattoostudio_",
              ],
            }),
          }}
        />
      </Head>

      {/* Header with Logo */}
      <header className="header">
        <div className="logo-container">
          <Link href="/" passHref legacyBehavior>
            <a aria-label="Go to home">
              <NeonLogo />
            </a>
          </Link>
        </div>

        {/* Social Media Icons */}
        <div className="footer-socials">
          <a
            href="https://www.instagram.com/hull_tattoo_studio/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-icon"
            aria-label="Instagram"
          >
            <FaInstagram />
          </a>
          <a
            href="https://www.facebook.com/Hulltattoostudio"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-icon"
            aria-label="Facebook"
          >
            <FaFacebook />
          </a>
          <a
            href="https://www.youtube.com/@Hulltattoostudio"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-icon"
            aria-label="YouTube"
          >
            <FaYoutube />
          </a>
          <a
            href="https://www.tiktok.com/@hulltattoostudio_"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-icon"
            aria-label="TikTok"
          >
            <FaTiktok />
          </a>
        </div>
      </header>

      {/* Navbar - Desktop */}
      <nav className="navbar">
        <div className="navbar-desktop">
          <Link href="/" passHref legacyBehavior>
            <a className="navbar-link">Home</a>
          </Link>

          <Link href="/aftercare" passHref legacyBehavior>
            <a className="navbar-link">Aftercare</a>
          </Link>

          <Link href="/loyalty" passHref legacyBehavior>
            <a className="navbar-link">Loyalty</a>
          </Link>

          <Link href="/blog" passHref legacyBehavior>
            <a className="navbar-link">Blog</a>
          </Link>

          {/* Artists Dropdown (Desktop) */}
          <Menu>
            <MenuButton
              as={Button}
              className="navbar-link"
              variant="ghost"
              fontSize="lg"
              fontWeight="semibold"
              rightIcon={<ChevronDownIcon />}
              px={2}
              py={1}
              display="flex"
              alignItems="center"
              _hover={{ color: "#ff007f", bg: "transparent" }}
              _focus={{ boxShadow: "none" }}
            >
              Artists
            </MenuButton>
            <MenuList
              bg="black"
              border="1px solid #ff007f"
              boxShadow="0 0 10px #ff007f, 0 0 15px #00d4ff"
              color="white"
            >
              <MenuGroup title="Artists">
                <MenuItem bg="transparent" _hover={{ bg: "rgba(255, 7, 131, 0.86)" }}>
                  <Link href="/mike" passHref legacyBehavior>
                    <a style={{ textDecoration: "none", color: "inherit" }}>Mike</a>
                  </Link>
                </MenuItem>
              </MenuGroup>

              <MenuDivider borderColor="#ff007f" />

              <MenuGroup title="Apprentices">
                <MenuItem bg="transparent" _hover={{ bg: "rgba(255, 7, 131, 0.86)" }}>
                  <Link href="/harley" passHref legacyBehavior>
                    <a style={{ textDecoration: "none", color: "inherit" }}>Harley</a>
                  </Link>
                </MenuItem>
                <MenuItem bg="transparent" _hover={{ bg: "rgba(255, 7, 131, 0.86)" }}>
                  <Link href="/jen" passHref legacyBehavior>
                    <a style={{ textDecoration: "none", color: "inherit" }}>Jen</a>
                  </Link>
                </MenuItem>
              </MenuGroup>
            </MenuList>
          </Menu>
        </div>
      </nav>

      {/* Main Content */}
      <Box as="main">{children}</Box>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-socials">
          {[
            {
              href: "https://www.instagram.com/hull_tattoo_studio/",
              label: "Instagram",
              icon: <FaInstagram />,
            },
            {
              href: "https://www.facebook.com/Hulltattoostudio",
              label: "Facebook",
              icon: <FaFacebook />,
            },
            {
              href: "https://www.youtube.com/@Hulltattoostudio",
              label: "YouTube",
              icon: <FaYoutube />,
            },
            {
              href: "https://www.tiktok.com/@eggtattooer",
              label: "TikTok",
              icon: <FaTiktok />,
            },
          ].map(({ href, label, icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-icon"
              aria-label={label}
            >
              {icon}
            </a>
          ))}
        </div>
        <p className="footer-text">
          © {currentYear} Hull Tattoo Studio. All rights reserved.
          <br />255 Hedon Road, Hull, HU9 1NQ.
        </p>
      </footer>

      {/* Bottom Navbar for Mobile */}
      <nav className="navbar-bottom">
        <Link href="/" passHref legacyBehavior>
          <a className="navbar-icon" aria-label="Home">
            <FaHome />
          </a>
        </Link>

        <Link href="/aftercare" passHref legacyBehavior>
          <a className="navbar-icon" aria-label="Aftercare">
            <FaFirstAid />
          </a>
        </Link>

        <Link href="/loyalty" passHref legacyBehavior>
          <a className="navbar-icon" aria-label="Loyalty">
            <FaStar />
          </a>
        </Link>

        <Link href="/blog" passHref legacyBehavior>
          <a className="navbar-icon" aria-label="Blog">
            <FaNewspaper />
          </a>
        </Link>

        {/* Artists Dropdown for Mobile */}
        <Menu>
          <MenuButton
            as={Button}
            rightIcon={<ChevronDownIcon />}
            variant="ghost"
            fontSize="lg"
            fontWeight="semibold"
            display="flex"
            alignItems="center"
            _hover={{ color: "#ff007f" }}
            aria-label="Artists menu"
          >
            <FaUserFriends style={{ marginRight: "6px" }} aria-hidden="true" />
          </MenuButton>
          <MenuList
            bg="black"
            border="1px solid #ff007f"
            boxShadow="0 0 10px #ff007f, 0 0 15px #00d4ff"
            color="white"
          >
            <MenuGroup title="Artists">
              <MenuItem bg="transparent" _hover={{ bg: "rgba(255,0,127,0.2)" }}>
                <Link href="/mike" passHref legacyBehavior>
                  <a style={{ textDecoration: "none", color: "inherit" }}>Mike</a>
                </Link>
              </MenuItem>
            </MenuGroup>

            <MenuDivider borderColor="#ff007f" />

            <MenuGroup title="Apprentices">
              <MenuItem bg="transparent" _hover={{ bg: "rgba(255,0,127,0.2)" }}>
                <Link href="/harley" passHref legacyBehavior>
                  <a style={{ textDecoration: "none", color: "inherit" }}>Harley</a>
                </Link>
              </MenuItem>
              <MenuItem bg="transparent" _hover={{ bg: "rgba(255,0,127,0.2)" }}>
                <Link href="/jen" passHref legacyBehavior>
                  <a style={{ textDecoration: "none", color: "inherit" }}>Jen</a>
                </Link>
              </MenuItem>
            </MenuGroup>
          </MenuList>
        </Menu>
      </nav>
    </Box>
  );
};

export default Layout;
