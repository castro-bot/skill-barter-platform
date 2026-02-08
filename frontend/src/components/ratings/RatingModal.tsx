// frontend/src/components/ratings/RatingModal.tsx
import { useEffect, useMemo, useState } from "react"
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  VStack,
  HStack,
  Textarea,
  IconButton,
  Box,
  Wrap,
  WrapItem,
  useToast
} from "@chakra-ui/react"
import { FaStar } from "react-icons/fa"
import { ratingsApi, type RatingMeta } from "../../api/ratings"
import { getApiErrorMessage } from "../../utils/error"

type RatingModalProps = {
  isOpen: boolean
  onClose: () => void
  tradeId: string
  counterpartyName: string
  onSuccess?: () => void
}

export const RatingModal = ({
  isOpen,
  onClose,
  tradeId,
  counterpartyName,
  onSuccess
}: RatingModalProps) => {
  const toast = useToast()

  const [score, setScore] = useState(0)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [meta, setMeta] = useState<RatingMeta | null>(null)
  const [isMetaLoading, setIsMetaLoading] = useState(false)
  const [metaError, setMetaError] = useState(false)

  const availableTags = useMemo(() => {
    if (!score || !meta?.tagsByScore) return []
    return meta.tagsByScore[score] || []
  }, [score, meta])

  useEffect(() => {
    if (!isOpen || meta) return

    let isActive = true

    const loadMeta = async () => {
      setIsMetaLoading(true)
      setMetaError(false)

      try {
        const data = await ratingsApi.getMeta()
        if (!isActive) return
        setMeta(data)
      } catch (error) {
        if (!isActive) return
        console.error("Error cargando metadata de calificaciones", error)
        setMetaError(true)
      } finally {
        if (isActive) {
          setIsMetaLoading(false)
        }
      }
    }

    loadMeta()

    return () => {
      isActive = false
    }
  }, [isOpen, meta])

  useEffect(() => {
    if (!isOpen) return
    setScore(0)
    setSelectedTags([])
    setComment("")
  }, [isOpen])

  useEffect(() => {
    if (availableTags.length === 0) {
      setSelectedTags([])
      return
    }

    setSelectedTags((prev) => prev.filter((tag) => availableTags.includes(tag)))
  }, [availableTags])

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) return prev.filter((t) => t !== tag)
      if (typeof meta?.maxTags === "number" && prev.length >= meta.maxTags) {
        toast({
          title: `Puedes seleccionar hasta ${meta.maxTags} motivos`,
          status: "warning"
        })
        return prev
      }
      return [...prev, tag]
    })
  }

  const handleSubmit = async () => {
    if (!score) {
      toast({ title: "Selecciona una calificación", status: "warning" })
      return
    }

    setIsSubmitting(true)
    try {
      await ratingsApi.create({
        tradeId,
        score,
        comment: comment.trim() || undefined,
        tags: selectedTags
      })

      toast({ title: "Gracias por calificar", status: "success" })
      onClose()
      onSuccess?.()
    } catch (error) {
      console.error("Error creando calificación", error)
      toast({
        title: "No se pudo registrar la calificación",
        description: getApiErrorMessage(error, "Intenta nuevamente."),
        status: "error"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay backdropFilter="blur(2px)" />
      <ModalContent boxShadow="xl">
        <ModalHeader>Califica a {counterpartyName}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="stretch" spacing={4}>
            <Box>
              <Text fontWeight="bold" mb={2}>
                Tu calificación
              </Text>
              <HStack spacing={1}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <IconButton
                    key={`score-${index}`}
                    aria-label={`${index + 1} estrellas`}
                    icon={<FaStar />}
                    size="lg"
                    variant="ghost"
                    color={score >= index + 1 ? "brand.500" : "gray.300"}
                    bg={score >= index + 1 ? "brand.50" : "transparent"}
                    _hover={{ bg: score >= index + 1 ? "brand.100" : "gray.100" }}
                    onClick={() => setScore(index + 1)}
                  />
                ))}
              </HStack>
              {score > 0 && (
                <Text fontSize="sm" color="textMuted" mt={1}>
                  {score} de 5
                </Text>
              )}
            </Box>

            {isMetaLoading && score > 0 && (
              <Text fontSize="sm" color="textMuted">
                Cargando motivos...
              </Text>
            )}

            {metaError && score > 0 && (
              <Text fontSize="sm" color="textMuted">
                No se pudieron cargar los motivos. Puedes calificar sin tags.
              </Text>
            )}

            {availableTags.length > 0 && (
              <Box>
                <Text fontWeight="bold" mb={2}>
                  Motivos (opcional)
                </Text>
                <Wrap>
                  {availableTags.map((tag) => {
                    const isActive = selectedTags.includes(tag)
                    return (
                      <WrapItem key={tag}>
                        <Button
                          size="sm"
                          variant={isActive ? "solid" : "outline"}
                          colorScheme={isActive ? "brand" : "gray"}
                          onClick={() => toggleTag(tag)}
                        >
                          {tag}
                        </Button>
                      </WrapItem>
                    )
                  })}
                </Wrap>
                {typeof meta?.maxTags === "number" && (
                  <Text fontSize="xs" color="brand.700" mt={2}>
                    Puedes elegir hasta {meta.maxTags} motivos.
                  </Text>
                )}
              </Box>
            )}

            <Box>
              <Text fontWeight="bold" mb={2}>
                Comentario (opcional)
              </Text>
              <Textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Cuenta tu experiencia..."
                resize="vertical"
                maxLength={meta?.maxCommentLength}
              />
              {typeof meta?.maxCommentLength === "number" && (
                <Text fontSize="xs" color="textMuted" mt={2}>
                  {comment.length}/{meta.maxCommentLength}
                </Text>
              )}
            </Box>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancelar
          </Button>
          <Button colorScheme="brand" onClick={handleSubmit} isLoading={isSubmitting}>
            Enviar calificación
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
