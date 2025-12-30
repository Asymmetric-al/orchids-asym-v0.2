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
    container: "h-8 w-[100px]",
    iconWrapper: "pl-2",
    icon: "h-3 w-3",
    input: "text-sm",
    currencyLabel: "text-[8px] pr-2",
    buttonWrapper: "pr-1",
    button: "h-5 px-2 text-[10px]",
    arrow: "ml-0.5 h-2.5 w-2.5",
  },
  sm: {
    container: "h-9 w-[140px]",
    iconWrapper: "pl-2.5",
    icon: "h-3.5 w-3.5",
    input: "text-base",
    currencyLabel: "text-[9px] pr-2.5",
    buttonWrapper: "pr-1",
    button: "h-6 px-2.5 text-xs",
    arrow: "ml-1 h-3 w-3",
  },
  default: {
    container: "h-11 w-[180px]",
    iconWrapper: "pl-3",
    icon: "h-4 w-4",
    input: "text-lg",
    currencyLabel: "text-[10px] pr-3",
    buttonWrapper: "pr-1.5",
    button: "h-7 px-3 text-xs",
    arrow: "ml-1 h-3.5 w-3.5",
  },
  lg: {
    container: "h-14 w-[220px]",
    iconWrapper: "pl-4",
    icon: "h-5 w-5",
    input: "text-xl",
    currencyLabel: "text-xs pr-4",
    buttonWrapper: "pr-2",
    button: "h-9 px-4 text-sm",
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
    <div className={cn("flex justify-center", className)}>
      <motion.div
        layout
        onClick={focusInput}
        className={cn(
          "relative flex items-center overflow-hidden rounded-full border bg-background cursor-text",
          "transition-all duration-200",
          config.container,
          isFocused
            ? "border-foreground/80 shadow-[0_2px_12px_rgba(0,0,0,0.08)] ring-1 ring-foreground/10"
            : "border-border/80 shadow-sm hover:border-muted-foreground/50 hover:shadow"
        )}
      >
        <div className={cn("flex-shrink-0 flex items-center", config.iconWrapper)}>
          <DollarSign
            className={cn(
              "transition-colors duration-150",
              config.icon,
              isFocused || displayValue ? "text-foreground" : "text-muted-foreground/40"
            )}
            strokeWidth={2.5}
          />
        </div>

        <div className="flex-1 flex items-center justify-center min-w-0">
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
              "w-full h-full bg-transparent border-0 outline-none ring-0 focus:ring-0 text-center",
              "font-semibold tracking-tight text-foreground font-sans",
              "placeholder:text-muted-foreground/40 placeholder:font-normal",
              config.input
            )}
          />
        </div>

        <AnimatePresence mode="wait">
          {hasValue ? (
            <motion.div
              key="button"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.35 }}
              className={cn("flex-shrink-0 flex items-center", config.buttonWrapper)}
            >
              <MotionButton
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleGive()
                }}
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
          ) : (
            <motion.span
              key="currency"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className={cn(
                "flex-shrink-0 select-none font-semibold text-muted-foreground/40 uppercase tracking-wide",
                config.currencyLabel
              )}
            >
              {currencyLabel}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
