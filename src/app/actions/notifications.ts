'use server'

import { cookies } from 'next/headers'

const COOKIE = 'activities_last_viewed'

export async function markActivitiesViewedAction() {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE, new Date().toISOString(), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 ano
  })
}

export async function getActivitiesLastViewed(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(COOKIE)?.value ?? null
}
