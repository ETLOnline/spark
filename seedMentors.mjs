import { db } from "../index.js"
import { usersTable, profileTable, tagsTable, userTagsTable, rolesTable, userRolesTable, mentorRatingsTable } from "../schema.js"

async function seedMentors() {
  console.log("🌱 Seeding mentor data...")

  try {
    // Create mentor users with profiles
    const mentors = [
      {
        user: {
          first_name: "Dr. Sarah",
          last_name: "Johnson",
          email: "sarah.johnson@mentors.com",
          external_auth_id: `mentor_sarah_${Date.now()}`,
          role: "mentor"
        },
        profile: {
          bio: "AI researcher with 12+ years in machine learning and deep learning. Published author and startup advisor.",
          degree: "PhD in Computer Science",
          institute: "Stanford University",
          company: "Google AI",
          job_title: "Senior AI Research Scientist",
          location: "San Francisco, CA",
          years_experience: 12,
          languages: ["English", "Spanish"],
          availability_status: "true",
          response_time: "< 2 hours",
          mentee_count: 45
        },
        skills: ["Machine Learning", "Python", "Data Science", "AI"],
        interests: ["Research", "Innovation", "Technology"]
      },
      {
        user: {
          first_name: "Prof. Michael",
          last_name: "Chen",
          email: "michael.chen@mentors.com",
          external_auth_id: `mentor_michael_${Date.now()}`,
          role: "mentor"
        },
        profile: {
          bio: "Business strategy expert and entrepreneur. Former McKinsey consultant, founded 2 successful startups.",
          degree: "MBA",
          institute: "Harvard Business School",
          company: "Venture Capital Partners",
          job_title: "Managing Partner",
          location: "New York, NY",
          years_experience: 15,
          languages: ["English", "Mandarin"],
          availability_status: "true",
          response_time: "< 4 hours",
          mentee_count: 38
        },
        skills: ["Business Strategy", "Consulting", "Entrepreneurship"],
        interests: ["Startups", "Innovation", "Leadership"]
      },
      {
        user: {
          first_name: "Dr. Emily",
          last_name: "Rodriguez",
          email: "emily.rodriguez@mentors.com",
          external_auth_id: `mentor_emily_${Date.now()}`,
          role: "mentor"
        },
        profile: {
          bio: "Leading cardiologist and medical researcher specializing in preventive cardiology.",
          degree: "MD, PhD",
          institute: "Johns Hopkins University",
          company: "Mayo Clinic",
          job_title: "Chief of Cardiology",
          location: "Rochester, MN",
          years_experience: 18,
          languages: ["English", "Spanish"],
          availability_status: "true",
          response_time: "< 6 hours",
          mentee_count: 52
        },
        skills: ["Cardiology", "Medical Research", "Patient Care"],
        interests: ["Medical Research", "Global Health", "Teaching"]
      }
    ]

    for (const mentorData of mentors) {
      try {
        // Check if user already exists
        const existingUser = await db.select().from(usersTable).where(eq(usersTable.email, mentorData.user.email)).limit(1)
        
        let userId
        if (existingUser.length > 0) {
          userId = existingUser[0].unique_id
          console.log(`✅ User ${mentorData.user.first_name} already exists`)
        } else {
          const [newUser] = await db.insert(usersTable).values(mentorData.user).returning()
          userId = newUser.unique_id
          console.log(`✅ Created user: ${mentorData.user.first_name} ${mentorData.user.last_name}`)
        }

        // Create or update profile
        const profileData = { ...mentorData.profile, user_id: userId }
        const existingProfile = await db.select().from(profileTable).where(eq(profileTable.user_id, userId)).limit(1)
        
        if (existingProfile.length > 0) {
          await db.update(profileTable).set(profileData).where(eq(profileTable.user_id, userId))
          console.log(`✅ Updated profile for ${mentorData.user.first_name}`)
        } else {
          await db.insert(profileTable).values(profileData)
          console.log(`✅ Created profile for ${mentorData.user.first_name}`)
        }

        // Create tags and assign them
        for (const skill of mentorData.skills) {
          let skillTag = await db.select().from(tagsTable).where(eq(tagsTable.name, skill)).limit(1)
          
          if (skillTag.length === 0) {
            [skillTag[0]] = await db.insert(tagsTable).values({
              name: skill,
              type: "skill",
              count: 1
            }).returning()
          }

          // Assign tag to user
          try {
            await db.insert(userTagsTable).values({
              user_id: userId,
              tag_id: skillTag[0].id
            })
          } catch (error) {
            // Tag assignment might already exist
          }
        }

        for (const interest of mentorData.interests) {
          let interestTag = await db.select().from(tagsTable).where(eq(tagsTable.name, interest)).limit(1)
          
          if (interestTag.length === 0) {
            [interestTag[0]] = await db.insert(tagsTable).values({
              name: interest,
              type: "interest",
              count: 1
            }).returning()
          }

          // Assign tag to user
          try {
            await db.insert(userTagsTable).values({
              user_id: userId,
              tag_id: interestTag[0].id
            })
          } catch (error) {
            // Tag assignment might already exist
          }
        }

        console.log(`✅ Processed mentor: ${mentorData.user.first_name} ${mentorData.user.last_name}`)

      } catch (error) {
        console.error(`❌ Error processing mentor ${mentorData.user.first_name}:`, error.message)
      }
    }

    console.log("🎉 Mentor seeding completed!")

  } catch (error) {
    console.error("❌ Seeding failed:", error)
  }
}

seedMentors().then(() => {
  console.log("✅ Done!")
}).catch(console.error)
