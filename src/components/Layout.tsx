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

          <Link href="/designs" passHref legacyBehavior>
            <a className="navbar-link" style={{ display: "flex", alignItems: "center" }}>
              
              Designs
            </a>
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
              {[
                { name: "Mike", href: "/mike" },
               
                { name: "Harley", href: "/harley" },
              ].map(({ name, href }) => (
                <MenuItem
                  key={name}
                  bg="transparent"
                  _hover={{ bg: "rgba(255, 7, 131, 0.86)" }}
                  color="white"
                >
                  <Link href={href} passHref legacyBehavior>
                    <a style={{ textDecoration: "none", color: "inherit" }}>{name}</a>
                  </Link>
                </MenuItem>
              ))}
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
              href: "https://www.tiktok.com/@hulltattoostudio_",
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

        <Link href="/designs" passHref legacyBehavior>
          <a className="navbar-icon" aria-label="Designs">
            <FaPaintBrush />
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
          >
            <FaUserFriends style={{ marginRight: "6px" }} aria-label="Artists" />
          </MenuButton>
          <MenuList
            bg="black"
            border="1px solid #ff007f"
            boxShadow="0 0 10px #ff007f, 0 0 15px #00d4ff"
            color="white"
          >
            {[
              { name: "Mike", href: "/mike" },
              
              { name: "Harley", href: "/harley" },
            ].map(({ name, href }) => (
              <MenuItem key={name} bg="transparent" _hover={{ bg: "rgba(255,0,127,0.2)" }}>
                <Link href={href} passHref legacyBehavior>
                  <a style={{ textDecoration: "none", color: "inherit" }}>{name}</a>
                </Link>
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
      </nav>
    </Box>
  );
};

export default Layout;
