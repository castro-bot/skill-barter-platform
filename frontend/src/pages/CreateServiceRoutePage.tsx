import { useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useDisclosure } from "@chakra-ui/react"
import { CreateServiceModal } from "../components/services/CreateServiceModal"

export const CreateServiceRoutePage = () => {
  const navigate = useNavigate()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const openedRef = useRef(false)

  // Abrir modal una sola vez (StrictMode en dev monta 2 veces)
  useEffect(() => {
    if (openedRef.current) return
    openedRef.current = true

    // Abrimos el modal
    onOpen()
  }, [onOpen])

  const handleClose = () => {
    onClose()
    // Sacamos al usuario de /services/new para evitar que quede URL rara
    navigate("/services", { replace: true })
  }

  const handleSuccess = () => {
    // Cuando crea, cerramos y volvemos al mercado
    handleClose()
  }

  return (
    <CreateServiceModal
      isOpen={isOpen}
      onClose={handleClose}
      onSuccess={handleSuccess}
    />
  )
}