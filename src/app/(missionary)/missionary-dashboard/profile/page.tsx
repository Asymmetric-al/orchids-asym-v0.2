'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { PageHeader } from '@/components/page-header'
import {
  Camera,
  Upload,
  Globe,
  MapPin,
  Mail,
  Phone as PhoneIcon,
  Save,
  Eye,
  Sparkles,
  ImageIcon,
  Smartphone,
  ArrowUpRight,
  Loader2,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Link as LinkIcon
} from 'lucide-react'

export default function ProfilePage() {
  const [isEditing, setIsEditing] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [profile, setProfile] = React.useState({
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
    avatarUrl: ''
  })

  React.useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/profile')
        const data = await res.json()
        if (data.profile) {
          const p = data.profile
          const m = p.missionary || {}
          const social = m.social_links || {}
          setProfile({
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
            avatarUrl: p.avatar_url || ''
          })
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProfile()
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
      
      // Attempt to delete old avatar if it exists
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
      
      toast.success("Avatar updated successfully")
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || "Failed to upload avatar.")
    } finally {
      setIsUploading(false)
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

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader 
        title="Profile" 
        description="Manage your public presence and ministry details."
      >
        <Button variant="outline" size="sm" className="h-9 px-4 text-xs font-medium">
          <Eye className="mr-2 h-4 w-4" />
          Live Site
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          size="sm"
          className="h-9 px-4 text-xs font-medium min-w-[100px]"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isEditing ? (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save
            </>
          ) : (
            'Edit Profile'
          )}
        </Button>
      </PageHeader>

      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-10">
          <Card className="border-zinc-200 bg-white shadow-sm overflow-hidden rounded-[2.5rem]">
            <CardHeader className="border-b border-zinc-50 bg-zinc-50/30 px-8 py-6">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">First Name</Label>
                  <Input 
                    value={profile.firstName}
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    disabled={!isEditing}
                    className="h-12 rounded-xl border-zinc-100 bg-zinc-50/50 focus:bg-white transition-all font-bold text-sm"
                  />
                </div>
                <div className="space-y-2.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Last Name</Label>
                  <Input 
                    value={profile.lastName}
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    disabled={!isEditing}
                    className="h-12 rounded-xl border-zinc-100 bg-zinc-50/50 focus:bg-white transition-all font-bold text-sm"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Location</Label>
                  <Input 
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    disabled={!isEditing}
                    className="h-12 rounded-xl border-zinc-100 bg-zinc-50/50 focus:bg-white transition-all font-bold text-sm"
                    placeholder="e.g. Bangkok, Thailand"
                  />
                </div>
                <div className="space-y-2.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Phone</Label>
                  <Input 
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    disabled={!isEditing}
                    className="h-12 rounded-xl border-zinc-100 bg-zinc-50/50 focus:bg-white transition-all font-bold text-sm"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
              
              <div className="space-y-2.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Tagline / Ministry Focus</Label>
                <Input 
                  value={profile.ministryFocus}
                  onChange={(e) => setProfile({ ...profile, ministryFocus: e.target.value })}
                  disabled={!isEditing}
                  className="h-12 rounded-xl border-zinc-100 bg-zinc-50/50 focus:bg-white transition-all font-bold text-sm"
                  placeholder="e.g. Youth Ministry & Education"
                />
              </div>

              <div className="space-y-2.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Bio</Label>
                <Textarea 
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  disabled={!isEditing}
                  className="min-h-[180px] resize-none rounded-2xl border-zinc-100 bg-zinc-50/50 focus:bg-white transition-all p-4 text-sm font-medium leading-relaxed"
                  placeholder="Tell your story..."
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-200 bg-white shadow-sm overflow-hidden rounded-[2.5rem]">
            <CardHeader className="border-b border-zinc-50 bg-zinc-50/30 px-8 py-6">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Social Presence</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
               <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1 flex items-center gap-2">
                       <Instagram className="h-3 w-3" /> Instagram
                    </Label>
                    <Input 
                      value={profile.instagram}
                      onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
                      disabled={!isEditing}
                      className="h-11 rounded-xl border-zinc-100 bg-zinc-50/50 focus:bg-white transition-all font-bold text-sm"
                      placeholder="@handle"
                    />
                  </div>
                  <div className="space-y-2.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1 flex items-center gap-2">
                       <Facebook className="h-3 w-3" /> Facebook
                    </Label>
                    <Input 
                      value={profile.facebook}
                      onChange={(e) => setProfile({ ...profile, facebook: e.target.value })}
                      disabled={!isEditing}
                      className="h-11 rounded-xl border-zinc-100 bg-zinc-50/50 focus:bg-white transition-all font-bold text-sm"
                      placeholder="facebook.com/name"
                    />
                  </div>
               </div>
               <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1 flex items-center gap-2">
                       <Twitter className="h-3 w-3" /> Twitter / X
                    </Label>
                    <Input 
                      value={profile.twitter}
                      onChange={(e) => setProfile({ ...profile, twitter: e.target.value })}
                      disabled={!isEditing}
                      className="h-11 rounded-xl border-zinc-100 bg-zinc-50/50 focus:bg-white transition-all font-bold text-sm"
                      placeholder="@handle"
                    />
                  </div>
                  <div className="space-y-2.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1 flex items-center gap-2">
                       <Youtube className="h-3 w-3" /> YouTube
                    </Label>
                    <Input 
                      value={profile.youtube}
                      onChange={(e) => setProfile({ ...profile, youtube: e.target.value })}
                      disabled={!isEditing}
                      className="h-11 rounded-xl border-zinc-100 bg-zinc-50/50 focus:bg-white transition-all font-bold text-sm"
                      placeholder="youtube.com/c/name"
                    />
                  </div>
               </div>
               <div className="space-y-2.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1 flex items-center gap-2">
                      <LinkIcon className="h-3 w-3" /> Personal Website
                  </Label>
                  <Input 
                    value={profile.website}
                    onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                    disabled={!isEditing}
                    className="h-11 rounded-xl border-zinc-100 bg-zinc-50/50 focus:bg-white transition-all font-bold text-sm"
                    placeholder="https://yourwebsite.com"
                  />
               </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-200 bg-white shadow-sm overflow-hidden rounded-[2.5rem]">
            <CardHeader className="border-b border-zinc-50 bg-zinc-50/30 px-8 py-6">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Media Assets</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-10">
                <div className="flex flex-col sm:flex-row items-center gap-8">
                  <Avatar className="h-28 w-28 border-4 border-white shadow-2xl">
                    <AvatarImage src={profile.avatarUrl} />
                    <AvatarFallback className="bg-zinc-900 text-xl font-black text-white uppercase">
                      {(profile.firstName?.[0] || '') + (profile.lastName?.[0] || '') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-4 text-center sm:text-left">
                    <p className="text-sm font-black text-zinc-900">Profile Photo</p>
                    <p className="text-xs font-medium text-zinc-500 leading-relaxed max-w-[240px]">High-resolution square format recommended. Minimum 400x400px.</p>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleAvatarUpload}
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={isUploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="h-10 rounded-xl border-zinc-200 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900"
                    >
                      {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                      {isUploading ? 'Uploading...' : 'Upload New'}
                    </Button>
                  </div>
                </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Cover Image</Label>
                <div className="aspect-[3/1] rounded-[2rem] border-4 border-dashed border-zinc-50 bg-zinc-50/30 flex flex-col items-center justify-center hover:bg-zinc-50 transition-all cursor-pointer group">
                  <div className="h-14 w-14 rounded-2xl bg-white shadow-sm border border-zinc-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <ImageIcon className="h-7 w-7 text-zinc-100" />
                  </div>
                  <p className="text-sm font-black text-zinc-900">Click to upload cover</p>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">1200x400px</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-8">
          <div className="sticky top-24">
            <div className="flex items-center justify-between mb-4 px-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Live Preview</span>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="h-9 w-9 bg-white border-zinc-200 rounded-xl text-zinc-600 shadow-sm"><Smartphone className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-400 rounded-xl hover:text-zinc-900"><Eye className="h-4 w-4" /></Button>
              </div>
            </div>
            
            <div className="border-[12px] border-zinc-900 rounded-[3.5rem] overflow-hidden shadow-2xl bg-white aspect-[9/19] relative ring-1 ring-zinc-200">
              <div className="absolute top-0 left-0 right-0 h-40 bg-zinc-50">
                <div className="absolute inset-0 flex items-center justify-center opacity-5">
                   <ImageIcon className="h-16 w-16" />
                </div>
              </div>
                <div className="absolute top-28 left-0 right-0 flex justify-center">
                  <div className="h-28 w-28 rounded-full border-4 border-white bg-white overflow-hidden shadow-2xl relative z-10">
                     <Avatar className="h-full w-full">
                      <AvatarImage src={profile.avatarUrl} />
                      <AvatarFallback className="bg-zinc-100 font-black uppercase text-xl">
                        {(profile.firstName?.[0] || '') + (profile.lastName?.[0] || '') || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              
              <div className="mt-60 px-8 text-center">
                <h2 className="text-2xl font-black text-zinc-900 tracking-tighter">
                  {profile.firstName || 'First'} {profile.lastName || 'Last'}
                </h2>
                <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mt-2">
                  <MapPin className="h-3.5 w-3.5" />
                  {profile.location || 'Location Not Set'}
                </div>
                <p className="text-xs font-black text-zinc-600 mt-3">{profile.ministryFocus || 'Ministry Focus'}</p>
                
                <p className="text-sm font-medium text-zinc-400 mt-6 leading-relaxed line-clamp-3 px-2">
                  {profile.bio || 'No bio provided yet.'}
                </p>

                <div className="flex justify-center gap-4 mt-8">
                   {profile.instagram && <Instagram className="h-4 w-4 text-zinc-400" />}
                   {profile.facebook && <Facebook className="h-4 w-4 text-zinc-400" />}
                   {profile.twitter && <Twitter className="h-4 w-4 text-zinc-400" />}
                   {profile.website && <Globe className="h-4 w-4 text-zinc-400" />}
                </div>

                <Button className="w-full mt-10 bg-zinc-900 text-white hover:bg-zinc-800 rounded-2xl h-14 shadow-2xl shadow-zinc-900/20 font-black uppercase tracking-[0.2em] text-[10px]">
                  GIVE SUPPORT
                </Button>

                <div className="mt-12 pt-8 border-t border-zinc-100 flex justify-center">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Our Stories</p>
                </div>
                <div className="mt-6 bg-zinc-50 rounded-3xl h-32 w-full border border-zinc-100"></div>
              </div>

              <div className="absolute top-0 left-0 right-0 h-10 flex justify-center pt-2 pointer-events-none">
                 <div className="bg-zinc-900 h-6 w-32 rounded-full"></div>
              </div>
              <div className="absolute bottom-2 left-0 right-0 flex justify-center pointer-events-none">
                 <div className="bg-zinc-200 h-1 w-36 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
