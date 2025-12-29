'use client'

import * as React from 'react'
import { useState, useRef, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/page-header'
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
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

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

interface ValidationErrors {
  firstName?: string
  lastName?: string
  phone?: string
  website?: string
  facebook?: string
  instagram?: string
  twitter?: string
  youtube?: string
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

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={`skeleton-card-${i}`} className="rounded-2xl">
              <CardHeader className="border-b border-zinc-100 px-6 py-4">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-5">
          <div className="sticky top-24 space-y-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="aspect-[9/16] rounded-3xl" />
          </div>
        </div>
      </div>
    </div>
  )
}

function FormField({
  label,
  icon: Icon,
  children,
  error,
  className,
}: {
  label: string
  icon?: React.ElementType
  children: React.ReactNode
  error?: string
  className?: string
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label className="text-xs font-medium text-zinc-500 flex items-center gap-1.5">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </Label>
      {children}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  )
}

function SocialIcon({
  platform,
  url,
}: {
  platform: string
  url: string
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
    <div className="cursor-pointer">
      <Icon className="h-4 w-4 text-zinc-400 hover:text-zinc-600 transition-colors" />
    </div>
  )
}

function AvatarUploadArea({
  avatarUrl,
  initials,
  isUploading,
  onUploadClick,
  isEditing,
}: {
  avatarUrl: string
  initials: string
  isUploading: boolean
  onUploadClick: () => void
  isEditing: boolean
}) {
  return (
    <div
      className={cn(
        "relative group",
        isEditing && "cursor-pointer"
      )}
      onClick={isEditing ? onUploadClick : undefined}
    >
      <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border-4 border-white shadow-lg">
        <AvatarImage src={avatarUrl} />
        <AvatarFallback className="bg-zinc-900 text-lg sm:text-xl font-bold text-white uppercase">
          {initials || 'U'}
        </AvatarFallback>
      </Avatar>
      {isUploading && (
        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
          <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 text-white animate-spin" />
        </div>
      )}
      {isEditing && !isUploading && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onUploadClick()
          }}
          className="absolute -bottom-1 -right-1 h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-zinc-900 text-white flex items-center justify-center shadow-lg border-2 border-white hover:bg-zinc-800 transition-colors"
        >
          <Camera className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </button>
      )}
    </div>
  )
}

