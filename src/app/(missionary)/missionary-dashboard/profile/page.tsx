'use client'

import * as React from 'react'
import { useState, useRef, useCallback, useMemo } from 'react'
import {
  motion,
  AnimatePresence,
  LayoutGroup,
  useReducedMotion,
  useMotionValue,
  useTransform,
  useSpring,
} from 'framer-motion'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/page-header'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Camera,
  Upload,
  Globe,
  MapPin,
  Phone as PhoneIcon,
  Save,
  Eye,
  Sparkles,
  ImageIcon,
  Smartphone,
  Monitor,
  Loader2,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Link as LinkIcon,
  Check,
  X,
  User,
  Pencil,
  ExternalLink,
  Copy,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const springTransition = {
  type: 'spring' as const,
  stiffness: 350,
  damping: 30,
  mass: 0.8,
}

const gentleSpring = {
  type: 'spring' as const,
  stiffness: 200,
  damping: 25,
  mass: 1,
}

const smoothTransition = {
  duration: 0.3,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
}

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
}

const cardVariants = {
  initial: { opacity: 0, y: 24, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { ...smoothTransition, duration: 0.4 },
  },
}

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: smoothTransition },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
}

interface ProfileData {
  firstName: string
  lastName: string
  email: string
  phone: string
  location: string
  ministryFocus: string
  bio: string
  facebook: string
  instagram: string
  twitter: string
  youtube: string
  website: string
  avatarUrl: string
  coverUrl: string
}

const initialProfile: ProfileData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  location: '',
  ministryFocus: '',
  bio: '',
  facebook: '',
  instagram: '',
  twitter: '',
  youtube: '',
  website: '',
  avatarUrl: '',
  coverUrl: '',
}

function ProfileSkeleton({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
  const skeletonAnimation = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
      }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between pb-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32 animate-pulse" />
          <Skeleton className="h-4 w-64 animate-pulse" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 animate-pulse" />
          <Skeleton className="h-9 w-28 animate-pulse" />
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-10">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={`skeleton-card-${i}`}
              {...skeletonAnimation}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="border-zinc-200 bg-white rounded-[2.5rem] overflow-hidden">
                <CardHeader className="border-b border-zinc-50 bg-zinc-50/30 px-8 py-6">
                  <Skeleton className="h-3 w-32 animate-pulse" />
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-20 animate-pulse" />
                      <Skeleton className="h-12 w-full rounded-xl animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-20 animate-pulse" />
                      <Skeleton className="h-12 w-full rounded-xl animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-24 animate-pulse" />
                    <Skeleton className="h-32 w-full rounded-xl animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="lg:col-span-5">
          <div className="sticky top-24">
            <Skeleton className="h-3 w-24 mb-4 animate-pulse" />
            <Skeleton className="aspect-[9/19] rounded-[3.5rem] animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}

function calculateProfileCompleteness(profile: ProfileData): number {
  const fields = [
    profile.firstName,
    profile.lastName,
    profile.location,
    profile.ministryFocus,
    profile.bio,
    profile.avatarUrl,
    profile.phone,
    profile.instagram || profile.facebook || profile.twitter || profile.website,
  ]
  const filled = fields.filter(Boolean).length
  return Math.round((filled / fields.length) * 100)
}

function AnimatedInput({
  isEditing,
  prefersReducedMotion,
  className,
  ...props
}: React.ComponentProps<'input'> & { isEditing: boolean; prefersReducedMotion: boolean }) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <motion.div
      animate={
        prefersReducedMotion
          ? {}
          : isFocused && isEditing
            ? { scale: 1.01, y: -1 }
            : { scale: 1, y: 0 }
      }
      transition={springTransition}
      className="relative"
    >
      <Input
        {...props}
        disabled={!isEditing}
        onFocus={(e) => {
          setIsFocused(true)
          props.onFocus?.(e)
        }}
        onBlur={(e) => {
          setIsFocused(false)
          props.onBlur?.(e)
        }}
        className={cn(
          'h-12 rounded-xl border-zinc-200 bg-zinc-50/50 transition-all duration-200 font-bold text-sm',
          isEditing && 'border-zinc-300 bg-white shadow-sm',
          isFocused && isEditing && 'border-zinc-400 ring-2 ring-zinc-100',
          className
        )}
      />
      {isFocused && isEditing && !prefersReducedMotion && (
        <motion.div
          layoutId="input-focus-ring"
          className="absolute inset-0 rounded-xl ring-2 ring-zinc-900/5 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        />
      )}
    </motion.div>
  )
}

