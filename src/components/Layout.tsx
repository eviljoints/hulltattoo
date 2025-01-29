// ./components/Layout.tsx

import React, { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import Head from "next/head"; // Included for global SEO tags

import {
  FaFacebook,
  FaInstagram,
  FaHome,
  FaFirstAid,
  FaQuestionCircle,
  FaStar,
  FaNewspaper,
  FaYoutube,
  FaTiktok,
  FaUserFriends, // Use this icon for Artists
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

interface LayoutProps {
  children: ReactNode;
  // Optional prop for per-page canonical URLs
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
        {/* 
          General site-wide meta tags can be included here.
          Avoid adding a global canonical URL to prevent overriding per-page canonical URLs.
        */}
        <meta name="robots" content="index, follow" />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        {/* Remove the global canonical URL to allow per-page canonical URLs */}
        {/* <link rel="canonical" href="https://www.hulltattoostudio.com" /> */}
      </Head>

      {/* Header with Logo */}
      <header className="header">
        <div className="logo-container">
          <Link href="/" passHref>
            <a aria-label="Go to home">
              <Image
                src="/images/logo.webp"
                alt="Tattoo Studio Logo"
                width={250}
                height={150}
                priority
              />
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
          <Link href="/" passHref>
            <a className="navbar-link">Home</a>
          </Link>

          <Link href="/aftercare" passHref>
            <a className="navbar-link">Aftercare</a>
          </Link>

          <Link href="/faq" passHref>
            <a className="navbar-link">FAQ</a>
          </Link>

          <Link href="/loyalty" passHref>
            <a className="navbar-link">Loyalty</a>
          </Link>

          <Link href="/blog" passHref>
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
              <MenuItem
                bg="transparent"
                _hover={{ bg: "rgba(255, 7, 131, 0.86)" }}
                color="white"
              >
                <Link href="/mike" passHref>
                  <a style={{ textDecoration: "none", color: "inherit" }}>
                    Mike
                  </a>
                </Link>
              </MenuItem>
              <MenuItem
                bg="transparent"
                _hover={{ bg: "rgba(255, 7, 131, 0.86)" }}
                color="white"
              >
                <Link href="/poppy" passHref>
                  <a style={{ textDecoration: "none", color: "inherit" }}>
                    Poppy
                  </a>
                </Link>
              </MenuItem>
              <MenuItem
                bg="transparent"
                _hover={{ bg: "rgba(255, 7, 131, 0.86)" }}
                color="white"
              >
                <Link href="/harley" passHref>
                  <a style={{ textDecoration: "none", color: "inherit" }}>
                    Harley
                  </a>
                </Link>
              </MenuItem>
            </MenuList>
          </Menu>
        </div>
      </nav>

      {/* Main Content */}
      <Box as="main">{children}</Box>

      {/* Footer */}
      <footer className="footer">
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
        <p className="footer-text">
          © {currentYear} Hull Tattoo Studio. All rights reserved.
          <br />
          652 Anlaby Road, Hull, HU3 6UU.
        </p>
      </footer>

      {/* Bottom Navbar for Mobile */}
      <nav className="navbar-bottom">
        <Link href="/" passHref>
          <a className="navbar-icon" aria-label="Home">
            <FaHome />
          </a>
        </Link>

        <Link href="/aftercare" passHref>
          <a className="navbar-icon" aria-label="Aftercare">
            <FaFirstAid />
          </a>
        </Link>

        <Link href="/faq" passHref>
          <a className="navbar-icon" aria-label="FAQ">
            <FaQuestionCircle />
          </a>
        </Link>

        <Link href="/loyalty" passHref>
          <a className="navbar-icon" aria-label="Loyalty">
            <FaStar />
          </a>
        </Link>

        <Link href="/blog" passHref>
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
          >
            <FaUserFriends style={{ marginRight: "6px" }} aria-label="Artists" />
          </MenuButton>
          <MenuList
            bg="black"
            border="1px solid #ff007f"
            boxShadow="0 0 10px #ff007f, 0 0 15px #00d4ff"
            color="white"
          >
            <MenuItem
              bg="transparent"
              _hover={{ bg: "rgba(255, 0, 127, 0.2)" }}
              color="white"
            >
              <Link href="/mike" passHref>
                <a style={{ textDecoration: "none", color: "inherit" }}>Mike</a>
              </Link>
            </MenuItem>
            <MenuItem
              bg="transparent"
              _hover={{ bg: "rgba(255, 0, 127, 0.2)" }}
              color="white"
            >
              <Link href="/poppy" passHref>
                <a style={{ textDecoration: "none", color: "inherit" }}>
                  Poppy
                </a>
              </Link>
            </MenuItem>
            <MenuItem
              bg="transparent"
              _hover={{ bg: "rgba(255, 0, 127, 0.2)" }}
              color="white"
            >
              <Link href="/harley" passHref>
                <a style={{ textDecoration: "none", color: "inherit" }}>
                  Harley
                </a>
              </Link>
            </MenuItem>
          </MenuList>
        </Menu>
      </nav>
    </Box>
  );
};

export default Layout;
