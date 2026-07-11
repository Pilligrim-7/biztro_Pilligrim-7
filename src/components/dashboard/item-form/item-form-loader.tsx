"use client"

import type { ComponentProps } from "react"
import { useEffect } from "react"
import dynamic from "next/dynamic"

import type ItemForm from "@/components/dashboard/item-form/item-form"
import { Skeleton } from "@/components/ui/skeleton"

function logClientDebug(
  location: string,
  message: string,
  data: Record<string, unknown>
) {
  // #region agent log
  fetch("http://127.0.0.1:7673/ingest/054c6300-c97c-4e9a-af45-670f19774a60", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "5cb27c"
    },
    body: JSON.stringify({
      sessionId: "5cb27c",
      runId: "post-fix",
      hypothesisId: "D",
      location,
      message,
      data,
      timestamp: Date.now()
    })
  }).catch(() => {})
  // #endregion
}

const ItemFormClient = dynamic(
  () =>
    import("@/components/dashboard/item-form/item-form")
      .then(mod => {
        logClientDebug(
          "item-form-loader.tsx:import",
          "ItemForm chunk loaded",
          {}
        )
        return mod
      })
      .catch(error => {
        logClientDebug("item-form-loader.tsx:import", "ItemForm chunk failed", {
          error: error instanceof Error ? error.message : String(error)
        })
        throw error
      }),
  {
    loading: () => (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-3/4" />
      </div>
    ),
    ssr: false
  }
)

export default function ItemFormLoader(props: ComponentProps<typeof ItemForm>) {
  useEffect(() => {
    logClientDebug("item-form-loader.tsx:mount", "ItemFormLoader mounted", {})
  }, [])

  return <ItemFormClient {...props} />
}