function AnimatedTextarea({
  isEditing,
  prefersReducedMotion,
  className,
  charCount,
  maxLength,
  ...props
}: React.ComponentProps<'textarea'> & {
  isEditing: boolean
  prefersReducedMotion: boolean
  charCount: number
  maxLength: number
}) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <motion.div
      animate={
        prefersReducedMotion
          ? {}
          : isFocused && isEditing
            ? { scale: 1.005, y: -1 }
            : { scale: 1, y: 0 }
      }
      transition={springTransition}
      className="relative"
    >
      <Textarea
        {...props}
        disabled={!isEditing}
        maxLength={maxLength}
        onFocus={(e) => {
          setIsFocused(true)
          props.onFocus?.(e)
        }}
        onBlur={(e) => {
          setIsFocused(false)
          props.onBlur?.(e)
        }}
        className={cn(
          'min-h-[160px] resize-none rounded-2xl border-zinc-200 bg-zinc-50/50 transition-all duration-200 p-4 text-sm font-medium leading-relaxed',
          isEditing && 'border-zinc-300 bg-white shadow-sm',
          isFocused && isEditing && 'border-zinc-400 ring-2 ring-zinc-100',
          className
        )}
      />
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'absolute bottom-3 right-3 text-[10px] font-bold transition-colors',
              charCount >= maxLength * 0.9 ? 'text-amber-500' : 'text-zinc-300'
            )}
          >
            {charCount}/{maxLength}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function FormField({
  label,
  icon: Icon,
  children,
  className,
  prefersReducedMotion,
}: {
  label: string
  icon?: React.ElementType
  children: React.ReactNode
  className?: string
  prefersReducedMotion?: boolean
}) {
  return (
    <motion.div
      variants={prefersReducedMotion ? {} : fadeInUp}
      className={cn('space-y-2.5', className)}
    >
      <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1 flex items-center gap-2">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </Label>
      {children}
    </motion.div>
  )
}

function SocialIcon({
  platform,
  url,
  prefersReducedMotion,
}: {
  platform: string
  url: string
  prefersReducedMotion: boolean
}) {
  if (!url) return null

  const icons: Record<string, React.ElementType> = {
    instagram: Instagram,
    facebook: Facebook,
    twitter: Twitter,
    youtube: Youtube,
    website: Globe,
  }

  const Icon = icons[platform] || Globe

  return (
    <motion.div
      key={`social-${platform}`}
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
      transition={springTransition}
      whileHover={prefersReducedMotion ? {} : { scale: 1.15, y: -2 }}
      className="cursor-pointer"
    >
      <Icon className="h-4 w-4 text-zinc-400 hover:text-zinc-600 transition-colors" />
    </motion.div>
  )
}

