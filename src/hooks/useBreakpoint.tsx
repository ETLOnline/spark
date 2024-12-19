import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useDetectBreakpoint(breakpoint: number = MOBILE_BREAKPOINT) {
  const [isbreakpoint, setIsBreakpoint] = React.useState<boolean | undefined>(
    undefined
  )

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const onChange = () => {
      setIsBreakpoint(window.innerWidth < breakpoint)
    }
    mql.addEventListener("change", onChange)
    setIsBreakpoint(window.innerWidth < breakpoint)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isbreakpoint
}
