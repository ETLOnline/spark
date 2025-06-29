import React from "react"
import { SignUp } from "@clerk/nextjs"

function SignUpPage() {
  return <SignUp signInUrl="/sign-in" forceRedirectUrl={"/profile"} />
}

export default SignUpPage
