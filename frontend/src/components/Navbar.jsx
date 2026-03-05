import { Box, Container, Flex, Heading, HStack, Link as ChakraLink } from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import { FiDownload, FiClock } from 'react-icons/fi';

export default function Navbar() {
  const location = useLocation();

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
              YT-DLP
            </Heading>
          </ChakraLink>

          <HStack spacing={2}>
            {navLink('/', 'Download', FiDownload)}
            {navLink('/history', 'History', FiClock)}
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}
