import { Box, Container, Flex, Heading, HStack, IconButton, Link as ChakraLink, Tooltip } from '@chakra-ui/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiDownload, FiClock } from 'react-icons/fi';
import { FaYoutube, FaInstagram, FaTiktok } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

const platformIcons = [
  { key: 'youtube', icon: FaYoutube, label: 'YouTube', color: '#FF0000' },
  { key: 'instagram', icon: FaInstagram, label: 'Instagram', color: '#E4405F' },
  { key: 'x', icon: FaXTwitter, label: 'X (Twitter)', color: '#FFFFFF' },
  { key: 'tiktok', icon: FaTiktok, label: 'TikTok', color: '#00F2EA' },
];

export default function Navbar({ platform, setPlatform }) {
  const location = useLocation();
  const navigate = useNavigate();

  const navLink = (to, label, icon) => {
    const isActive = location.pathname === to;
    return (
      <ChakraLink
        as={Link}
        to={to}
        display="flex"
        alignItems="center"
        gap={2}
        px={4}
        py={2}
        rounded="lg"
        fontWeight="semibold"
        fontSize="sm"
        bg={isActive ? 'whiteAlpha.200' : 'transparent'}
        color={isActive ? 'brand.400' : 'gray.300'}
        _hover={{ bg: 'whiteAlpha.100', color: 'brand.300', textDecoration: 'none' }}
        transition="all 0.2s"
      >
        <Box as={icon} />
        {label}
      </ChakraLink>
    );
  };

  return (
    <Box
      as="nav"
      position="sticky"
      top={0}
      zIndex={100}
      backdropFilter="blur(12px)"
      bg="rgba(15, 15, 35, 0.85)"
      borderBottom="1px solid"
      borderColor="whiteAlpha.100"
    >
      <Container maxW="6xl">
        <Flex h="16" align="center" justify="space-between">
          <ChakraLink
            as={Link}
            to="/"
            _hover={{ textDecoration: 'none' }}
          >
            <Heading
              size="md"
              bgGradient="linear(to-r, brand.400, pink.400)"
              bgClip="text"
              fontWeight="extrabold"
              letterSpacing="tight"
            >
              Nyova Downloader
            </Heading>
          </ChakraLink>

          {/* Platform selector icons */}
          <HStack spacing={1}>
            {platformIcons.map((p) => (
              <Tooltip key={p.key} label={p.label} fontSize="xs" hasArrow>
                <IconButton
                  aria-label={p.label}
                  icon={<Box as={p.icon} boxSize="18px" />}
                  variant="ghost"
                  size="sm"
                  color={platform === p.key ? p.color : 'gray.500'}
                  bg={platform === p.key ? 'whiteAlpha.150' : 'transparent'}
                  _hover={{ color: p.color, bg: 'whiteAlpha.100' }}
                  transition="all 0.2s"
                  onClick={() => {
                    setPlatform(p.key);
                    if (location.pathname !== '/') navigate('/');
                  }}
                />
              </Tooltip>
            ))}
          </HStack>

          <HStack spacing={2}>
            {navLink('/', 'Download', FiDownload)}
            {navLink('/history', 'History', FiClock)}
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}
