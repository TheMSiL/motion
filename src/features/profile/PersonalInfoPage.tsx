import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { userService } from '@/services'
import { useAsync } from '@/hooks/useAsync'
import { useToast } from '@/store/toast-store'
import { cn } from '@/lib/utils'
import { Screen } from '@/components/layout/Screen'
import { MobileHeader } from '@/components/layout/MobileHeader'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Skeleton } from '@/components/ui/Skeleton'

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Enter at least 2 characters')
    .max(40, 'Keep it under 40 characters'),
  email: z.email('Enter a valid email address'),
  city: z.string().trim().min(2, 'Enter your city').max(40, 'Keep it under 40 characters'),
  bio: z.string().trim().max(160, 'Keep your bio under 160 characters'),
})

type FormValues = z.infer<typeof schema>

const FIELDS = [
  { name: 'name' as const, label: 'Full name', type: 'text', autoComplete: 'name' },
  { name: 'email' as const, label: 'Email', type: 'email', autoComplete: 'email' },
  { name: 'city' as const, label: 'City', type: 'text', autoComplete: 'address-level2' },
]

export default function PersonalInfoPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { data: user, loading } = useAsync(() => userService.getUser(), [])

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: { name: '', email: '', city: '', bio: '' },
  })

  useEffect(() => {
    if (!user) return
    reset({ name: user.name, email: user.email, city: user.city, bio: user.bio })
  }, [user, reset])

  const name = watch('name')
  const bio = watch('bio') ?? ''

  async function onSubmit(values: FormValues) {
    await userService.updateProfile(values)
    toast('Profile updated', { description: 'Your details have been saved' })
    navigate('/profile')
  }

  if (loading || !user) {
    return (
      <Screen header={<MobileHeader back title="Personal information" />}>
        <div className="space-y-4 px-[var(--gutter)] pt-6">
          <Skeleton className="mx-auto size-20 rounded-full" />
          <Skeleton className="h-14 rounded-2xl" />
          <Skeleton className="h-14 rounded-2xl" />
          <Skeleton className="h-14 rounded-2xl" />
        </div>
      </Screen>
    )
  }

  return (
    <Screen
      header={<MobileHeader back title="Personal information" />}
      footer={
        <Button
          size="lg"
          fullWidth
          loading={isSubmitting}
          disabled={!isDirty}
          onClick={handleSubmit(onSubmit)}
        >
          Save changes
        </Button>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 px-[var(--gutter)] pt-6" noValidate>
        <div className="flex flex-col items-center gap-3">
          <Avatar
            initials={(name || user.name)
              .split(/\s+/)
              .slice(0, 2)
              .map((part) => part.charAt(0).toUpperCase())
              .join('')}
            name={name || user.name}
            size={84}
            ring
          />
          <p className="text-[12.5px] text-ink-3">Your monogram updates with your name</p>
        </div>

        {FIELDS.map((field) => (
          <div key={field.name}>
            <label
              htmlFor={field.name}
              className="mb-1.5 block text-[12.5px] font-semibold text-ink-2"
            >
              {field.label}
            </label>
            <input
              id={field.name}
              type={field.type}
              autoComplete={field.autoComplete}
              aria-invalid={Boolean(errors[field.name])}
              aria-describedby={errors[field.name] ? `${field.name}-error` : undefined}
              className={cn(
                'h-13 w-full rounded-2xl border bg-surface px-4 text-[15px] text-ink outline-none',
                'h-[52px] transition-colors placeholder:text-ink-3 focus:border-line-strong',
                errors[field.name] ? 'border-negative' : 'border-line',
              )}
              {...register(field.name)}
            />
            {errors[field.name] && (
              <p id={`${field.name}-error`} role="alert" className="mt-1.5 text-[12.5px] text-negative">
                {errors[field.name]?.message}
              </p>
            )}
          </div>
        ))}

        <div>
          <label htmlFor="bio" className="mb-1.5 block text-[12.5px] font-semibold text-ink-2">
            Bio
          </label>
          <textarea
            id="bio"
            rows={3}
            aria-invalid={Boolean(errors.bio)}
            aria-describedby={errors.bio ? 'bio-error' : 'bio-count'}
            className={cn(
              'w-full resize-none rounded-2xl border bg-surface px-4 py-3 text-[15px] leading-relaxed text-ink outline-none',
              'transition-colors placeholder:text-ink-3 focus:border-line-strong',
              errors.bio ? 'border-negative' : 'border-line',
            )}
            {...register('bio')}
          />
          <div className="mt-1.5 flex items-center justify-between">
            {errors.bio ? (
              <p id="bio-error" role="alert" className="text-[12.5px] text-negative">
                {errors.bio.message}
              </p>
            ) : (
              <span id="bio-count" className="text-[12px] text-ink-3">
                {bio.length}/160
              </span>
            )}
          </div>
        </div>

        <div className="pb-24" />
      </form>
    </Screen>
  )
}
