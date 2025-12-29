'use client'

import * as React from 'react'
import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
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
  AlertCircle,
  RefreshCw,
  User,
  Pencil,
  ExternalLink,
  Copy,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const springTransition = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 30,
}

const smoothTransition = {
  duration: 0.25,
  ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
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

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between pb-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>
      
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-10">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-zinc-200 bg-white rounded-[2.5rem] overflow-hidden">
                <CardHeader className="border-b border-zinc-50 bg-zinc-50/30 px-8 py-6">
                  <Skeleton className="h-3 w-32" />
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-12 w-full rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-12 w-full rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-32 w-full rounded-xl" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        
        <div className="lg:col-span-5">
          <div className="sticky top-24">
            <Skeleton className="h-3 w-24 mb-4" />
            <Skeleton className="aspect-[9/19] rounded-[3.5rem]" />
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

function FormField({
  label,
  icon: Icon,
  children,
  className,
}: {
  label: string
  icon?: React.ElementType
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      variants={fadeInUp}
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

function SocialIcon({ platform, url }: { platform: string; url: string }) {
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
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={springTransition}
    >
      <Icon className="h-4 w-4 text-zinc-400" />
    </motion.div>
  )
}

type PreviewMode = 'mobile' | 'desktop'

export default function ProfilePage() {
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

  const completeness = calculateProfileCompleteness(profile)

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
    setProfile(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const supabase = createClient()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath)

      const oldAvatarUrl = profile.avatarUrl
      setProfile(prev => ({ ...prev, avatarUrl: publicUrl }))
      
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
        body: JSON.stringify({ avatarUrl: publicUrl })
      })
      
      if (!res.ok) throw new Error("Failed to update profile database")
      
      setOriginalProfile(prev => ({ ...prev, avatarUrl: publicUrl }))
      toast.success("Avatar updated successfully")
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || "Failed to upload avatar.")
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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const fileExt = file.name.split('.').pop()
      const fileName = `cover-${user.id}-${Date.now()}.${fileExt}`
      const filePath = `covers/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath)

      setProfile(prev => ({ ...prev, coverUrl: publicUrl }))
      toast.success("Cover image uploaded successfully")
    } catch (error: any) {
      console.error('Cover upload error:', error)
      toast.error(error.message || "Failed to upload cover image.")
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
            website: profile.website
          }
        })
      })
      if (res.ok) {
        setIsEditing(false)
        setOriginalProfile(profile)
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 2000)
        toast.success("Profile saved successfully")
      } else {
        const data = await res.json()
        throw new Error(data.error || "Failed to save profile")
      }
    } catch (error: any) {
      console.error('Failed to save profile:', error)
      toast.error(error.message)
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
    return <ProfileSkeleton />
  }

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="space-y-6 pb-20"
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <PageHeader 
            title="Profile" 
            description="Manage your public presence and ministry details."
          >
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
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
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                          >
                            <Check className="h-4 w-4 text-emerald-600" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="copy"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
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
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 px-4 text-xs font-medium border-zinc-200 hover:bg-zinc-50"
                      asChild
                    >
                      <a href={`/workers/${profile.firstName?.toLowerCase()}-${profile.lastName?.toLowerCase()}`} target="_blank" rel="noopener noreferrer">
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
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
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

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving || (isEditing && !hasChanges)}
                  size="sm"
                  className={cn(
                    "h-9 px-4 text-xs font-medium min-w-[110px] transition-colors",
                    saveSuccess && "bg-emerald-600 hover:bg-emerald-600"
                  )}
                >
                  <AnimatePresence mode="wait">
                    {isSaving ? (
                      <motion.div
                        key="saving"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center"
                      >
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </motion.div>
                    ) : saveSuccess ? (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="flex items-center"
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Saved!
                      </motion.div>
                    ) : isEditing ? (
                      <motion.div
                        key="save"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </motion.div>
                    ) : (
                      <motion.div
                        key="edit"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex items-center gap-4"
        >
          <div className="flex-1 max-w-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Profile Completeness
              </span>
              <motion.span
                key={completeness}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={cn(
                  "text-xs font-black",
                  completeness === 100 ? "text-emerald-600" : completeness >= 70 ? "text-amber-600" : "text-zinc-400"
                )}
              >
                {completeness}%
              </motion.span>
            </div>
            <div className="relative">
              <Progress value={completeness} className="h-2 bg-zinc-100" />
              <motion.div
                className="absolute inset-0 rounded-full overflow-hidden"
                initial={false}
              >
                <motion.div
                  className={cn(
                    "h-full rounded-full",
                    completeness === 100 ? "bg-emerald-500" : completeness >= 70 ? "bg-amber-500" : "bg-zinc-900"
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${completeness}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </motion.div>
            </div>
          </div>
          {completeness < 100 && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Badge className="bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-bold uppercase tracking-widest">
                <Sparkles className="h-3 w-3 mr-1" />
                Complete your profile
              </Badge>
            </motion.div>
          )}
        </motion.div>

        <div className="grid gap-10 lg:grid-cols-12">
          <motion.div
            className="lg:col-span-7 space-y-8"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={fadeInUp}>
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
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                  >
                    <div className="grid md:grid-cols-2 gap-8">
                      <FormField label="First Name">
                        <Input 
                          value={profile.firstName}
                          onChange={(e) => updateProfile('firstName', e.target.value)}
                          disabled={!isEditing}
                          className={cn(
                            "h-12 rounded-xl border-zinc-200 bg-zinc-50/50 focus:bg-white transition-all font-bold text-sm",
                            isEditing && "border-zinc-300 bg-white shadow-sm"
                          )}
                        />
                      </FormField>
                      <FormField label="Last Name">
                        <Input 
                          value={profile.lastName}
                          onChange={(e) => updateProfile('lastName', e.target.value)}
                          disabled={!isEditing}
                          className={cn(
                            "h-12 rounded-xl border-zinc-200 bg-zinc-50/50 focus:bg-white transition-all font-bold text-sm",
                            isEditing && "border-zinc-300 bg-white shadow-sm"
                          )}
                        />
                      </FormField>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      <FormField label="Location" icon={MapPin}>
                        <Input 
                          value={profile.location}
                          onChange={(e) => updateProfile('location', e.target.value)}
                          disabled={!isEditing}
                          className={cn(
                            "h-12 rounded-xl border-zinc-200 bg-zinc-50/50 focus:bg-white transition-all font-bold text-sm",
                            isEditing && "border-zinc-300 bg-white shadow-sm"
                          )}
                          placeholder="e.g. Bangkok, Thailand"
                        />
                      </FormField>
                      <FormField label="Phone" icon={PhoneIcon}>
                        <Input 
                          value={profile.phone}
                          onChange={(e) => updateProfile('phone', e.target.value)}
                          disabled={!isEditing}
                          className={cn(
                            "h-12 rounded-xl border-zinc-200 bg-zinc-50/50 focus:bg-white transition-all font-bold text-sm",
                            isEditing && "border-zinc-300 bg-white shadow-sm"
                          )}
                          placeholder="+1 (555) 000-0000"
                        />
                      </FormField>
                    </div>
                    
                    <FormField label="Tagline / Ministry Focus">
                      <Input 
                        value={profile.ministryFocus}
                        onChange={(e) => updateProfile('ministryFocus', e.target.value)}
                        disabled={!isEditing}
                        className={cn(
                          "h-12 rounded-xl border-zinc-200 bg-zinc-50/50 focus:bg-white transition-all font-bold text-sm",
                          isEditing && "border-zinc-300 bg-white shadow-sm"
                        )}
                        placeholder="e.g. Youth Ministry & Education"
                      />
                    </FormField>

                    <FormField label="Bio">
                      <div className="relative">
                        <Textarea 
                          value={profile.bio}
                          onChange={(e) => updateProfile('bio', e.target.value)}
                          disabled={!isEditing}
                          className={cn(
                            "min-h-[160px] resize-none rounded-2xl border-zinc-200 bg-zinc-50/50 focus:bg-white transition-all p-4 text-sm font-medium leading-relaxed",
                            isEditing && "border-zinc-300 bg-white shadow-sm"
                          )}
                          placeholder="Tell your story and share your heart for ministry..."
                          maxLength={500}
                        />
                        {isEditing && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute bottom-3 right-3 text-[10px] font-bold text-zinc-300"
                          >
                            {profile.bio.length}/500
                          </motion.div>
                        )}
                      </div>
                    </FormField>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
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
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                  >
                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField label="Instagram" icon={Instagram}>
                        <Input 
                          value={profile.instagram}
                          onChange={(e) => updateProfile('instagram', e.target.value)}
                          disabled={!isEditing}
                          className={cn(
                            "h-11 rounded-xl border-zinc-200 bg-zinc-50/50 focus:bg-white transition-all font-bold text-sm",
                            isEditing && "border-zinc-300 bg-white shadow-sm"
                          )}
                          placeholder="@handle"
                        />
                      </FormField>
                      <FormField label="Facebook" icon={Facebook}>
                        <Input 
                          value={profile.facebook}
                          onChange={(e) => updateProfile('facebook', e.target.value)}
                          disabled={!isEditing}
                          className={cn(
                            "h-11 rounded-xl border-zinc-200 bg-zinc-50/50 focus:bg-white transition-all font-bold text-sm",
                            isEditing && "border-zinc-300 bg-white shadow-sm"
                          )}
                          placeholder="facebook.com/name"
                        />
                      </FormField>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField label="Twitter / X" icon={Twitter}>
                        <Input 
                          value={profile.twitter}
                          onChange={(e) => updateProfile('twitter', e.target.value)}
                          disabled={!isEditing}
                          className={cn(
                            "h-11 rounded-xl border-zinc-200 bg-zinc-50/50 focus:bg-white transition-all font-bold text-sm",
                            isEditing && "border-zinc-300 bg-white shadow-sm"
                          )}
                          placeholder="@handle"
                        />
                      </FormField>
                      <FormField label="YouTube" icon={Youtube}>
                        <Input 
                          value={profile.youtube}
                          onChange={(e) => updateProfile('youtube', e.target.value)}
                          disabled={!isEditing}
                          className={cn(
                            "h-11 rounded-xl border-zinc-200 bg-zinc-50/50 focus:bg-white transition-all font-bold text-sm",
                            isEditing && "border-zinc-300 bg-white shadow-sm"
                          )}
                          placeholder="youtube.com/c/name"
                        />
                      </FormField>
                    </div>
                    <FormField label="Personal Website" icon={LinkIcon}>
                      <Input 
                        value={profile.website}
                        onChange={(e) => updateProfile('website', e.target.value)}
                        disabled={!isEditing}
                        className={cn(
                          "h-11 rounded-xl border-zinc-200 bg-zinc-50/50 focus:bg-white transition-all font-bold text-sm",
                          isEditing && "border-zinc-300 bg-white shadow-sm"
                        )}
                        placeholder="https://yourwebsite.com"
                      />
                    </FormField>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="border-zinc-200 bg-white shadow-sm overflow-hidden rounded-[2rem]">
                <CardHeader className="border-b border-zinc-100 bg-zinc-50/50 px-8 py-5">
                  <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                    <ImageIcon className="h-3.5 w-3.5" />
                    Media Assets
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-10">
                  <div className="flex flex-col sm:flex-row items-center gap-8">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      transition={springTransition}
                      className="relative group"
                    >
                      <Avatar className="h-28 w-28 border-4 border-white shadow-2xl">
                        <AvatarImage src={profile.avatarUrl} />
                        <AvatarFallback className="bg-zinc-900 text-xl font-black text-white uppercase">
                          {(profile.firstName?.[0] || '') + (profile.lastName?.[0] || '') || 'U'}
                        </AvatarFallback>
                      </Avatar>
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
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute -bottom-1 -right-1 h-9 w-9 rounded-full bg-zinc-900 text-white flex items-center justify-center shadow-lg border-2 border-white"
                      >
                        <Camera className="h-4 w-4" />
                      </motion.button>
                    </motion.div>
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
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
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
                    <motion.div
                      whileHover={{ scale: 1.005 }}
                      transition={springTransition}
                      onClick={() => coverInputRef.current?.click()}
                      className={cn(
                        "aspect-[3/1] rounded-[1.5rem] border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer group relative overflow-hidden",
                        profile.coverUrl
                          ? "border-transparent"
                          : "border-zinc-200 bg-zinc-50/50 hover:bg-zinc-100/50 hover:border-zinc-300"
                      )}
                    >
                      {profile.coverUrl ? (
                        <>
                          <img
                            src={profile.coverUrl}
                            alt="Cover"
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              whileHover={{ opacity: 1, scale: 1 }}
                              className="bg-white rounded-xl px-4 py-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <span className="text-xs font-black uppercase tracking-widest">Change Cover</span>
                            </motion.div>
                          </div>
                        </>
                      ) : (
                        <>
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className="h-14 w-14 rounded-2xl bg-white shadow-sm border border-zinc-100 flex items-center justify-center mb-4"
                          >
                            {isUploadingCover ? (
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
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, ...smoothTransition }}
          >
            <div className="sticky top-24">
              <div className="flex items-center justify-between mb-4 px-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  Live Preview
                </span>
                <div className="flex gap-1.5">
                  <Tabs value={previewMode} onValueChange={(v) => setPreviewMode(v as PreviewMode)}>
                    <TabsList className="bg-zinc-100 border border-zinc-200 p-1 h-auto rounded-xl">
                      <TabsTrigger
                        value="mobile"
                        className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-3 py-1.5"
                      >
                        <Smartphone className="h-4 w-4" />
                      </TabsTrigger>
                      <TabsTrigger
                        value="desktop"
                        className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-3 py-1.5"
                      >
                        <Monitor className="h-4 w-4" />
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
              
              <AnimatePresence mode="wait">
                {previewMode === 'mobile' ? (
                  <motion.div
                    key="mobile"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={smoothTransition}
                    className="border-[12px] border-zinc-900 rounded-[3.5rem] overflow-hidden shadow-2xl bg-white aspect-[9/19] relative ring-1 ring-zinc-200"
                  >
                    <div className="absolute top-0 left-0 right-0 h-40">
                      {profile.coverUrl ? (
                        <img src={profile.coverUrl} alt="Cover" className="w-full h-full object-cover" />
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
                        whileHover={{ scale: 1.05 }}
                        transition={springTransition}
                        className="h-28 w-28 rounded-full border-4 border-white bg-white overflow-hidden shadow-2xl relative z-10"
                      >
                        <Avatar className="h-full w-full">
                          <AvatarImage src={profile.avatarUrl} />
                          <AvatarFallback className="bg-zinc-100 font-black uppercase text-xl">
                            {(profile.firstName?.[0] || '') + (profile.lastName?.[0] || '') || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      </motion.div>
                    </div>
                    
                    <div className="mt-60 px-8 text-center">
                      <motion.h2
                        layout
                        className="text-2xl font-black text-zinc-900 tracking-tighter"
                      >
                        {profile.firstName || 'First'} {profile.lastName || 'Last'}
                      </motion.h2>
                      <motion.div
                        layout
                        className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mt-2"
                      >
                        <MapPin className="h-3.5 w-3.5" />
                        {profile.location || 'Location Not Set'}
                      </motion.div>
                      <motion.p layout className="text-xs font-black text-zinc-600 mt-3">
                        {profile.ministryFocus || 'Ministry Focus'}
                      </motion.p>
                      
                      <motion.p
                        layout
                        className="text-sm font-medium text-zinc-400 mt-6 leading-relaxed line-clamp-3 px-2"
                      >
                        {profile.bio || 'No bio provided yet.'}
                      </motion.p>

                      <motion.div layout className="flex justify-center gap-4 mt-8">
                        <AnimatePresence>
                          <SocialIcon platform="instagram" url={profile.instagram} />
                          <SocialIcon platform="facebook" url={profile.facebook} />
                          <SocialIcon platform="twitter" url={profile.twitter} />
                          <SocialIcon platform="youtube" url={profile.youtube} />
                          <SocialIcon platform="website" url={profile.website} />
                        </AnimatePresence>
                      </motion.div>

                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
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
                    key="desktop"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
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
                          <img src={profile.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-zinc-100" />
                        )}
                      </div>
                      
                      <div className="px-6 pb-6">
                        <div className="flex items-end gap-4 -mt-8">
                          <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
                            <AvatarImage src={profile.avatarUrl} />
                            <AvatarFallback className="bg-zinc-100 font-black uppercase">
                              {(profile.firstName?.[0] || '') + (profile.lastName?.[0] || '') || 'U'}
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
                              <SocialIcon platform="instagram" url={profile.instagram} />
                              <SocialIcon platform="facebook" url={profile.facebook} />
                              <SocialIcon platform="twitter" url={profile.twitter} />
                            </AnimatePresence>
                          </div>
                          <Button size="sm" className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest">
                            Give Support
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6 p-4 rounded-2xl bg-zinc-50 border border-zinc-100"
              >
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                    <Sparkles className="h-4 w-4 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-zinc-900">Pro Tip</p>
                    <p className="text-[11px] font-medium text-zinc-500 mt-0.5 leading-relaxed">
                      A complete profile with a great photo and compelling bio can increase donations by up to 40%.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </TooltipProvider>
  )
}
