'use client'
import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div>
      <h2>មានបញ្ហាមួយកើតឡើង!</h2>
      <button onClick={() => reset()}>សាកល្បងម្ដងទៀត</button>
    </div>
  )
}