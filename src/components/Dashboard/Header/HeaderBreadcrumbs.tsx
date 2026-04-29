"use client"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "../../ui/breadcrumb"

interface BreadcrumbItemType {
  label: string
  href: string
  isCurrent: boolean
}

interface Props {
  breadcrumbs: BreadcrumbItemType[]
}

const HeaderBreadcrumbs = ({ breadcrumbs }: Props) => {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, i) => {
          // Determine if the current item is one of the last four
          const isLastFour = i >= breadcrumbs.length - 4

          return (
            // Using 'contents' prevents the div from breaking the BreadcrumbList flex layout
            <div key={crumb.href + crumb.label} className="contents">
              <BreadcrumbItem
                className={!isLastFour ? "hidden md:inline-flex" : ""}
              >
                {crumb.isCurrent ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={crumb.href}>
                    {crumb.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>

              {/* Add separator if it's not the last item */}
              {i !== breadcrumbs.length - 1 && (
                <BreadcrumbSeparator
                  className={!isLastFour ? "hidden md:block" : ""}
                />
              )}
            </div>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export default HeaderBreadcrumbs
