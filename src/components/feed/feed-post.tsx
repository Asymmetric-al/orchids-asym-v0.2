'use client'

import { useState } from 'react'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { Heart, MessageCircle, HandHeart } from 'lucide-react'
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

export function FeedPost({ post, onLike, onPrayer }: FeedPostProps) {
  const [liked, setLiked] = useState(post.user_liked ?? false)
  const [prayed, setPrayed] = useState(post.user_prayed ?? false)
  const [likeCount, setLikeCount] = useState(post.like_count)
  const [prayerCount, setPrayerCount] = useState(post.prayer_count)
  const [showComments, setShowComments] = useState(false)

  const handleLike = () => {
    const newLiked = !liked
    setLiked(newLiked)
    setLikeCount((prev) => (newLiked ? prev + 1 : prev - 1))
    onLike(post.id, newLiked)
  }

  const handlePrayer = () => {
    const newPrayed = !prayed
    setPrayed(newPrayed)
    setPrayerCount((prev) => (newPrayed ? prev + 1 : prev - 1))
    onPrayer(post.id, newPrayed)
  }

  const initials = `${post.author.first_name[0]}${post.author.last_name[0]}`

  return (
    <>
      <Card>
        <CardHeader className="flex-row items-center gap-3 space-y-0">
          <Avatar className="size-10">
            {post.author.avatar_url && (
              <AvatarImage src={post.author.avatar_url} alt={post.author.first_name} />
            )}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold">
              {post.author.first_name} {post.author.last_name}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </p>
          </div>
        </CardHeader>

        {post.media.length > 0 && (
          <div className="relative">
            {post.media.length === 1 ? (
              <div className="relative aspect-square w-full overflow-hidden">
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
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 600px"
                  />
                )}
              </div>
            ) : (
              <Carousel className="w-full">
                <CarouselContent className="-ml-0">
                  {post.media.map((item, index) => (
                    <CarouselItem key={index} className="pl-0">
                      <div className="relative aspect-square w-full overflow-hidden">
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

        <CardContent className="space-y-3">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleLike}
              aria-label={liked ? 'Unlike post' : 'Like post'}
              aria-pressed={liked}
            >
              <Heart
                className={cn('size-5', liked && 'fill-red-500 text-red-500')}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handlePrayer}
              aria-label={prayed ? 'Remove prayer' : 'Pray for this'}
              aria-pressed={prayed}
            >
              <HandHeart
                className={cn('size-5', prayed && 'fill-amber-500 text-amber-500')}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setShowComments(true)}
              aria-label="View comments"
            >
              <MessageCircle className="size-5" />
            </Button>
          </div>

          <div className="flex gap-3 text-sm text-muted-foreground">
            <span>{likeCount} likes</span>
            <span>{prayerCount} prayers</span>
            <span>{post.comment_count} comments</span>
          </div>

          <p className="text-sm">
            <span className="font-semibold">
              {post.author.first_name} {post.author.last_name}
            </span>{' '}
            {post.content}
          </p>

          {post.comment_count > 0 && (
            <Button
              variant="link"
              className="h-auto p-0 text-muted-foreground"
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