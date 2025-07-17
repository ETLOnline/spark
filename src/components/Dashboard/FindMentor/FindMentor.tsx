"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MapPin, BookOpen, Building, Clock, Search, Filter, X, ChevronDown, Heart, MessageCircle, Star, Users, ChevronUp } from "lucide-react";
import { GetAllMentorsAction, GetMentorFiltersDataAction, MentorData } from "@/src/server-actions/User/MentorAction";
import { 
  CreateMentorConnectionAction, 
  ToggleMentorFavoriteAction, 
  GetUserFavoriteMentorsAction,
  GetMentorConnectionStatusAction 
} from "@/src/server-actions/User/MentorConnectionAction";
import { useAuth } from "@clerk/nextjs";

// Remove hardcoded fallback defaults, filters will be fetched from DB

const experienceLevels = ["All Experience Levels", "1-3 years", "4-7 years", "8-12 years", "13+ years"];
const sortOptions = [
	{ value: "rating", label: "Highest Rated" },
	{ value: "reviews", label: "Most Reviews" },
	{ value: "experience", label: "Most Experience" },
	{ value: "name", label: "Name A-Z" }
];

const FindMentor: React.FC = () => {
	const { isLoaded, isSignedIn } = useAuth();
	const router = useRouter();
	const searchParams = useSearchParams();
	
	const [search, setSearch] = useState("");
	const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
	const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
	const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
	const [selectedExperience, setSelectedExperience] = useState<string>("All Experience Levels");
	const [selectedUniversities, setSelectedUniversities] = useState<string[]>([]);
	const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
	const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
	const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
	const [availabilityFilter, setAvailabilityFilter] = useState<"all" | "available" | "unavailable">("all");
	const [openFilters, setOpenFilters] = useState({
		domain: true,
		skills: true,
		interests: true,
		experience: true,
		university: false,
		company: false,
		location: false,
		languages: false,
		availability: false,
	});
	const [filtersExpanded, setFiltersExpanded] = useState(true);
	const [minRating, setMinRating] = useState(0);
	const [sortBy, setSortBy] = useState<'rating' | 'reviews' | 'experience' | 'name'>("rating");
	const [showMobileFilters, setShowMobileFilters] = useState(false);
	const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
	const [connectionStatuses, setConnectionStatuses] = useState<Map<string, string>>(new Map());
	
	// New state for database data
	const [mentors, setMentors] = useState<MentorData[]>([]);
	// Filter options loaded from database instead of hardcoded defaults
	const [domains, setDomains] = useState<string[]>([]);
	const [skills, setSkills] = useState<string[]>([]);
	const [interests, setInterests] = useState<string[]>([]);
	const [universities, setUniversities] = useState<string[]>([]);
	const [companies, setCompanies] = useState<string[]>([]);
	const [locations, setLocations] = useState<string[]>([]);
	const [languages, setLanguages] = useState<string[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Load filter state from URL on component mount
	useEffect(() => {
		if (!searchParams) return;
		
		const urlSearch = searchParams.get('search');
		const urlDomains = searchParams.get('domains');
		const urlSkills = searchParams.get('skills');
		const urlInterests = searchParams.get('interests');
		const urlExperience = searchParams.get('experience');
		const urlUniversities = searchParams.get('universities');
		const urlCompanies = searchParams.get('companies');
		const urlLocations = searchParams.get('locations');
		const urlLanguages = searchParams.get('languages');
		const urlAvailability = searchParams.get('availability');
		const urlMinRating = searchParams.get('minRating');
		const urlSortBy = searchParams.get('sortBy');

		if (urlSearch) setSearch(urlSearch);
		if (urlDomains) setSelectedDomains(urlDomains.split(','));
		if (urlSkills) setSelectedSkills(urlSkills.split(','));
		if (urlInterests) setSelectedInterests(urlInterests.split(','));
		if (urlExperience) setSelectedExperience(urlExperience);
		if (urlUniversities) setSelectedUniversities(urlUniversities.split(','));
		if (urlCompanies) setSelectedCompanies(urlCompanies.split(','));
		if (urlLocations) setSelectedLocations(urlLocations.split(','));
		if (urlLanguages) setSelectedLanguages(urlLanguages.split(','));
		if (urlAvailability && ['all', 'available', 'unavailable'].includes(urlAvailability)) {
			setAvailabilityFilter(urlAvailability as "all" | "available" | "unavailable");
		}
		if (urlMinRating) setMinRating(Number(urlMinRating));
		if (urlSortBy && ['rating', 'reviews', 'experience', 'name'].includes(urlSortBy)) {
			setSortBy(urlSortBy as 'rating' | 'reviews' | 'experience' | 'name');
		}
	}, [searchParams]);

	// Update URL when filters change
	useEffect(() => {
		if (!isLoaded) return;
		
		const params = new URLSearchParams();
		
		if (search) params.set('search', search);
		if (selectedDomains.length > 0) params.set('domains', selectedDomains.join(','));
		if (selectedSkills.length > 0) params.set('skills', selectedSkills.join(','));
		if (selectedInterests.length > 0) params.set('interests', selectedInterests.join(','));
		if (selectedExperience !== "All Experience Levels") params.set('experience', selectedExperience);
		if (selectedUniversities.length > 0) params.set('universities', selectedUniversities.join(','));
		if (selectedCompanies.length > 0) params.set('companies', selectedCompanies.join(','));
		if (selectedLocations.length > 0) params.set('locations', selectedLocations.join(','));
		if (selectedLanguages.length > 0) params.set('languages', selectedLanguages.join(','));
		if (availabilityFilter !== "all") params.set('availability', availabilityFilter);
		if (minRating > 0) params.set('minRating', minRating.toString());
		if (sortBy !== "rating") params.set('sortBy', sortBy);

		const newUrl = params.toString() ? `?${params.toString()}` : '';
		window.history.replaceState({}, '', `/find-mentor${newUrl}`);
	}, [search, selectedDomains, selectedSkills, selectedInterests, selectedExperience, 
		selectedUniversities, selectedCompanies, selectedLocations, selectedLanguages, 
		availabilityFilter, minRating, sortBy, isLoaded]);

	// Load user's favorite mentors on component mount
	useEffect(() => {
		const loadFavorites = async () => {
			if (!isSignedIn || !isLoaded) return;
			
			try {
				const result = await GetUserFavoriteMentorsAction();
				if (result.success && result.data) {
					setFavoriteIds(new Set(result.data));
				}
			} catch (error) {
				console.error("Error loading favorites:", error);
				// Don't throw error, just log it - favorites are not critical
			}
		};

		// Only load if user is fully authenticated
		if (isLoaded && isSignedIn) {
			loadFavorites();
		}
	}, [isLoaded, isSignedIn]);

	// Load connection statuses for mentors
	useEffect(() => {
		const loadConnectionStatuses = async () => {
			if (!isSignedIn || !isLoaded || mentors.length === 0) return;
			
			try {
				const statusMap = new Map<string, string>();
				
				// Load connection status for each mentor
				for (const mentor of mentors) {
					try {
						const result = await GetMentorConnectionStatusAction(mentor.id);
						if (result.success && result.data) {
							statusMap.set(mentor.id, result.data.status);
						}
					} catch (error) {
						// Skip individual mentor status errors - they might not be connected
						console.warn(`Failed to load connection status for mentor ${mentor.id}:`, error);
					}
				}
				
				setConnectionStatuses(statusMap);
			} catch (error) {
				console.error("Error loading connection statuses:", error);
			}
		};

		// Only load if user is fully authenticated and mentors are loaded
		if (isLoaded && isSignedIn && mentors.length > 0) {
			loadConnectionStatuses();
		}
	}, [isLoaded, isSignedIn, mentors]);

	// Fetch mentors and filter data on component mount
	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			setError(null);
			
			try {
				// Fetch mentors
				const mentorsResult = await GetAllMentorsAction();
				console.log('[FindMentor] mentorsResult:', mentorsResult);
				if (mentorsResult.success && mentorsResult.data) {
					console.log('[FindMentor] mentors data:', mentorsResult.data);
					mentorsResult.data.forEach((m) => console.log(`Mentor: ${m.name}`, 'Skills:', m.skills, 'Interests:', m.interests));
					setMentors(mentorsResult.data);
				} else {
					setError(mentorsResult.error || "Failed to fetch mentors");
				}

				// Fetch filter data
				const filtersResult = await GetMentorFiltersDataAction();
				if (filtersResult.success && filtersResult.data) {
					setDomains(filtersResult.data.domains);
					setSkills(filtersResult.data.skills);
					setInterests(filtersResult.data.interests);
					
					// Extract unique values from mentors for additional filters
					if (mentorsResult.success && mentorsResult.data) {
						const mentorData = mentorsResult.data;
						const uniqueUniversities = [...new Set(mentorData.map(m => m.university))].sort();
						const uniqueCompanies = [...new Set(mentorData.map(m => m.company))].sort();
						const uniqueLocations = [...new Set(mentorData.map(m => m.location))].sort();
						const uniqueLanguages = [...new Set(mentorData.flatMap(m => m.languages))].sort();
						
						setUniversities(uniqueUniversities);
						setCompanies(uniqueCompanies);
						setLocations(uniqueLocations);
						setLanguages(uniqueLanguages);
					}
				}
			} catch (err) {
				setError("An error occurred while fetching data");
				console.error("Error fetching mentor data:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	const filteredMentors = useMemo(() => {
		return mentors.filter((mentor) => {
			const searchLower = search.toLowerCase();
			const matchesSearch = !search || (
				mentor.name.toLowerCase().includes(searchLower) ||
				mentor.email.toLowerCase().includes(searchLower) ||
				mentor.university.toLowerCase().includes(searchLower) ||
				mentor.company.toLowerCase().includes(searchLower) ||
				mentor.domain.toLowerCase().includes(searchLower) ||
				mentor.location.toLowerCase().includes(searchLower) ||
				mentor.skills.some((skill) => skill.toLowerCase().includes(searchLower)) ||
				mentor.interests.some((interest) => interest.toLowerCase().includes(searchLower))
			);
			
			const matchesDomain = selectedDomains.length === 0 || selectedDomains.includes(mentor.domain);
			const matchesSkills = selectedSkills.length === 0 || selectedSkills.every((skill) => mentor.skills.includes(skill));
			const matchesInterests = selectedInterests.length === 0 || selectedInterests.every((interest) => mentor.interests.includes(interest));
			const matchesUniversity = selectedUniversities.length === 0 || selectedUniversities.includes(mentor.university);
			const matchesCompany = selectedCompanies.length === 0 || selectedCompanies.includes(mentor.company);
			const matchesLocation = selectedLocations.length === 0 || selectedLocations.includes(mentor.location);
			const matchesLanguages = selectedLanguages.length === 0 || selectedLanguages.some((lang) => mentor.languages.includes(lang));
			
			const matchesExperience = selectedExperience === "All Experience Levels" || (() => {
				const exp = mentor.experience;
				if (selectedExperience === "1-3 years") return exp >= 1 && exp <= 3;
				if (selectedExperience === "4-7 years") return exp >= 4 && exp <= 7;
				if (selectedExperience === "8-12 years") return exp >= 8 && exp <= 12;
				if (selectedExperience === "13+ years") return exp >= 13;
				return true;
			})();
			
			const matchesAvailability = availabilityFilter === "all" || 
				(availabilityFilter === "available" && mentor.available) ||
				(availabilityFilter === "unavailable" && !mentor.available);
			
			const matchesRating = mentor.rating >= minRating;
			
			return matchesSearch && matchesDomain && matchesSkills && matchesInterests && 
				   matchesUniversity && matchesCompany && matchesLocation && matchesLanguages &&
				   matchesExperience && matchesAvailability && matchesRating;
		});
	}, [mentors, search, selectedDomains, selectedSkills, selectedInterests, selectedUniversities, 
		selectedCompanies, selectedLocations, selectedLanguages, selectedExperience, 
		availabilityFilter, minRating]);

	const sortedMentors = useMemo(() => {
		return [...filteredMentors].sort((a, b) => {
			if (sortBy === "rating") {
				if (b.rating !== a.rating) return b.rating - a.rating;
				return b.ratingCount - a.ratingCount; // tie-breaker: more reviews
			}
			if (sortBy === "reviews") {
				if (b.ratingCount !== a.ratingCount) return b.ratingCount - a.ratingCount;
				return b.rating - a.rating; // tie-breaker: higher rating
			}
			if (sortBy === "experience") {
				if (b.experience !== a.experience) return b.experience - a.experience;
				return b.rating - a.rating; // tie-breaker: higher rating
			}
			if (sortBy === "name") {
				return a.name.localeCompare(b.name);
			}
			return 0;
		});
	}, [filteredMentors, sortBy]);

	const handleDomainChange = (domain: string) => {
		setSelectedDomains((prev) =>
			prev.includes(domain)
				? prev.filter((d) => d !== domain)
				: [...prev, domain]
		);
	};

	const handleMultiSelectChange = (
		value: string, 
		currentSelection: string[], 
		setter: React.Dispatch<React.SetStateAction<string[]>>
	) => {
		setter((prev) =>
			prev.includes(value)
				? prev.filter((item) => item !== value)
				: [...prev, value]
		);
	};

	const removeFilter = (type: string, value: string) => {
		switch (type) {
			case "domain":
				setSelectedDomains(prev => prev.filter(d => d !== value));
				break;
			case "skill":
				setSelectedSkills(prev => prev.filter(s => s !== value));
				break;
			case "interest":
				setSelectedInterests(prev => prev.filter(i => i !== value));
				break;
			case "university":
				setSelectedUniversities(prev => prev.filter(u => u !== value));
				break;
			case "company":
				setSelectedCompanies(prev => prev.filter(c => c !== value));
				break;
			case "location":
				setSelectedLocations(prev => prev.filter(l => l !== value));
				break;
			case "language":
				setSelectedLanguages(prev => prev.filter(l => l !== value));
				break;
		}
	};

	const clearAllFilters = () => {
		setSearch("");
		setSelectedDomains([]);
		setSelectedSkills([]);
		setSelectedInterests([]);
		setSelectedUniversities([]);
		setSelectedCompanies([]);
		setSelectedLocations([]);
		setSelectedLanguages([]);
		setSelectedExperience("All Experience Levels");
		setAvailabilityFilter("all");
		setMinRating(0);
	};

	const getActiveFilterCount = () => {
		let count = 0;
		if (search) count++;
		count += selectedDomains.length;
		count += selectedSkills.length;
		count += selectedInterests.length;
		count += selectedUniversities.length;
		count += selectedCompanies.length;
		count += selectedLocations.length;
		count += selectedLanguages.length;
		if (selectedExperience !== "All Experience Levels") count++;
		if (availabilityFilter !== "all") count++;
		if (minRating > 0) count++;
		return count;
	};

	const toggleFavorite = async (mentorId: string) => {
		if (!isSignedIn) {
			alert("Please sign in to favorite mentors");
			return;
		}

		try {
			const result = await ToggleMentorFavoriteAction({ mentorId });
			if (result.success) {
				setFavoriteIds(prev => {
					const newSet = new Set(prev);
					if (result.data?.isFavorite) {
						newSet.add(mentorId);
					} else {
						newSet.delete(mentorId);
					}
					return newSet;
				});
			} else {
				alert(result.error || "Failed to update favorite");
			}
		} catch (error) {
			console.error("Error toggling favorite:", error);
			alert("An error occurred while updating favorites");
		}
	};

	const handleConnect = async (mentorId: string, available: boolean) => {
		if (!isSignedIn) {
			alert("Please sign in to connect with mentors");
			return;
		}

		try {
			// Check current connection status first
			const statusResult = await GetMentorConnectionStatusAction(mentorId);
			if (statusResult.success && statusResult.data) {
				const status = statusResult.data.status;
				if (status === 'pending') {
					alert("Connection request already sent");
					return;
				} else if (status === 'accepted') {
					alert("Already connected to this mentor");
					return;
				}
			}

			if (available) {
				const message = prompt("Enter a message for the mentor (optional):");
				const result = await CreateMentorConnectionAction({ 
					mentorId, 
					message: message || undefined 
				});
				
				if (result.success) {
					alert("Connection request sent successfully!");
					setConnectionStatuses(prev => new Map(prev).set(mentorId, 'pending'));
				} else {
					alert(result.error || "Failed to send connection request");
				}
			} else {
				// For unavailable mentors, add to waitlist
				const result = await CreateMentorConnectionAction({ 
					mentorId, 
					message: "Joined waitlist" 
				});
				
				if (result.success) {
					alert("Added to waitlist successfully!");
					setConnectionStatuses(prev => new Map(prev).set(mentorId, 'pending'));
				} else {
					alert(result.error || "Failed to join waitlist");
				}
			}
		} catch (error) {
			console.error("Error handling connection:", error);
			alert("An error occurred while processing your request");
		}
	};

	const toggleFilter = (key: keyof typeof openFilters) => {
		setOpenFilters((prev) => ({ ...prev, [key]: !prev[key] }));
	};

	// Check if all filters are expanded
	const areAllFiltersExpanded = Object.values(openFilters).every(value => value);

	// Function to toggle all filters
	const toggleAllFilters = () => {
		const newState = !areAllFiltersExpanded;
		setOpenFilters({
			domain: newState,
			skills: newState,
			interests: newState,
			experience: newState,
			university: newState,
			company: newState,
			location: newState,
			languages: newState,
			availability: newState,
		});
	};

	// Multi-select dropdown component
	const MultiSelectDropdown: React.FC<{
		title: string;
		options: string[];
		selected: string[];
		onChange: (value: string) => void;
		isOpen: boolean;
		onToggle: () => void;
	}> = ({ title, options, selected, onChange, isOpen, onToggle }) => {
		const [searchTerm, setSearchTerm] = useState("");
		
		const filteredOptions = options.filter(option =>
			option.toLowerCase().includes(searchTerm.toLowerCase())
		);

		return (
			<div className="mb-4">
				<div className="flex items-center justify-between mb-1 cursor-pointer" onClick={onToggle}>
					<strong className="text-base text-gray-900 dark:text-white">{title}</strong>
					<div className="flex items-center gap-2">
						{selected.length > 0 && (
							<span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
								{selected.length}
							</span>
						)}
						<ChevronDown className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
					</div>
				</div>
				{isOpen && (
					<div className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-[hsl(240,5.9%,15%)]">
						<div className="relative mb-2">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
							<input
								type="text"
								placeholder={`Search ${title.toLowerCase()}...`}
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 bg-white dark:bg-[hsl(240,5.9%,18%)] text-gray-900 dark:text-white"
							/>
						</div>
						<div className="max-h-40 overflow-y-auto">
							{filteredOptions.map((option) => (
								<label key={option} className="flex items-center gap-2 py-1 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer">
									<input
										type="checkbox"
										checked={selected.includes(option)}
										onChange={() => onChange(option)}
										className="accent-blue-600 dark:accent-blue-400"
									/>
									<span className="text-sm text-gray-900 dark:text-white">{option}</span>
								</label>
							))}
						</div>
						{selected.length > 0 && (
							<div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
								<div className="flex flex-wrap gap-1">
									{selected.slice(0, 2).map((item, index) => (
										<span
											key={`${item}-${index}`}
											className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full"
										>
											{item}
											<X 
												className="w-3 h-3 cursor-pointer hover:text-blue-600 dark:hover:text-blue-300" 
												onClick={(e) => {
													e.stopPropagation();
													onChange(item);
												}}
											/>
										</span>
									))}
									{selected.length > 2 && (
										<span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
											+{selected.length - 2} more
										</span>
									)}
								</div>
							</div>
						)}
					</div>
				)}
			</div>
		);
	};

	return (
		<div className="w-full bg-white dark:bg-[hsl(240,5.9%,9%)] min-h-screen">
			{/* Heading and subheading */}
			<div className="w-full max-w-8xl mx-auto px-2 md:px-6 pt-6 pb-2">
				<h1 className="text-2xl md:text-3xl font-bold mb-1 text-gray-900 dark:text-white">
					Find Your Perfect Mentor
				</h1>
				<p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">
					Connect with experienced professionals who can guide your career journey
				</p>
			</div>
			
			{/* Active Filters Bar */}
			{getActiveFilterCount() > 0 && (
				<div className="w-full max-w-8xl mx-auto px-2 md:px-6 pb-4">
					<div className="flex flex-wrap items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
						<span className="text-sm font-medium text-blue-800 dark:text-blue-200">
							Active Filters ({getActiveFilterCount()}):
						</span>
						{search && (
							<span className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
								Search: "{search}"
								<X className="w-3 h-3 cursor-pointer hover:text-blue-600 dark:hover:text-blue-300" onClick={() => setSearch("")} />
							</span>
						)}
						{selectedDomains.map(domain => (
							<span key={domain} className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
								{domain}
								<X className="w-3 h-3 cursor-pointer hover:text-blue-600 dark:hover:text-blue-300" onClick={() => removeFilter("domain", domain)} />
							</span>
						))}
						{selectedSkills.map(skill => (
							<span key={skill} className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
								{skill}
								<X className="w-3 h-3 cursor-pointer" onClick={() => removeFilter("skill", skill)} />
							</span>
						))}
						{selectedInterests.map(interest => (
							<span key={interest} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
								{interest}
								<X className="w-3 h-3 cursor-pointer" onClick={() => removeFilter("interest", interest)} />
							</span>
						))}
						{selectedExperience !== "All Experience Levels" && (
							<span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
								{selectedExperience}
								<X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedExperience("All Experience Levels")} />
							</span>
						)}
						<button
							onClick={clearAllFilters}
							className="text-blue-600 hover:text-blue-800 text-sm font-medium"
						>
							Clear All
						</button>
					</div>
				</div>
			)}
			
			{/* Loading State */}
			{loading && (
				<div className="w-full max-w-8xl mx-auto px-2 md:px-6 pb-6">
					<div className="flex justify-center items-center h-64">
						<div className="text-lg text-gray-600">Loading mentors...</div>
					</div>
				</div>
			)}
			
			{/* Error State */}
			{error && !loading && (
				<div className="w-full max-w-8xl mx-auto px-2 md:px-6 pb-6">
					<div className="flex justify-center items-center h-64">
						<div className="text-lg text-red-600">Error: {error}</div>
					</div>
				</div>
			)}
			
			{/* Main Content */}
			{!loading && !error && (
				<div className="w-full max-w-8xl mx-auto flex flex-col lg:flex-row gap-3 md:gap-6 px-2 md:px-6 pb-6">
					{/* Mobile Filter Toggle */}
					<div className="lg:hidden mb-4">
						<button
							onClick={() => setShowMobileFilters(!showMobileFilters)}
							className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg w-full justify-center hover:bg-blue-700 dark:hover:bg-blue-800"
						>
							<Filter className="w-4 h-4" />
							Filters {getActiveFilterCount() > 0 && `(${getActiveFilterCount()})`}
						</button>
					</div>				{/* Sidebar */}
				<aside className={`w-full lg:w-80 bg-gray-50 dark:bg-[hsl(240,5.9%,12%)] border border-gray-200 dark:border-gray-700 rounded-xl p-3 md:p-4 flex-shrink-0 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
					<div className="flex items-center justify-between mb-3">
						<div className="flex items-center gap-2">
							<button
								onClick={toggleAllFilters}
								className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
								title={areAllFiltersExpanded ? "Collapse all filters" : "Expand all filters"}
							>
								{areAllFiltersExpanded ? (
									<ChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
								) : (
									<ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
								)}
							</button>
							<h3 className="font-semibold text-xl text-gray-900 dark:text-white">Filters</h3>
						</div>
						{getActiveFilterCount() > 0 && (
							<button
								onClick={clearAllFilters}
								className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm"
							>
								Clear All
							</button>
						)}
					</div>
					{/* Filter Group: Study Domain */}
					<MultiSelectDropdown
						title="Study Domain"
						options={domains}
						selected={selectedDomains}
						onChange={(value) => handleMultiSelectChange(value, selectedDomains, setSelectedDomains)}
						isOpen={openFilters.domain}
						onToggle={() => toggleFilter('domain')}
					/>

					{/* Skills Filter Group */}
					<MultiSelectDropdown
						title="Skills"
						options={skills}
						selected={selectedSkills}
						onChange={(value) => handleMultiSelectChange(value, selectedSkills, setSelectedSkills)}
						isOpen={openFilters.skills}
						onToggle={() => toggleFilter('skills')}
					/>

					{/* Interests Filter Group */}
					<MultiSelectDropdown
						title="Interests"
						options={interests}
						selected={selectedInterests}
						onChange={(value) => handleMultiSelectChange(value, selectedInterests, setSelectedInterests)}
						isOpen={openFilters.interests}
						onToggle={() => toggleFilter('interests')}
					/>

					{/* Experience Level Filter Group */}
					<div className="mb-4">
						<div className="flex items-center justify-between mb-1 cursor-pointer" onClick={() => toggleFilter('experience')}>
							<strong className="text-base text-gray-900 dark:text-white">Experience Level</strong>
							<ChevronDown className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform ${openFilters.experience ? 'rotate-180' : ''}`} />
						</div>
						{openFilters.experience && (
							<select
								className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 bg-white dark:bg-[hsl(240,5.9%,15%)] text-gray-900 dark:text-white"
								value={selectedExperience}
								onChange={(e) => setSelectedExperience(e.target.value)}
							>
								{experienceLevels.map((level) => (
									<option key={level} value={level}>{level}</option>
								))}
							</select>
						)}
					</div>

					{/* University Filter */}
					<MultiSelectDropdown
						title="University"
						options={universities}
						selected={selectedUniversities}
						onChange={(value) => handleMultiSelectChange(value, selectedUniversities, setSelectedUniversities)}
						isOpen={openFilters.university}
						onToggle={() => toggleFilter('university')}
					/>

					{/* Company Filter */}
					<MultiSelectDropdown
						title="Company"
						options={companies}
						selected={selectedCompanies}
						onChange={(value) => handleMultiSelectChange(value, selectedCompanies, setSelectedCompanies)}
						isOpen={openFilters.company}
						onToggle={() => toggleFilter('company')}
					/>

					{/* Location Filter */}
					<MultiSelectDropdown
						title="Location"
						options={locations}
						selected={selectedLocations}
						onChange={(value) => handleMultiSelectChange(value, selectedLocations, setSelectedLocations)}
						isOpen={openFilters.location}
						onToggle={() => toggleFilter('location')}
					/>

					{/* Languages Filter */}
					<MultiSelectDropdown
						title="Languages"
						options={languages}
						selected={selectedLanguages}
						onChange={(value) => handleMultiSelectChange(value, selectedLanguages, setSelectedLanguages)}
						isOpen={openFilters.languages}
						onToggle={() => toggleFilter('languages')}
					/>

					{/* Availability Filter */}
					<div className="mb-4">
						<div className="flex items-center justify-between mb-1 cursor-pointer" onClick={() => toggleFilter('availability')}>
							<strong className="text-base text-gray-900 dark:text-white">Availability</strong>
							<ChevronDown className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform ${openFilters.availability ? 'rotate-180' : ''}`} />
						</div>
						{openFilters.availability && (
							<select
								className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 bg-white dark:bg-[hsl(240,5.9%,15%)] text-gray-900 dark:text-white"
								value={availabilityFilter}
								onChange={(e) => setAvailabilityFilter(e.target.value as "all" | "available" | "unavailable")}
							>
								<option value="all">All</option>
								<option value="available">Available</option>
								<option value="unavailable">Unavailable</option>
							</select>
						)}
					</div>
					<div>
						<div className="flex items-center justify-between mb-1">
							<strong className="text-base text-gray-900 dark:text-white">Minimum Rating</strong>
						</div>
						<input
							type="range"
							min={0}
							max={5}
							step={0.1}
							className="w-full accent-blue-600 dark:accent-blue-400"
							value={minRating}
							onChange={e => setMinRating(Number(e.target.value))}
						/>
						<div className="flex justify-between text-sm text-gray-400 dark:text-gray-500 mt-1">
							<span>0</span>
							<span>{minRating}+ stars</span>
							<span>5</span>
						</div>
					</div>
				</aside>

				{/* Main Content */}
				<main className="flex-1 min-w-0">
					{/* Search and Sort */}
					<div className="flex flex-col sm:flex-row items-center gap-2 mb-3">
						<div className="relative w-full sm:flex-1">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
							<input
								type="text"
								placeholder="Search by name, email, skills, interests, university, or company…"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="w-full pl-10 pr-3 py-2 rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 text-lg bg-white dark:bg-[hsl(240,5.9%,15%)] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
							/>
						</div>
						<select
							className="w-full sm:w-auto px-3 py-2 rounded border border-gray-300 dark:border-gray-600 text-lg bg-white dark:bg-[hsl(240,5.9%,15%)] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700"
							value={sortBy}
							onChange={e => setSortBy(e.target.value as 'rating' | 'reviews' | 'experience' | 'name')}
						>
							{sortOptions.map(option => (
								<option key={option.value} value={option.value}>{option.label}</option>
							))}
						</select>
					</div>
					
					{/* Mentor Count */}
					<div className="mb-4 text-gray-700 dark:text-gray-300 font-semibold text-lg">
						{sortedMentors.length} mentor{sortedMentors.length !== 1 ? 's' : ''} found
					</div>
					
					{/* No Results State */}
					{sortedMentors.length === 0 && (
						<div className="text-center py-12">
							<div className="text-gray-400 dark:text-gray-500 mb-4">
								<Users className="w-16 h-16 mx-auto mb-4" />
								<h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">No mentors found</h3>
								<p className="text-gray-500 dark:text-gray-400 mb-4">
									Try adjusting your search criteria or filters to find more mentors.
								</p>
								{getActiveFilterCount() > 0 && (
									<button
										onClick={clearAllFilters}
										className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800"
									>
										Clear All Filters
									</button>
								)}
							</div>
						</div>
					)}

					{/* Mentor Cards */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
						{sortedMentors.map((mentor) => (
							<div
								key={mentor.id}
								className="bg-white dark:bg-[hsl(240,5.9%,12%)] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 hover:shadow-md dark:hover:shadow-gray-700/50 transition-shadow"
							>
								{/* Header */}
								<div className="flex items-start gap-3 mb-3">
									<div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex-shrink-0 flex items-center justify-center text-white font-bold text-lg">
										{mentor.name.split(' ').map(n => n[0]).join('')}
									</div>
									<div className="flex-1 min-w-0">
										<div className="flex items-start justify-between">
											<div className="flex-1 min-w-0">
												<h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">
													{mentor.name}
												</h3>
												<p className="text-gray-600 dark:text-gray-300 text-lg truncate">
													{mentor.title}
												</p>
												<div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm">
													<Building className="w-4 h-4" />
													<span className="truncate">{mentor.company}</span>
												</div>
											</div>
											<button
												onClick={() => toggleFavorite(mentor.id)}
												className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[hsl(240,5.9%,18%)] ${favoriteIds.has(mentor.id) ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}`}
											>
												<Heart className={`w-5 h-5 ${favoriteIds.has(mentor.id) ? 'fill-current' : ''}`} />
											</button>
										</div>
									</div>
								</div>

								{/* University and Domain */}
								<div className="flex flex-wrap items-center gap-2 text-sm mb-3">
									<div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
										<BookOpen className="w-4 h-4" />
										<span>{mentor.university}</span>
									</div>
									<span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs font-medium">
										{mentor.domain}
									</span>
								</div>

								{/* Location and Rating */}
								<div className="flex items-center justify-between mb-3">
									<div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm">
										<MapPin className="w-4 h-4" />
										<span>{mentor.location}</span>
									</div>
									<div className="flex items-center gap-1">
										<Star className="w-4 h-4 text-yellow-500 fill-current" />
										<span className="font-semibold text-gray-900 dark:text-white">{mentor.rating}</span>
										<span className="text-gray-500 dark:text-gray-400 text-sm">({mentor.ratingCount})</span>
									</div>
								</div>

								{/* Bio */}
								<p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
									{mentor.description}
								</p>

								{/* Skills */}
								<div className="mb-4">
									<h4 className="font-medium text-gray-900 dark:text-white text-sm mb-2">Skills</h4>
									<div className="flex flex-wrap gap-1">
										{mentor.skills.map((skill, index) => (
											<span
												key={`${mentor.id}-skill-${index}`}
												className="bg-gray-100 dark:bg-[hsl(240,5.9%,18%)] text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs"
											>
												{skill}
											</span>
										))}
									</div>
								</div>

								{/* Interests */}
								<div className="mb-4">
									<h4 className="font-medium text-gray-900 dark:text-white text-sm mb-2">Interests</h4>
									<div className="flex flex-wrap gap-1">
										{mentor.interests.map((interest, index) => (
											<span
												key={`${mentor.id}-interest-${index}`}
												className="border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full text-xs"
											>
												{interest}
											</span>
										))}
									</div>
								</div>

								{/* Stats */}
								<div className="flex justify-between items-center mb-4 py-3 bg-gray-50 dark:bg-[hsl(240,5.9%,18%)] rounded-lg px-4">
									<div className="text-center">
										<div className="font-bold text-lg text-gray-900 dark:text-white">{mentor.mentees}</div>
										<div className="text-xs text-gray-500 dark:text-gray-400">Mentees</div>
									</div>
									<div className="text-center">
										<div className="font-bold text-lg text-gray-900 dark:text-white">{mentor.experience}+</div>
										<div className="text-xs text-gray-500 dark:text-gray-400">Years Exp</div>
									</div>
									<div className="text-center">
										<div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
											<Clock className="w-4 h-4" />
											<span className="text-xs">{mentor.responseTime}</span>
										</div>
									</div>
								</div>

								{/* Languages and Availability */}
								<div className="flex items-center justify-between mb-4">
									<div className="flex flex-wrap gap-1">
										{mentor.languages.map((lang, index) => (
											<span
												key={`${mentor.id}-language-${index}`}
												className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs"
											>
												{lang}
											</span>
										))}
									</div>
									<span
										className={`px-3 py-1 rounded-full text-xs font-medium ${
											mentor.available
												? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
												: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
										}`}
									>
										{mentor.available ? "Available" : "Unavailable"}
									</span>
								</div>

								{/* Action Buttons */}
								<div className="flex gap-2">
									<button
										onClick={() => handleConnect(mentor.id, mentor.available)}
										disabled={connectionStatuses.get(mentor.id) === 'pending' || connectionStatuses.get(mentor.id) === 'accepted'}
										className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium text-sm ${
											connectionStatuses.get(mentor.id) === 'pending' 
												? 'bg-yellow-500 dark:bg-yellow-600 text-white cursor-not-allowed'
												: connectionStatuses.get(mentor.id) === 'accepted'
												? 'bg-green-600 dark:bg-green-700 text-white cursor-not-allowed'
												: mentor.available
												? 'bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-800'
												: 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
										}`}
									>
										<MessageCircle className="w-4 h-4" />
										{connectionStatuses.get(mentor.id) === 'pending' 
											? 'Request Sent'
											: connectionStatuses.get(mentor.id) === 'accepted'
											? 'Connected'
											: mentor.available ? 'Connect' : 'Join Waitlist'}
									</button>
								</div>
							</div>
						))}
					</div>
				</main>
			</div>
			)}
		</div>
	);
};

export default FindMentor;