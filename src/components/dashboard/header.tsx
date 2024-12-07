import React from 'react'
import { SidebarTrigger } from '../ui/sidebar'
import { Separator } from '@radix-ui/react-separator'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../ui/breadcrumb'
import { ModeToggle } from '../ThemeProvider/ThemeToggle'

const Header = () => {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2">
    <div className='flex items-center between justify-between w-full gap-2 px-4'>

      <div className="flex items-center ">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="#">
                Building Your Application
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Data Fetching</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>


      </div>

      <ModeToggle />


    </div>
  </header>
  )
}

export default Header