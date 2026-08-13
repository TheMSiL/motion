import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Download, Link2 } from 'lucide-react'
import type { Route } from '@/types'
import { distanceUnit, formatDistance, formatDurationShort, formatPace } from '@/lib/format'
import { downloadBlob, renderShareCard } from '@/lib/share-image'
import { useUnits } from '@/store/settings-store'
import { useToast } from '@/store/toast-store'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Button } from '@/components/ui/Button'
import { RouteMap } from '@/components/maps/RouteMap'

export interface ShareSheetProps {
  open: boolean
  onClose: () => void
  title: string
  distance: number
  duration: number
  route: Route
}

/** The social card: previewed in the sheet, exported as a real PNG. */
export function ShareSheet({ open, onClose, title, distance, duration, route }: ShareSheetProps) {
  const units = useUnits()
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const distanceLabel = `${formatDistance(distance, units)} ${distanceUnit(units)}`
  const durationLabel = formatDurationShort(duration)

  async function copyLink() {
    const link = `${window.location.origin}${window.location.pathname}`
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
      toast('Link copied', { description: 'Share it anywhere you like' })
    } catch {
      toast('Could not copy the link', { variant: 'error' })
    }
  }

  async function download() {
    setDownloading(true)
    try {
      const blob = await renderShareCard({
        title,
        distanceLabel,
        durationLabel,
        paceLabel: formatPace(duration, distance, units),
        dateLabel: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        route,
      })
      downloadBlob(blob, `motion-${title.toLowerCase().replace(/\s+/g, '-')}.png`)
      toast('Image saved', { description: 'Check your downloads folder' })
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Export failed', { variant: 'error' })
    } finally {
      setDownloading(false)
    }
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Share this activity"
      description="A card built from your session, ready to post."
      footer={
        <div className="flex gap-3">
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            icon={copied ? <Check className="size-[18px]" /> : <Link2 className="size-[18px]" />}
            onClick={copyLink}
          >
            {copied ? 'Copied' : 'Copy link'}
          </Button>
          <Button
            size="lg"
            fullWidth
            loading={downloading}
            icon={<Download className="size-[18px]" />}
            onClick={download}
          >
            Download
          </Button>
        </div>
      }
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden rounded-[24px] bg-[#0d0e10] p-5 text-white"
      >
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-bold tracking-[0.22em]">MOTION</span>
          <span className="text-[11px] text-white/50">
            {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </span>
        </div>

        <RouteMap
          route={route}
          className="map-night mt-4 h-40 w-full rounded-2xl"
          tone="accent"
          showMarkers
          compact
          label="Route preview for the share card"
        />

        <p className="mt-5 text-[40px] font-semibold uppercase leading-none tracking-[-0.03em] tabular">
          {distanceLabel}
        </p>
        <p className="mt-1.5 text-[24px] font-semibold uppercase leading-none tracking-[-0.02em] text-accent tabular">
          {durationLabel}
        </p>
        <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
          {title}
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[10.5px] uppercase tracking-[0.12em] text-white/40">
          <span>{formatPace(duration, distance, units)}</span>
          <span>Move more. Live better.</span>
        </div>
      </motion.div>
    </BottomSheet>
  )
}
