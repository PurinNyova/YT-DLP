import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Text,
  VStack,
  Badge,
  Spinner,
  useToast,
  Card,
  CardBody,
  Icon,
  Progress,
} from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiSearch, FiMusic, FiVideo, FiDownload, FiCheck, FiX } from 'react-icons/fi';
import { fetchVideoInfo, startDownload, getDownloadStatus, getDownloadFileURL } from '../api/client';
import { PLATFORMS } from '../App';

const MotionBox = motion(Box);

export default function HomePage({ platform = 'youtube' }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState(null);
  const [formatType, setFormatType] = useState('video');
  const [selectedQuality, setSelectedQuality] = useState('');
  const [downloadState, setDownloadState] = useState(null); // { id, status }
  const toast = useToast();

  const platformInfo = PLATFORMS[platform] || PLATFORMS.youtube;

  // Reset form when platform changes
  useEffect(() => {
    setUrl('');
    setVideoInfo(null);
    setDownloadState(null);
    setFormatType('video');
    setSelectedQuality('');
  }, [platform]);

  const handleFetchInfo = async () => {
    if (!url.trim()) {
      toast({ title: `Please enter a ${platformInfo.name} URL`, status: 'warning', duration: 3000 });
      return;
    }
    setLoading(true);
    setVideoInfo(null);
    setDownloadState(null);
    try {
      const info = await fetchVideoInfo(url.trim(), platform);
      setVideoInfo(info);
      // Auto-select first quality
      const formats = info.formats.filter((f) => f.type === formatType);
      if (formats.length > 0) {
        setSelectedQuality(formats[0].quality);
      }
    } catch (err) {
      toast({
        title: 'Failed to fetch video info',
        description: err.response?.data?.error || err.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const availableFormats = videoInfo
    ? videoInfo.formats.filter((f) => f.type === formatType)
    : [];

  useEffect(() => {
    if (availableFormats.length > 0) {
      setSelectedQuality(availableFormats[0].quality);
    } else {
      setSelectedQuality('');
    }
  }, [formatType, videoInfo]);

  const handleDownload = async () => {
    if (!selectedQuality) return;
    try {
      const result = await startDownload(url.trim(), formatType, selectedQuality, platform);
      setDownloadState({ id: result.id, status: 'pending' });
      toast({ title: 'Download started!', status: 'info', duration: 2000 });
    } catch (err) {
      toast({
        title: 'Failed to start download',
        description: err.response?.data?.error || err.message,
        status: 'error',
        duration: 5000,
      });
    }
  };

  // Poll download status
  const pollStatus = useCallback(async () => {
    if (!downloadState || downloadState.status === 'completed' || downloadState.status === 'failed') return;
    try {
      const data = await getDownloadStatus(downloadState.id);
      setDownloadState({ id: downloadState.id, status: data.status });
      if (data.status === 'completed') {
        toast({ title: 'Download complete!', status: 'success', duration: 3000 });
      } else if (data.status === 'failed') {
        toast({
          title: 'Download failed',
          description: data.error_message || 'Unknown error',
          status: 'error',
          duration: 5000,
        });
      }
    } catch {
      // ignore polling errors
    }
  }, [downloadState, toast]);

  useEffect(() => {
    if (!downloadState || downloadState.status === 'completed' || downloadState.status === 'failed') return;
    const interval = setInterval(pollStatus, 2000);
    return () => clearInterval(interval);
  }, [downloadState, pollStatus]);

  const statusBadge = (status) => {
    const map = {
      pending: { colorScheme: 'yellow', icon: FiDownload },
      processing: { colorScheme: 'blue', icon: FiDownload },
      completed: { colorScheme: 'green', icon: FiCheck },
      failed: { colorScheme: 'red', icon: FiX },
    };
    const s = map[status] || map.pending;
    return (
      <Badge colorScheme={s.colorScheme} px={3} py={1} rounded="full" fontSize="sm" display="flex" alignItems="center" gap={1}>
        <Icon as={s.icon} />
        {status}
      </Badge>
    );
  };

  return (
    <Container maxW="3xl" py={12}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box textAlign="center">
          <Heading
            size="2xl"
            bgGradient="linear(to-r, brand.400, pink.400, purple.400)"
            bgClip="text"
            fontWeight="extrabold"
            mb={2}
          >
            Download{' '}
            <Box as="span" position="relative" display="inline-block">
              <AnimatePresence mode="wait">
                <MotionBox
                  as="span"
                  key={platform}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  display="inline-block"
                >
                  {platformInfo.name}
                </MotionBox>
              </AnimatePresence>
            </Box>{' '}
            Videos
          </Heading>
          <Text color="gray.400" fontSize="lg">
            Paste a link, pick your format, and download.
          </Text>
        </Box>

        {/* URL Input */}
        <Card bg="whiteAlpha.50" border="1px solid" borderColor="whiteAlpha.100" shadow="2xl">
          <CardBody>
            <HStack spacing={3}>
              <InputGroup size="lg">
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiSearch} color="gray.500" />
                </InputLeftElement>
                <Input
                  placeholder={platformInfo.placeholder}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleFetchInfo()}
                  bg="whiteAlpha.100"
                  border="1px solid"
                  borderColor="whiteAlpha.200"
                  _hover={{ borderColor: 'brand.400' }}
                  _focus={{ borderColor: 'brand.400', boxShadow: '0 0 0 1px #e94560' }}
                  color="white"
                  _placeholder={{ color: 'gray.500' }}
                  rounded="xl"
                />
              </InputGroup>
              <Button
                size="lg"
                bg="brand.400"
                color="white"
                _hover={{ bg: 'brand.300' }}
                onClick={handleFetchInfo}
                isLoading={loading}
                loadingText="Fetching"
                rounded="xl"
                px={8}
                minW="140px"
              >
                Fetch Info
              </Button>
            </HStack>
          </CardBody>
        </Card>

        {/* Video Info + Format Selection */}
        {videoInfo && (
          <Card bg="whiteAlpha.50" border="1px solid" borderColor="whiteAlpha.100" shadow="2xl" overflow="hidden">
            <CardBody p={0}>
              {/* Thumbnail + Title */}
              <Flex direction={{ base: 'column', md: 'row' }}>
                <Image
                  src={videoInfo.thumbnail}
                  alt={videoInfo.title}
                  maxW={{ base: '100%', md: '320px' }}
                  objectFit="cover"
                  fallback={<Box bg="gray.700" w="320px" h="180px" />}
                />
                <VStack align="start" p={5} spacing={3} flex={1}>
                  <Heading size="md" color="white" noOfLines={2}>
                    {videoInfo.title}
                  </Heading>
                  <Text color="gray.400" fontSize="sm">
                    Duration: {Math.floor(videoInfo.duration / 60)}:{String(Math.floor(videoInfo.duration % 60)).padStart(2, '0')}
                  </Text>
                </VStack>
              </Flex>

              {/* Format Selection */}
              <Box p={5} borderTop="1px solid" borderColor="whiteAlpha.100">
                <VStack spacing={4} align="stretch">
                  {/* Audio/Video Toggle */}
                  <HStack spacing={3}>
                    <Button
                      leftIcon={<FiVideo />}
                      variant={formatType === 'video' ? 'solid' : 'outline'}
                      bg={formatType === 'video' ? 'brand.400' : 'transparent'}
                      color="white"
                      borderColor="brand.400"
                      _hover={{ bg: formatType === 'video' ? 'brand.300' : 'whiteAlpha.100' }}
                      onClick={() => setFormatType('video')}
                      flex={1}
                      rounded="xl"
                    >
                      Video
                    </Button>
                    <Button
                      leftIcon={<FiMusic />}
                      variant={formatType === 'audio' ? 'solid' : 'outline'}
                      bg={formatType === 'audio' ? 'brand.400' : 'transparent'}
                      color="white"
                      borderColor="brand.400"
                      _hover={{ bg: formatType === 'audio' ? 'brand.300' : 'whiteAlpha.100' }}
                      onClick={() => setFormatType('audio')}
                      flex={1}
                      rounded="xl"
                    >
                      Audio
                    </Button>
                  </HStack>

                  {/* Quality Dropdown */}
                  <Select
                    value={selectedQuality}
                    onChange={(e) => setSelectedQuality(e.target.value)}
                    bg="whiteAlpha.100"
                    border="1px solid"
                    borderColor="whiteAlpha.200"
                    _hover={{ borderColor: 'brand.400' }}
                    color="white"
                    rounded="xl"
                    size="lg"
                  >
                    {availableFormats.length === 0 && (
                      <option value="" style={{ background: '#1a1a2e' }}>
                        No {formatType} formats available
                      </option>
                    )}
                    {availableFormats.map((f) => (
                      <option key={f.format_id} value={f.quality} style={{ background: '#1a1a2e' }}>
                        {f.quality} ({f.ext}){f.filesize ? ` — ${(f.filesize / 1024 / 1024).toFixed(1)}MB` : ''}
                      </option>
                    ))}
                  </Select>

                  {/* Download Button */}
                  <Button
                    size="lg"
                    bg="brand.400"
                    color="white"
                    _hover={{ bg: 'brand.300', transform: 'translateY(-1px)' }}
                    _active={{ transform: 'translateY(0)' }}
                    leftIcon={<FiDownload />}
                    onClick={handleDownload}
                    isDisabled={!selectedQuality || (downloadState && downloadState.status !== 'completed' && downloadState.status !== 'failed')}
                    rounded="xl"
                    transition="all 0.2s"
                    shadow="lg"
                    w="full"
                  >
                    Download {formatType === 'audio' ? 'Audio' : 'Video'}
                  </Button>
                </VStack>
              </Box>
            </CardBody>
          </Card>
        )}

        {/* Download Status */}
        {downloadState && (
          <Card bg="whiteAlpha.50" border="1px solid" borderColor="whiteAlpha.100" shadow="2xl">
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Flex justify="space-between" align="center">
                  <Text fontWeight="bold" color="white">
                    Download #{downloadState.id}
                  </Text>
                  {statusBadge(downloadState.status)}
                </Flex>

                {(downloadState.status === 'pending' || downloadState.status === 'processing') && (
                  <Box>
                    <Progress
                      isIndeterminate
                      colorScheme="brand"
                      size="sm"
                      rounded="full"
                      bg="whiteAlpha.100"
                    />
                    <HStack mt={2} justifyContent="center">
                      <Spinner size="sm" color="brand.400" />
                      <Text fontSize="sm" color="gray.400">
                        {downloadState.status === 'pending' ? 'Queued...' : 'Downloading...'}
                      </Text>
                    </HStack>
                  </Box>
                )}

                {downloadState.status === 'completed' && (
                  <Button
                    as="a"
                    href={getDownloadFileURL(downloadState.id)}
                    download
                    bg="green.500"
                    color="white"
                    _hover={{ bg: 'green.400' }}
                    leftIcon={<FiDownload />}
                    rounded="xl"
                    size="lg"
                    w="full"
                  >
                    Save File
                  </Button>
                )}
              </VStack>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Container>
  );
}
