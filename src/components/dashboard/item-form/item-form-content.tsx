import {
  dehydrate,
  HydrationBoundary,
  QueryClient
} from "@tanstack/react-query"
import { notFound } from "next/navigation"

import ItemFormLoader from "@/components/dashboard/item-form/item-form-loader"
import { getCategories, getMenuItemById } from "@/server/actions/item/queries"
import { getAvailableTranslations } from "@/server/actions/item/translations"
import {
  getCurrentOrganization,
  isProMember
} from "@/server/actions/user/queries"
import { debugLog } from "@/lib/debug-log"

export async function ItemFormContent({
  action,
  id
}: {
  action: string
  id: string
}) {
  const pageStart = Date.now()
  // #region agent log
  debugLog({
    hypothesisId: "D",
    location: "item-form-content.tsx:start",
    message: "ItemFormContent started",
    data: { action, id, elapsedMs: 0 },
    runId: "post-fix"
  })
  // #endregion

  const org = await getCurrentOrganization()

  // #region agent log
  debugLog({
    hypothesisId: "D",
    location: "item-form-content.tsx:after-org",
    message: "Organization loaded",
    data: {
      action,
      id,
      hasOrg: Boolean(org),
      elapsedMs: Date.now() - pageStart
    },
    runId: "post-fix"
  })
  // #endregion

  if (!org) {
    notFound()
  }

  const queryClient = new QueryClient()

  const [item, isPro, availableTranslations] = await Promise.all([
    getMenuItemById(id),
    isProMember(),
    getAvailableTranslations(org.id),
    queryClient.prefetchQuery({
      queryKey: ["categories"],
      queryFn: () => getCategories(org.id)
    })
  ])

  // #region agent log
  debugLog({
    hypothesisId: "D",
    location: "item-form-content.tsx:after-data",
    message: "Item form data loaded",
    data: {
      action,
      id,
      hasItem: Boolean(item),
      isPro,
      localeCount: availableTranslations.length,
      elapsedMs: Date.now() - pageStart
    },
    runId: "post-fix"
  })
  // #endregion

  if (action !== "new" && !item) {
    notFound()
  }

  // #region agent log
  debugLog({
    hypothesisId: "D",
    location: "item-form-content.tsx:before-render",
    message: "Rendering ItemFormLoader",
    data: { action, id, elapsedMs: Date.now() - pageStart },
    runId: "post-fix"
  })
  // #endregion

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ItemFormLoader
        action={action}
        item={item}
        isPro={isPro}
        availableTranslationLocales={availableTranslations.map(
          translation => translation.locale
        )}
      />
    </HydrationBoundary>
  )
}
