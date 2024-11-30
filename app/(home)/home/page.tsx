import Image from "next/image";
import './home.css'
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
export default function Home() {
  return (

    <>
      <div className="hero">

        <div className="Heading">
          <h1 className="Main-Heading">Find nad Book a Mentor for your 1:1 help today!</h1>
          <p>We have our 200 Mentor available, qualified in over 300 subjects</p>
          <Button variant={'outline'}>Find a Mentor</Button>
        </div>

        <div className="avatars">
          <div className="absolute top-[-100px] left-[140px]">
            <Avatar>
              <AvatarImage src="/avatar1.jpg" />
              <AvatarFallback>avatar-1</AvatarFallback>
            </Avatar>
          </div>

          <div className="absolute top-[-150px] left-[410px]">
            <Avatar>
              <AvatarImage src="/avatar2.jpg" />
              <AvatarFallback>avatar-1</AvatarFallback>
            </Avatar>
          </div>

          <div className="absolute top-[-40px] left-[280px]">
            <Avatar>
              <AvatarImage src="/avatar3.jpg" />
              <AvatarFallback>avatar-1</AvatarFallback>
            </Avatar>
          </div>

          <div className="absolute top-[40px] left-[170px]">
            <Avatar>
              <AvatarImage src="/avatar4.jpg" />
              <AvatarFallback>avatar-1</AvatarFallback>
            </Avatar>
          </div>

          <div className="absolute top-[80px] left-[280px]">
            <Avatar>
              <AvatarImage src="/avatar5.jpg" />
              <AvatarFallback>avatar-1</AvatarFallback>
            </Avatar>
          </div>

          <div className="absolute top-[20px] left-[400px]">
            <Avatar>
              <AvatarImage src="/avatar6.jpg" />
              <AvatarFallback>avatar-1</AvatarFallback>
            </Avatar>
          </div>

        </div>
      </div>
    </>
  );
}
