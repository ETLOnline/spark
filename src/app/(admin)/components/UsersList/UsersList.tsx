"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import moment from "moment"
import { useDebounce } from "use-debounce"
import { Loader2, Search } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Input } from "@/src/components/ui/input"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/src/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/src/components/ui/alert-dialog"
import PaginationComponent from "@/src/components/common/Pagination"
import { useToast } from "@/src/hooks/use-toast"
import {
  FormatUserName,
  formatRelativeTime,
  getUserRole
} from "@/src/utils/helpers"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  GetAdminUsersAction,
  SetUserDisabledAction
} from "@/src/server-actions/Admin/AdminUsers"
import { SelectUser } from "@/src/db/schema"
import { PaginationType } from "@/src/components/common/types/pagination.type"
import {
  USER_VERIFICATION_BADGES,
  USER_VERIFICATION_OPTIONS,
  UserVerification
} from "./usersListData"

const PAGE_SIZE = 10

type VerificationFilter = "all" | UserVerification

// schema user (with profile + roles) + lastActive from Clerk
type UsersListUser = SelectUser & {
  lastActive: string | null
}

const getVerification = (user: UsersListUser): UserVerification =>
  user.profile?.verified ? "verified" : "unverified"

type UsersListProps = {
  // role selected in the page's role chips (roles.name); undefined = all users
  role?: string
}

// Admin list of every user with verification filter, search and disable/enable. The role
// filter comes from the role chips at the top of the page.
// Data is fetched live (GetAdminUsersAction), filtered and paginated on the server.
export function UsersList({ role }: UsersListProps) {
  const { toast } = useToast()
  const [users, setUsers] = useState<UsersListUser[]>([])
  const [pagination, setPagination] = useState<PaginationType>()
  const [verification, setVerification] = useState<VerificationFilter>("all")
  const [search, setSearch] = useState("")
  // wait until typing stops before searching
  const [debouncedSearch] = useDebounce(search, 400)
  const [page, setPage] = useState(1)
  const [userToToggle, setUserToToggle] = useState<UsersListUser | null>(null)

  const [loading, , , getUsers] = useServerAction(GetAdminUsersAction)
  const [toggling, , , setUserDisabled] = useServerAction(SetUserDisabledAction)

  // a new role from the page's chips starts again from page 1
  useEffect(() => {
    setPage(1)
  }, [role])

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await getUsers({
        role,
        verified:
          verification === "all" ? undefined : verification === "verified",
        search: debouncedSearch,
        page,
        limit: PAGE_SIZE
      })
      if (res?.success && res.data) {
        setUsers(res.data.users)
        setPagination(res.data.pagination)
      }
    }
    fetchUsers()
  }, [role, verification, debouncedSearch, page])

  const total = pagination?.total ?? 0
  const totalPages = pagination?.totalPages ?? 1
  const currentPage = pagination?.page ?? page
  const pageStart = (currentPage - 1) * PAGE_SIZE

  // any filter change starts again from page 1
  const changeVerification = (value: string) => {
    setVerification(value as VerificationFilter)
    setPage(1)
  }
  const changeSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  // disables (Clerk ban) or re-enables the selected user
  const confirmToggle = async () => {
    if (!userToToggle) return
    const disabled = !userToToggle.disabled
    const name = FormatUserName(userToToggle.first_name, userToToggle.last_name)
    const res = await setUserDisabled(userToToggle.unique_id, disabled)
    if (res?.success) {
      setUsers((prev) =>
        prev.map((u) =>
          u.unique_id === userToToggle.unique_id ? { ...u, disabled } : u
        )
      )
      toast({
        title: disabled ? "User disabled" : "User enabled",
        description: disabled
          ? `${name} can no longer sign in.`
          : `${name} can sign in again.`
      })
    } else {
      toast({
        title: "Something went wrong",
        description: res?.error || "Failed to update user",
        variant: "destructive"
      })
    }
    setUserToToggle(null)
  }

  return (
    <Card className="min-w-0">
      <CardHeader className="p-4 sm:p-5 pb-0 sm:pb-0 space-y-4">
        <CardTitle className="text-sm">Users</CardTitle>

        {/* Search + verification filter */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => changeSearch(e.target.value)}
              placeholder="Search by name or email"
              className="pl-9"
            />
          </div>
          <Tabs value={verification} onValueChange={changeVerification}>
            <TabsList className="w-full justify-start overflow-x-auto md:w-auto">
              {USER_VERIFICATION_OPTIONS.map((o) => (
                <TabsTrigger key={o.value} value={o.value}>
                  {o.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5">
        <div className="overflow-x-auto rounded-lg border">
          <Table className="min-w-[56rem]">
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Last active</TableHead>
                <TableHead>Verification</TableHead>
                <TableHead>LinkedIn</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    No users match these filters.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => {
                  const badge = USER_VERIFICATION_BADGES[getVerification(user)]
                  return (
                    <TableRow key={user.unique_id}>
                      <TableCell className="font-medium">
                        <span className="inline-flex items-center gap-2 whitespace-nowrap">
                          {FormatUserName(user.first_name, user.last_name)}
                          {user.disabled && (
                            <Badge variant="destructive">Disabled</Badge>
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <span className="whitespace-nowrap">
                          {getUserRole(user)?.filter(Boolean).join(", ") || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {user.lastActive ? (
                          <>
                            <p>{formatRelativeTime(user.lastActive)}</p>
                            <p className="text-xs text-muted-foreground">
                              {moment(user.lastActive).format("MMM D, YYYY")}
                            </p>
                          </>
                        ) : (
                          <>
                            <p>Never</p>
                            <p className="text-xs text-muted-foreground">—</p>
                          </>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={badge.className}>
                          {badge.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.profile?.linkedin_url ? (
                          <Link
                            href={user.profile.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-primary underline underline-offset-2"
                          >
                            Click here
                          </Link>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Not added
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className={
                            user.disabled
                              ? undefined
                              : "text-destructive hover:text-destructive"
                          }
                          onClick={() => setUserToToggle(user)}
                        >
                          {user.disabled ? "Enable" : "Disable"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* same footer as the other paginated admin lists (e.g. RewardTypePanel) */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t pt-3">
          <span className="text-xs text-muted-foreground text-center sm:text-left">
            {total === 0
              ? "No users"
              : `Showing ${pageStart + 1}–${Math.min(pageStart + users.length, total)} of ${total.toLocaleString()}`}
          </span>
          {totalPages > 1 && (
            <div className="sm:ml-auto">
              <PaginationComponent
                pagination={{
                  total,
                  page: currentPage,
                  limit: PAGE_SIZE,
                  totalPages
                }}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      </CardContent>

      {/* Disable / enable confirmation */}
      <AlertDialog
        open={!!userToToggle}
        onOpenChange={(open) => !open && !toggling && setUserToToggle(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {userToToggle &&
                FormatUserName(
                  userToToggle.first_name,
                  userToToggle.last_name
                )}{" "}
              ({userToToggle?.email}){" "}
              {userToToggle?.disabled
                ? "will be able to sign in again."
                : "will be signed out and won't be able to sign in. Their posts and profile stay visible, and you can enable them again later."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={toggling}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                confirmToggle()
              }}
              disabled={toggling}
              className={
                userToToggle?.disabled
                  ? undefined
                  : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              }
            >
              {toggling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {userToToggle?.disabled ? "Enable" : "Disable"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
