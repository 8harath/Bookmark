'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signUp, validateEmail, validatePassword } from '@/utils/auth'
import { Button, Input, Card } from '@/components/ui'

const signupSchema = z.object({
  email: z.string().email('Invalid email address').max(255, 'Email too long'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type SignupForm = z.infer<typeof signupSchema>

export default function SignupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  })

  const password = watch('password')
  const passwordValidation = password ? validatePassword(password) : null

  const onSubmit = async (data: SignupForm) => {
    setIsLoading(true)
    setError('')

    try {
      // Validate email format
      if (!validateEmail(data.email)) {
        setError('Invalid email format')
        setIsLoading(false)
        return
      }

      // Validate password strength
      const { isValid, errors: passwordErrors } = validatePassword(data.password)
      if (!isValid) {
        setError(passwordErrors.join(', '))
        setIsLoading(false)
        return
      }

      await signUp(data.email, data.password)
      setSuccess(true)
    } catch (err: any) {
      console.error('Signup error:', err)
      if (err.message?.includes('already registered')) {
        setError('Account already exists. Try logging in.')
      } else if (err.message?.includes('Invalid email')) {
        setError('Invalid email address')
      } else {
        setError(err.message || 'Sign up failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <h1 className="mb-6 text-center">CHECK YOUR EMAIL ✉️</h1>
          <p className="font-mono mb-6 text-center">
            We sent a verification link to your email address.
            Click the link to verify your account.
          </p>
          <Link href="/auth/login" className="block">
            <Button className="w-full">GO TO LOGIN</Button>
          </Link>
        </Card>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <h1 className="mb-2">SIGN UP</h1>
        <p className="font-mono mb-8 text-sm">Create your account to get started</p>

        {error && (
          <div className="mb-6 p-4 border-3 border-error bg-white">
            <p className="font-mono text-sm text-error">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Email"
            type="email"
            placeholder="your@email.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <div>
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />
            {passwordValidation && !passwordValidation.isValid && password && (
              <ul className="mt-2 text-xs font-mono space-y-1">
                {passwordValidation.errors.map((err, i) => (
                  <li key={i} className="text-error">❌ {err}</li>
                ))}
              </ul>
            )}
          </div>

          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
          </Button>
        </form>

        <p className="mt-6 text-center font-mono text-sm">
          Already have an account?{' '}
          <Link href="/auth/login" className="underline font-bold">
            Log in
          </Link>
        </p>
      </Card>
    </main>
  )
}