function CoverUploadArea({
  coverUrl,
  isUploading,
  onUploadClick,
  isEditing,
}: {
  coverUrl: string
  isUploading: boolean
  onUploadClick: () => void
  isEditing: boolean
}) {
  return (
    <div
      onClick={isEditing ? onUploadClick : undefined}
      className={cn(
        'aspect-[3/1] rounded-xl sm:rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all relative overflow-hidden',
        isEditing && 'cursor-pointer',
        coverUrl
          ? 'border-transparent'
          : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100 hover:border-zinc-300'
      )}
    >
      {coverUrl ? (
        <>
          <img
            src={coverUrl}
            alt="Cover"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {isEditing && (
            <div className="absolute inset-0 bg-black/0 hover:bg-black/40 flex items-center justify-center transition-colors group">
              <div className="bg-white rounded-lg px-3 py-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs font-medium">Change Cover</span>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-white shadow-sm border border-zinc-100 flex items-center justify-center mb-2 sm:mb-3">
            {isUploading ? (
              <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 text-zinc-400 animate-spin" />
            ) : (
              <ImageIcon className="h-5 w-5 sm:h-6 sm:w-6 text-zinc-300" />
            )}
          </div>
          <p className="text-xs sm:text-sm font-medium text-zinc-700">
            {isEditing ? 'Click to upload cover photo' : 'No cover photo'}
          </p>
          <p className="text-[10px] sm:text-xs text-zinc-400 mt-0.5">
            1200x400px recommended
          </p>
        </>
      )}
    </div>
  )
}

function PreviewToggle({
  value,
  onChange,
}: {
  value: 'mobile' | 'desktop'
  onChange: (v: 'mobile' | 'desktop') => void
}) {
  return (
    <div className="relative bg-zinc-100 border border-zinc-200 p-1 rounded-lg flex">
      <div
        className={cn(
          "absolute top-1 bottom-1 bg-white rounded-md shadow-sm transition-all duration-200",
          value === 'mobile' ? 'left-1 w-[calc(50%-2px)]' : 'left-[50%] w-[calc(50%-2px)]'
        )}
      />
      <button
        onClick={() => onChange('mobile')}
        className={cn(
          'relative z-10 px-2.5 py-1 rounded-md transition-colors',
          value === 'mobile' ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'
        )}
      >
        <Smartphone className="h-4 w-4" />
      </button>
      <button
        onClick={() => onChange('desktop')}
        className={cn(
          'relative z-10 px-2.5 py-1 rounded-md transition-colors',
          value === 'desktop' ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'
        )}
      >
        <Monitor className="h-4 w-4" />
      </button>
    </div>
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
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})

  const fileInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const [profile, setProfile] = useState<ProfileData>(initialProfile)
  const [originalProfile, setOriginalProfile] = useState<ProfileData>(initialProfile)

  const initials = (profile.firstName?.[0] || '') + (profile.lastName?.[0] || '')

  useEffect(() => {
    async function fetchProfile() {
      try {
        setFetchError(null)
        const res = await fetch('/api/profile')
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Failed to load profile')
        }
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
        const message = error instanceof Error ? error.message : 'Failed to load profile'
        setFetchError(message)
        toast.error(message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProfile()
  }, [])

  useEffect(() => {
    const changed = JSON.stringify(profile) !== JSON.stringify(originalProfile)
    setHasChanges(changed)
  }, [profile, originalProfile])

  const validateProfile = useCallback((): boolean => {
    const errors: ValidationErrors = {}
    
    if (profile.firstName && profile.firstName.length > 50) {
      errors.firstName = 'First name is too long (max 50 characters)'
    }
    
    if (profile.lastName && profile.lastName.length > 50) {
      errors.lastName = 'Last name is too long (max 50 characters)'
    }
    
    if (profile.phone && !/^[+\d\s()-]*$/.test(profile.phone)) {
      errors.phone = 'Please enter a valid phone number'
    }
    
    if (profile.website && profile.website.length > 0) {
      try {
        if (!profile.website.startsWith('http://') && !profile.website.startsWith('https://')) {
          errors.website = 'Website should start with http:// or https://'
        }
      } catch {
        errors.website = 'Please enter a valid URL'
      }
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }, [profile])

  const updateProfile = useCallback((field: keyof ProfileData, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
    if (validationErrors[field as keyof ValidationErrors]) {
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }, [validationErrors])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB')
      return
    }

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

      if (!res.ok) throw new Error('Failed to update profile')

      setOriginalProfile((prev) => ({ ...prev, avatarUrl: publicUrl }))
      toast.success('Profile picture updated')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image'
      console.error('Upload error:', error)
      toast.error(errorMessage)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be smaller than 10MB')
      return
    }

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
      toast.success('Cover photo uploaded')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload cover image'
      console.error('Cover upload error:', error)
      toast.error(errorMessage)
    } finally {
      setIsUploadingCover(false)
      if (coverInputRef.current) {
        coverInputRef.current.value = ''
      }
    }
  }

  const handleSave = async () => {
    if (!isEditing) {
      setIsEditing(true)
      return
    }

    if (!validateProfile()) {
      toast.error('Please fix the errors before saving')
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
          coverUrl: profile.coverUrl,
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
        toast.success('Profile saved')
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
    setValidationErrors({})
  }

  const handleCopyLink = async () => {
    const link = `${window.location.origin}/workers/${profile.firstName?.toLowerCase()}-${profile.lastName?.toLowerCase()}`
    await navigator.clipboard.writeText(link)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
    toast.success('Link copied!')
  }

  if (isLoading) {
    return <ProfileSkeleton />
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center">
          <AlertCircle className="h-6 w-6 text-red-500" />
        </div>
        <p className="text-zinc-600">{fetchError}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-6 pb-20">
        <PageHeader title="Profile" description="Update your information and how you appear to supporters.">
          <div className="flex items-center gap-2 flex-wrap">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                  className="h-9 px-3 text-xs font-medium"
                >
                  {copiedLink ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy profile link</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-3 text-xs font-medium"
                  asChild
                >
                  <a
                    href={`/workers/${profile.firstName?.toLowerCase()}-${profile.lastName?.toLowerCase()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Eye className="mr-1.5 h-4 w-4" />
                    <span className="hidden sm:inline">View Public Page</span>
                    <span className="sm:hidden">View</span>
                    <ExternalLink className="ml-1 h-3 w-3 opacity-50" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>View your public profile</TooltipContent>
            </Tooltip>

            {isEditing && hasChanges && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="h-9 px-3 text-xs font-medium text-zinc-500 hover:text-zinc-900"
              >
                <X className="mr-1.5 h-4 w-4" />
                Cancel
              </Button>
            )}

            <Button
              onClick={handleSave}
              disabled={isSaving || (isEditing && !hasChanges)}
              size="sm"
              className={cn(
                'h-9 px-4 text-xs font-medium min-w-[100px]',
                saveSuccess && 'bg-emerald-600 hover:bg-emerald-600'
              )}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : saveSuccess ? (
                <>
                  <CheckCircle2 className="mr-1.5 h-4 w-4" />
                  Saved!
                </>
              ) : isEditing ? (
                <>
                  <Save className="mr-1.5 h-4 w-4" />
                  Save
                </>
              ) : (
                <>
                  <Pencil className="mr-1.5 h-4 w-4" />
                  Edit
                </>
              )}
            </Button>
          </div>
        </PageHeader>

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7 space-y-6">
            <Card className="rounded-2xl border-zinc-200 shadow-sm">
              <CardHeader className="border-b border-zinc-100 px-4 sm:px-6 py-4">
                <CardTitle className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Personal Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField label="First Name" error={validationErrors.firstName}>
                      <Input
                        value={profile.firstName}
                        onChange={(e) => updateProfile('firstName', e.target.value)}
                        disabled={!isEditing}
                        className="h-10"
                        placeholder="Your first name"
                      />
                    </FormField>
                    <FormField label="Last Name" error={validationErrors.lastName}>
                      <Input
                        value={profile.lastName}
                        onChange={(e) => updateProfile('lastName', e.target.value)}
                        disabled={!isEditing}
                        className="h-10"
                        placeholder="Your last name"
                      />
                    </FormField>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField label="Location" icon={MapPin}>
                      <Input
                        value={profile.location}
                        onChange={(e) => updateProfile('location', e.target.value)}
                        disabled={!isEditing}
                        placeholder="City, Country"
                        className="h-10"
                      />
                    </FormField>
                    <FormField label="Phone" icon={PhoneIcon} error={validationErrors.phone}>
                      <Input
                        value={profile.phone}
                        onChange={(e) => updateProfile('phone', e.target.value)}
                        disabled={!isEditing}
                        placeholder="+1 (555) 000-0000"
                        className="h-10"
                      />
                    </FormField>
                  </div>

                  <FormField label="Tagline">
                    <Input
                      value={profile.ministryFocus}
                      onChange={(e) => updateProfile('ministryFocus', e.target.value)}
                      disabled={!isEditing}
                      placeholder="A short description of your work"
                      className="h-10"
                    />
                  </FormField>

                  <FormField label="About You">
                    <div className="relative">
                      <Textarea
                        value={profile.bio}
                        onChange={(e) => updateProfile('bio', e.target.value)}
                        disabled={!isEditing}
                        placeholder="Share a bit about yourself and your ministry..."
                        className="min-h-[120px] resize-none"
                        maxLength={500}
                      />
                      {isEditing && (
                        <span className={cn(
                          "absolute bottom-2 right-2 text-[10px] font-medium",
                          profile.bio.length >= 450 ? 'text-amber-500' : 'text-zinc-300'
                        )}>
                          {profile.bio.length}/500
                        </span>
                      )}
                    </div>
                  </FormField>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-zinc-200 shadow-sm">
              <CardHeader className="border-b border-zinc-100 px-4 sm:px-6 py-4">
                <CardTitle className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Profile Photos
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-6">
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                  <AvatarUploadArea
                    avatarUrl={profile.avatarUrl}
                    initials={initials}
                    isUploading={isUploading}
                    onUploadClick={() => fileInputRef.current?.click()}
                    isEditing={isEditing}
                  />
                  <div className="space-y-2 text-center sm:text-left">
                    <p className="text-sm font-medium text-zinc-900">Profile Picture</p>
                    <p className="text-xs text-zinc-500 max-w-[200px]">
                      Square image, at least 400x400px. JPG or PNG.
                    </p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                    />
                    {isEditing && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isUploading}
                        onClick={() => fileInputRef.current?.click()}
                        className="h-8 text-xs"
                      >
                        {isUploading ? (
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Upload className="mr-1.5 h-3.5 w-3.5" />
                        )}
                        {isUploading ? 'Uploading...' : 'Upload'}
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium text-zinc-500">
                    Cover Photo
                  </Label>
                  <CoverUploadArea
                    coverUrl={profile.coverUrl}
                    isUploading={isUploadingCover}
                    onUploadClick={() => coverInputRef.current?.click()}
                    isEditing={isEditing}
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

            <Card className="rounded-2xl border-zinc-200 shadow-sm">
              <CardHeader className="border-b border-zinc-100 px-4 sm:px-6 py-4">
                <CardTitle className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Social Links
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField label="Instagram" icon={Instagram}>
                      <Input
                        value={profile.instagram}
                        onChange={(e) => updateProfile('instagram', e.target.value)}
                        disabled={!isEditing}
                        placeholder="@yourhandle"
                        className="h-10"
                      />
                    </FormField>
                    <FormField label="Facebook" icon={Facebook}>
                      <Input
                        value={profile.facebook}
                        onChange={(e) => updateProfile('facebook', e.target.value)}
                        disabled={!isEditing}
                        placeholder="facebook.com/yourpage"
                        className="h-10"
                      />
                    </FormField>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField label="Twitter / X" icon={Twitter}>
                      <Input
                        value={profile.twitter}
                        onChange={(e) => updateProfile('twitter', e.target.value)}
                        disabled={!isEditing}
                        placeholder="@yourhandle"
                        className="h-10"
                      />
                    </FormField>
                    <FormField label="YouTube" icon={Youtube}>
                      <Input
                        value={profile.youtube}
                        onChange={(e) => updateProfile('youtube', e.target.value)}
                        disabled={!isEditing}
                        placeholder="youtube.com/@channel"
                        className="h-10"
                      />
                    </FormField>
                  </div>
                  <FormField label="Website" icon={LinkIcon} error={validationErrors.website}>
                    <Input
                      value={profile.website}
                      onChange={(e) => updateProfile('website', e.target.value)}
                      disabled={!isEditing}
                      placeholder="https://yourwebsite.com"
                      className="h-10"
                    />
                  </FormField>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-5">
            <div className="sticky top-24">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-medium text-zinc-500">
                  Preview
                </span>
                <PreviewToggle
                  value={previewMode}
                  onChange={setPreviewMode}
                />
              </div>

              {previewMode === 'mobile' ? (
                <div className="border-[10px] sm:border-[12px] border-zinc-900 rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden shadow-2xl bg-white aspect-[9/16] relative">
                  <div className="absolute top-0 left-0 right-0 h-32 sm:h-36">
                    {profile.coverUrl ? (
                      <img
                        src={profile.coverUrl}
                        alt="Cover"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-100 flex items-center justify-center">
                        <ImageIcon className="h-10 w-10 sm:h-12 sm:w-12 text-zinc-200" />
                      </div>
                    )}
                  </div>

                  <div className="absolute top-20 sm:top-24 left-0 right-0 flex justify-center">
                    <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full border-4 border-white bg-white overflow-hidden shadow-lg">
                      <Avatar className="h-full w-full">
                        <AvatarImage src={profile.avatarUrl} />
                        <AvatarFallback className="bg-zinc-100 font-bold text-base sm:text-lg">
                          {initials || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>

                  <div className="mt-44 sm:mt-52 px-4 sm:px-6 text-center">
                    <h2 className="text-lg sm:text-xl font-bold text-zinc-900">
                      {profile.firstName || 'First'} {profile.lastName || 'Last'}
                    </h2>
                    <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-500 mt-1">
                      <MapPin className="h-3 w-3" />
                      {profile.location || 'Location'}
                    </div>
                    <p className="text-xs font-medium text-zinc-600 mt-2">
                      {profile.ministryFocus || 'Tagline'}
                    </p>

                    <p className="text-xs text-zinc-400 mt-4 line-clamp-3 px-2">
                      {profile.bio || 'Your bio will appear here.'}
                    </p>

                    <div className="flex justify-center gap-3 mt-5">
                      {profile.instagram && (
                        <SocialIcon platform="instagram" url={profile.instagram} />
                      )}
                      {profile.facebook && (
                        <SocialIcon platform="facebook" url={profile.facebook} />
                      )}
                      {profile.twitter && (
                        <SocialIcon platform="twitter" url={profile.twitter} />
                      )}
                      {profile.youtube && (
                        <SocialIcon platform="youtube" url={profile.youtube} />
                      )}
                      {profile.website && (
                        <SocialIcon platform="website" url={profile.website} />
                      )}
                    </div>

                    <Button className="w-full mt-6 sm:mt-8 bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl h-11 sm:h-12 text-xs font-semibold">
                      Support
                    </Button>
                  </div>

                  <div className="absolute top-0 left-0 right-0 h-6 sm:h-8 flex justify-center pt-1 pointer-events-none">
                    <div className="bg-zinc-900 h-4 sm:h-5 w-24 sm:w-28 rounded-full" />
                  </div>
                  <div className="absolute bottom-1 left-0 right-0 flex justify-center pointer-events-none">
                    <div className="bg-zinc-200 h-1 w-28 sm:w-32 rounded-full" />
                  </div>
                </div>
              ) : (
                <div className="border border-zinc-200 rounded-xl overflow-hidden shadow-lg bg-white">
                  <div className="h-2.5 bg-zinc-100 border-b border-zinc-200 flex items-center px-2 gap-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
                    <div className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
                    <div className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
                  </div>

                  <div className="relative">
                    <div className="h-20">
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

                    <div className="px-4 pb-4">
                      <div className="flex items-end gap-3 -mt-6">
                        <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                          <AvatarImage src={profile.avatarUrl} />
                          <AvatarFallback className="bg-zinc-100 text-xs font-bold">
                            {initials || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 pb-0.5">
                          <h2 className="text-sm font-bold text-zinc-900">
                            {profile.firstName || 'First'} {profile.lastName || 'Last'}
                          </h2>
                          <p className="text-[10px] text-zinc-500 flex items-center gap-1">
                            <MapPin className="h-2.5 w-2.5" />
                            {profile.location || 'Location'}
                          </p>
                        </div>
                      </div>

                      <p className="text-[10px] font-medium text-zinc-600 mt-3">
                        {profile.ministryFocus || 'Tagline'}
                      </p>
                      <p className="text-[10px] text-zinc-400 mt-1 line-clamp-2">
                        {profile.bio || 'Your bio will appear here.'}
                      </p>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex gap-2">
                          {profile.instagram && (
                            <SocialIcon platform="instagram" url={profile.instagram} />
                          )}
                          {profile.facebook && (
                            <SocialIcon platform="facebook" url={profile.facebook} />
                          )}
                          {profile.twitter && (
                            <SocialIcon platform="twitter" url={profile.twitter} />
                          )}
                        </div>
                        <Button
                          size="sm"
                          className="h-6 rounded text-[9px] font-medium px-3"
                        >
                          Support
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
