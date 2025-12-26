'use client'

import { useState } from 'react'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { Heart, MessageCircle, HandHeart, Flame } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { cn } from '@/lib/utils'
import type { PostWithAuthor } from '@/types/database'
import { CommentsDialog } from './comments-dialog'

interface FeedPostProps {
  post: PostWithAuthor
  onLike: (postId: string, liked: boolean) => void
  onPrayer: (postId: string, prayed: boolean) => void
}

interface Particle {
  id: number
  emoji: string
  x: number
  y: number
}

export function FeedPost({ post, onLike, onPrayer }: FeedPostProps) {
  const [liked, setLiked] = useState(post.user_liked ?? false)
  const [prayed, setPrayed] = useState(post.user_prayed ?? false)
  const [fired, setFired] = useState(false) // Assuming fires are client-side only for now or need schema update
  const [likeCount, setLikeCount] = useState(post.like_count)
  const [prayerCount, setPrayerCount] = useState(post.prayer_count)
  const [showComments, setShowComments] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])

  const addParticles = (emoji: string) => {
    const newParticles = Array.from({ length: 8 }).map((_, i) => ({
      id: Date.now() + i,
      emoji,
      x: (Math.random() - 0.5) * 100,
      y: (Math.random() - 0.5) * 100,
    }))
    setParticles((prev) => [...prev, ...newParticles])
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)))
    }, 1000)
  }

  const handleLike = () => {
    const newLiked = !liked
    setLiked(newLiked)
    setLikeCount((prev) => (newLiked ? prev + 1 : prev - 1))
    onLike(post.id, newLiked)
    if (newLiked) addParticles('❤️')
  }

  const handlePrayer = () => {
    const newPrayed = !prayed
    setPrayed(newPrayed)
    setPrayerCount((prev) => (newPrayed ? prev + 1 : prev - 1))
    onPrayer(post.id, newPrayed)
    if (newPrayed) addParticles('🙏')
  }

  const handleFire = () => {
    setFired(!fired)
    if (!fired) addParticles('🔥')
  }

  const initials = `${post.author.first_name[0]}${post.author.last_name[0]}`

  return (
    <>
      <Card className="overflow-hidden border-none shadow-lg ring-1 ring-black/5 dark:ring-white/10">
        <CardHeader className="flex-row items-center gap-3 space-y-0 bg-muted/30 pb-4">
          <Avatar className="size-10 ring-2 ring-primary/10">
            {post.author.avatar_url && (
              <AvatarImage src={post.author.avatar_url} alt={post.author.first_name} />
            )}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold tracking-tight">
              {post.author.first_name} {post.author.last_name}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </p>
          </div>
        </CardHeader>

        {post.media && post.media.length > 0 && (
          <div className="relative">
            {post.media.length === 1 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative aspect-[4/3] w-full overflow-hidden"
              >
                {post.media[0].type === 'video' ? (
                  <video
                    src={post.media[0].url}
                    controls
                    className="size-full object-cover"
                    aria-label="Post video"
                  />
                ) : (
                  <Image
                    src={post.media[0].url}
                    alt="Post media"
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 600px"
                    priority
                  />
                )}
              </motion.div>
            ) : (
              <Carousel className="w-full">
                <CarouselContent className="-ml-0">
                  {post.media.map((item, index) => (
                    <CarouselItem key={index} className="pl-0">
                      <div className="relative aspect-[4/3] w-full overflow-hidden">
                        {item.type === 'video' ? (
                          <video
                            src={item.url}
                            controls
                            className="size-full object-cover"
                            aria-label={`Post video ${index + 1}`}
                          />
                        ) : (
                          <Image
                            src={item.url}
                            alt={`Post media ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 600px"
                          />
                        )}
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>
            )}
          </div>
        )}

        <CardContent className="space-y-4 pt-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'rounded-full transition-colors',
                  liked && 'bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-500/10'
                )}
                onClick={handleLike}
              >
                <motion.div
                  whileTap={{ scale: 1.5 }}
                  animate={liked ? { scale: [1, 1.2, 1] } : {}}
                >
                  <Heart className={cn('size-5', liked && 'fill-current')} />
                </motion.div>
              </Button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'rounded-full transition-colors',
                prayed && 'bg-indigo-50 text-indigo-500 hover:bg-indigo-100 dark:bg-indigo-500/10'
              )}
              onClick={handlePrayer}
            >
              <motion.div
                whileTap={{ scale: 1.5 }}
                animate={prayed ? { scale: [1, 1.2, 1] } : {}}
              >
                <HandHeart className={cn('size-5', prayed && 'fill-current')} />
              </motion.div>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'rounded-full transition-colors',
                fired && 'bg-orange-50 text-orange-500 hover:bg-orange-100 dark:bg-orange-500/10'
              )}
              onClick={handleFire}
            >
              <motion.div
                whileTap={{ scale: 1.5 }}
                animate={fired ? { scale: [1, 1.2, 1] } : {}}
              >
                <Flame className={cn('size-5', fired && 'fill-current')} />
              </motion.div>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setShowComments(true)}
            >
              <MessageCircle className="size-5" />
            </Button>

            <AnimatePresence>
              {particles.map((p) => (
                <motion.span
                  key={p.id}
                  initial={{ opacity: 1, scale: 0.5, x: 0, y: 0 }}
                  animate={{ 
                    opacity: 0, 
                    scale: 1.5, 
                    x: p.x, 
                    y: p.y - 100,
                    rotate: p.x 
                  }}
                  className="pointer-events-none absolute z-50 text-xl"
                >
                  {p.emoji}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>

          <div className="flex gap-4 text-xs font-medium text-muted-foreground/80">
            <span className={cn(liked && "text-red-500")}>{likeCount} likes</span>
            <span className={cn(prayed && "text-indigo-500")}>{prayerCount} prayers</span>
            <span>{post.comment_count} comments</span>
          </div>

          <div className="space-y-2">
            <div 
              className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>

          {post.comment_count > 0 && (
            <Button
              variant="link"
              className="h-auto p-0 text-xs font-semibold text-primary hover:no-underline"
              onClick={() => setShowComments(true)}
            >
              View all {post.comment_count} comments
            </Button>
          )}
        </CardContent>
      </Card>

      <CommentsDialog
        postId={post.id}
        open={showComments}
        onOpenChange={setShowComments}
      />
    </>
  )
}
