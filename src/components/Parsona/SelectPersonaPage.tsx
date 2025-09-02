"use client"

import { useEffect, useState } from "react"
import { Button } from "@/src/components/ui/button"
import Container from "@/src/components/container/Container"
import { Card, CardContent } from "@/src/components/ui/card"
import { Check } from "lucide-react"
import { cn } from "@/src/lib/utils"
import {
  getUserAssignedRoleAction,
  savePersonaAction
} from "@/src/server-actions/UserRoles/UserRole"
import { useServerAction } from "@/src/hooks/useServerAction"
import { SelectRole, SelectUser } from "@/src/db/schema"
import { useRouter } from "next/navigation"
import { toast } from "@/src/hooks/use-toast"
import { useSetAtom } from "jotai"
import { userStore } from "@/src/store/user/userStore"
import { useAuthUser } from "@/src/hooks/useAuthUser"

interface SelectPersonaPageProps {
  roles: SelectRole[]
  userAuth: SelectUser
}

export default function SelectPersonaPage({
  roles,
  userAuth
}: SelectPersonaPageProps) {
  const { refreshAuthUser, isReloadingPermissions } = useAuthUser()
  const [selectedPersona, setSelectedPersona] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const [savingPersona, saveResult, saveError, executeSavePersona] =
    useServerAction(savePersonaAction)

  const handleSelectPersona = (personaId: number) =>
    setSelectedPersona(personaId)

  useEffect(() => {
    ;(async () => {
      const result = await getUserAssignedRoleAction(userAuth.unique_id)
      if (result?.success) {
        router.push("/profile-completion")
      }
    })()
  }, [userAuth.unique_id, router])

  const handleContinue = async () => {
    if (!selectedPersona) return
    setIsLoading(true)
    try {
      const attachPersona = await executeSavePersona(
        selectedPersona,
        userAuth.unique_id,
        userAuth.external_auth_id
      )
      if (attachPersona && attachPersona.success) {
        await refreshAuthUser()
        toast({ title: "Persona saved successfully" })
        router.push("/profile-complition")
      }
    } catch (error) {
      console.log(error)
      toast({ title: "Failed to save persona 2", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 dark:from-background dark:via-background dark:to-muted/10 mt-14">
      <Container>
        <div className="flex items-center justify-center min-h-screen py-8 px-4">
          <div className="w-full max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Let's personalize your experience
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Select a role that best describes you to get started with a
              tailored experience
            </p>

            <div className="grid grid-cols-1 sm:[grid-template-columns:repeat(auto-fit,minmax(0,1fr))]  gap-4 sm:gap-6 mt-12">
              {roles?.map((role) => (
                <Card
                  key={role.id}
                  className={cn(
                    "relative cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg",
                    "border-2 bg-card/50 backdrop-blur-sm",
                    selectedPersona === role.id
                      ? "border-primary shadow-lg shadow-primary/20 bg-primary/5"
                      : "border-border hover:border-primary/50",
                    "dark:bg-card/30 dark:backdrop-blur-sm"
                  )}
                  onClick={() => handleSelectPersona(role.id)}
                >
                  <CardContent className="flex flex-col items-center justify-center p-6 h-full min-h-[200px] relative">
                    {selectedPersona === role.id && (
                      <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                    <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                      {role.name}
                    </h3>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="pt-8">
              <Button
                onClick={handleContinue}
                loading={isLoading}
                disabled={!selectedPersona || isLoading}
                size="lg"
                className="px-8 py-3 text-lg font-medium min-w-[160px]"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  "Continue"
                )}
              </Button>

              {!selectedPersona && (
                <p className="text-sm text-muted-foreground mt-3">
                  Please select a persona to continue
                </p>
              )}
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}
