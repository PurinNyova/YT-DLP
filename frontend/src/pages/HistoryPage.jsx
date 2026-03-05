import { useEffect, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Icon,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  Card,
  CardBody,
  Spinner,
} from '@chakra-ui/react';
import { FiDownload, FiMusic, FiVideo, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { listDownloads, getDownloadFileURL } from '../api/client';

export default function HistoryPage() {
  const [downloads, setDownloads] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const pageSize = 15;

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await listDownloads(page, pageSize);
      setDownloads(data.downloads || []);
      setTotal(data.total || 0);
    } catch {
      setDownloads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  const totalPages = Math.ceil(total / pageSize);

  const statusColor = {
    pending: 'yellow',
    processing: 'blue',
    completed: 'green',
    failed: 'red',
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString();
  };

  const formatSize = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <Container maxW="6xl" py={12}>
      <VStack spacing={6} align="stretch">
        <Heading
          size="xl"
          bgGradient="linear(to-r, brand.400, pink.400)"
          bgClip="text"
          fontWeight="extrabold"
        >
          Download History
        </Heading>

        <Card bg="whiteAlpha.50" border="1px solid" borderColor="whiteAlpha.100" shadow="2xl">
          <CardBody p={0}>
            {loading ? (
              <Box py={16} textAlign="center">
                <Spinner size="xl" color="brand.400" />
              </Box>
            ) : downloads.length === 0 ? (
              <Box py={16} textAlign="center">
                <Text color="gray.500" fontSize="lg">
                  No downloads yet.
                </Text>
              </Box>
            ) : (
              <Box overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr borderBottom="1px solid" borderColor="whiteAlpha.100">
                      <Th color="gray.400" borderColor="whiteAlpha.100">ID</Th>
                      <Th color="gray.400" borderColor="whiteAlpha.100">Title</Th>
                      <Th color="gray.400" borderColor="whiteAlpha.100">Format</Th>
                      <Th color="gray.400" borderColor="whiteAlpha.100">Quality</Th>
                      <Th color="gray.400" borderColor="whiteAlpha.100">Size</Th>
                      <Th color="gray.400" borderColor="whiteAlpha.100">Status</Th>
                      <Th color="gray.400" borderColor="whiteAlpha.100">Created</Th>
                      <Th color="gray.400" borderColor="whiteAlpha.100">Action</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {downloads.map((dl) => (
                      <Tr key={dl.id} _hover={{ bg: 'whiteAlpha.50' }} borderBottom="1px solid" borderColor="whiteAlpha.50">
                        <Td borderColor="whiteAlpha.50" color="gray.300">
                          {dl.id}
                        </Td>
                        <Td borderColor="whiteAlpha.50" maxW="250px" isTruncated color="white" fontWeight="medium">
                          {dl.title || '—'}
                        </Td>
                        <Td borderColor="whiteAlpha.50">
                          <Icon as={dl.format === 'audio' ? FiMusic : FiVideo} color="brand.400" />
                        </Td>
                        <Td borderColor="whiteAlpha.50" color="gray.300">
                          {dl.quality}
                        </Td>
                        <Td borderColor="whiteAlpha.50" color="gray.300">
                          {formatSize(dl.file_size)}
                        </Td>
                        <Td borderColor="whiteAlpha.50">
                          <Badge colorScheme={statusColor[dl.status] || 'gray'} rounded="full" px={2}>
                            {dl.status}
                          </Badge>
                        </Td>
                        <Td borderColor="whiteAlpha.50" color="gray.400" fontSize="xs">
                          {formatTime(dl.created_at)}
                        </Td>
                        <Td borderColor="whiteAlpha.50">
                          {dl.status === 'completed' && (
                            <Button
                              as="a"
                              href={getDownloadFileURL(dl.id)}
                              download
                              size="xs"
                              bg="brand.400"
                              color="white"
                              _hover={{ bg: 'brand.300' }}
                              leftIcon={<FiDownload />}
                              rounded="lg"
                            >
                              Download
                            </Button>
                          )}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <HStack justify="center" p={4} borderTop="1px solid" borderColor="whiteAlpha.100" spacing={4}>
                <Button
                  size="sm"
                  variant="ghost"
                  color="gray.300"
                  _hover={{ bg: 'whiteAlpha.100' }}
                  leftIcon={<FiChevronLeft />}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  isDisabled={page === 1}
                >
                  Prev
                </Button>
                <Text color="gray.400" fontSize="sm">
                  Page {page} of {totalPages}
                </Text>
                <Button
                  size="sm"
                  variant="ghost"
                  color="gray.300"
                  _hover={{ bg: 'whiteAlpha.100' }}
                  rightIcon={<FiChevronRight />}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  isDisabled={page === totalPages}
                >
                  Next
                </Button>
              </HStack>
            )}
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
}
