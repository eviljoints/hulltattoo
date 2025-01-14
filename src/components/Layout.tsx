import React, { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";

// If FaTiktok does not exist in your version of react-icons,
// use `SiTiktok` from `react-icons/si` instead.
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
  title?: string;
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
      {/* Header with Logo */}
      <header className="header">
        <div className="logo-container">
          <Link href="/" passHref>
            <a aria-label="Go to home">
              <Image
                src="/images/logo.png"
                alt="Tattoo Studio Logo"
                width={300}
                height={120}
                priority
              />
            </a>
          </Link>
        </div>

        {/* Icons under logo using the same classes as the footer */}
        <div className="footer-socials">
          <a
            href="https://www.instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-icon"
            aria-label="Instagram"
          >
            <FaInstagram />
          </a>
          <a
            href="https://www.facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-icon"
            aria-label="Facebook"
          >
            <FaFacebook />
          </a>
          <a
            href="https://www.youtube.com/@HTSpodcast"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-icon"
            aria-label="YouTube"
          >
            <FaYoutube />
          </a>
          {/* TikTok Link Added Here */}
          <a
            href="https://www.tiktok.com/@hulltattoostudio"
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

          {/* FAQ Link on Desktop */}
          <Link href="/faq" passHref>
            <a className="navbar-link">FAQ</a>
          </Link>

          {/* Loyalty Page Link for Desktop */}
          <Link href="/loyalty" passHref>
            <a className="navbar-link">Loyalty</a>
          </Link>

          {/* Blog Link on Desktop */}
          <Link href="/blog" passHref>
            <a className="navbar-link">Blog</a>
          </Link>

          {/* Artists Dropdown (Desktop) */}
          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              variant="ghost"
              fontSize="lg"
              fontWeight="semibold"
              _hover={{ color: "#ff007f" }}
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
            href="https://www.instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-icon"
            aria-label="Instagram"
          >
            <FaInstagram />
          </a>
          <a
            href="https://www.facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-icon"
            aria-label="Facebook"
          >
            <FaFacebook />
          </a>
          <a
            href="https://www.youtube.com/@HTSpodcast"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-icon"
            aria-label="YouTube"
          >
            <FaYoutube />
          </a>
          {/* TikTok Link Added Here */}
          <a
            href="https://www.tiktok.com/@hulltattoostudio"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-icon"
            aria-label="TikTok"
          >
            <FaTiktok />
          </a>
        </div>
        <p className="footer-text">
          © {currentYear} Tattoo Studio. All rights reserved.
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

        {/* FAQ Link on Mobile */}
        <Link href="/faq" passHref>
          <a className="navbar-icon" aria-label="FAQ">
            <FaQuestionCircle />
          </a>
        </Link>

        {/* Loyalty Page Link for Mobile */}
        <Link href="/loyalty" passHref>
          <a className="navbar-icon" aria-label="Loyalty">
            <FaStar />
          </a>
        </Link>

        {/* Blog Link on Mobile */}
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
            _hover={{ color: "#ff007f" }}
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
