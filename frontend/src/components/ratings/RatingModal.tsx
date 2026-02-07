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
    if (!isOpen || meta || isMetaLoading) return

    let isActive = true
    setIsMetaLoading(true)
    setMetaError(false)

    ratingsApi
      .getMeta()
      .then((data) => {
        if (!isActive) return
        setMeta(data)
      })
      .catch((error) => {
        if (!isActive) return
        console.error("Error cargando metadata de calificaciones", error)
        setMetaError(true)
      })
      .finally(() => {
        if (!isActive) return
        setIsMetaLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [isOpen, meta, isMetaLoading])

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
      toast({ title: "Selecciona una calificacion", status: "warning" })
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
      console.error("Error creando calificacion", error)
      toast({
        title: "No se pudo registrar la calificacion",
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
      <ModalContent>
        <ModalHeader>Califica a {counterpartyName}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="stretch" spacing={4}>
            <Box>
              <Text fontWeight="bold" mb={2}>
                Tu calificacion
              </Text>
              <HStack spacing={1}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <IconButton
                    key={`score-${index}`}
                    aria-label={`${index + 1} estrellas`}
                    icon={<FaStar />}
                    size="lg"
                    variant="ghost"
                    color={score >= index + 1 ? "yellow.400" : "gray.300"}
                    onClick={() => setScore(index + 1)}
                  />
                ))}
              </HStack>
              {score > 0 && (
                <Text fontSize="sm" color="gray.500" mt={1}>
                  {score} de 5
                </Text>
              )}
            </Box>

            {isMetaLoading && score > 0 && (
              <Text fontSize="sm" color="gray.500">
                Cargando motivos...
              </Text>
            )}

            {metaError && score > 0 && (
              <Text fontSize="sm" color="gray.500">
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
                          colorScheme={isActive ? "blue" : "gray"}
                          onClick={() => toggleTag(tag)}
                        >
                          {tag}
                        </Button>
                      </WrapItem>
                    )
                  })}
                </Wrap>
                {typeof meta?.maxTags === "number" && (
                  <Text fontSize="xs" color="gray.500" mt={2}>
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
                <Text fontSize="xs" color="gray.500" mt={2}>
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
          <Button colorScheme="blue" onClick={handleSubmit} isLoading={isSubmitting}>
            Enviar calificacion
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
