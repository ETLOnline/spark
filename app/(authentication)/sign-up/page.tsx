import Container from '@/components/container/Container'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React from 'react'
import { Separator } from '@/components/ui/separator'


function SignUp() {
  return (

    <>

      <div className='text-center justify-start'>
        <h1 className='font-bold text-3xl'>Sign Up</h1>
        <p>For All Your Mentoring Needs</p>
      </div>
      <div className='flex w-full gap-3 justify-between'>
        <Input id="fname" title='First Name' type='text' />
        <Input id="lname" title='Last Name' type='text' />
      </div>


      <Input id="input" title="Email" type="email" />

      <div className="flex w-full gap-3 justify-between">
        <Input type='password' id='password' title='Password' />
        <Input id='input' title='Confirm Password' type='password' />
      </div>
      <div className="text-center mt-4">
        <Button>Sign Up</Button>
      </div>

      <div className="text-center">
        <p>Already have an account?<Button variant={'link'} className='link-button'>Login</Button></p>
      </div>

      <Separator className='mt-10' />

      <div>

      </div>
    </>
  )
}

export default SignUp