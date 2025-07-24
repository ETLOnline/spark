"use server"

import { CreateServerAction } from ".."
import { tagsTable } from "@/src/db/schema"
import { eq } from "drizzle-orm"
import { getUserTags } from "@/src/db/data-access/tag/query"
import { GetAllMentors, GetMentorById } from "@/src/db/data-access/user/query"
import { GetMentorRatings, GetMentorRelationships } from "@/src/db/data-access/mentor/query"
import { db } from "@/src/db"

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
  true,  
  async (filters?: MentorFilters) => {
    try {
      // Get users with mentor role using data access layer
      const mentorsData = await GetAllMentors()

      // Filter mentors who have mentor role through role table
      const mentorsWithRoles = mentorsData.filter(user => {
        // Include users with mentor role flag or assigned mentor role in roles table
        const hasRoleColumn = user.role === "mentor"
        const hasAssignedRole = user.roles?.some(userRole => {
          const roleName = userRole.role?.name?.toLowerCase()
          const roleSlug = userRole.role?.slug?.toLowerCase()
          return roleName === "mentor" || roleSlug === "mentor"
        }) ?? false
        return hasRoleColumn || hasAssignedRole
      })

      // Use preloaded tags relation for each mentor
      const mentorsWithTags = await Promise.all(
        mentorsWithRoles.map(async (mentor) => {
          // Fetch user tags (skills and interests) directly from user_tags table
          const userTags = await getUserTags(mentor.unique_id)
          const tags = userTags ?? []
          
          // Separate skills and interests from tags
          const skills = [...new Set(tags
            .filter(userTag => userTag.tag?.type === 'skill')
            .map(userTag => userTag.tag?.name)
            .filter(Boolean))] 
          
          const interests = [...new Set(tags
            .filter(userTag => userTag.tag?.type === 'interest')
            .map(userTag => userTag.tag?.name)
            .filter(Boolean))]

          // Get mentor ratings via data access layer
          const mentorRatingsQuery = await GetMentorRatings(mentor.unique_id)

          let avgRating = 0; 
          let totalRatings = 0; 
          
          if (mentorRatingsQuery.length > 0) {
            const ratings = mentorRatingsQuery.map((r: any) => parseFloat(r.rating));
            avgRating = Math.round((ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length) * 10) / 10;
            totalRatings = ratings.length;
          } else {
            avgRating = 0;
            totalRatings = 0;
          }

          // Get mentor relationships via data access layer
          const mentorRelationshipsQuery = await GetMentorRelationships(mentor.unique_id)

          const activeMentees = mentorRelationshipsQuery.filter((rel: any) => rel.status === 'accepted').length;
         
          const profileData: any = mentor.profile;
          const yearsExp = 0;
          const isAvailable = true;
          const responseTime = "";
          const languages: string[] = [];
          const actualMenteeCount = 0;

          const mentorData: MentorData = {
            id: mentor.unique_id,
            name: `${mentor.first_name} ${mentor.last_name}`,
            title: profileData?.degree || "",
            company: "",
            university: profileData?.institute || "",
            domain: interests[0] || "General",
            location: profileData?.location || "Remote",
            rating: avgRating,
            ratingCount: totalRatings,
            skills,
            interests,
            mentees: actualMenteeCount,
            experience: yearsExp,
            responseTime: responseTime,
            languages: languages,
            description: profileData?.bio || "",
            available: isAvailable,
            email: mentor.email,
            profileUrl: mentor.profile_url || undefined
          }

          return mentorData
        })
      )

      let filteredMentors = mentorsWithTags

      if (filters?.search) {
        const searchLower = filters.search.toLowerCase()
        filteredMentors = filteredMentors.filter(mentor =>
          mentor.name.toLowerCase().includes(searchLower) ||
          mentor.university.toLowerCase().includes(searchLower) ||
          mentor.company.toLowerCase().includes(searchLower) ||
          mentor.skills.some((skill: string) => skill.toLowerCase().includes(searchLower))
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
  true, // Don't require auth for viewing mentor profile
  async (mentorId: string) => {
    try {
      const mentor = await GetMentorById(mentorId)

      if (!mentor) {
        return { success: false, error: "Mentor not found" }
      }

      // Check if user has mentor role
      const isMentor = mentor.role === "mentor" || 
        mentor.roles?.some(userRole => userRole.role?.name === "mentor")

      if (!isMentor) {
        return { success: false, error: "User is not a mentor" }
      }

      // Get tags for the mentor
      const tags = await getUserTags(mentor.unique_id)
      const skills = tags
        .filter(ut => ut.tag?.type === 'skill')
        .map(ut => ut.tag?.name)
        .filter(Boolean)
      const interests = tags
        .filter(ut => ut.tag?.type === 'interest')
        .map(ut => ut.tag?.name)
        .filter(Boolean)

      // Get mentor ratings
      const mentorRatingsQuery = await GetMentorRatings(mentor.unique_id)
      
      let avgRating = 0
      let totalRatings = 0
      
      if (mentorRatingsQuery.length > 0) {
        const ratings = mentorRatingsQuery.map((r: any) => parseFloat(r.rating));
        avgRating = Math.round((ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length) * 10) / 10;
        totalRatings = ratings.length;
      }

      // Pull fields from mentor.profile
      const p = mentor.profile
      // Default mentor stats (extended profile fields not in use)
      const mentees = 0
      const experience = 0
      const languages: string[] = []
      const available = true
      const responseTime = ''

      const mentorData: MentorData = {
        id: mentor.unique_id,
        name: `${mentor.first_name} ${mentor.last_name}`,
        title: p?.degree || 'Professional',
        company: '',
        university: p?.institute || '',
        domain: interests[0] || 'General',
        location: p?.institute || '',
        rating: avgRating,
        ratingCount: totalRatings,
        skills,
        interests,
        mentees,
        experience,
        responseTime,
        languages,
        description: p?.bio || '',
        available,
        email: mentor.email,
        profileUrl: mentor.profile_url || undefined
      }

      return { success: true, data: mentorData }
    } catch (error) {
      console.error("Error fetching mentor:", error)
      return { success: false, error: error instanceof Error ? error.message : "Failed to fetch mentor" }
    }
  }
)


// Helper function to get unique domains, skills, and interests from all mentors
export const GetMentorFiltersDataAction = CreateServerAction(
  true,
  async () => {
    try {
      // Get all mentors for domains
      const mentorsResult = await GetAllMentorsAction()
      if (!mentorsResult.success || !mentorsResult.data) {
        return {
          success: false,
          error: "Failed to fetch mentors data for filters"
        }
      }
      const mentors = mentorsResult.data
      // Extract unique domains from mentors
      const domains = [...new Set(mentors.map(mentor => mentor.domain))].sort()
      // Fetch all skill tags
      const skillTags = await db.query.tagsTable.findMany({
        where: eq(tagsTable.type, 'skill')
      })
      // Fetch all interest tags
      const interestTags = await db.query.tagsTable.findMany({
        where: eq(tagsTable.type, 'interest')
      })
      // Map tag names and sort
      const skills = skillTags.map(tag => tag.name).sort()
      const interests = interestTags.map(tag => tag.name).sort()
      
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
