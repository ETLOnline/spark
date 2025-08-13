import { useAtom } from "jotai"
import React from "react"
import { siteStore } from "../store/site/siteStore"
import { SitePageName } from "../types/pageName"

const usePageName = () => {
  const [PageNameAtom, setPageNameAtom] = useAtom(siteStore.pageNameAtom)

  function SetPageName(pageName: SitePageName) {
    setPageNameAtom(pageName)
  }

  function GetPageName() {
    return PageNameAtom
  }

  return { SetPageName, GetPageName }
}

export default usePageName
