import { sql, eq } from "drizzle-orm"
import { db } from ".."
import { usersTable, profileTable, tagsTable, userTagsTable, userRolesTable, rolesTable, mentorRatingsTable, mentorRelationshipsTable } from "../schema"

const mentorData = [
  {
    user: {
      first_name: "Dr. Sarah",
      last_name: "Johnson",
      email: "sarah.johnson@mentors.com",
      external_auth_id: `mentor_sarah_${Date.now()}`
    },
    profile: {
      bio: "AI researcher with 12+ years in machine learning and deep learning. Published author and startup advisor.",
      degree: "PhD in Computer Science",
      institute: "Stanford University",
      linkedin_url: "https://linkedin.com/in/sarah-johnson-ai",
      github_url: "https://github.com/sarah-johnson",
      personal_website_url: "https://sarahjohnson.ai"
    },
    skills: ["Machine Learning", "Python", "Data Science", "AI"],
    interests: ["Research", "Innovation", "Technology"]
  },
  {
    user: {
      first_name: "Prof. Michael",
      last_name: "Chen",
      email: "michael.chen@mentors.com",
      external_auth_id: `mentor_michael_${Date.now()}`
    },
    profile: {
      bio: "Business strategy expert and entrepreneur. Former McKinsey consultant, founded 2 successful startups.",
      degree: "MBA",
      institute: "Harvard Business School",
      linkedin_url: "https://linkedin.com/in/michael-chen-mba",
      personal_website_url: "https://michaelchen.biz"
    },
    skills: ["Business Strategy", "Consulting", "Entrepreneurship"],
    interests: ["Startups", "Innovation", "Leadership"]
  },
  {
    user: {
      first_name: "Dr. Emily",
      last_name: "Rodriguez",
      email: "emily.rodriguez@mentors.com",
      external_auth_id: `mentor_emily_${Date.now()}`
    },
    profile: {
      bio: "Leading cardiologist and medical researcher specializing in preventive cardiology.",
      degree: "MD, PhD",
      institute: "Johns Hopkins University",
      linkedin_url: "https://linkedin.com/in/emily-rodriguez-md"
    },
    skills: ["Cardiology", "Medical Research", "Patient Care"],
    interests: ["Medical Research", "Global Health", "Teaching"]
  },
  {
    user: {
      first_name: "Alex",
      last_name: "Kim",
      email: "alex.kim@mentors.com",
      external_auth_id: `mentor_alex_${Date.now()}`
    },
    profile: {
      bio: "Full-stack engineer with 8 years building scalable web applications using React and Node.js.",
      degree: "B.Sc. Computer Science",
      institute: "University of Washington",
      linkedin_url: "https://linkedin.com/in/alex-kim",
      github_url: "https://github.com/alexkim",
      personal_website_url: "https://alexkim.dev"
    },
    skills: ["React", "TypeScript", "Node.js", "Full-Stack Development"],
    interests: ["Web Development", "Open Source", "Mentoring"]
  },
  {
    user: {
      first_name: "Maria",
      last_name: "Garcia",
      email: "maria.garcia@mentors.com",
      external_auth_id: `mentor_maria_${Date.now()}`
    },
    profile: {
      bio: "UX/UI designer specializing in creating accessible and user-centered design systems.",
      degree: "M.Des",
      institute: "Rhode Island School of Design",
      linkedin_url: "https://linkedin.com/in/maria-garcia-ux",
      personal_website_url: "https://mariagarcia.design"
    },
    skills: ["UX Design", "Figma", "User Research", "Accessibility"],
    interests: ["Design Systems", "Product Design", "User Psychology"]
  }
]

