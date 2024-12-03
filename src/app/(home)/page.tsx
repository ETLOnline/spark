import './home.css'
import { Button } from "@/src/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Carousel, CarouselContent, CarouselItem } from "@/src/components/ui/carousel";
import LogoCards from "@/src/components/logocards";
import MentorCard from "@/src/components/mentorcard";
import SessionCard from '@/src/components/sessioncard';


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
          <div className="absolute md:top-[-260px] md:left-[20px] top-[-220px] left-[140px] ">
            <Avatar className="w-20 h-20">
              <AvatarImage src="/avatar1.jpg" />
              <AvatarFallback>avatar-1</AvatarFallback>
            </Avatar>
          </div>

          <div className="absolute md:top-[-240px] left-[310px] lg:top-[-250px] lg:left-[510px]">
            <Avatar className="w-20 h-20">
              <AvatarImage src="/avatar2.jpg" />
              <AvatarFallback>avatar-1</AvatarFallback>
            </Avatar>
          </div>

          <div className="absolute md:top-[-145px] md:left-[140px] lg:top-[-110px] lg:left-[280px]">
            <Avatar className="w-20 h-20">
              <AvatarImage src="/avatar3.jpg" />
              <AvatarFallback>avatar-1</AvatarFallback>
            </Avatar>
          </div>

          <div className="absolute md:top-[70px] left-[40px] lg:top-[140px] lg:left-[180px]">
            <Avatar className="w-20 h-20">
              <AvatarImage src="/avatar4.jpg" />
              <AvatarFallback>avatar-1</AvatarFallback>
            </Avatar>
          </div>

          <div className="absolute md:top-[140px] left-[250px] lg:top-[180px] lg:left-[380px]">
            <Avatar className="w-20 h-20">
              <AvatarImage src="/avatar5.jpg" />
              <AvatarFallback>avatar-1</AvatarFallback>
            </Avatar>
          </div>

          <div className="absolute md:top-[-25px] left-[280px] lg:top-[20px] lg:left-[600px]">
            <Avatar className="w-20 h-20">
              <AvatarImage src="/avatar6.jpg" />
              <AvatarFallback>avatar-1</AvatarFallback>
            </Avatar>
          </div>

        </div>
      </div>

      <h1 className="Mentors">
        Featured Mentors
      </h1>

      <Carousel>
        <CarouselContent className='lg:gap-8 ml-4'>
          <CarouselItem>
            <MentorCard imgURL="mentor-image1.jpg" Tittle="Tom Jones" Duration="200+ hrs" />
          </CarouselItem>

          <CarouselItem>
            <MentorCard imgURL="mentor-image2.jpg" Tittle="Holly Fax" Duration="100+ hrs" />
          </CarouselItem>

          <CarouselItem>
            <MentorCard imgURL="mentor-image3.jpg" Tittle="Valerie" Duration="400+ hrs" />
          </CarouselItem>

          <CarouselItem>
            <MentorCard imgURL="mentor-image4.jpg" Tittle="James Dean" Duration="200+ hrs" />
          </CarouselItem>

          <CarouselItem>
            <MentorCard imgURL="mentor-image1.jpg" Tittle="Tom Jones" Duration="200+ hrs" />
          </CarouselItem>

          <CarouselItem>
            <MentorCard imgURL="mentor-image2.jpg" Tittle="Tom Jones" Duration="200+ hrs" />
          </CarouselItem>

          <CarouselItem>
            <MentorCard imgURL="mentor-image3.jpg" Tittle="Tom Jones" Duration="200+ hrs" />
          </CarouselItem>

          <CarouselItem>
            <MentorCard imgURL="mentor-image4.jpg" Tittle="Tom Jones" Duration="200+ hrs" />
          </CarouselItem>

        </CarouselContent>
      </Carousel>

      <div className="statment">
        <h1 className="font-bold text-3xl">Helping the world one mentor at a time</h1>
        <p className="pt-4 pb-4">sifting through the overwhelming content on the internet will slow you down.break through the <br /> noise abd get specific advice directly from the experts.</p>
        <Button variant={'outline'}>Let's Find a Mentor</Button>
      </div>


      <h1 className="font-bold text-xl text-center mt-6 mb-6">In Demand Skills</h1>

      <div className="flex flex-row justify-between mx-8">
        <LogoCards imgURL="next.png" imgALT="next" Tittle="react"></LogoCards>
        <LogoCards imgURL="node.png" imgALT="Nodejs" Tittle="Nodejs"></LogoCards>
        <LogoCards imgURL="graphic.png" imgALT="graphic" Tittle="Graphic Design"></LogoCards>
      </div>

      <div className=" mt-8 flex flex-row justify-around">
        <LogoCards imgURL="java.jpg" imgALT="javascript" Tittle="JavaScript"></LogoCards>
        <LogoCards imgURL="ux.svg" imgALT="ux" Tittle="Ux Design"></LogoCards>
      </div>

      <div className="mt-8 flex flex-row justify-between mx-8">
        <LogoCards imgURL="next.png" imgALT="next" Tittle="react"></LogoCards>
        <LogoCards imgURL="node.png" imgALT="Nodejs" Tittle="Nodejs"></LogoCards>
        <LogoCards imgURL="graphic.png" imgALT="graphic" Tittle="Graphic Design"></LogoCards>
      </div>

      <div className="text-center mt-20 mb-8">
        <h1 className='font-bold text-xl mb-4'>Upcoming Sessions</h1>
        <p>Sign Up to one of our session and start your journey</p>
      </div>

      <div className='session-cards'>
        <SessionCard imgURL='session-image1.jpg' Tittle='Everthing Design' />

        <SessionCard imgURL='session-image2.jpg' Tittle='Coding Newbies' />

        <SessionCard imgURL='session-image3.jpg' Tittle='Project planning' />

        <SessionCard imgURL='session-image4.jpg' Tittle='Quality Assurence' />
      </div>
      <div className='text-center mt-8 mb-10'>
        <Button variant={'secondary'}>Learn more</Button>
      </div>

    </>
  );
}
