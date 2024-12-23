"use client"

import "./header.css"
import { LinkAsButton } from "@/src/components/LinkAsButton/LinkAsButton"
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import Navbar from "../NavBar/NavbarComponent"
import ModeToggle from "../ThemeProvider/ThemeToggle"
// import { CreateServerAction } from "@/src/server-actions"
import { CreateUser } from "@/src/db/data-access/user/query"
import { InsertUser } from "@/src/db/schema"

const addUser = async () => {
  try {
    const newUser: InsertUser = {
      first_name: "test",
      last_name: "user",
      email: "test@user.com",
      external_auth_id: "wasdtygh",
      profile_url: "user.test.com",
      meta: "test user metadata"
    }
    const res = await CreateUser(newUser)
    console.log("user created", res)
    return { success: true, data: res }
  } catch (error) {
    console.log("user created error", error)
    return { error: error }
  }
}

function Header() {
  return (
    <div className="header">
      <Navbar />
      <div className="button-wrapper">
        <SignedIn>
          <UserButton userProfileUrl="/profile" />
        </SignedIn>
        <SignedOut>
          <LinkAsButton href="/sign-up" className="button" variant={"ghost"}>
            Sign Up
          </LinkAsButton>
          <LinkAsButton href="/sign-in" variant={"default"}>
            Log In
          </LinkAsButton>
        </SignedOut>
        <ModeToggle />
      </div>
    </div>
  )
}

export default Header
