import { useCallback, useState } from 'react'
import { Button, type ButtonProps } from 'tamagui'

type BaseProps = Omit<ButtonProps, 'children' | 'onPress'> & {
  label: string
  active: boolean
  onChange?: (active: boolean) => void
}

export function Chip({ label, active, onChange, ...buttonProps }: BaseProps) {
  const [activeInternal, setActiveInternal] = useState(active)
  const toggle = useCallback(() => {
    const next = !activeInternal
    console.log('next', next)

    onChange?.(next)
    setActiveInternal(next)
  }, [activeInternal, onChange])

  return (
    <Button
      size="$2"
      chromeless
      bordered
      bw={1}
      br="$10"
      unstyled={false}
      px="$3"
      py="$1.5"
      ml="$2"
      mt="$2"
      bg={activeInternal ? '$buttonDangerBackground' : '$background'}
      onPress={toggle}
      aria-pressed={active}
      {...buttonProps}
    >
      {label}
    </Button>
  )
}
