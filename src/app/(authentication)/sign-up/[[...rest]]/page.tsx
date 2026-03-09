import React from "react"
import { SignUp } from "@clerk/nextjs"

function SignUpPage() {
  return <SignUp signInUrl="/sign-in" forceRedirectUrl={"/communities"} />
}

export default SignUpPage
