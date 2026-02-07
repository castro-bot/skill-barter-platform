// frontend/src/components/ratings/StarRating.tsx
import { HStack, Icon, Text } from "@chakra-ui/react"
import { FaStar } from "react-icons/fa"

const sizeMap = {
  xs: 3,
  sm: 4,
  md: 5,
  lg: 6
} as const

type StarRatingProps = {
  value: number
  count?: number
  size?: keyof typeof sizeMap
  showValue?: boolean
  showCount?: boolean
}

export const StarRating = ({
  value,
  count,
  size = "sm",
  showValue = true,
  showCount = true
}: StarRatingProps) => {
  const safeValue = Number.isFinite(value) ? value : 0
  const rounded = Math.round(safeValue * 10) / 10

  return (
    <HStack spacing={1} align="center">
      {Array.from({ length: 5 }).map((_, index) => (
        <Icon
          key={`star-${index}`}
          as={FaStar}
          color={safeValue >= index + 1 ? "brand.500" : "gray.300"}
          boxSize={sizeMap[size]}
        />
      ))}
      {showValue && (
        <Text fontSize="xs" color="gray.600">
          {rounded.toFixed(1)}
        </Text>
      )}
      {showCount && typeof count === "number" && (
        <Text fontSize="xs" color="gray.500">
          ({count})
        </Text>
      )}
    </HStack>
  )
}
