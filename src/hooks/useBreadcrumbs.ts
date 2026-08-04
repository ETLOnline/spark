"use client"

import { usePathname, useParams, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import {
  breadcrumbConfig,
  type BreadcrumbConfigItem
} from "@/src/lib/breadcrumbs.config"

interface BreadcrumbItem {
  label: string
  href: string
  isCurrent: boolean
}

const buildBreadcrumbsFromConfig = async (
  currentPathSegments: string[],
  currentConfigLevel: BreadcrumbConfigItem[],
  accumulatedHref: string,
  params: Record<string, string | string[]>,
  memoizedLabels: Map<
    string,
    string | Array<{ label: string; href?: string; data?: any }>
  >
): Promise<BreadcrumbItem[]> => {
  const crumbs: BreadcrumbItem[] = []

  if (currentPathSegments.length === 0) {
    return crumbs
  }

  const currentSegment = currentPathSegments[0]
  const remainingSegments = currentPathSegments.slice(1)

  let matchedConfigItem: BreadcrumbConfigItem | undefined
  let paramName: string | undefined

  for (const item of currentConfigLevel) {
    if (item.path === `/${currentSegment}`) {
      matchedConfigItem = item
      break
    }
    if (item.path.startsWith("/[") && item.path.endsWith("]")) {
      const potentialParamName = item.path.substring(2, item.path.length - 1)

      if (params[potentialParamName] === currentSegment) {
        matchedConfigItem = item
        paramName = potentialParamName
        break
      }
    }
  }

  const encodedSegment = encodeURIComponent(currentSegment)
  const segmentHref = `${accumulatedHref}${matchedConfigItem && !matchedConfigItem.path.includes("[") ? matchedConfigItem.path : `/${encodedSegment}`}`

  if (matchedConfigItem) {
    let displayLabelOrLabels:
      | string
      | Array<{ label: string; href?: string; data?: any }>
      | null = matchedConfigItem.label || null

    if (matchedConfigItem.dynamicLabelFetcher) {
      const paramValue = params[paramName || ""] as string

      if (paramValue) {
        const memoKey = `${matchedConfigItem.path}-${paramValue}`
        if (memoizedLabels.has(memoKey)) {
          displayLabelOrLabels = memoizedLabels.get(memoKey)!
        } else {
          try {
            const fetchedResult = await matchedConfigItem.dynamicLabelFetcher(
              paramValue,
              params
            )
            if (fetchedResult !== null) {
              displayLabelOrLabels = fetchedResult
              memoizedLabels.set(memoKey, fetchedResult)
            }
          } catch (error) {
            console.error(
              `Error fetching label for ${paramName}=${paramValue}:`,
              error
            )
          }
        }
      }
    }

    if (Array.isArray(displayLabelOrLabels)) {
      displayLabelOrLabels.forEach((item) => {
        crumbs.push({
          label: item.label,
          href: item.href ? item.href : segmentHref,
          isCurrent: false
        })
      })
    } else if (typeof displayLabelOrLabels === "string") {
      crumbs.push({
        label: displayLabelOrLabels,
        href: matchedConfigItem.href || segmentHref,
        isCurrent: false
      })
    }

    if (matchedConfigItem.children && remainingSegments.length > 0) {
      const childCrumbs = await buildBreadcrumbsFromConfig(
        remainingSegments,
        matchedConfigItem.children,
        segmentHref,
        params,
        memoizedLabels
      )
      crumbs.push(...childCrumbs)
    }
  } else {
    const encodedSegment = encodeURIComponent(currentSegment)
    const genericSegmentHref = `${accumulatedHref}/${encodedSegment}`
    crumbs.push({
      label: currentSegment.charAt(0).toUpperCase() + currentSegment.slice(1),
      href: genericSegmentHref,
      isCurrent: false
    })

    if (remainingSegments.length > 0) {
      const childCrumbs = await buildBreadcrumbsFromConfig(
        remainingSegments,
        breadcrumbConfig,
        genericSegmentHref,
        params,
        memoizedLabels
      )
      crumbs.push(...childCrumbs)
    }
  }

  return crumbs
}

export const useBreadcrumbs = (): BreadcrumbItem[] => {
  const pathname = usePathname()
  const params = useParams()
  const searchParams = useSearchParams()
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([])

  useEffect(() => {
    const generateBreadcrumbs = async () => {
      const cleanPath = pathname.startsWith("/")
        ? pathname.substring(1)
        : pathname
      const pathSegments = cleanPath
        .split("/")
        .filter((s) => s !== "" && !s.startsWith("("))
        .map((s) => decodeURIComponent(s))

      const finalBreadcrumbs: BreadcrumbItem[] = []

      finalBreadcrumbs.push({
        label: "Spark",
        href: "/",
        isCurrent: pathname === "/"
      })

      const dynamicCrumbs = await buildBreadcrumbsFromConfig(
        pathSegments,
        breadcrumbConfig,
        "",
        params as Record<string, string | string[]>,
        new Map<
          string,
          string | Array<{ label: string; href?: string; data?: any }>
        >()
      )

      dynamicCrumbs.forEach((crumb) => {
        if (
          !finalBreadcrumbs.some(
            (existing) =>
              existing.href === crumb.href && existing.label === crumb.label
          )
        ) {
          finalBreadcrumbs.push(crumb)
        }
      })

      const pageType = searchParams.get("page-type")
      if (pageType) {
        const friendlyPageType =
          pageType.charAt(0).toUpperCase() + pageType.slice(1).replace("-", " ")
        finalBreadcrumbs.push({
          label: friendlyPageType,
          href: `${pathname}?page-type=${pageType}`,
          isCurrent: true
        })
      } else {
        if (finalBreadcrumbs.length > 0) {
          finalBreadcrumbs[finalBreadcrumbs.length - 1].isCurrent = true
        }
      }

      setBreadcrumbs(finalBreadcrumbs)
    }

    generateBreadcrumbs()
  }, [pathname, params, searchParams])

  return breadcrumbs
}
