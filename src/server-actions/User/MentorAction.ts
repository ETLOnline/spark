"use server"

import { CreateServerAction } from ".."
import { db } from "@/src/db"
import { usersTable, userRolesTable, rolesTable, profileTable, mentorRatingsTable, mentorRelationshipsTable } from "@/src/db/schema"
import { eq, and, like, or, desc, asc, sql } from "drizzle-orm"
import { getUserTags } from "@/src/db/data-access/tag/query"

export interface MentorData {
  id: string
  name: string
  title: string
  company: string
  university: string
  domain: string
  location: string
  rating: number
  ratingCount: number
  skills: string[]
  interests: string[]
  mentees: number
  experience: number
  responseTime: string
  languages: string[]
  description: string
  available: boolean
  email: string
  profileUrl?: string
}

export interface MentorFilters {
  search?: string
  domains?: string[]
  skills?: string[]
  interests?: string[]
  experienceLevel?: string
  minRating?: number
  sortBy?: 'rating' | 'experience'
}

export const GetAllMentorsAction = CreateServerAction(
  false, // Don't require auth for browsing mentors
  async (filters?: MentorFilters) => {
    try {
      // Get users with mentor role
      const mentorsQuery = db
        .select({
          user: {
            unique_id: usersTable.unique_id,
            first_name: usersTable.first_name,
            last_name: usersTable.last_name,
            email: usersTable.email,
            profile_url: usersTable.profile_url,
            role: usersTable.role
          },
          profile: {
            bio: profileTable.bio,
            degree: profileTable.degree,
            institute: profileTable.institute,
            linkedin_url: profileTable.linkedin_url,
            github_url: profileTable.github_url,
            company: profileTable.company,
            job_title: profileTable.job_title,
            location: profileTable.location,
            years_experience: profileTable.years_experience,
            languages: profileTable.languages,
            availability_status: profileTable.availability_status,
            response_time: profileTable.response_time,
            mentee_count: profileTable.mentee_count
          }
        })
        .from(usersTable)
        .leftJoin(profileTable, eq(usersTable.unique_id, profileTable.user_id))
        .leftJoin(userRolesTable, eq(usersTable.unique_id, userRolesTable.user_id))
        .leftJoin(rolesTable, eq(userRolesTable.role_id, rolesTable.id))
        .where(
          or(
            eq(usersTable.role, "mentor"), // If using simple role field
            eq(rolesTable.name, "mentor")  // If using role table
          )
        )

      const mentorsData = await mentorsQuery

      // Get tags for each mentor
      const mentorsWithTags = await Promise.all(
        mentorsData.map(async (mentor) => {
          const tags = await getUserTags(mentor.user.unique_id)
          
          // Separate skills and interests from tags
          const skills = tags
            .filter(tag => tag.tag_type === 'skill')
            .map(tag => tag.tag_name)
          
          const interests = tags
            .filter(tag => tag.tag_type === 'interest')
            .map(tag => tag.tag_name)

          // Get mentor ratings directly from database
          const mentorRatingsQuery = await db
            .select()
            .from(mentorRatingsTable)
            .where(eq(mentorRatingsTable.mentor_id, mentor.user.unique_id))

          let avgRating = 4.0; // Default
          let totalRatings = 94; // Default
          
          if (mentorRatingsQuery.length > 0) {
            const ratings = mentorRatingsQuery.map((r: any) => parseFloat(r.rating));
            avgRating = ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length;
            totalRatings = ratings.length;
          } else {
            // Mock data for demo
            avgRating = Math.round((Math.random() * 2 + 3) * 10) / 10; // 3.0 to 5.0
            totalRatings = Math.floor(Math.random() * 200) + 20;
          }

          // Get mentor relationships count
          const mentorRelationshipsQuery = await db
            .select()
            .from(mentorRelationshipsTable)
            .where(eq(mentorRelationshipsTable.mentor_id, mentor.user.unique_id))

          const activeMentees = mentorRelationshipsQuery.filter((rel: any) => rel.status === 'accepted').length;
          
          // Use profile data when available, fallback to defaults
          const profileData = mentor.profile;
          const yearsExp = profileData?.years_experience || Math.floor(Math.random() * 15) + 1;
          const isAvailable = profileData?.availability_status === "true" || Math.random() > 0.3;
          const responseTime = profileData?.response_time || (isAvailable ? "< 2 hours" : "< 12 hours");
          
          let languages = ["English"]; // Default
          if (profileData?.languages) {
            try {
              languages = Array.isArray(profileData.languages) 
                ? profileData.languages 
                : JSON.parse(profileData.languages as string);
            } catch {
              languages = ["English"];
            }
          }
          
          const actualMenteeCount = profileData?.mentee_count || activeMentees || Math.floor(Math.random() * 80) + 10;

          const mentorData: MentorData = {
            id: mentor.user.unique_id,
            name: `${mentor.user.first_name} ${mentor.user.last_name}`,
            title: profileData?.job_title || profileData?.degree || "Professional",
            company: profileData?.company || "Company Name", // Default until we have real data
            university: profileData?.institute || "University",
            domain: interests[0] || "General", // Use first interest as domain
            location: profileData?.location || "Location", // Default until we have real data
            rating: avgRating,
            ratingCount: totalRatings,
            skills,
            interests,
            mentees: actualMenteeCount,
            experience: yearsExp,
            responseTime: responseTime,
            languages: languages,
            description: profileData?.bio || "Experienced professional ready to mentor.",
            available: isAvailable,
            email: mentor.user.email,
            profileUrl: mentor.user.profile_url || undefined
          }

          return mentorData
        })
      )

      // Apply filters
      let filteredMentors = mentorsWithTags

      if (filters?.search) {
        const searchLower = filters.search.toLowerCase()
        filteredMentors = filteredMentors.filter(mentor =>
          mentor.name.toLowerCase().includes(searchLower) ||
          mentor.university.toLowerCase().includes(searchLower) ||
          mentor.company.toLowerCase().includes(searchLower) ||
          mentor.skills.some(skill => skill.toLowerCase().includes(searchLower))
        )
      }

      if (filters?.domains && filters.domains.length > 0) {
        filteredMentors = filteredMentors.filter(mentor =>
          filters.domains!.includes(mentor.domain)
        )
      }

      if (filters?.skills && filters.skills.length > 0) {
        filteredMentors = filteredMentors.filter(mentor =>
          filters.skills!.every(skill => mentor.skills.includes(skill))
        )
      }

      if (filters?.interests && filters.interests.length > 0) {
        filteredMentors = filteredMentors.filter(mentor =>
          filters.interests!.every(interest => mentor.interests.includes(interest))
        )
      }

      if (filters?.experienceLevel) {
        filteredMentors = filteredMentors.filter(mentor => {
          const exp = mentor.experience
          if (filters.experienceLevel === "1-3 years") return exp >= 1 && exp <= 3
          if (filters.experienceLevel === "4-7 years") return exp >= 4 && exp <= 7
          if (filters.experienceLevel === "8-12 years") return exp >= 8 && exp <= 12
          if (filters.experienceLevel === "13+ years") return exp >= 13
          return true
        })
      }

      if (filters?.minRating) {
        filteredMentors = filteredMentors.filter(mentor =>
          mentor.rating >= filters.minRating!
        )
      }

      // Apply sorting
      if (filters?.sortBy === 'experience') {
        filteredMentors.sort((a, b) => {
          if (b.experience !== a.experience) return b.experience - a.experience
          return b.rating - a.rating // tie-breaker
        })
      } else {
        // Default to rating sort
        filteredMentors.sort((a, b) => {
          if (b.rating !== a.rating) return b.rating - a.rating
          return b.ratingCount - a.ratingCount // tie-breaker
        })
      }

      return {
        success: true,
        data: filteredMentors
      }
    } catch (error) {
      console.error("Error fetching mentors:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch mentors"
      }
    }
  }
)

