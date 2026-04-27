"use client"

import { useEffect, useRef, useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card"
import { Progress } from "@/src/components/ui/progress"
import { StepOne } from "./StepOne"
import { StepTwo } from "./StepTwo"
import { StepThree } from "./StepThree"
import { OnboardingCompletion } from "../TrustEngine/OnboardingCompletion"
import { DynamicIcon, IconName } from "lucide-react/dynamic"
import { SelectUser } from "@/src/db/schema"
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import { useRouter } from "next/navigation"
import Loader from "../common/Loader/Loader"
import { LoaderSizes } from "../common/types/loader-types"

interface ProfileCompletionFormProps {
  isTrustEngineEnabled: boolean
  initialUser: SelectUser
}

export default function ProfileCompletionForm({
  isTrustEngineEnabled,
  initialUser
}: ProfileCompletionFormProps) {
  const [step, setStep] = useState(1)
  const [user, setUser] = useState<SelectUser>(initialUser)
  const [isLoadingUser, setIsLoadingUser] = useState(false)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const fetchUserData = async () => {
      setIsLoadingUser(true)
      const currUser = await AuthUserAction()
      if (currUser) {
        setUser(currUser)
      }
      setIsLoadingUser(false)
    }
    fetchUserData()
  }, [step])

  const steps = [
    {
      title: "Personal Info",
      icon: "user"
    },
    {
      title: "Education",
      icon: "graduation-cap"
    },
    {
      title: "Social Links",
      icon: "link-2"
    },
    {
      title: "Complete",
      icon: "check-circle"
    }
  ]
  const progress = ((step - 1) / 3) * 100

  const router = useRouter()

  useEffect(() => {
    if (step === 4 && !isTrustEngineEnabled) {
      router.push("/profile")
    }
  }, [step, isTrustEngineEnabled, router])

  return (
    <Card className="w-full">
      <CardHeader className="space-y-4">
        {/* <CardTitle className="text-2xl">Complete Your Profile</CardTitle> */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            {steps.map((label, index) => (
              <span
                key={label.title}
                className={`
                  flex flex-col items-center align-middle 
                  ${
                    step >= index + 1
                      ? "text-primary border-primary"
                      : step === index + 1
                        ? "text-foreground border-foreground"
                        : "text-muted-foreground border-muted-foreground"
                  }`}
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-2">
                  <DynamicIcon
                    name={label.icon as IconName}
                    className="h-4 w-4"
                  />
                </div>
                {label.title}
              </span>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {isLoadingUser ? (
          <div className="flex items-center justify-center h-64">
            <Loader size={LoaderSizes.lg} />
          </div>
        ) : (
          <>
            {step === 1 && user && (
              <StepOne
                step={step}
                setStep={setStep}
                user={user}
                setUser={setUser}
              />
            )}
            {step === 2 && user && (
              <StepTwo
                step={step}
                setStep={setStep}
                user={user}
                setUser={setUser}
              />
            )}
            {step === 3 && user && (
              <StepThree
                step={step}
                setStep={setStep}
                user={user}
                setUser={setUser}
              />
            )}
            {step === 4 && isTrustEngineEnabled && (
              <OnboardingCompletion
                redirectTo="/profile"
                buttonLabel="Go to Profile"
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
