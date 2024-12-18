// ./src/components/Layout.tsx

import React, { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FaFacebook,
  FaInstagram,
  FaHome,
  FaUserAlt,
  FaCalendarAlt,
  FaSignInAlt,
  FaFirstAid,
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
  // Calculate the current year once
  const currentYear = new Date().getFullYear();

  return (
    <Box
      className="layout-container"
      overflowX="hidden"
      minH="100vh"
      color="white"
      position="relative" // Allows Background to position correctly
      bg="transparent" // Ensure transparency
    >
      {/* Header with Logo */}
      <header className="header">
        <div className="logo-container">
          <Link href="/" passHref>
            <a aria-label="Go to home">
              <Image
                src="/images/logo.png" // Path to the logo image
                alt="Tattoo Studio Logo"
                width={300} // Explicit width
                height={120} // Explicit height
                priority // Ensure the logo loads quickly
              />
            </a>
          </Link>
        </div>
      </header>

      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-desktop">
          <Link href="/" passHref>
            <a className="navbar-link">Home</a>
          </Link>

          {/* Aftercare Link */}
          <Link href="/aftercare" passHref>
            <a className="navbar-link">Aftercare</a>
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
                _hover={{ bg: "rgba(255, 0, 127, 0.2)" }}
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

          {/* Artist Login Button (if applicable) */}
          {/* Uncomment and customize if needed
          <Link href="/login" passHref>
            <a className="navbar-link">
              <FaSignInAlt style={{ marginRight: "8px" }} />
              Login
            </a>
          </Link>
          */}
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

        {/* Aftercare Link for Mobile */}
        <Link href="/aftercare" passHref>
          <a className="navbar-icon" aria-label="Aftercare">
            <FaFirstAid /> {/* Icon representing Aftercare */}
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
                <a style={{ textDecoration: "none", color: "inherit" }}>
                  Mike
                </a>
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

        {/* Additional Mobile Icons (if needed) */}
        {/* Add more icons like Calendar or Login here */}
      </nav>
    </Box>
  );
};

export default Layout;