export const GetMentorByIdAction = CreateServerAction(
  false, // Don't require auth for viewing mentor profile
  async (mentorId: string) => {
    try {
      const mentor = await db.query.usersTable.findFirst({
        where: eq(usersTable.unique_id, mentorId),
        with: {
          profile: true,
          roles: {
            with: {
              role: true
            }
          }
        }
      })

      if (!mentor) {
        return {
          success: false,
          error: "Mentor not found"
        }
      }

      // Check if user has mentor role
      const isMentor = mentor.role === "mentor" || 
        mentor.roles?.some(userRole => userRole.role?.name === "mentor")

      if (!isMentor) {
        return {
          success: false,
          error: "User is not a mentor"
        }
      }

      // Get tags for the mentor
      const tags = await getUserTags(mentor.unique_id)
      
      const skills = tags
        .filter(tag => tag.tag_type === 'skill')
        .map(tag => tag.tag_name)
      
      const interests = tags
        .filter(tag => tag.tag_type === 'interest')
        .map(tag => tag.tag_name)

      // Mock additional data
      const mockRating = Math.round((Math.random() * 2 + 3) * 10) / 10
      const mockRatingCount = Math.floor(Math.random() * 200) + 20
      const mockMentees = Math.floor(Math.random() * 80) + 10
      const mockExperience = Math.floor(Math.random() * 15) + 1
      const mockAvailable = Math.random() > 0.3

      const mentorData: MentorData = {
        id: mentor.unique_id,
        name: `${mentor.first_name} ${mentor.last_name}`,
        title: mentor.profile?.degree || "Professional",
        company: "Company Name",
        university: mentor.profile?.institute || "University",
        domain: interests[0] || "General",
        location: "Location",
        rating: mockRating,
        ratingCount: mockRatingCount,
        skills,
        interests,
        mentees: mockMentees,
        experience: mockExperience,
        responseTime: mockAvailable ? "< 2 hours" : "< 12 hours",
        languages: ["English"],
        description: mentor.profile?.bio || "Experienced professional ready to mentor.",
        available: mockAvailable,
        email: mentor.email,
        profileUrl: mentor.profile_url || undefined
      }

      return {
        success: true,
        data: mentorData
      }
    } catch (error) {
      console.error("Error fetching mentor:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch mentor"
      }
    }
  }
)

// Helper function to get unique domains, skills, and interests from all mentors
export const GetMentorFiltersDataAction = CreateServerAction(
  false,
  async () => {
    try {
      // Get all mentors
      const mentorsResult = await GetAllMentorsAction()
      
      if (!mentorsResult.success || !mentorsResult.data) {
        return {
          success: false,
          error: "Failed to fetch mentors data for filters"
        }
      }

      const mentors = mentorsResult.data
      
      // Extract unique values
      const domains = [...new Set(mentors.map(mentor => mentor.domain))]
      const skills = [...new Set(mentors.flatMap(mentor => mentor.skills))]
      const interests = [...new Set(mentors.flatMap(mentor => mentor.interests))]
      
      return {
        success: true,
        data: {
          domains: domains.sort(),
          skills: skills.sort(),
          interests: interests.sort(),
          experienceLevels: ["1-3 years", "4-7 years", "8-12 years", "13+ years"]
        }
      }
    } catch (error) {
      console.error("Error fetching filter data:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch filter data"
      }
    }
  }
)
