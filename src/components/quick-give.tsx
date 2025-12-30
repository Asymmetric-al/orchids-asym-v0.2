"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight, DollarSign } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type QuickGiveProps = {
  workerId: string
  className?: string
  currencyLabel?: string
  minAmount?: number
  size?: "xs" | "sm" | "default" | "lg"
}

const MotionButton = motion.create(Button)

function clampCurrencyParts(raw: string) {
  let clean = raw.replace(/[^\d.]/g, "")
  const parts = clean.split(".")
  if (parts.length > 2) clean = `${parts[0]}.${parts.slice(1).join("")}`

  const [iRaw, dRaw] = clean.split(".")
  const i = (iRaw ?? "").slice(0, 6)
  const d = (dRaw ?? "").slice(0, 2)

  return { i, d, hasDot: clean.includes(".") }
}

function formatWithCommas(intPart: string) {
  if (!intPart) return ""
  return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

function parseToNumber(intPart: string, decPart: string) {
  const i = intPart ? Number(intPart) : 0
  const d = decPart ? Number(`0.${decPart}`) : 0
  return Number.isFinite(i + d) ? i + d : 0
}

const sizeConfig = {
  xs: {
    container: "h-8 max-w-[120px]",
    iconWrapper: "pl-2",
    icon: "h-3 w-3",
    input: "pl-0.5 pr-8 text-sm",
    currencyLabel: "right-2 text-[8px]",
    buttonWrapper: 3,
    button: "ml-0.5 h-5 px-2 text-[10px]",
    arrow: "ml-0.5 h-2.5 w-2.5",
  },
  sm: {
    container: "h-9 max-w-[160px]",
    iconWrapper: "pl-2.5",
    icon: "h-3.5 w-3.5",
    input: "pl-1 pr-10 text-base",
    currencyLabel: "right-2.5 text-[9px]",
    buttonWrapper: 4,
    button: "ml-1 h-6 px-2.5 text-xs",
    arrow: "ml-1 h-3 w-3",
  },
  default: {
    container: "h-11 max-w-[200px]",
    iconWrapper: "pl-3",
    icon: "h-4 w-4",
    input: "pl-1 pr-12 text-lg",
    currencyLabel: "right-3 text-[10px]",
    buttonWrapper: 5,
    button: "ml-1 h-7 px-3 text-xs",
    arrow: "ml-1 h-3.5 w-3.5",
  },
  lg: {
    container: "h-14 max-w-xs",
    iconWrapper: "pl-4",
    icon: "h-5 w-5",
    input: "pl-1.5 pr-14 text-xl",
    currencyLabel: "right-4 text-xs",
    buttonWrapper: 6,
    button: "ml-1.5 h-9 px-4 text-sm",
    arrow: "ml-1.5 h-4 w-4",
  },
}

export function QuickGive({
  workerId,
  className,
  currencyLabel = "USD",
  minAmount = 1,
  size = "default",
}: QuickGiveProps) {
  const router = useRouter()
  const inputRef = React.useRef<HTMLInputElement>(null)

  const [isFocused, setIsFocused] = React.useState(false)
  const [intPart, setIntPart] = React.useState("")
  const [decPart, setDecPart] = React.useState("")
  const [hasDot, setHasDot] = React.useState(false)

  const displayValue = React.useMemo(() => {
    const i = formatWithCommas(intPart)
    if (!i && !decPart && !hasDot) return ""
    if (hasDot) return `${i || "0"}.${decPart}`
    return i
  }, [intPart, decPart, hasDot])

  const amount = React.useMemo(() => parseToNumber(intPart, decPart), [intPart, decPart])
  const hasValue = amount >= minAmount

  const config = sizeConfig[size]

  function focusInput() {
    inputRef.current?.focus()
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value

    if (next.trim() === "") {
      setIntPart("")
      setDecPart("")
      setHasDot(false)
      return
    }

    const { i, d, hasDot: dot } = clampCurrencyParts(next)
    setIntPart(i.replace(/^0+(?=\d)/, ""))
    setDecPart(d)
    setHasDot(dot)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleGive()
  }

  function handleGive() {
    if (!hasValue) {
      focusInput()
      return
    }

    const safeAmount = Math.round(amount * 100) / 100
    const qs = new URLSearchParams({
      workerId,
      amount: String(safeAmount),
    })

    router.push(`/checkout?${qs.toString()}`)
  }

  return (
    <div className={cn("w-full", className)}>
      <motion.div
        layout
        onClick={focusInput}
        className={cn(
          "relative flex w-full items-center overflow-hidden rounded-full border bg-background cursor-text",
          "transition-all duration-200",
          config.container,
          isFocused
            ? "border-foreground/80 shadow-[0_2px_12px_rgba(0,0,0,0.08)] ring-1 ring-foreground/10"
            : "border-border/80 shadow-sm hover:border-muted-foreground/50 hover:shadow"
        )}
      >
        <div className={cn(
          "pointer-events-none z-10 flex items-center justify-center",
          config.iconWrapper
        )}>
          <DollarSign
            className={cn(
              "transition-colors duration-150",
              config.icon,
              isFocused || displayValue ? "text-foreground" : "text-muted-foreground/50"
            )}
            strokeWidth={2.5}
          />
        </div>

        <div className="relative flex h-full flex-1 items-center">
          <input
            ref={inputRef}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={displayValue}
            onChange={onChange}
            onKeyDown={onKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="0"
            aria-label="Donation amount"
            className={cn(
              "h-full w-full bg-transparent border-0 outline-none ring-0 focus:ring-0",
              "font-semibold tracking-tight text-foreground font-sans",
              "placeholder:text-muted-foreground/40 placeholder:font-normal",
              config.input
            )}
          />

          <AnimatePresence>
            {!hasValue && !isFocused && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  "pointer-events-none absolute select-none font-semibold text-muted-foreground/50 uppercase tracking-wide",
                  config.currencyLabel
                )}
              >
                {currencyLabel}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence mode="popLayout">
          {hasValue && (
            <motion.div
              initial={{ width: 0, opacity: 0, paddingRight: 0 }}
              animate={{ width: "auto", opacity: 1, paddingRight: config.buttonWrapper }}
              exit={{ width: 0, opacity: 0, paddingRight: 0 }}
              transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
              className="flex h-full items-center justify-end overflow-hidden"
            >
              <MotionButton
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleGive()
                }}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={cn(
                  "rounded-full font-semibold shadow-sm whitespace-nowrap",
                  config.button
                )}
              >
                Give
                <ArrowRight className={config.arrow} />
              </MotionButton>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
