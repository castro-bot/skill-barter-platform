// frontend/src/pages/TradesPage.tsx
import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Card,
  CardBody,
  Text,
  Badge,
  Button,
  HStack,
  Flex,
  Avatar,
  Icon,
  Spinner,
  Alert,
  AlertIcon,
  keyframes,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  useToast,
  useDisclosure
} from "@chakra-ui/react";
import { FaExchangeAlt } from "react-icons/fa";
import { tradesApi, type Trade, type TradesResponse } from "../api/trades";
import { RatingModal } from "../components/ratings/RatingModal";
import { getApiErrorMessage } from "../utils/error";

const WHATSAPP_REGEX = /^(?:\+5939\d{8}|09\d{8})$/;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

const normalizeWhatsappInput = (value: string) => {
  const trimmed = value.trim();
  const hasPlus = trimmed.startsWith("+");
  const digitsOnly = trimmed.replace(/\D/g, "");
  return hasPlus ? `+${digitsOnly}` : digitsOnly;
};

export const TradesPage = () => {
  const toast = useToast();
  const [trades, setTrades] = useState<TradesResponse>({ incoming: [], outgoing: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const ratingDisclosure = useDisclosure();
  const [ratingTarget, setRatingTarget] = useState<{ tradeId: string; counterpartyName: string } | null>(null);
  const whatsappDisclosure = useDisclosure();
  const [acceptTarget, setAcceptTarget] = useState<{ tradeId: string } | null>(null);
  const [whatsapp, setWhatsapp] = useState("");

  const openRating = (trade: Trade, isIncoming: boolean) => {
    const counterpartyName = isIncoming
      ? trade.proposer?.name || "Usuario"
      : trade.receiver?.name || "Usuario";
    setRatingTarget({ tradeId: trade.id, counterpartyName });
    ratingDisclosure.onOpen();
  };

  const closeRating = () => {
    ratingDisclosure.onClose();
    setRatingTarget(null);
  };

  const openAccept = (tradeId: string) => {
    setAcceptTarget({ tradeId });
    setWhatsapp("");
    whatsappDisclosure.onOpen();
  };

  const closeAccept = () => {
    whatsappDisclosure.onClose();
    setAcceptTarget(null);
    setWhatsapp("");
  };

  const fetchTrades = async () => {
    setIsLoading(true);
    try {
      const data = await tradesApi.getAll();
      setTrades(data);
    } catch (error) {
      console.error("Error cargando trueques", error);
      toast({
        title: "Error cargando trueques",
        description: getApiErrorMessage(error, "Intenta nuevamente en unos segundos."),
        status: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, []);

  const handleRespond = async (
    tradeId: string,
    action: "accept" | "reject",
    contactWhatsapp?: string
  ) => {
    setProcessingId(tradeId);
    try {
      await tradesApi.respond(tradeId, action, contactWhatsapp);
      toast({
        title: action === "accept" ? "¡Trueque Aceptado!" : "Trueque Rechazado",
        status: action === "accept" ? "success" : "info"
      });
      fetchTrades();
      return true;
    } catch (error) {
      console.error("Error respondiendo al trueque:", error);
      toast({
        title: "Error al procesar la acción",
        description: getApiErrorMessage(error, "Intenta nuevamente."),
        status: "error"
      });
      return false;
    } finally {
      setProcessingId(null);
    }
  };

  const handleAcceptConfirm = async () => {
    if (!acceptTarget) return;

    const normalizedWhatsapp = normalizeWhatsappInput(whatsapp);
    if (!normalizedWhatsapp) {
      toast({ title: "Ingresa tu WhatsApp para continuar", status: "warning" });
      return;
    }
    if (!WHATSAPP_REGEX.test(normalizedWhatsapp)) {
      toast({
        title: "WhatsApp inválido",
        description: "Usa +5939XXXXXXXX o 09XXXXXXXX",
        status: "error"
      });
      return;
    }

    const ok = await handleRespond(acceptTarget.tradeId, "accept", normalizedWhatsapp);
    if (ok) closeAccept();
  };

  // Sprint 3: completar trueque
  const handleComplete = async (tradeId: string) => {
    setProcessingId(tradeId);
    try {
      await tradesApi.complete(tradeId);
      toast({ title: "✅ Trueque completado", status: "success" });
      fetchTrades();
    } catch (error) {
      console.error("Error completando el trueque:", error);
      toast({
        title: "Error al completar el trueque",
        description: getApiErrorMessage(error, "Intenta nuevamente."),
        status: "error"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return "green";
      case "REJECTED":
        return "red";
      case "COMPLETED":
        return "brand";
      default:
        return "sand"; // PENDING
    }
  };

  const TradeCard = ({ trade, isIncoming }: { trade: Trade; isIncoming: boolean }) => (
    <Card
      mb={6}
      overflow="hidden"
      variant="outline"
      borderColor={trade.status === "PENDING" ? "sand.300" : "gray.200"}
      boxShadow={trade.status === "PENDING" ? "md" : "sm"}
      borderRadius="xl"
      borderWidth={trade.status === "PENDING" ? "2px" : "1px"}
      transition="all 0.2s"
      _hover={{ shadow: "lg" }}
    >
      <CardBody p={0}>
        {/* CABECERA */}
        <Flex
          bg={trade.status === "PENDING" ? "sand.50" : "gray.50"}
          p={4}
          justify="space-between"
          align="center"
          borderBottom="1px solid"
          borderColor="gray.100"
        >
          <Badge
            colorScheme={getStatusColor(trade.status)}
            px={3}
            py={1}
            borderRadius="md"
            fontSize="xs"
            fontWeight="bold"
          >
            {trade.status === "PENDING" ? "PENDIENTE DE RESPUESTA" : trade.status}
          </Badge>

          <Text fontSize="xs" fontWeight="bold" color="gray.500">
            {new Date(trade.createdAt).toLocaleDateString()}
          </Text>
        </Flex>

        {/* CUERPO */}
        <Flex direction={{ base: "column", md: "row" }} p={6} align="center" gap={6}>
          {/* LADO IZQUIERDO */}
          <Box flex={1} textAlign={{ base: "center", md: "left" }} w="full">
            <Text
              fontSize="xx-small"
              fontWeight="bold"
              color="gray.400"
              textTransform="uppercase"
              mb={2}
              letterSpacing="wider"
            >
              {isIncoming ? "TE OFRECEN" : "TÚ OFRECES"}
            </Text>

            <Heading size="md" color="brand.700" mb={2}>
              {trade.proposerService?.title || "Servicio no disponible"}
            </Heading>

            <HStack justify={{ base: "center", md: "start" }} spacing={3}>
              <Avatar size="xs" name={trade.proposer?.name || "Usuario"} />
              <Text fontSize="sm" color="gray.600" fontWeight="medium">
                {trade.proposer?.name || "Usuario"}
              </Text>
            </HStack>
          </Box>

          {/* ICONO */}
          <Flex
            bg="gray.100"
            w={12}
            h={12}
            borderRadius="full"
            align="center"
            justify="center"
            color="gray.500"
            shrink={0}
          >
            <Icon as={FaExchangeAlt} />
          </Flex>

          {/* LADO DERECHO */}
          <Box flex={1} textAlign={{ base: "center", md: "right" }} w="full">
            <Flex direction="column" align={{ base: "center", md: "flex-end" }}>
              <Text
                fontSize="xx-small"
                fontWeight="bold"
                color="gray.400"
                textTransform="uppercase"
                mb={2}
                letterSpacing="wider"
              >
                {isIncoming ? "A CAMBIO DE TU" : "POR SU"}
              </Text>

              <Heading size="md" color="sand.600" mb={2}>
                {trade.receiverService?.title || "Servicio no disponible"}
              </Heading>

              <HStack spacing={3}>
                <Text fontSize="sm" color="gray.600" fontWeight="medium">
                  {isIncoming ? "Tu servicio" : trade.receiver?.name || "Usuario"}
                </Text>
                {!isIncoming && <Avatar size="xs" name={trade.receiver?.name || "Usuario"} />}
              </HStack>
            </Flex>
          </Box>
        </Flex>

        {/* PIE */}
        <Box px={6} pb={6}>
          {trade.note && (
            <Box
              bg="yellow.50"
              p={4}
              borderRadius="lg"
              mb={4}
              borderLeft="4px solid"
              borderColor="yellow.400"
            >
              <Text fontSize="xs" color="gray.500" fontWeight="bold" mb={1}>
                NOTA:
              </Text>
              <Text fontSize="sm" fontStyle="italic" color="gray.700">
                "{trade.note}"
              </Text>
            </Box>
          )}

          {/* BOTONES: Incoming + Pending => Aceptar/Rechazar */}
          {isIncoming && trade.status === "PENDING" && (
            <Flex gap={3} mt={4} justify={{ base: "stretch", md: "flex-end" }}>
              <Button
                flex={{ base: 1, md: "none" }}
                colorScheme="red"
                variant="ghost"
                size="sm"
                isLoading={processingId === trade.id}
                onClick={() => handleRespond(trade.id, "reject")}
              >
                Rechazar
              </Button>

              <Button
                flex={{ base: 1, md: "none" }}
                colorScheme="green"
                shadow="md"
                size="sm"
                isLoading={processingId === trade.id}
                onClick={() => openAccept(trade.id)}
              >
                Aceptar Trueque
              </Button>
            </Flex>
          )}

          {/* Sprint 3: Si está ACCEPTED => mostrar botón Completar (para ambos lados) */}
          {trade.status === "ACCEPTED" && (
            <Flex mt={4} gap={3} justify={{ base: "center", md: "flex-end" }} align="center" wrap="wrap">
              <Badge colorScheme="green" variant="solid" px={3} py={1} borderRadius="full">
                ✅ ¡Trueque Aceptado!
              </Badge>

              <Button
                colorScheme="brand"
                size="sm"
                isLoading={processingId === trade.id}
                onClick={() => handleComplete(trade.id)}
              >
                Completar
              </Button>
            </Flex>
          )}

          {/* Estado COMPLETED */}
          {trade.status === "COMPLETED" && (
            <Flex mt={4} gap={3} justify={{ base: "center", md: "flex-end" }} align="center" wrap="wrap">
              <Badge colorScheme="brand" variant="solid" px={3} py={1} borderRadius="full">
                🎉 Trueque Completado
              </Badge>
              {trade.hasRated ? (
                <Badge colorScheme="green" variant="subtle" px={3} py={1} borderRadius="full">
                  Calificado
                </Badge>
              ) : (
                <Button size="sm" colorScheme="brand" onClick={() => openRating(trade, isIncoming)}>
                  Calificar
                </Button>
              )}
            </Flex>
          )}

          {(trade.status === "ACCEPTED" || trade.status === "COMPLETED") && trade.contactWhatsapp && (
            <Box
              mt={4}
              p={3}
              borderRadius="lg"
              border="1px solid"
              borderColor="green.200"
              bg="green.50"
            >
              <Text fontSize="xs" fontWeight="bold" color="green.700" mb={1}>
                Contacto WhatsApp
              </Text>
              <Text fontSize="sm" color="green.800">
                {trade.contactWhatsapp}
              </Text>
            </Box>
          )}
        </Box>
      </CardBody>
    </Card>
  );

  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="50vh">
        <Spinner size="xl" color="brand.500" thickness="4px" />
      </Flex>
    );
  }

  return (
    <Box bg="transparent" minH="calc(100vh - 64px)" py={8}>
      {ratingTarget && (
        <RatingModal
          isOpen={ratingDisclosure.isOpen}
          onClose={closeRating}
          tradeId={ratingTarget.tradeId}
          counterpartyName={ratingTarget.counterpartyName}
          onSuccess={fetchTrades}
        />
      )}
      <Modal isOpen={whatsappDisclosure.isOpen} onClose={closeAccept} isCentered>
        <ModalOverlay backdropFilter="blur(2px)" />
        <ModalContent>
          <ModalHeader>Comparte tu WhatsApp</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isRequired>
              <FormLabel>Número de WhatsApp</FormLabel>
              <Input
                placeholder="Ej: +593994601733 o 0994601733"
                value={whatsapp}
                onChange={(e) => setWhatsapp(normalizeWhatsappInput(e.target.value))}
                inputMode="tel"
              />
              <Text fontSize="xs" color="gray.500" mt={2}>
                Se compartirá con la otra parte cuando aceptes el trueque.
              </Text>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={closeAccept}>
              Cancelar
            </Button>
            <Button
              colorScheme="green"
              onClick={handleAcceptConfirm}
              isLoading={processingId === acceptTarget?.tradeId}
            >
              Aceptar y Compartir
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Container maxW="container.md">
        <Heading mb={8} size="xl" color="gray.700" letterSpacing="tight">
          Mis Trueques
        </Heading>

        <Tabs isFitted variant="soft-rounded" colorScheme="brand">
          <TabList mb={6} bg="white" p={1} borderRadius="full" shadow="sm">
            <Tab borderRadius="full" fontWeight="bold">
              Recibidos (Inbox)
            </Tab>
            <Tab borderRadius="full" fontWeight="bold">
              Enviados
            </Tab>
          </TabList>

          <TabPanels>
            {/* RECIBIDOS */}
            <TabPanel px={0}>
              {trades.incoming?.length > 0 ? (
                trades.incoming.map((t, index) => (
                  <Box key={t.id} animation={`${fadeUp} 0.5s ease ${index * 0.04}s both`}>
                    <TradeCard trade={t} isIncoming={true} />
                  </Box>
                ))
              ) : (
                <Alert
                  status="info"
                  borderRadius="xl"
                  variant="subtle"
                  flexDirection="column"
                  alignItems="center"
                  justifyItems="center"
                  textAlign="center"
                  height="200px"
                  justifyContent="center"
                >
                  <AlertIcon boxSize="40px" mr={0} />
                  <Heading size="md" mt={4} mb={1}>
                    Sin solicitudes
                  </Heading>
                  <Text maxW="sm">
                    Nadie te ha propuesto un trueque todavía. ¡Mejora tus servicios para atraer más gente!
                  </Text>
                </Alert>
              )}
            </TabPanel>

            {/* ENVIADOS */}
            <TabPanel px={0}>
              {trades.outgoing?.length > 0 ? (
                trades.outgoing.map((t, index) => (
                  <Box key={t.id} animation={`${fadeUp} 0.5s ease ${index * 0.04}s both`}>
                    <TradeCard trade={t} isIncoming={false} />
                  </Box>
                ))
              ) : (
                <Alert
                  status="info"
                  borderRadius="xl"
                  variant="subtle"
                  flexDirection="column"
                  alignItems="center"
                  justifyItems="center"
                  textAlign="center"
                  height="200px"
                  justifyContent="center"
                >
                  <AlertIcon boxSize="40px" mr={0} />
                  <Heading size="md" mt={4} mb={1}>
                    No has ofertado
                  </Heading>
                  <Text maxW="sm">Explora el mercado y propón intercambios a los servicios que te interesen.</Text>
                </Alert>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </Box>
  );
};