export const MentorSeed = async () => {
  return await db.transaction(async (tx) => {

    const [existingRole] = await tx
      .select()
      .from(rolesTable)
      .where(sql`LOWER(${rolesTable.name}) = 'mentor'`)
      .limit(1)

    let mentorRoleId: number
    if (existingRole) {
      mentorRoleId = existingRole.id
      console.log(`✅ Mentor role exists with ID: ${mentorRoleId}`)
    } else {
      const [newRole] = await tx.insert(rolesTable).values({
        name: "mentor",
        role_type: "user_role",
        slug: "mentor"
      }).returning()
      mentorRoleId = newRole.id
      console.log(`✅ Created mentor role with ID: ${mentorRoleId}`)
    }

    console.log("🌱 Starting mentor seeding with role ID:", mentorRoleId)

    let processedCount = 0
    let errorCount = 0

    for (const mentorInfo of mentorData) {
      try {
        // Check if user already exists
        const existingUser = await tx
          .select()
          .from(usersTable)
          .where(eq(usersTable.email, mentorInfo.user.email))
          .limit(1)

        let userId
        if (existingUser.length > 0) {
          userId = existingUser[0].unique_id
          console.log(`✅ User ${mentorInfo.user.first_name} already exists`)
          // Ensure role column is set to mentor
          await tx
            .update(usersTable)
            .set({ role: "mentor" })
            .where(eq(usersTable.unique_id, userId))
          console.log(`✅ Updated existing user role to mentor for ${mentorInfo.user.first_name}`)
        } else {
          const [newUser] = await tx
            .insert(usersTable)
            .values({ ...mentorInfo.user, role: "mentor" })
            .returning()
          userId = newUser.unique_id
          console.log(`✅ Created user: ${mentorInfo.user.first_name} ${mentorInfo.user.last_name} with mentor role`)
        }

        // Assign mentor role to user
        try {
          await tx.insert(userRolesTable).values({
            user_id: userId,
            role_id: mentorRoleId
          })
          console.log(`✅ Assigned mentor role to ${mentorInfo.user.first_name}`)
        } catch (error) {
          // Role assignment might already exist - ignore
          console.log(`ℹ️ Role assignment for ${mentorInfo.user.first_name} might already exist`)
        }

        // Create or update profile (including mentor-specific fields)
        const profileData = { ...mentorInfo.profile, user_id: userId }
        const existingProfile = await tx
          .select()
          .from(profileTable)
          .where(eq(profileTable.user_id, userId))
          .limit(1)

        if (existingProfile.length > 0) {
          await tx
            .update(profileTable)
            .set(profileData)
            .where(eq(profileTable.user_id, userId))
          console.log(`✅ Updated profile for ${mentorInfo.user.first_name}`)
        } else {
          await tx.insert(profileTable).values(profileData)
          console.log(`✅ Created profile for ${mentorInfo.user.first_name}`)
        }

        // Mentor-specific fields are stored in profile table; no separate mentor profile table actions required

        // Clear existing user tags to prevent duplicates
        await tx.delete(userTagsTable).where(eq(userTagsTable.user_id, userId))
        console.log(`✅ Cleared existing tags for ${mentorInfo.user.first_name}`)

        // Process skills
        for (const skill of mentorInfo.skills) {
          try {
            // 1. Fetch or create the skill tag
            let skillTag = await tx
              .select()
              .from(tagsTable)
              .where(sql`name = ${skill} AND type = 'skill'`)
              .limit(1)

            if (skillTag.length === 0) {
              skillTag = await tx
                .insert(tagsTable)
                .values({ name: skill, type: "skill" })
                .returning()
            }

            // 2. Assign the skill tag to the user (ignore duplicates)
            try {
              await tx.insert(userTagsTable).values({
                user_id: userId,
                tag_id: skillTag[0].id
              })
            } catch {
              // duplicate assignment, ignore
            }
          } catch (error) {
            console.warn(`⚠️ Error processing skill "${skill}":`, (error as Error).message)
          }
        }

        // Process interests
        for (const interest of mentorInfo.interests) {
          try {
            // 1. Fetch or create the interest tag
            let interestTag = await tx
              .select()
              .from(tagsTable)
              .where(sql`name = ${interest} AND type = 'interest'`)
              .limit(1)

            if (interestTag.length === 0) {
              interestTag = await tx
                .insert(tagsTable)
                .values({ name: interest, type: "interest" })
                .returning()
            }

            // 2. Assign the interest tag to the user (ignore duplicates)
            try {
              await tx.insert(userTagsTable).values({
                user_id: userId,
                tag_id: interestTag[0].id
              })
            } catch {
              // duplicate assignment, ignore
            }
          } catch (error) {
            console.warn(`⚠️ Error processing interest "${interest}":`, (error as Error).message)
          }
        }

        processedCount++
        console.log(`✅ Processed mentor: ${mentorInfo.user.first_name} ${mentorInfo.user.last_name}`)

      } catch (error) {
        errorCount++
        console.error(
          `❌ Error processing mentor ${mentorInfo.user.first_name}:`,
          (error as Error).message
        )
      }
    }

    // Get all seeded mentors for ratings
    const allMentors = await tx.select().from(usersTable).where(eq(usersTable.role, "mentor"))
    
    // Create sample reviewer users for ratings
    const reviewerUsers = [
      { first_name: "Student", last_name: "User1", email: "student1@example.com", external_auth_id: `reviewer_1_${Date.now()}` },
      { first_name: "Student", last_name: "User2", email: "student2@example.com", external_auth_id: `reviewer_2_${Date.now()}` },
      { first_name: "Student", last_name: "User3", email: "student3@example.com", external_auth_id: `reviewer_3_${Date.now()}` },
      { first_name: "Student", last_name: "User4", email: "student4@example.com", external_auth_id: `reviewer_4_${Date.now()}` },
      { first_name: "Student", last_name: "User5", email: "student5@example.com", external_auth_id: `reviewer_5_${Date.now()}` },
      { first_name: "Student", last_name: "User6", email: "student6@example.com", external_auth_id: `reviewer_6_${Date.now()}` }
    ]

    const insertedReviewers = []
    for (const reviewer of reviewerUsers) {
      try {
        const [existingReviewer] = await tx.select().from(usersTable).where(eq(usersTable.email, reviewer.email)).limit(1)
        
        if (existingReviewer) {
          insertedReviewers.push(existingReviewer)
        } else {
          const [newReviewer] = await tx.insert(usersTable).values(reviewer).returning()
          insertedReviewers.push(newReviewer)
          console.log(`✅ Created reviewer: ${reviewer.first_name} ${reviewer.last_name}`)
        }
      } catch (error) {
        console.warn(`⚠️ Reviewer might already exist: ${reviewer.email}`)
      }
    }

    // Create sample ratings for each mentor
    const sampleRatings = [
      { mentor_idx: 0, reviewer_idx: 0, rating: "4.8", review_text: "Excellent mentor! Very knowledgeable in AI and provided great guidance." },
      { mentor_idx: 0, reviewer_idx: 1, rating: "4.9", review_text: "Sarah helped me understand complex ML concepts. Highly recommend!" },
      { mentor_idx: 0, reviewer_idx: 2, rating: "4.7", review_text: "Great insights into research methodologies and industry applications." },
      { mentor_idx: 1, reviewer_idx: 0, rating: "4.6", review_text: "Great business insights and strategic thinking. Michael is very experienced." },
      { mentor_idx: 1, reviewer_idx: 3, rating: "4.8", review_text: "Helped me understand startup fundamentals and business strategy." },
      { mentor_idx: 1, reviewer_idx: 4, rating: "4.5", review_text: "Very practical advice on entrepreneurship and consulting." },
      { mentor_idx: 2, reviewer_idx: 1, rating: "4.9", review_text: "Dr. Rodriguez is an amazing mentor in the medical field. Very caring and knowledgeable." },
      { mentor_idx: 2, reviewer_idx: 2, rating: "4.8", review_text: "Excellent guidance on medical research and patient care approaches." },
      { mentor_idx: 3, reviewer_idx: 3, rating: "4.7", review_text: "Alex provided excellent guidance on software architecture and system design." },
      { mentor_idx: 3, reviewer_idx: 4, rating: "4.6", review_text: "Great help with React and TypeScript. Very knowledgeable developer." },
      { mentor_idx: 3, reviewer_idx: 5, rating: "4.8", review_text: "Helped me improve my full-stack development skills significantly." },
      { mentor_idx: 4, reviewer_idx: 0, rating: "4.9", review_text: "Maria has great design thinking and helped me improve my UX skills significantly." },
      { mentor_idx: 4, reviewer_idx: 5, rating: "4.7", review_text: "Excellent mentor for UX design and user research methodologies." }
    ]

    let ratingsCreated = 0
    for (const rating of sampleRatings) {
      if (allMentors[rating.mentor_idx] && insertedReviewers[rating.reviewer_idx]) {
        try {
          await tx.insert(mentorRatingsTable).values({
            mentor_id: allMentors[rating.mentor_idx].unique_id,
            reviewer_id: insertedReviewers[rating.reviewer_idx].unique_id,
            rating: rating.rating,
            review_text: rating.review_text
          })
          ratingsCreated++
        } catch (error) {
          console.warn(`⚠️ Rating might already exist for mentor ${rating.mentor_idx}`)
        }
      }
    }

    console.log(`✅ Created ${ratingsCreated} mentor ratings`)

    console.log(`🎉 Mentor seeding completed! Processed: ${processedCount}, Errors: ${errorCount}, Ratings: ${ratingsCreated}`)
  })
}
