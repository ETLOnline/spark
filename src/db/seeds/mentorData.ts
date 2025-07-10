import { db } from "../index"
import { usersTable, profileTable, tagsTable, userTagsTable, rolesTable, userRolesTable, mentorRatingsTable, mentorRelationshipsTable } from "../schema"
import { eq } from "drizzle-orm"

export const seedMentorData = async () => {
  console.log("🌱 Seeding mentor data...")

  try {
    // 1. First, ensure mentor role exists
    const mentorRole = await db.select().from(rolesTable).where(eq(rolesTable.name, "mentor")).limit(1)
    let mentorRoleId: number

    if (mentorRole.length === 0) {
      const [newRole] = await db.insert(rolesTable).values({
        name: "mentor",
        role_type: "user_role",
        slug: "mentor"
      }).returning()
      mentorRoleId = newRole.id
      console.log("✅ Created mentor role")
    } else {
      mentorRoleId = mentorRole[0].id
      console.log("✅ Mentor role already exists")
    }

    // 2. Create mentor users
    const mentorUsers = [
      {
        first_name: "Dr. Sarah",
        last_name: "Johnson",
        email: "sarah.johnson@mentor.com",
        external_auth_id: "mentor_sarah_123",
        role: "mentor",
        profile_url: "https://example.com/sarah.jpg"
      },
      {
        first_name: "Prof. Michael",
        last_name: "Chen",
        email: "michael.chen@mentor.com",
        external_auth_id: "mentor_michael_456",
        role: "mentor",
        profile_url: "https://example.com/michael.jpg"
      },
      {
        first_name: "Dr. Emily",
        last_name: "Rodriguez",
        email: "emily.rodriguez@mentor.com",
        external_auth_id: "mentor_emily_789",
        role: "mentor",
        profile_url: "https://example.com/emily.jpg"
      },
      {
        first_name: "Dr. James",
        last_name: "Thompson",
        email: "james.thompson@mentor.com",
        external_auth_id: "mentor_james_101",
        role: "mentor",
        profile_url: "https://example.com/james.jpg"
      },
      {
        first_name: "Dr. Aisha",
        last_name: "Patel",
        email: "aisha.patel@mentor.com",
        external_auth_id: "mentor_aisha_202",
        role: "mentor",
        profile_url: "https://example.com/aisha.jpg"
      },
      {
        first_name: "Prof. David",
        last_name: "Kim",
        email: "david.kim@mentor.com",
        external_auth_id: "mentor_david_303",
        role: "mentor",
        profile_url: "https://example.com/david.jpg"
      }
    ]

    // Insert mentor users (or get existing ones)
    const insertedMentors = []
    for (const mentorData of mentorUsers) {
      try {
        const [existingUser] = await db.select().from(usersTable).where(eq(usersTable.email, mentorData.email)).limit(1)
        
        if (existingUser) {
          insertedMentors.push(existingUser)
          console.log(`✅ Mentor ${mentorData.first_name} ${mentorData.last_name} already exists`)
        } else {
          const [newUser] = await db.insert(usersTable).values(mentorData).returning()
          insertedMentors.push(newUser)
          console.log(`✅ Created mentor user: ${mentorData.first_name} ${mentorData.last_name}`)
        }
      } catch (error) {
        console.log(`⚠️ Mentor ${mentorData.first_name} ${mentorData.last_name} might already exist, skipping...`)
      }
    }

    // 3. Assign mentor role to users
    for (const mentor of insertedMentors) {
      try {
        const [existingRole] = await db.select().from(userRolesTable)
          .where(eq(userRolesTable.user_id, mentor.unique_id))
          .limit(1)

        if (!existingRole) {
          await db.insert(userRolesTable).values({
            user_id: mentor.unique_id,
            role_id: mentorRoleId
          })
          console.log(`✅ Assigned mentor role to ${mentor.first_name} ${mentor.last_name}`)
        }
      } catch (error) {
        console.log(`⚠️ Role assignment might already exist for ${mentor.first_name} ${mentor.last_name}`)
      }
    }

    // 4. Create mentor profiles
    const mentorProfiles = [
      {
        user_id: insertedMentors[0]?.unique_id,
        bio: "Experienced AI researcher with 12+ years in machine learning and deep learning. Published author and startup advisor.",
        degree: "PhD in Computer Science",
        institute: "Stanford University",
        linkedin_url: "https://linkedin.com/in/sarahjohnson",
        github_url: "https://github.com/sarahjohnson",
        company: "Google AI",
        job_title: "Senior AI Research Scientist",
        location: "San Francisco, CA",
        years_experience: 12,
        languages: ["English", "Spanish"],
        availability_status: "true",
        response_time: "< 2 hours",
        mentee_count: 45
      },
      {
        user_id: insertedMentors[1]?.unique_id,
        bio: "Business strategy expert and entrepreneur. Former McKinsey consultant, founded 2 successful startups.",
        degree: "MBA",
        institute: "Harvard Business School",
        linkedin_url: "https://linkedin.com/in/michaelchen",
        company: "Venture Capital Partners",
        job_title: "Managing Partner",
        location: "New York, NY",
        years_experience: 15,
        languages: ["English", "Mandarin"],
        availability_status: "true",
        response_time: "< 4 hours",
        mentee_count: 38
      },
      {
        user_id: insertedMentors[2]?.unique_id,
        bio: "Leading cardiologist and medical researcher specializing in preventive cardiology and patient care innovation.",
        degree: "MD, PhD",
        institute: "Johns Hopkins University",
        linkedin_url: "https://linkedin.com/in/emilyrodriguez",
        company: "Mayo Clinic",
        job_title: "Chief of Cardiology",
        location: "Rochester, MN",
        years_experience: 18,
        languages: ["English", "Spanish"],
        availability_status: "true",
        response_time: "< 6 hours",
        mentee_count: 52
      },
      {
        user_id: insertedMentors[3]?.unique_id,
        bio: "Software engineering leader with expertise in distributed systems and cloud architecture. Ex-Netflix, ex-Amazon.",
        degree: "MS Computer Science",
        institute: "MIT",
        linkedin_url: "https://linkedin.com/in/jamesthompson",
        github_url: "https://github.com/jamesthompson",
        company: "Netflix",
        job_title: "Staff Software Engineer",
        location: "Seattle, WA",
        years_experience: 10,
        languages: ["English"],
        availability_status: "true",
        response_time: "< 3 hours",
        mentee_count: 29
      },
      {
        user_id: insertedMentors[4]?.unique_id,
        bio: "Product design leader focused on UX research and design systems. Passionate about accessible and inclusive design.",
        degree: "MS in Human-Computer Interaction",
        institute: "Carnegie Mellon University",
        linkedin_url: "https://linkedin.com/in/aishapateld",
        company: "Figma",
        job_title: "Senior Product Designer",
        location: "San Francisco, CA",
        years_experience: 8,
        languages: ["English", "Hindi", "Gujarati"],
        availability_status: "true",
        response_time: "< 4 hours",
        mentee_count: 33
      },
      {
        user_id: insertedMentors[5]?.unique_id,
        bio: "Mechanical engineering professor and robotics researcher. Expert in automation and manufacturing processes.",
        degree: "PhD in Mechanical Engineering",
        institute: "University of California, Berkeley",
        linkedin_url: "https://linkedin.com/in/davidkim",
        company: "UC Berkeley",
        job_title: "Professor of Mechanical Engineering",
        location: "Berkeley, CA",
        years_experience: 14,
        languages: ["English", "Korean"],
        availability_status: "false",
        response_time: "< 12 hours",
        mentee_count: 41
      }
    ]

    // Insert mentor profiles
    for (let i = 0; i < mentorProfiles.length; i++) {
      if (mentorProfiles[i].user_id) {
        try {
          const [existingProfile] = await db.select().from(profileTable)
            .where(eq(profileTable.user_id, mentorProfiles[i].user_id!))
            .limit(1)

          if (existingProfile) {
            // Update existing profile with mentor data
            await db.update(profileTable)
              .set(mentorProfiles[i])
              .where(eq(profileTable.user_id, mentorProfiles[i].user_id!))
            console.log(`✅ Updated profile for mentor ${i + 1}`)
          } else {
            await db.insert(profileTable).values(mentorProfiles[i])
            console.log(`✅ Created profile for mentor ${i + 1}`)
          }
        } catch (error) {
          console.log(`⚠️ Profile for mentor ${i + 1} might already exist, trying to update...`)
        }
      }
    }

    // 5. Create tags for skills and interests
    const skillTags = [
      "Machine Learning", "Python", "Data Science", "AI", "Deep Learning",
      "Business Strategy", "Consulting", "Entrepreneurship", "Venture Capital",
      "Cardiology", "Medical Research", "Patient Care", "Medical Education",
      "Software Engineering", "Distributed Systems", "Cloud Computing", "DevOps",
      "UX Design", "Product Design", "Design Systems", "User Research",
      "Mechanical Engineering", "Robotics", "Automation", "Manufacturing"
    ]

    const interestTags = [
      "Research", "Startups", "Teaching", "Medical Research", "Global Health",
      "Innovation", "Technology", "Healthcare", "Education", "Mentoring",
      "Leadership", "Product Development", "Sustainability", "Accessibility"
    ]

    // Insert skill tags
    const insertedSkillTags = []
    for (const skill of skillTags) {
      try {
        const [existingTag] = await db.select().from(tagsTable)
          .where(eq(tagsTable.name, skill))
          .limit(1)

        if (existingTag) {
          insertedSkillTags.push(existingTag)
        } else {
          const [newTag] = await db.insert(tagsTable).values({
            name: skill,
            type: "skill",
            count: 1
          }).returning()
          insertedSkillTags.push(newTag)
        }
      } catch (error) {
        console.log(`⚠️ Skill tag ${skill} might already exist`)
      }
    }

    // Insert interest tags
    const insertedInterestTags = []
    for (const interest of interestTags) {
      try {
        const [existingTag] = await db.select().from(tagsTable)
          .where(eq(tagsTable.name, interest))
          .limit(1)

        if (existingTag) {
          insertedInterestTags.push(existingTag)
        } else {
          const [newTag] = await db.insert(tagsTable).values({
            name: interest,
            type: "interest",
            count: 1
          }).returning()
          insertedInterestTags.push(newTag)
        }
      } catch (error) {
        console.log(`⚠️ Interest tag ${interest} might already exist`)
      }
    }

    console.log(`✅ Created/verified ${insertedSkillTags.length} skill tags and ${insertedInterestTags.length} interest tags`)

    // 6. Assign tags to mentors
    const mentorTagAssignments = [
      // Sarah Johnson (AI Researcher)
      {
        mentor_idx: 0,
        skills: ["Machine Learning", "Python", "Data Science", "AI", "Deep Learning"],
        interests: ["Research", "Innovation", "Technology", "Teaching"]
      },
      // Michael Chen (Business)
      {
        mentor_idx: 1,
        skills: ["Business Strategy", "Consulting", "Entrepreneurship", "Venture Capital"],
        interests: ["Startups", "Innovation", "Leadership", "Mentoring"]
      },
      // Emily Rodriguez (Medical)
      {
        mentor_idx: 2,
        skills: ["Cardiology", "Medical Research", "Patient Care", "Medical Education"],
        interests: ["Medical Research", "Global Health", "Teaching", "Healthcare"]
      },
      // James Thompson (Software Engineering)
      {
        mentor_idx: 3,
        skills: ["Software Engineering", "Distributed Systems", "Cloud Computing", "DevOps"],
        interests: ["Technology", "Innovation", "Teaching", "Product Development"]
      },
      // Aisha Patel (Design)
      {
        mentor_idx: 4,
        skills: ["UX Design", "Product Design", "Design Systems", "User Research"],
        interests: ["Innovation", "Accessibility", "Product Development", "Education"]
      },
      // David Kim (Engineering)
      {
        mentor_idx: 5,
        skills: ["Mechanical Engineering", "Robotics", "Automation", "Manufacturing"],
        interests: ["Research", "Innovation", "Sustainability", "Teaching"]
      }
    ]

    for (const assignment of mentorTagAssignments) {
      const mentor = insertedMentors[assignment.mentor_idx]
      if (!mentor) continue

      // Assign skill tags
      for (const skillName of assignment.skills) {
        const skillTag = insertedSkillTags.find(tag => tag.name === skillName)
        if (skillTag) {
          try {
            const [existing] = await db.select().from(userTagsTable)
              .where(eq(userTagsTable.user_id, mentor.unique_id))
              .limit(1)

            if (!existing) {
              await db.insert(userTagsTable).values({
                user_id: mentor.unique_id,
                tag_id: skillTag.id
              })
            }
          } catch (error) {
            // Tag assignment might already exist
          }
        }
      }

      // Assign interest tags
      for (const interestName of assignment.interests) {
        const interestTag = insertedInterestTags.find(tag => tag.name === interestName)
        if (interestTag) {
          try {
            const [existing] = await db.select().from(userTagsTable)
              .where(eq(userTagsTable.user_id, mentor.unique_id))
              .limit(1)

            if (!existing) {
              await db.insert(userTagsTable).values({
                user_id: mentor.unique_id,
                tag_id: interestTag.id
              })
            }
          } catch (error) {
            // Tag assignment might already exist
          }
        }
      }
    }

    console.log("✅ Assigned tags to mentors")

    // 7. Create some mentor ratings
    const sampleRatings = [
      { mentor_idx: 0, reviewer_email: "student1@example.com", rating: "4.8", review_text: "Excellent mentor! Very knowledgeable in AI and provided great guidance." },
      { mentor_idx: 0, reviewer_email: "student2@example.com", rating: "4.9", review_text: "Sarah helped me understand complex ML concepts. Highly recommend!" },
      { mentor_idx: 1, reviewer_email: "student3@example.com", rating: "4.7", review_text: "Great business insights and strategic thinking. Michael is very experienced." },
      { mentor_idx: 2, reviewer_email: "student4@example.com", rating: "4.9", review_text: "Dr. Rodriguez is an amazing mentor in the medical field. Very caring and knowledgeable." },
      { mentor_idx: 3, reviewer_email: "student5@example.com", rating: "4.6", review_text: "James provided excellent guidance on software architecture and system design." },
      { mentor_idx: 4, reviewer_email: "student6@example.com", rating: "4.8", review_text: "Aisha has great design thinking and helped me improve my UX skills significantly." }
    ]

    for (const rating of sampleRatings) {
      const mentor = insertedMentors[rating.mentor_idx]
      if (mentor) {
        try {
          // Create a dummy reviewer user if needed
          let reviewer
          try {
            [reviewer] = await db.select().from(usersTable).where(eq(usersTable.email, rating.reviewer_email)).limit(1)
            if (!reviewer) {
              [reviewer] = await db.insert(usersTable).values({
                first_name: "Student",
                last_name: `User${rating.mentor_idx + 1}`,
                email: rating.reviewer_email,
                external_auth_id: `student_${rating.mentor_idx + 1}_${Date.now()}`,
                role: "user"
              }).returning()
            }
          } catch (error) {
            continue // Skip if reviewer creation fails
          }

          await db.insert(mentorRatingsTable).values({
            mentor_id: mentor.unique_id,
            reviewer_id: reviewer.unique_id,
            rating: rating.rating,
            review_text: rating.review_text
          })
        } catch (error) {
          // Rating might already exist
        }
      }
    }

    console.log("✅ Created sample mentor ratings")

    console.log("🎉 Mentor data seeding completed successfully!")

  } catch (error) {
    console.error("❌ Error seeding mentor data:", error)
    throw error
  }
}
