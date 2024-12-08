import './style.css'
import { Button } from "@/src/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Carousel, CarouselContent, CarouselItem } from "@/src/components/ui/carousel";
import SkillTag from "@/src/components/HomePageComponents/SkillTag/SkillTag";
import MentorCard from "@/src/components/HomePageComponents/MentorCard/MentorCard";
import SessionCard from '@/src/components/HomePageComponents/SessionCard/SessionCard';
import Container from '@/src/components/container/Container';


export default function Home() {
  return (
    <>
      <div className="hero h-screen">
        <Container>
          <div className='flex items-center justify-center h-screen w-full '>
            <div className="hero-content ">
              <h1 className="Main-Heading">Find and Book a Mentor for your 1:1 help today!</h1>
              <p>We have our 200 Mentor available, qualified in over 300 subjects</p>
              <Button size={'lg'} variant={'outline'} width={'fit'} >Find a Mentor</Button>
            </div>

            <div className="avatars relative">
              <div className="absolute md:top-[-260px] md:left-[20px] top-[-220px] left-[140px]">
                <Avatar className="w-16 h-16">
                  <AvatarImage src="/images/home/avatar1.jpg" />
                  <AvatarFallback>avatar-1</AvatarFallback>
                </Avatar>
              </div>

              <div className="absolute md:top-[-240px] md:left-[330px] lg:top-[-250px] lg:left-[500px]">
                <Avatar className="w-16 h-16">
                  <AvatarImage src="/images/home/avatar2.jpg" />
                  <AvatarFallback>avatar-1</AvatarFallback>
                </Avatar>
              </div>

              <div className="absolute md:top-[-145px] md:left-[140px] lg:top-[-110px] lg:left-[280px]">
                <Avatar className="w-16 h-16">
                  <AvatarImage src="/images/home/avatar3.jpg" />
                  <AvatarFallback>avatar-1</AvatarFallback>
                </Avatar>
              </div>

              <div className="absolute md:top-[70px] left-[40px] lg:top-[140px] lg:left-[180px]">
                <Avatar className="w-16 h-16">
                  <AvatarImage src="/images/home/avatar4.jpg" />
                  <AvatarFallback>avatar-1</AvatarFallback>
                </Avatar>
              </div>

              <div className="absolute md:top-[140px] left-[250px] lg:top-[180px] lg:left-[380px]">
                <Avatar className="w-16 h-16">
                  <AvatarImage src="/images/home/avatar5.jpg" />
                  <AvatarFallback>avatar-1</AvatarFallback>
                </Avatar>
              </div>

              <div className="absolute md:top-[-25px] left-[365px] lg:top-[20px] lg:left-[507px]">
                <Avatar className="w-16 h-16">
                  <AvatarImage src="/images/home/avatar6.jpg" />
                  <AvatarFallback>avatar-1</AvatarFallback>
                </Avatar>
              </div>

            </div>

          </div>
        </Container>
      </div>

      <div className='section'>

        <h1 className="section-title ml-8">
          Featured Mentors
        </h1>

        <div className="section-content">
          <Carousel>
            <CarouselContent className="carousel-content">
              <CarouselItem>
                <MentorCard imgURL="/images/home/mentor-image1.jpg" title="Tom Jones" duration="200+ hrs" />
              </CarouselItem>

              <CarouselItem>
                <MentorCard imgURL="/images/home/mentor-image2.jpg" title="Holly Fax" duration="100+ hrs" />
              </CarouselItem>

              <CarouselItem>
                <MentorCard imgURL="/images/home/mentor-image3.jpg" title="Valerie" duration="400+ hrs" />
              </CarouselItem>

              <CarouselItem>
                <MentorCard imgURL="/images/home/mentor-image4.jpg" title="James Dean" duration="200+ hrs" />
              </CarouselItem>

              <CarouselItem>
                <MentorCard imgURL="/images/home/mentor-image1.jpg" title="Tom Jones" duration="200+ hrs" />
              </CarouselItem>

              <CarouselItem>
                <MentorCard imgURL="/images/home/mentor-image2.jpg" title="Tom Jones" duration="200+ hrs" />
              </CarouselItem>

              <CarouselItem>
                <MentorCard imgURL="/images/home/mentor-image3.jpg" title="Tom Jones" duration="200+ hrs" />
              </CarouselItem>

              <CarouselItem>
                <MentorCard imgURL="/images/home/mentor-image4.jpg" title="Tom Jones" duration="200+ hrs" />
              </CarouselItem>

            </CarouselContent>
          </Carousel>
        </div>
      </div>

      <div className='hero'>
        <Container>
          <div className="section">
            <h1 className="section-title text-center">Helping the world one mentor at a time</h1>
            <div className="section-text text-center">
              <p className='pb-4'>sifting through the overwhelming content on the internet will slow you down.break through the <br /> noise abd get specific advice directly from the experts.</p>
              <Button variant={'outline'}>Let's Find a Mentor</Button>
            </div>
          </div>
        </Container>

      </div>

      <Container>
        <div className="section">
          <h1 className="section-title text-center ">In Demand Skills</h1>
          <div className="section-content">

            <div className="section-content-wrapper justify-around md:justify-between">
              <SkillTag imgURL="/images/home/next.png" imgALT="next" title="react" />
              <SkillTag imgURL="/images/home/node.png" imgALT="Nodejs" title="Nodejs" />
              <SkillTag imgURL="/images/home/graphic.png" imgALT="graphic" title="Graphic Design" />
            </div>

            <div className="section-content-wrapper justify-around">
              <SkillTag imgURL="/images/home/java.jpg" imgALT="javascript" title="JavaScript" />
              <SkillTag imgURL="/images/home/ux.svg" imgALT="ux" title="Ux Design" />
            </div>

            <div className="section-content-wrapper justify-around md:justify-between ">
              <SkillTag imgURL="/images/home/next.png" imgALT="next" title="react" />
              <SkillTag imgURL="/images/home/node.png" imgALT="Nodejs" title="Nodejs" />
              <SkillTag imgURL="/images/home/graphic.png" imgALT="graphic" title="Graphic Design" />
            </div>

          </div>

        </div>

      </Container>

      <Container>
        <div className="section">

          <div className="section-title text-center">
            <h1>Upcoming Sessions</h1>
          </div>
          <div className="section-text text-center">
            <p>Sign Up to one of our session and start your journey</p>
          </div>



          <div className="section-card">
            <SessionCard imgURL='/images/home/session-image1.jpg' title='Everthing Design' />

            <SessionCard imgURL='/images/home/session-image2.jpg' title='Coding Newbies' />

            <SessionCard imgURL='/images/home/session-image3.jpg' title='Project planning' />

            <SessionCard imgURL='/images/home/session-image4.jpg' title='Quality Assurence' />
          </div>
          <div className='section-button'>
            <Button variant={'secondary'}>Learn more</Button>
          </div>
        </div>

      </Container>


    </>
  );
}
