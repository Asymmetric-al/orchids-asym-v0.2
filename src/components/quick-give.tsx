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
  size?: "default" | "compact"
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

  const isCompact = size === "compact"

  return (
    <div className={cn("w-full", isCompact ? "max-w-[200px]" : "max-w-sm", className)}>
      <motion.div
        layout
        onClick={focusInput}
        className={cn(
          "relative flex w-full items-center overflow-hidden rounded-full border-2 bg-background cursor-text",
          "transition-colors duration-200",
          isCompact ? "h-10" : "h-14 sm:h-16",
          isFocused
            ? "border-foreground shadow-[0_4px_24px_rgba(0,0,0,0.10)]"
            : "border-border shadow-sm hover:border-muted-foreground/40"
        )}
      >
        <div className={cn(
          "pointer-events-none z-10 flex items-center justify-center",
          isCompact ? "pl-3" : "pl-4 sm:pl-6"
        )}>
          <DollarSign
            className={cn(
              "transition-colors",
              isCompact ? "h-4 w-4" : "h-5 w-5 sm:h-6 sm:w-6",
              isFocused || displayValue ? "text-foreground" : "text-muted-foreground/40"
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
            placeholder="0.00"
            aria-label="Donation amount"
            className={cn(
              "h-full w-full bg-transparent border-0 outline-none ring-0 focus:ring-0",
              "font-bold tracking-tight text-foreground",
              "placeholder:text-muted-foreground/35",
              isCompact ? "pl-1 pr-12 text-lg" : "pl-2 pr-14 sm:pr-16 text-xl sm:text-2xl"
            )}
          />

          <AnimatePresence>
            {!hasValue && !isFocused && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={cn(
                  "pointer-events-none absolute select-none font-bold text-muted-foreground/40",
                  isCompact ? "right-3 text-[10px]" : "right-4 sm:right-6 text-xs sm:text-sm"
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
              animate={{ width: "auto", opacity: 1, paddingRight: isCompact ? 4 : 6 }}
              exit={{ width: 0, opacity: 0, paddingRight: 0 }}
              transition={{ type: "spring", bounce: 0, duration: 0.35 }}
              className="flex h-full items-center justify-end overflow-hidden"
            >
              <MotionButton
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleGive()
                }}
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 420, damping: 28 }}
                className={cn(
                  "rounded-full font-bold shadow-md whitespace-nowrap",
                  isCompact
                    ? "ml-1 h-7 px-3 text-xs"
                    : "ml-2 h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-base"
                )}
              >
                Give
                <ArrowRight className={cn(isCompact ? "ml-1 h-3 w-3" : "ml-1.5 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5")} />
              </MotionButton>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {hasValue && !isCompact && (
          <motion.p
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 8 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="text-center text-xs font-semibold text-emerald-600"
          >
            Your gift changes lives
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
