"use client"

import { useEffect, useState } from "react"
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
import { DynamicIcon, IconName } from "lucide-react/dynamic"
import { SelectUser } from "@/src/db/schema"
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"

export default function ProfileCompletionForm() {
  const [step, setStep] = useState(1)
  const [user, setUser] = useState<SelectUser>()

  useEffect(() => {
    const fetchUserData = async () => {
      const currUser = await AuthUserAction()

      if (currUser) {
        setUser(currUser)
      }
    }
    fetchUserData()
  }, [])

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
    }
  ]
  const progress = ((step - 1) / 2) * 100

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
                    step > index + 1
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
      </CardContent>
    </Card>
  )
}
