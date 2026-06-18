'use client'

import { useEffect } from 'react'
import { markActivitiesViewedAction } from '@/app/actions/notifications'

export default function MarkViewed() {
  useEffect(() => {
    markActivitiesViewedAction()
  }, [])
  return null
}
