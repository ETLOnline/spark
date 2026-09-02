import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"

/**
 * A user can submit/resubmit an advisor request for a space only when FYP is
 * enabled on that space, they can edit the space (scoped grant), and they
 * hold the global "request advisor" permission (student grant).
 */
export function useCanRequestAdvisor(
  spaceId: string | undefined,
  isFypEnabled: boolean | undefined
) {
  const { permissionChecker } = usePermissionChecker("scoped", "SPACE", spaceId)
  const { permissionChecker: globalPermissionChecker } =
    usePermissionChecker("global")

  const canEditDetails = permissionChecker
    ? permissionChecker.canAccess("space.update")
    : false

  const canRequestAdvisor = globalPermissionChecker
    ? globalPermissionChecker.canAccess("fyp.can_request_advisor")
    : false

  return isFypEnabled === true && canEditDetails && canRequestAdvisor
}