function AvatarUploadArea({
  avatarUrl,
  initials,
  isUploading,
  onUploadClick,
  prefersReducedMotion,
}: {
  avatarUrl: string
  initials: string
  isUploading: boolean
  onUploadClick: () => void
  prefersReducedMotion: boolean
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      whileHover={prefersReducedMotion ? {} : { scale: 1.03 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
      transition={springTransition}
      className="relative group cursor-pointer"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onUploadClick}
    >
      <motion.div
        animate={
          prefersReducedMotion
            ? {}
            : isHovered
              ? { boxShadow: '0 20px 40px -12px rgba(0,0,0,0.25)' }
              : { boxShadow: '0 10px 30px -8px rgba(0,0,0,0.15)' }
        }
        className="rounded-full"
      >
        <Avatar className="h-28 w-28 border-4 border-white">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback className="bg-zinc-900 text-xl font-black text-white uppercase">
            {initials || 'U'}
          </AvatarFallback>
        </Avatar>
      </motion.div>
      <AnimatePresence>
        {isUploading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center"
          >
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        whileHover={prefersReducedMotion ? {} : { scale: 1.15, rotate: 10 }}
        whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
        transition={springTransition}
        onClick={(e) => {
          e.stopPropagation()
          onUploadClick()
        }}
        className="absolute -bottom-1 -right-1 h-9 w-9 rounded-full bg-zinc-900 text-white flex items-center justify-center shadow-lg border-2 border-white"
      >
        <Camera className="h-4 w-4" />
      </motion.button>
    </motion.div>
  )
}

function CoverUploadArea({
  coverUrl,
  isUploading,
  onUploadClick,
  prefersReducedMotion,
}: {
  coverUrl: string
  isUploading: boolean
  onUploadClick: () => void
  prefersReducedMotion: boolean
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      whileHover={prefersReducedMotion ? {} : { scale: 1.005 }}
      transition={gentleSpring}
      onClick={onUploadClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn(
        'aspect-[3/1] rounded-[1.5rem] border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer group relative overflow-hidden',
        coverUrl
          ? 'border-transparent'
          : 'border-zinc-200 bg-zinc-50/50 hover:bg-zinc-100/50 hover:border-zinc-300'
      )}
    >
      {coverUrl ? (
        <>
          <motion.img
            src={coverUrl}
            alt="Cover"
            className="absolute inset-0 w-full h-full object-cover"
            animate={prefersReducedMotion ? {} : isHovered ? { scale: 1.02 } : { scale: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={isHovered ? { backgroundColor: 'rgba(0,0,0,0.4)' } : { backgroundColor: 'rgba(0,0,0,0)' }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              initial={false}
              animate={
                prefersReducedMotion
                  ? { opacity: isHovered ? 1 : 0 }
                  : isHovered
                    ? { opacity: 1, scale: 1, y: 0 }
                    : { opacity: 0, scale: 0.9, y: 8 }
              }
              transition={smoothTransition}
              className="bg-white rounded-xl px-4 py-2 shadow-lg"
            >
              <span className="text-xs font-black uppercase tracking-widest">Change Cover</span>
            </motion.div>
          </motion.div>
        </>
      ) : (
        <>
          <motion.div
            animate={prefersReducedMotion ? {} : isHovered ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }}
            transition={springTransition}
            className="h-14 w-14 rounded-2xl bg-white shadow-sm border border-zinc-100 flex items-center justify-center mb-4"
          >
            {isUploading ? (
              <Loader2 className="h-7 w-7 text-zinc-400 animate-spin" />
            ) : (
              <ImageIcon className="h-7 w-7 text-zinc-300 group-hover:text-zinc-400 transition-colors" />
            )}
          </motion.div>
          <p className="text-sm font-black text-zinc-900">Click to upload cover</p>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
            1200x400px recommended
          </p>
        </>
      )}
    </motion.div>
  )
}

function PreviewToggle({
  value,
  onChange,
  prefersReducedMotion,
}: {
  value: 'mobile' | 'desktop'
  onChange: (v: 'mobile' | 'desktop') => void
  prefersReducedMotion: boolean
}) {
  return (
    <div className="relative bg-zinc-100 border border-zinc-200 p-1 rounded-xl flex">
      <motion.div
        layoutId={prefersReducedMotion ? undefined : 'preview-toggle-bg'}
        className="absolute top-1 bottom-1 bg-white rounded-lg shadow-sm"
        initial={false}
        animate={{
          left: value === 'mobile' ? 4 : '50%',
          width: 'calc(50% - 4px)',
        }}
        transition={springTransition}
      />
      <button
        onClick={() => onChange('mobile')}
        className={cn(
          'relative z-10 px-3 py-1.5 rounded-lg transition-colors',
          value === 'mobile' ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'
        )}
      >
        <Smartphone className="h-4 w-4" />
      </button>
      <button
        onClick={() => onChange('desktop')}
        className={cn(
          'relative z-10 px-3 py-1.5 rounded-lg transition-colors',
          value === 'desktop' ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'
        )}
      >
        <Monitor className="h-4 w-4" />
      </button>
    </div>
  )
}

function ProgressBar({
  value,
  prefersReducedMotion,
}: {
  value: number
  prefersReducedMotion: boolean
}) {
  const springValue = useSpring(value, { stiffness: 100, damping: 20 })
  const width = useTransform(springValue, (v) => `${v}%`)

  return (
    <div className="relative h-2 bg-zinc-100 rounded-full overflow-hidden">
      <motion.div
        className={cn(
          'h-full rounded-full',
          value === 100 ? 'bg-emerald-500' : value >= 70 ? 'bg-amber-500' : 'bg-zinc-900'
        )}
        style={prefersReducedMotion ? { width: `${value}%` } : { width }}
        initial={prefersReducedMotion ? undefined : { width: 0 }}
        animate={prefersReducedMotion ? undefined : { width: `${value}%` }}
        transition={prefersReducedMotion ? undefined : { duration: 0.8, ease: 'easeOut' }}
      />
    </div>
  )
}

type PreviewMode = 'mobile' | 'desktop'

export default function ProfilePage() {
  const prefersReducedMotion = useReducedMotion() ?? false
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isUploadingCover, setIsUploadingCover] = useState(false)
  const [previewMode, setPreviewMode] = useState<PreviewMode>('mobile')
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const [profile, setProfile] = useState<ProfileData>(initialProfile)
  const [originalProfile, setOriginalProfile] = useState<ProfileData>(initialProfile)

  const completeness = useMemo(() => calculateProfileCompleteness(profile), [profile])
  const initials = useMemo(
    () => (profile.firstName?.[0] || '') + (profile.lastName?.[0] || ''),
    [profile.firstName, profile.lastName]
  )

  React.useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/profile')
        const data = await res.json()
        if (data.profile) {
          const p = data.profile
          const m = p.missionary || {}
          const social = m.social_links || {}
          const profileData: ProfileData = {
            firstName: p.first_name || '',
            lastName: p.last_name || '',
            email: p.email || '',
            phone: m.phone || '',
            location: m.location || '',
            ministryFocus: m.tagline || '',
            bio: m.bio || '',
            facebook: social.facebook || '',
            instagram: social.instagram || '',
            twitter: social.twitter || '',
            youtube: social.youtube || '',
            website: social.website || '',
            avatarUrl: p.avatar_url || '',
            coverUrl: m.cover_url || '',
          }
          setProfile(profileData)
          setOriginalProfile(profileData)
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error)
        toast.error('Failed to load profile')
      } finally {
        setIsLoading(false)
      }
    }
    fetchProfile()
  }, [])

  React.useEffect(() => {
    const changed = JSON.stringify(profile) !== JSON.stringify(originalProfile)
    setHasChanges(changed)
  }, [profile, originalProfile])

  const updateProfile = useCallback((field: keyof ProfileData, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage.from('profiles').upload(filePath, file)

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from('profiles').getPublicUrl(filePath)

      const oldAvatarUrl = profile.avatarUrl
      setProfile((prev) => ({ ...prev, avatarUrl: publicUrl }))

      if (oldAvatarUrl) {
        try {
          const oldPath = oldAvatarUrl.split('/public/profiles/')[1]
          if (oldPath) {
            await supabase.storage.from('profiles').remove([oldPath])
          }
        } catch (err) {
          console.warn('Failed to delete old avatar:', err)
        }
      }

      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl: publicUrl }),
      })

      if (!res.ok) throw new Error('Failed to update profile database')

      setOriginalProfile((prev) => ({ ...prev, avatarUrl: publicUrl }))
      toast.success('Avatar updated successfully')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload avatar.'
      console.error('Upload error:', error)
      toast.error(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingCover(true)
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const fileExt = file.name.split('.').pop()
      const fileName = `cover-${user.id}-${Date.now()}.${fileExt}`
      const filePath = `covers/${fileName}`

      const { error: uploadError } = await supabase.storage.from('profiles').upload(filePath, file)

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from('profiles').getPublicUrl(filePath)

      setProfile((prev) => ({ ...prev, coverUrl: publicUrl }))
      toast.success('Cover image uploaded successfully')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload cover image.'
      console.error('Cover upload error:', error)
      toast.error(errorMessage)
    } finally {
      setIsUploadingCover(false)
    }
  }

  const handleSave = async () => {
    if (!isEditing) {
      setIsEditing(true)
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: profile.firstName,
          lastName: profile.lastName,
          bio: profile.bio,
          tagline: profile.ministryFocus,
          location: profile.location,
          phone: profile.phone,
          socialLinks: {
            facebook: profile.facebook,
            instagram: profile.instagram,
            twitter: profile.twitter,
            youtube: profile.youtube,
            website: profile.website,
          },
        }),
      })
      if (res.ok) {
        setIsEditing(false)
        setOriginalProfile(profile)
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 2000)
        toast.success('Profile saved successfully')
      } else {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save profile')
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save profile'
      console.error('Failed to save profile:', error)
      toast.error(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setProfile(originalProfile)
    setIsEditing(false)
    setHasChanges(false)
  }

  const handleCopyLink = async () => {
    const link = `${window.location.origin}/workers/${profile.firstName?.toLowerCase()}-${profile.lastName?.toLowerCase()}`
    await navigator.clipboard.writeText(link)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
    toast.success('Profile link copied!')
  }

  if (isLoading) {
    return <ProfileSkeleton prefersReducedMotion={prefersReducedMotion} />
  }

  const animationProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.4 },
      }

  return (
    <TooltipProvider>
      <motion.div {...animationProps} className="space-y-6 pb-20">
        <motion.div
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: -10 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? undefined : { delay: 0.1 }}
        >
          <PageHeader title="Profile" description="Manage your public presence and ministry details.">
            <motion.div
              className="flex items-center gap-2"
              initial={prefersReducedMotion ? undefined : { opacity: 0, x: 20 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
              transition={prefersReducedMotion ? undefined : { delay: 0.2 }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                    whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyLink}
                      className="h-9 px-3 text-xs font-medium border-zinc-200 hover:bg-zinc-50"
                    >
                      <AnimatePresence mode="wait">
                        {copiedLink ? (
                          <motion.div
                            key="check"
                            initial={prefersReducedMotion ? undefined : { scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={prefersReducedMotion ? undefined : { scale: 0 }}
                            transition={springTransition}
                          >
                            <Check className="h-4 w-4 text-emerald-600" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="copy"
                            initial={prefersReducedMotion ? undefined : { scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={prefersReducedMotion ? undefined : { scale: 0 }}
                            transition={springTransition}
                          >
                            <Copy className="h-4 w-4" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>Copy profile link</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                    whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 px-4 text-xs font-medium border-zinc-200 hover:bg-zinc-50"
                      asChild
                    >
                      <a
                        href={`/workers/${profile.firstName?.toLowerCase()}-${profile.lastName?.toLowerCase()}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Live Site
                        <ExternalLink className="ml-1.5 h-3 w-3 opacity-50" />
                      </a>
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>View your public profile</TooltipContent>
              </Tooltip>

              <AnimatePresence mode="wait">
                {isEditing && hasChanges && (
                  <motion.div
                    initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.8, x: -10 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.8, x: -10 }}
                    whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                    whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                    transition={springTransition}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancel}
                      className="h-9 px-4 text-xs font-medium text-zinc-500 hover:text-zinc-900"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
              >
                <Button
                  onClick={handleSave}
                  disabled={isSaving || (isEditing && !hasChanges)}
                  size="sm"
                  className={cn(
                    'h-9 px-4 text-xs font-medium min-w-[110px] transition-colors',
                    saveSuccess && 'bg-emerald-600 hover:bg-emerald-600'
                  )}
                >
                  <AnimatePresence mode="wait">
                    {isSaving ? (
                      <motion.div
                        key="saving"
                        initial={prefersReducedMotion ? undefined : { opacity: 0, rotate: -90 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={prefersReducedMotion ? undefined : { opacity: 0, rotate: 90 }}
                        className="flex items-center"
                      >
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </motion.div>
                    ) : saveSuccess ? (
                      <motion.div
                        key="success"
                        initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.5 }}
                        transition={springTransition}
                        className="flex items-center"
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Saved!
                      </motion.div>
                    ) : isEditing ? (
                      <motion.div
                        key="save"
                        initial={prefersReducedMotion ? undefined : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={prefersReducedMotion ? undefined : { opacity: 0 }}
                        className="flex items-center"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </motion.div>
                    ) : (
                      <motion.div
                        key="edit"
                        initial={prefersReducedMotion ? undefined : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={prefersReducedMotion ? undefined : { opacity: 0 }}
                        className="flex items-center"
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Profile
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            </motion.div>
          </PageHeader>
        </motion.div>

        <motion.div
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? undefined : { delay: 0.15 }}
          className="flex items-center gap-4"
        >
          <div className="flex-1 max-w-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Profile Completeness
              </span>
              <motion.span
                key={completeness}
                initial={prefersReducedMotion ? undefined : { scale: 1.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={springTransition}
                className={cn(
                  'text-xs font-black',
                  completeness === 100
                    ? 'text-emerald-600'
                    : completeness >= 70
                      ? 'text-amber-600'
                      : 'text-zinc-400'
                )}
              >
                {completeness}%
              </motion.span>
            </div>
            <ProgressBar value={completeness} prefersReducedMotion={prefersReducedMotion} />
          </div>
          <AnimatePresence>
            {completeness < 100 && (
              <motion.div
                initial={prefersReducedMotion ? undefined : { opacity: 0, x: -10, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, x: -10, scale: 0.9 }}
                transition={{ delay: 0.3, ...springTransition }}
              >
                <Badge className="bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-bold uppercase tracking-widest">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Complete your profile
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <LayoutGroup>
          <div className="grid gap-10 lg:grid-cols-12">
            <motion.div
              className="lg:col-span-7 space-y-8"
              variants={prefersReducedMotion ? {} : staggerContainer}
              initial="initial"
              animate="animate"
            >
              <motion.div variants={prefersReducedMotion ? {} : cardVariants}>
                <Card className="border-zinc-200 bg-white shadow-sm overflow-hidden rounded-[2rem]">
                  <CardHeader className="border-b border-zinc-100 bg-zinc-50/50 px-8 py-5">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                      <User className="h-3.5 w-3.5" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <motion.div
                      className="space-y-8"
                      variants={prefersReducedMotion ? {} : staggerContainer}
                      initial="initial"
                      animate="animate"
                    >
                      <div className="grid md:grid-cols-2 gap-8">
                        <FormField label="First Name" prefersReducedMotion={prefersReducedMotion}>
                          <AnimatedInput
                            value={profile.firstName}
                            onChange={(e) => updateProfile('firstName', e.target.value)}
                            isEditing={isEditing}
                            prefersReducedMotion={prefersReducedMotion}
                          />
                        </FormField>
                        <FormField label="Last Name" prefersReducedMotion={prefersReducedMotion}>
                          <AnimatedInput
                            value={profile.lastName}
                            onChange={(e) => updateProfile('lastName', e.target.value)}
                            isEditing={isEditing}
                            prefersReducedMotion={prefersReducedMotion}
                          />
                        </FormField>
                      </div>

                      <div className="grid md:grid-cols-2 gap-8">
                        <FormField label="Location" icon={MapPin} prefersReducedMotion={prefersReducedMotion}>
                          <AnimatedInput
                            value={profile.location}
                            onChange={(e) => updateProfile('location', e.target.value)}
                            isEditing={isEditing}
                            prefersReducedMotion={prefersReducedMotion}
                            placeholder="e.g. Bangkok, Thailand"
                          />
                        </FormField>
                        <FormField label="Phone" icon={PhoneIcon} prefersReducedMotion={prefersReducedMotion}>
                          <AnimatedInput
                            value={profile.phone}
                            onChange={(e) => updateProfile('phone', e.target.value)}
                            isEditing={isEditing}
                            prefersReducedMotion={prefersReducedMotion}
                            placeholder="+1 (555) 000-0000"
                          />
                        </FormField>
                      </div>

                      <FormField label="Tagline / Ministry Focus" prefersReducedMotion={prefersReducedMotion}>
                        <AnimatedInput
                          value={profile.ministryFocus}
                          onChange={(e) => updateProfile('ministryFocus', e.target.value)}
                          isEditing={isEditing}
                          prefersReducedMotion={prefersReducedMotion}
                          placeholder="e.g. Youth Ministry & Education"
                        />
                      </FormField>

                      <FormField label="Bio" prefersReducedMotion={prefersReducedMotion}>
                        <AnimatedTextarea
                          value={profile.bio}
                          onChange={(e) => updateProfile('bio', e.target.value)}
                          isEditing={isEditing}
                          prefersReducedMotion={prefersReducedMotion}
                          placeholder="Tell your story and share your heart for ministry..."
                          charCount={profile.bio.length}
                          maxLength={500}
                        />
                      </FormField>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={prefersReducedMotion ? {} : cardVariants}>
                <Card className="border-zinc-200 bg-white shadow-sm overflow-hidden rounded-[2rem]">
                  <CardHeader className="border-b border-zinc-100 bg-zinc-50/50 px-8 py-5">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                      <Globe className="h-3.5 w-3.5" />
                      Social Presence
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <motion.div
                      className="space-y-6"
                      variants={prefersReducedMotion ? {} : staggerContainer}
                      initial="initial"
                      animate="animate"
                    >
                      <div className="grid md:grid-cols-2 gap-6">
                        <FormField
                          label="Instagram"
                          icon={Instagram}
                          prefersReducedMotion={prefersReducedMotion}
                        >
                          <AnimatedInput
                            value={profile.instagram}
                            onChange={(e) => updateProfile('instagram', e.target.value)}
                            isEditing={isEditing}
                            prefersReducedMotion={prefersReducedMotion}
                            placeholder="@handle"
                            className="h-11"
                          />
                        </FormField>
                        <FormField label="Facebook" icon={Facebook} prefersReducedMotion={prefersReducedMotion}>
                          <AnimatedInput
                            value={profile.facebook}
                            onChange={(e) => updateProfile('facebook', e.target.value)}
                            isEditing={isEditing}
                            prefersReducedMotion={prefersReducedMotion}
                            placeholder="facebook.com/name"
                            className="h-11"
                          />
                        </FormField>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <FormField label="Twitter / X" icon={Twitter} prefersReducedMotion={prefersReducedMotion}>
                          <AnimatedInput
                            value={profile.twitter}
                            onChange={(e) => updateProfile('twitter', e.target.value)}
                            isEditing={isEditing}
                            prefersReducedMotion={prefersReducedMotion}
                            placeholder="@handle"
                            className="h-11"
                          />
                        </FormField>
                        <FormField label="YouTube" icon={Youtube} prefersReducedMotion={prefersReducedMotion}>
                          <AnimatedInput
                            value={profile.youtube}
                            onChange={(e) => updateProfile('youtube', e.target.value)}
                            isEditing={isEditing}
                            prefersReducedMotion={prefersReducedMotion}
                            placeholder="youtube.com/c/name"
                            className="h-11"
                          />
                        </FormField>
                      </div>
                      <FormField
                        label="Personal Website"
                        icon={LinkIcon}
                        prefersReducedMotion={prefersReducedMotion}
                      >
                        <AnimatedInput
                          value={profile.website}
                          onChange={(e) => updateProfile('website', e.target.value)}
                          isEditing={isEditing}
                          prefersReducedMotion={prefersReducedMotion}
                          placeholder="https://yourwebsite.com"
                          className="h-11"
                        />
                      </FormField>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={prefersReducedMotion ? {} : cardVariants}>
                <Card className="border-zinc-200 bg-white shadow-sm overflow-hidden rounded-[2rem]">
                  <CardHeader className="border-b border-zinc-100 bg-zinc-50/50 px-8 py-5">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                      <ImageIcon className="h-3.5 w-3.5" />
                      Media Assets
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-10">
                    <div className="flex flex-col sm:flex-row items-center gap-8">
                      <AvatarUploadArea
                        avatarUrl={profile.avatarUrl}
                        initials={initials}
                        isUploading={isUploading}
                        onUploadClick={() => fileInputRef.current?.click()}
                        prefersReducedMotion={prefersReducedMotion}
                      />
                      <div className="space-y-3 text-center sm:text-left">
                        <p className="text-sm font-black text-zinc-900">Profile Photo</p>
                        <p className="text-xs font-medium text-zinc-500 leading-relaxed max-w-[240px]">
                          High-resolution square format recommended. Minimum 400x400px.
                        </p>
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                        />
                        <motion.div
                          whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                          whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isUploading}
                            onClick={() => fileInputRef.current?.click()}
                            className="h-10 rounded-xl border-zinc-200 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                          >
                            {isUploading ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Upload className="mr-2 h-4 w-4" />
                            )}
                            {isUploading ? 'Uploading...' : 'Upload New'}
                          </Button>
                        </motion.div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">
                        Cover Image
                      </Label>
                      <CoverUploadArea
                        coverUrl={profile.coverUrl}
                        isUploading={isUploadingCover}
                        onUploadClick={() => coverInputRef.current?.click()}
                        prefersReducedMotion={prefersReducedMotion}
                      />
                      <input
                        type="file"
                        ref={coverInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleCoverUpload}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            <motion.div
              className="lg:col-span-5"
              initial={prefersReducedMotion ? undefined : { opacity: 0, x: 20 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
              transition={prefersReducedMotion ? undefined : { delay: 0.3, ...smoothTransition }}
            >
              <div className="sticky top-24">
                <div className="flex items-center justify-between mb-4 px-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                    Live Preview
                  </span>
                  <PreviewToggle
                    value={previewMode}
                    onChange={setPreviewMode}
                    prefersReducedMotion={prefersReducedMotion}
                  />
                </div>

                <AnimatePresence mode="wait">
                  {previewMode === 'mobile' ? (
                    <motion.div
                      key="mobile-preview"
                      initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.95, y: -10 }}
                      transition={smoothTransition}
                      className="border-[12px] border-zinc-900 rounded-[3.5rem] overflow-hidden shadow-2xl bg-white aspect-[9/19] relative ring-1 ring-zinc-200"
                    >
                      <div className="absolute top-0 left-0 right-0 h-40">
                        {profile.coverUrl ? (
                          <img
                            src={profile.coverUrl}
                            alt="Cover"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-zinc-100">
                            <div className="absolute inset-0 flex items-center justify-center opacity-10">
                              <ImageIcon className="h-16 w-16" />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="absolute top-28 left-0 right-0 flex justify-center">
                        <motion.div
                          whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                          transition={springTransition}
                          className="h-28 w-28 rounded-full border-4 border-white bg-white overflow-hidden shadow-2xl relative z-10"
                        >
                          <Avatar className="h-full w-full">
                            <AvatarImage src={profile.avatarUrl} />
                            <AvatarFallback className="bg-zinc-100 font-black uppercase text-xl">
                              {initials || 'U'}
                            </AvatarFallback>
                          </Avatar>
                        </motion.div>
                      </div>

                      <div className="mt-60 px-8 text-center">
                        <motion.h2
                          layout={!prefersReducedMotion}
                          className="text-2xl font-black text-zinc-900 tracking-tighter"
                        >
                          {profile.firstName || 'First'} {profile.lastName || 'Last'}
                        </motion.h2>
                        <motion.div
                          layout={!prefersReducedMotion}
                          className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mt-2"
                        >
                          <MapPin className="h-3.5 w-3.5" />
                          {profile.location || 'Location Not Set'}
                        </motion.div>
                        <motion.p
                          layout={!prefersReducedMotion}
                          className="text-xs font-black text-zinc-600 mt-3"
                        >
                          {profile.ministryFocus || 'Ministry Focus'}
                        </motion.p>

                        <motion.p
                          layout={!prefersReducedMotion}
                          className="text-sm font-medium text-zinc-400 mt-6 leading-relaxed line-clamp-3 px-2"
                        >
                          {profile.bio || 'No bio provided yet.'}
                        </motion.p>

                        <motion.div
                          layout={!prefersReducedMotion}
                          className="flex justify-center gap-4 mt-8"
                        >
                          <AnimatePresence>
                            {profile.instagram && (
                              <SocialIcon
                                key="preview-instagram"
                                platform="instagram"
                                url={profile.instagram}
                                prefersReducedMotion={prefersReducedMotion}
                              />
                            )}
                            {profile.facebook && (
                              <SocialIcon
                                key="preview-facebook"
                                platform="facebook"
                                url={profile.facebook}
                                prefersReducedMotion={prefersReducedMotion}
                              />
                            )}
                            {profile.twitter && (
                              <SocialIcon
                                key="preview-twitter"
                                platform="twitter"
                                url={profile.twitter}
                                prefersReducedMotion={prefersReducedMotion}
                              />
                            )}
                            {profile.youtube && (
                              <SocialIcon
                                key="preview-youtube"
                                platform="youtube"
                                url={profile.youtube}
                                prefersReducedMotion={prefersReducedMotion}
                              />
                            )}
                            {profile.website && (
                              <SocialIcon
                                key="preview-website"
                                platform="website"
                                url={profile.website}
                                prefersReducedMotion={prefersReducedMotion}
                              />
                            )}
                          </AnimatePresence>
                        </motion.div>

                        <motion.div
                          whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                          whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                        >
                          <Button className="w-full mt-10 bg-zinc-900 text-white hover:bg-zinc-800 rounded-2xl h-14 shadow-2xl shadow-zinc-900/20 font-black uppercase tracking-[0.2em] text-[10px]">
                            GIVE SUPPORT
                          </Button>
                        </motion.div>

                        <div className="mt-12 pt-8 border-t border-zinc-100 flex justify-center">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                            Our Stories
                          </p>
                        </div>
                        <div className="mt-6 bg-zinc-50 rounded-3xl h-32 w-full border border-zinc-100" />
                      </div>

                      <div className="absolute top-0 left-0 right-0 h-10 flex justify-center pt-2 pointer-events-none">
                        <div className="bg-zinc-900 h-6 w-32 rounded-full" />
                      </div>
                      <div className="absolute bottom-2 left-0 right-0 flex justify-center pointer-events-none">
                        <div className="bg-zinc-200 h-1 w-36 rounded-full" />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="desktop-preview"
                      initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.95, y: -10 }}
                      transition={smoothTransition}
                      className="border border-zinc-200 rounded-2xl overflow-hidden shadow-xl bg-white"
                    >
                      <div className="h-3 bg-zinc-100 border-b border-zinc-200 flex items-center px-3 gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-zinc-300" />
                        <div className="h-2 w-2 rounded-full bg-zinc-300" />
                        <div className="h-2 w-2 rounded-full bg-zinc-300" />
                      </div>

                      <div className="relative">
                        <div className="h-24">
                          {profile.coverUrl ? (
                            <img
                              src={profile.coverUrl}
                              alt="Cover"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-zinc-100" />
                          )}
                        </div>

                        <div className="px-6 pb-6">
                          <div className="flex items-end gap-4 -mt-8">
                            <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
                              <AvatarImage src={profile.avatarUrl} />
                              <AvatarFallback className="bg-zinc-100 font-black uppercase">
                                {initials || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 pb-1">
                              <h2 className="text-lg font-black text-zinc-900 tracking-tight">
                                {profile.firstName || 'First'} {profile.lastName || 'Last'}
                              </h2>
                              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {profile.location || 'Location Not Set'}
                              </p>
                            </div>
                          </div>

                          <p className="text-xs font-black text-zinc-600 mt-4">
                            {profile.ministryFocus || 'Ministry Focus'}
                          </p>
                          <p className="text-xs font-medium text-zinc-400 mt-2 leading-relaxed line-clamp-2">
                            {profile.bio || 'No bio provided yet.'}
                          </p>

                          <div className="flex items-center justify-between mt-6">
                            <div className="flex gap-3">
                              <AnimatePresence>
                                {profile.instagram && (
                                  <SocialIcon
                                    key="desktop-instagram"
                                    platform="instagram"
                                    url={profile.instagram}
                                    prefersReducedMotion={prefersReducedMotion}
                                  />
                                )}
                                {profile.facebook && (
                                  <SocialIcon
                                    key="desktop-facebook"
                                    platform="facebook"
                                    url={profile.facebook}
                                    prefersReducedMotion={prefersReducedMotion}
                                  />
                                )}
                                {profile.twitter && (
                                  <SocialIcon
                                    key="desktop-twitter"
                                    platform="twitter"
                                    url={profile.twitter}
                                    prefersReducedMotion={prefersReducedMotion}
                                  />
                                )}
                              </AnimatePresence>
                            </div>
                            <Button
                              size="sm"
                              className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest"
                            >
                              Give Support
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div
                  initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10 }}
                  animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                  transition={prefersReducedMotion ? undefined : { delay: 0.5 }}
                  whileHover={prefersReducedMotion ? {} : { scale: 1.01, y: -2 }}
                  className="mt-6 p-4 rounded-2xl bg-zinc-50 border border-zinc-100 cursor-default"
                >
                  <div className="flex items-start gap-3">
                    <motion.div
                      className="h-8 w-8 rounded-lg bg-violet-100 flex items-center justify-center shrink-0"
                      whileHover={prefersReducedMotion ? {} : { rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <Sparkles className="h-4 w-4 text-violet-600" />
                    </motion.div>
                    <div>
                      <p className="text-xs font-black text-zinc-900">Pro Tip</p>
                      <p className="text-[11px] font-medium text-zinc-500 mt-0.5 leading-relaxed">
                        A complete profile with a great photo and compelling bio can increase
                        donations by up to 40%.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </LayoutGroup>
      </motion.div>
    </TooltipProvider>
  )
}
