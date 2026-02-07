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
import { ratingsApi } from "../../api/ratings"
import { getApiErrorMessage } from "../../utils/error"

const TAGS_BY_SCORE: Record<number, string[]> = {
  1: ["Incumplio lo acordado", "No se presento", "Mala comunicacion", "Calidad baja", "Tiempo de entrega"],
  2: ["Incumplio lo acordado", "No se presento", "Mala comunicacion", "Calidad baja", "Tiempo de entrega"],
  3: ["Aceptable", "Retraso leve", "Comunicacion media", "Calidad regular"],
  4: ["Gran comunicacion", "Entrega puntual", "Alta calidad", "Volveria a intercambiar"],
  5: ["Gran comunicacion", "Entrega puntual", "Alta calidad", "Volveria a intercambiar"]
}

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

  const availableTags = useMemo(() => {
    if (!score) return []
    return TAGS_BY_SCORE[score] || []
  }, [score])

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
              />
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
