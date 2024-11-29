import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import React from 'react'

const Signin = () => {
    return (
        <>

            <div className='text-center justify-start'>
                <h1 className='font-bold text-3xl'>Sign Up</h1>
                <p>For All Your Mentoring Needs</p>
            </div>



            <Input id="input" title="Email" type="email" />
            <Input type='password' id='password' title='Password' />



            <div className="text-center mt-4">
                <Button>Sign In</Button>

            </div>


            <div className="text-center">
                <p>Already have an account?<Button variant={'link'} className='link-button'>Login</Button></p>
            </div>
        </>
    )
}

export default Signin