import { IconButton, Tooltip } from '@chakra-ui/react'
import { FiCopy } from 'react-icons/fi'

interface ICopyButtonProps {
  value: string
  label?: string
  onSuccessfulCopy?: () => void
  onFailedCopy?: () => void
}

const CopyButton = ({
  value,
  label = 'Copy',
  onFailedCopy,
  onSuccessfulCopy,
}: ICopyButtonProps) => (
  <Tooltip hasArrow shouldWrapChildren label={label}>
    <IconButton
      aria-label="Copy refresh token"
      icon={<FiCopy />}
      onClick={() => {
        navigator.clipboard
          .writeText(value)
          .then(() => {
            onSuccessfulCopy?.()
          })
          .catch(() => {
            onFailedCopy?.()
          })
      }}
    />
  </Tooltip>
)

export default CopyButton
