import Image from "next/image";
import './home.css'
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
export default function Home() {
  return (
    <>
      <div className="hero">

        <div className="content">
          <h1 className="Main-Heading">Find and Book a Mentor for your 1:1 help today!</h1>
          <p>We have our 200 Mentor available, qualified in over 300 subjects</p>
          <Button size={'lg'} variant={'outline'} width={'fit'} >Find a Mentor</Button>
        </div>

        <div className="avatars relative">
          <div className="absolute top-[-220px] left-[140px] ">
            <Avatar className="w-20 h-20">
              <AvatarImage src="/avatar1.jpg" />
              <AvatarFallback>avatar-1</AvatarFallback>
            </Avatar>
          </div>

          <div className="absolute top-[-250px] left-[510px]">
            <Avatar className="w-20 h-20">
              <AvatarImage src="/avatar2.jpg" />
              <AvatarFallback>avatar-1</AvatarFallback>
            </Avatar>
          </div>

          <div className="absolute top-[-110px] left-[280px]">
            <Avatar className="w-20 h-20">
              <AvatarImage src="/avatar3.jpg" />
              <AvatarFallback>avatar-1</AvatarFallback>
            </Avatar>
          </div>

          <div className="absolute top-[140px] left-[180px]">
            <Avatar className="w-20 h-20">
              <AvatarImage src="/avatar4.jpg" />
              <AvatarFallback>avatar-1</AvatarFallback>
            </Avatar>
          </div>

          <div className="absolute top-[180px] left-[380px]">
            <Avatar className="w-20 h-20">
              <AvatarImage src="/avatar5.jpg" />
              <AvatarFallback>avatar-1</AvatarFallback>
            </Avatar>
          </div>

          <div className="absolute top-[20px] left-[600px]">
            <Avatar className="w-20 h-20">
              <AvatarImage src="/avatar6.jpg" />
              <AvatarFallback>avatar-1</AvatarFallback>
            </Avatar>
          </div>

        </div>
      </div>
    </>
  );
}
